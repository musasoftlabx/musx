// * React
import React from 'react';

// * React Native
import {ActivityIndicator, Pressable, View} from 'react-native';

// * Libraries
import Ionicons from 'react-native-vector-icons/Ionicons';
import Sound from 'react-native-sound';
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
        onPress={() => TrackPlayer.skip(0)}>
        <Ionicons
          name="play-back"
          size={40}
          color={activeTrackIndex === 0 ? 'rgba(255, 255, 255, .4)' : 'white'}
        />
      </Pressable>

      <Pressable
        disabled={activeTrackIndex === 0 && position <= 10}
        onPress={() => {
          if (position <= 10) TrackPlayer.skipToPrevious();
          else TrackPlayer.seekTo(0);
        }}>
        <Ionicons
          name="play-back-circle"
          size={70}
          color={
            activeTrackIndex === 0 && position >= 10
              ? 'rgba(255, 255, 255, .4)'
              : '#fff'
          }
        />
      </Pressable>

      {isLoading || isBuffering ? (
        <ActivityIndicator
          size={50}
          color="grey"
          style={{
            backgroundColor: '#fff',
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
            color="#fff"
          />
        </Pressable>
      )}

      <Pressable
        disabled={activeTrackIndex === queue.length - 1}
        onPress={() => {
          TrackPlayer.skipToNext();
          /* const crossfader = new Sound(
            queue[activeTrackIndex + 1].url,
            Sound.MAIN_BUNDLE,
            e => {
              if (e) {
                TrackPlayer.skipToNext();
                console.log('failed to load the sound', e);
                return;
              }

              crossfader.setVolume(0);
              crossfader.play();

              let fadeOutInterval = setInterval(async () => {
                const currentTrackVolume = await TrackPlayer.getVolume();
                const crossfaderVolume = crossfader.getVolume();

                await TrackPlayer.setVolume(currentTrackVolume - 0.1);
                crossfader.setVolume(crossfaderVolume + 0.1);

                if (currentTrackVolume <= 0) {
                  crossfader.getCurrentTime(async seconds => {
                    await TrackPlayer.skipToNext();
                    await TrackPlayer.seekTo(seconds + 1.8);
                    clearInterval(fadeOutInterval);

                    let fadeInInterval = setInterval(async () => {
                      await TrackPlayer.setVolume(
                        (await TrackPlayer.getVolume()) + 0.5,
                      );

                      crossfader.setVolume(crossfader.getVolume() - 0.3);

                      if (crossfader.getVolume() <= 0) {
                        await TrackPlayer.setVolume(1);
                        crossfader.stop();
                        clearInterval(fadeInInterval);
                        crossfader.release();
                      }
                    }, 1000);
                  });
                }
              }, 1000);
            },
          ); */
        }}>
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
        onPress={() => TrackPlayer.skip(queue.length)}>
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
