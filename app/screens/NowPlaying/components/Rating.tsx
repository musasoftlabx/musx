// * React
import React, { useCallback } from 'react';

// * React Native
import { Vibration } from 'react-native';

// * Libraries
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import StarRating from 'react-native-star-rating-widget';
import TrackPlayer from 'react-native-track-player';

// * Store
import { usePlayerStore } from '../../../store';
import { refreshScreens } from '../../../functions';

export default function Rating() {
  // ? Mutations
  const { mutate: saveRating } = useMutation({
    mutationFn: (body: { id?: number; rating: number }) =>
      axios.patch('rateTrack', body),
  });

  // ? StoreStates
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const trackRating = usePlayerStore(state => state.trackRating);
  const selectedPlaylist = usePlayerStore(state => state.selectedPlaylist);

  // ? StoreActions
  const setTrackRating = usePlayerStore(state => state.setTrackRating);

  const RatingCallback = useCallback(
    () => (
      <StarRating
        rating={trackRating ?? 0}
        onChange={rating => {
          Vibration.vibrate(50);
          setTrackRating(rating);
          TrackPlayer.updateMetadataForTrack(activeTrackIndex!, {
            ...activeTrack,
            rating,
          });

          saveRating(
            { id: activeTrack?.id, rating },
            {
              onSuccess: ({ data }) => {
                // ? Refresh screens to apply changes of rated track
                refreshScreens(activeTrack, selectedPlaylist);
              },
              onError: error => console.log(error),
            },
          );
        }}
      />
    ),
    [activeTrackIndex, trackRating],
  );

  return <RatingCallback />;
}
