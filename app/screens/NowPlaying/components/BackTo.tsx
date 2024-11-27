// * React
import React, {useState, useCallback, useEffect} from 'react';

// * React Native
import {Image, Text, TouchableOpacity, View} from 'react-native';

// * Libraries
import DraggableFlatList, {
  OpacityDecorator,
  RenderItemParams,
  ScaleDecorator,
  ShadowDecorator,
} from 'react-native-draggable-flatlist';
import {StarRatingDisplay} from 'react-native-star-rating-widget';

// * Store
import {usePlayerStore, WIDTH} from '../../../store';

// * Types
import {QueueProps, TrackProps, TracksProps} from '../../../types';
import TrackPlayer from 'react-native-track-player';

export default function BackTo({RenderQueueListItem}: any) {
  // ? StoreStates
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const queue = usePlayerStore(state => state.queue);

  // ? States
  const [data, setData] = useState<TracksProps>(queue);

  // ? StoreActions
  const setQueue = usePlayerStore(state => state.setQueue);

  // ? Effects
  useEffect(() => {
    const x = activeTrackIndex! - 5;

    setData(queue.slice(x > 0 ? x : 0, activeTrackIndex).reverse());
  }, [queue]);

  return (
    <DraggableFlatList
      data={data}
      onDragEnd={async ({data, from, to}) => {
        setData(data);

        const restoredQueue = [
          ...queue.slice(0, activeTrackIndex + 1),
          ...data,
        ];

        setQueue(restoredQueue);

        await TrackPlayer.move(
          restoredQueue.findIndex(
            (track: TrackProps) =>
              track.id === data.find((x, i) => i === from)?.id,
          ),
          restoredQueue.findIndex(
            (track: TrackProps) =>
              track.id === data.find((x, i) => i === to)?.id,
          ),
        );

        // console.log(restoredQueue.map(t => t.title));
        // console.error(
        //   restoredQueue.findIndex(
        //     (track: TrackProps) =>
        //       track.title === data.find((x, i) => i === from)?.title,
        //   ),
        //   restoredQueue.findIndex(
        //     (track: TrackProps) =>
        //       track.title === data.find((x, i) => i === to)?.title,
        //   ),
        // );
      }}
      keyExtractor={({id}) => id.toString()}
      renderItem={RenderQueueListItem}
      activationDistance={10}
      renderPlaceholder={() => (
        <View style={{backgroundColor: 'yellow', height: 600}} />
      )}
      ListEmptyComponent={() => (
        <View
          style={{height: 300, justifyContent: 'center', alignItems: 'center'}}>
          <Text>No tracks</Text>
        </View>
      )}
      containerStyle={{marginVertical: 10}}
    />
  );
}
