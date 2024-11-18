// * React
import React, {useState, useCallback, useEffect} from 'react';

// * Library
import TrackPlayer from 'react-native-track-player';

// * Store
import {usePlayerStore} from '../../../store';

// * Assets
import {SegmentedButtons} from 'react-native-paper';

// * Components
import BackTo from './BackTo';
import UpNext from './UpNext';

export default function Queue() {
  // ? States
  const [tab, setTab] = useState('');
  const [queue, setQueue] = useState(usePlayerStore(state => state.queue));

  // ? StoreStates
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  //const queue = usePlayerStore(state => state.queue);

  const palette = usePlayerStore(state => state.palette);

  useEffect(() => {
    setTab('upNext');
    setQueue(queue);
    //TrackPlayer.getQueue().then((queue: any) => setQueue(queue));
  }, []);

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
          style={{borderColor: '#fff', marginHorizontal: 60}}
          theme={{colors: {secondaryContainer: palette[2]}}}
        />

        {queue?.length > 0 && (
          <>
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
        )}
      </>
    ),
    [activeTrackIndex, tab],
  );

  return <QueueCallback />;
}
