// * React
import React from 'react';

// * React Native
import {
  View,
  StyleSheet,
  Image,
  Text,
  Pressable,
  Vibration,
  ActivityIndicator,
} from 'react-native';

// * Libraries
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import TrackPlayer, {State} from 'react-native-track-player';

// * Store
import {usePlayerStore} from '../store';

// * Assets
import imageFiller from '../assets/images/image-filler.png';

export default function Footer() {
  // ? StoreStates
  const {position, duration} = usePlayerStore(state => state.progress);
  const {state} = usePlayerStore(state => state.playbackState);
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const nowPlayingRef = usePlayerStore(state => state.nowPlayingRef);
  const palette = usePlayerStore(state => state.palette);
  const queue = usePlayerStore(state => state.queue);

  // ? StoreActions
  const openNowPlaying = usePlayerStore(state => state.openNowPlaying);
  const playPause = usePlayerStore(state => state.playPause);

  // ? Constants
  const isPlaying = state === State.Playing;
  const isBuffering = state === State.Buffering;
  const isLoading = state === State.Loading;
  const activeStates = [
    State.Playing,
    State.Paused,
    State.Loading,
    State.Buffering,
    State.Ready,
  ];

  return (
    activeStates.includes(state) && (
      <View
        style={{
          borderRadius: 50,
          borderTopColor: palette?.[2],
          borderTopWidth: 0.5,
          paddingVertical: 10,
        }}>
        <LinearGradient
          colors={[palette?.[1] ?? '#fff', palette?.[0] ?? '#000']}
          useAngle={true}
          angle={290}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
        />

        <View style={{flexDirection: 'row', gap: 10, paddingHorizontal: 20}}>
          <Pressable
            style={{flexGrow: 0.8, flexDirection: 'row', alignItems: 'center'}}
            onPress={() => {
              openNowPlaying(nowPlayingRef!);
              Vibration.vibrate(50);
            }}>
            <Image
              source={
                activeTrack?.artwork ? {uri: activeTrack?.artwork} : imageFiller
              }
              style={{
                height: 45,
                width: 45,
                marginRight: 8,
                borderRadius: 10,
              }}
            />
            <View style={{flex: 1}}>
              <Text numberOfLines={1} style={styles.title}>
                {activeTrack?.title}
              </Text>
              <Text numberOfLines={1} style={styles.artists}>
                {activeTrack?.albumArtist ?? 'Unknown Artist'}
              </Text>
            </View>
          </Pressable>

          <View style={{flexGrow: 0.2}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 20,
              }}>
              <Pressable
                disabled={activeTrackIndex === 0}
                onPress={() => {
                  if (position <= 10) TrackPlayer.skipToPrevious();
                  else TrackPlayer.seekTo(0);
                }}>
                <Icon
                  name="play-back"
                  size={25}
                  color={activeTrackIndex === 0 ? 'grey' : 'white'}
                />
              </Pressable>

              <Progress.Circle
                size={50}
                progress={position / duration || 0}
                color={palette[2]}
                style={{marginRight: -67.5, opacity: 1}}
              />

              {isLoading || isBuffering ? (
                <ActivityIndicator
                  size={30}
                  color="#000"
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 100,
                    borderColor: 'transparent',
                    width: 35,
                    height: 35,
                    marginLeft: 5,
                  }}
                />
              ) : (
                <Pressable onPress={playPause} style={{}}>
                  <Icon
                    name={isPlaying ? 'pause-circle' : 'play-circle'}
                    size={45}
                    color="#fff"
                  />
                </Pressable>
              )}

              <Pressable
                disabled={activeTrackIndex === queue.length - 1}
                onPress={() => TrackPlayer.skipToNext()}>
                <Icon
                  name="play-forward"
                  size={25}
                  color={
                    activeTrackIndex === queue.length - 1 ? 'grey' : 'white'
                  }
                />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    )
  );
}

const styles = StyleSheet.create({
  title: {fontSize: 17, fontWeight: '800'},
  artists: {fontSize: 14, fontWeight: '500'},
});
