// * React
import React, {useState, useEffect} from 'react';

// * React Native
import {Text, View} from 'react-native';

// * Libraries
import DraggableFlatList from 'react-native-draggable-flatlist';
import TrackPlayer, {Track} from 'react-native-track-player';

// * Store
import {usePlayerStore} from '../../../store';

// * Types
import {TrackProps} from '../../../types';

export default function BackTo({RenderQueueListItem}: any) {
  // ? StoreStates
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const queue = usePlayerStore(state => state.queue);

  // ? StoreActions
  const setQueue = usePlayerStore(state => state.setQueue);

  // ? States
  const [data, setData] = useState<Track[]>(queue);

  // ? Effects
  useEffect(() => {
    const x = activeTrackIndex - 10;
    setData(queue.slice(x > 0 ? x : 0, activeTrackIndex).reverse());
  }, [queue]);

  return (
    <DraggableFlatList
      data={data}
      onDragEnd={({data, from, to}) => {
        setData(data);

        const restoredQueue = [
          ...queue.slice(0, activeTrackIndex + 1),
          ...data,
        ];

        setQueue(restoredQueue);

        TrackPlayer.move(
          restoredQueue.findIndex(
            (track: Omit<TrackProps, ''>) =>
              track.id === data.find((x, i) => i === from)?.id,
          ),
          restoredQueue.findIndex(
            (track: Omit<TrackProps, ''>) =>
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
