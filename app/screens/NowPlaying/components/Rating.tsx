// * React
import React, {useCallback} from 'react';

// * React Native
import {Vibration} from 'react-native';

// * Libraries
import {useMutation} from '@tanstack/react-query';
import axios from 'axios';
import StarRating from 'react-native-star-rating-widget';
import TrackPlayer from 'react-native-track-player';

// * Store
import {usePlayerStore} from '../../../store';

export default function Rating() {
  // ? Mutations
  const {mutate: saveRating} = useMutation({
    mutationFn: (body: {id?: number; rating: number}) =>
      axios.patch('rateTrack', body),
  });

  // ? StoreStates
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const trackRating = usePlayerStore(state => state.trackRating);

  // ? StoreActions
  const setTrackRating = usePlayerStore(state => state.setTrackRating);

  const RatingCallback = useCallback(
    () => (
      <StarRating
        rating={trackRating}
        onChange={rating => {
          Vibration.vibrate(50);
          setTrackRating(rating);
          TrackPlayer.updateMetadataForTrack(activeTrackIndex!, {
            ...activeTrack,
            rating,
          });

          saveRating(
            {id: activeTrack?.id, rating},
            {
              onSuccess: ({data}) => console.log(data),
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
