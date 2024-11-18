// * React
import React from 'react';

// * React Native
import {ActivityIndicator, Pressable, Vibration, View} from 'react-native';

// * Libraries
import Ionicons from 'react-native-vector-icons/Ionicons';
import TrackPlayer, {State} from 'react-native-track-player';

// * Store
import {usePlayerStore} from '../../../store';

export default function Controls() {
  // ? StoreStates
  const {position} = usePlayerStore(state => state.progress);
  const {state} = usePlayerStore(state => state.playbackState);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const queue = usePlayerStore(state => state.queue);

  // ? StoreActions
  const playPause = usePlayerStore(state => state.playPause);
  const next = usePlayerStore(state => state.next);
  const previous = usePlayerStore(state => state.previous);

  // ? Constants
  const isPlaying = state === State.Playing;
  const isBuffering = state === State.Buffering;
  const isLoading = state === State.Loading;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginTop: 10,
      }}>
      <Pressable
        disabled={activeTrackIndex === 0}
        style={{marginRight: 10}}
        onPress={() => (Vibration.vibrate(50), TrackPlayer.skip(0))}>
        <Ionicons
          name="play-back"
          size={40}
          color={activeTrackIndex === 0 ? 'rgba(255, 255, 255, .4)' : 'white'}
        />
      </Pressable>

      <Pressable
        disabled={activeTrackIndex === 0 && position <= 10}
        onPress={() => previous(position)}>
        <Ionicons
          name="play-back-circle"
          size={70}
          color={
            activeTrackIndex === 0 && position <= 10
              ? 'rgba(255, 255, 255, .4)'
              : 'white'
          }
        />
      </Pressable>

      {isLoading || isBuffering ? (
        <ActivityIndicator
          size={30}
          color="#000"
          style={{
            backgroundColor: 'white',
            borderRadius: 100,
            borderColor: 'transparent',
            width: 80,
            height: 80,
            margin: 10,
          }}
        />
      ) : (
        <Pressable onPress={playPause}>
          <Ionicons
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={100}
            color="white"
          />
        </Pressable>
      )}

      <Pressable
        disabled={activeTrackIndex === queue.length - 1}
        onPress={next}>
        <Ionicons
          name="play-forward-circle"
          size={70}
          color={
            activeTrackIndex === queue.length - 1
              ? 'rgba(255, 255, 255, .4)'
              : 'white'
          }
        />
      </Pressable>

      <Pressable
        disabled={activeTrackIndex === queue.length - 1}
        style={{marginLeft: 10}}
        onPress={() => (
          Vibration.vibrate(50), TrackPlayer.skip(queue.length - 1)
        )}>
        <Ionicons
          name="play-forward"
          size={40}
          color={
            activeTrackIndex === queue.length - 1
              ? 'rgba(255, 255, 255, .4)'
              : 'white'
          }
        />
      </Pressable>
    </View>
  );
}
