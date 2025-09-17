// * React
import React, { useState, useEffect, useRef } from 'react';

// * React Native
import { TouchableOpacity, View } from 'react-native';

// * Libraries
import { Text } from 'react-native-paper';
import BottomSheet from '@gorhom/bottom-sheet';
import DraggableFlatList from 'react-native-draggable-flatlist';
import TrackPlayer, { Track } from 'react-native-track-player';

// * Store
import { usePlayerStore } from '../../../store';

// * Types
import { TrackProps } from '../../../types';
import { arrayMove } from '../../../functions';

export default function UpNext({ RenderQueueListItem }: any) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // ? StoreStates
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const queue = usePlayerStore(state => state.queue);

  // ? StoreActions
  const setActiveTrackIndex = usePlayerStore(
    state => state.setActiveTrackIndex,
  );
  const setActiveTrack = usePlayerStore(state => state.setActiveTrack);
  const setQueue = usePlayerStore(state => state.setQueue);

  // ? States
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [data, setData] = useState<Track[]>(queue);
  const [track, setTrack] = useState<TrackProps>();

  // ? Effects
  useEffect(() => {
    setData(queue.slice(activeTrackIndex + 1, activeTrackIndex + 10));
  }, [queue]);

  return (
    <DraggableFlatList
      data={data}
      onDragEnd={({ data, from, to }) => {
        setData(data);

        const restoredQueue = [
          ...queue.slice(0, activeTrackIndex + 1),
          ...data,
        ];

        console.log(restoredQueue.map(track => track.title));
        setQueue(restoredQueue);

        TrackPlayer.move(
          restoredQueue.findIndex(
            track => track.id === data.find((_, i) => i === from)?.id,
          ),
          restoredQueue.findIndex(
            track => track.id === data.find((_, i) => i === to)?.id,
          ),
        ).then(async () => {
          const _queue = await TrackPlayer.getQueue();
          //console.log(queue.map(track => track.title));
          console.log(_queue.map(track => track.title));

          // let element = queue[from];
          // queue.splice(from, 1);
          // queue.splice(to, 0, element);

          //setQueue(_queue);
        });
      }}
      keyExtractor={({ id }) => id.toString()}
      renderItem={RenderQueueListItem}
      activationDistance={0}
      ListEmptyComponent={() => (
        <View
          style={{
            height: 300,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text>No tracks</Text>
        </View>
      )}
      containerStyle={{ marginVertical: 10 }}
    />
  );
}
