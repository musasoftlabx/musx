// * React
import React, {useState, useEffect, useRef} from 'react';

// * React Native
import {Text, View} from 'react-native';

// * Libraries
import DraggableFlatList from 'react-native-draggable-flatlist';
import BottomSheet from '@gorhom/bottom-sheet';
import TrackPlayer from 'react-native-track-player';

// * Store
import {usePlayerStore} from '../../../store';

// * Types
import {TrackProps} from '../../../types';

export default function UpNext({RenderQueueListItem}: any) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  const queue = usePlayerStore(state => state.queue);

  // ? States
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [data, setData] = useState<any>(queue);
  const [track, setTrack] = useState<TrackProps>();

  // ? StoreStates
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);

  const setQueue = usePlayerStore(state => state.setQueue);

  // ? Effects
  useEffect(() => {
    setData(queue.slice(activeTrackIndex + 1, activeTrackIndex! + 10));
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
