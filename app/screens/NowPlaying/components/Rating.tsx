// * React
import React, { useCallback } from 'react';

// * React Native
import { ToastAndroid, Vibration } from 'react-native';

// * Libraries
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
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
  const activePlaylist = usePlayerStore(state => state.activePlaylist);

  // ? StoreActions
  const setTrackRating = usePlayerStore(state => state.setTrackRating);

  const RatingCallback = useCallback(
    () => (
      <StarRating
        rating={trackRating ?? 0}
        onChange={rating => {
          Vibration.vibrate(100);
          setTrackRating(rating);
          TrackPlayer.updateMetadataForTrack(activeTrackIndex!, {
            ...activeTrack,
            rating,
          });
          saveRating(
            { id: activeTrack?.id, rating },
            {
              onSuccess: () => refreshScreens(activeTrack, activePlaylist), // ? Refresh screens to apply changes of rated track
              onError: error => {
                if (error instanceof AxiosError) {
                  ToastAndroid.showWithGravity(
                    error.response?.data.body,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                  );
                }
              },
            },
          );
        }}
      />
    ),
    [activeTrackIndex, trackRating],
  );

  return <RatingCallback />;
}
