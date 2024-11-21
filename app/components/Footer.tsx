// * React
import React from 'react';

// * React Native
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Vibration,
  ActivityIndicator,
} from 'react-native';

// * Libraries
import * as Progress from 'react-native-progress';
import {MediaPlayerState} from 'react-native-google-cast';
import {State} from 'react-native-track-player';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

// * Store
import {usePlayerStore} from '../store';

// * Functions
import {formatTrackTime} from '../functions';

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
  const next = usePlayerStore(state => state.next);
  const previous = usePlayerStore(state => state.previous);

  // ? Constants
  const isPlaying = state === State.Playing;
  const isBuffering = state === State.Buffering;
  const isLoading = state === State.Loading;
  const isEnded = state === State.Ended;
  const isIdle = state === MediaPlayerState.IDLE;
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
                height: 50,
                width: 50,
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
              <Text style={{fontSize: 12, marginLeft: 3, marginTop: 2}}>
                {`${formatTrackTime(position)} / ${formatTrackTime(duration)}`}
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
                disabled={(activeTrackIndex === 0 && position <= 10) || isIdle}
                onPress={() => previous(position)}>
                <Icon
                  name="play-back"
                  size={25}
                  color={
                    (activeTrackIndex === 0 && position <= 10) || isIdle
                      ? 'rgba(255, 255, 255, .4)'
                      : 'white'
                  }
                />
              </Pressable>

              <Progress.Circle
                size={50}
                progress={position / duration || 0}
                color="#fff"
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
                <Pressable disabled={isEnded || isIdle} onPress={playPause}>
                  <Icon
                    name={isPlaying ? 'pause-circle' : 'play-circle'}
                    size={45}
                    color={
                      isEnded || isIdle ? 'rgba(255, 255, 255, .4)' : 'white'
                    }
                  />
                </Pressable>
              )}

              <Pressable
                disabled={activeTrackIndex === queue.length - 1}
                onPress={next}>
                <Icon
                  name="play-forward"
                  size={25}
                  color={
                    activeTrackIndex === queue.length - 1
                      ? 'rgba(255, 255, 255, .4)'
                      : 'white'
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
  artists: {fontSize: 14, fontWeight: '500', marginLeft: 2},
});
