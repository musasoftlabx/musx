// * React
import React, {useState, useCallback} from 'react';

//import TrackPlayer from 'react-native-track-player';

// * Store
import {usePlayerStore} from '../../../store';

// * Assets
import {SegmentedButtons} from 'react-native-paper';

// * Components
import BackTo from './BackTo';
import UpNext from './UpNext';

export default function Queue() {
  // ? States
  const [tab, setTab] = useState('upNext');
  //const [queue, setQueue] = useState();

  // ? StoreStates
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const queue = usePlayerStore(state => state.queue);

  const palette = usePlayerStore(state => state.palette);

  // useEffect(()=>{
  //   TrackPlayer.getQueue()
  // },[activeTrack])

  const QueueCallback = useCallback(
    () => (
      <>
        <SegmentedButtons
          value={tab}
          onValueChange={state => setTab(state)}
          buttons={[
            {value: 'backTo', label: 'BACK TO'},
            {value: 'upNext', label: 'UP NEXT'},
          ]}
          style={{marginHorizontal: 60}}
          theme={{colors: {secondaryContainer: palette[2]}}}
        />

        {tab === 'upNext' ? (
          <UpNext
            queue={queue}
            activeTrack={activeTrack}
            activeTrackIndex={activeTrackIndex}
          />
        ) : (
          <BackTo
            queue={queue}
            activeTrack={activeTrack}
            activeTrackIndex={activeTrackIndex}
          />
        )}
      </>
    ),
    [activeTrackIndex, tab],
  );

  return <QueueCallback />;
}
