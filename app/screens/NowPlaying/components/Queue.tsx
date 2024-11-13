// * React
import React, {useState, useCallback, useEffect} from 'react';

// * Store
import {usePlayerStore} from '../../../store';

// * Assets
import {SegmentedButtons} from 'react-native-paper';

// * Components
import History from './History';
import UpNext from './UpNext';
//import TrackPlayer from 'react-native-track-player';

export default function Queue() {
  // ? States
  const [value, setValue] = useState<'queue' | 'history'>('queue');
  //const [queue, setQueue] = useState();

  // ? StoreStates
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const queue = usePlayerStore(state => state.queue);

  // useEffect(()=>{
  //   TrackPlayer.getQueue()
  // },[activeTrack])

  const QueueCallback = useCallback(
    () => (
      <>
        <SegmentedButtons
          value={value}
          onValueChange={(x: any) => setValue(x)}
          buttons={[
            {value: 'history', label: 'History'},
            {value: 'queue', label: 'Queue'},
          ]}
        />

        {value === 'queue' ? (
          <UpNext
            queue={queue}
            activeTrack={activeTrack}
            activeTrackIndex={activeTrackIndex}
          />
        ) : (
          <History
            queue={queue}
            activeTrack={activeTrack}
            activeTrackIndex={activeTrackIndex}
          />
        )}
      </>
    ),
    [activeTrackIndex],
  );

  return <QueueCallback />;
}
