// * React
import React from 'react';

// * React Native
import {
  ActivityIndicator,
  View,
  Image,
  Pressable,
  Vibration,
} from 'react-native';

// * Libraries
import * as Progress from 'react-native-progress';
import { MediaPlayerState } from 'react-native-google-cast';
import { State } from 'react-native-track-player';
import { Text } from 'react-native-paper';
import { useDeviceOrientation } from '@react-native-community/hooks';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

// * Store
import { usePlayerStore, WIDTH } from '../store';

// * Utils
import { fontFamilyBold } from '../utils';

// * Functions
import { formatTrackTime } from '../functions';

// * Assets
import imageFiller from '../assets/images/image-filler.png';

export default function Footer() {
  // ? Hooks
  const orientation = useDeviceOrientation();

  // ? Store States
  const { position, duration } = usePlayerStore(state => state.progress);
  const { state } = usePlayerStore(state => state.playbackState);
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
    State.Buffering,
    State.Paused,
    State.Loading,
    State.Buffering,
    State.Ready,
  ];

  return (
    activeStates.includes(state) && (
      <View
        style={{
          borderTopColor: '#ffffff56',
          borderTopWidth: 0.5,
          paddingHorizontal: 20,
          paddingVertical: 6,
        }}
      >
        <LinearGradient
          colors={[palette?.[1] ?? '#fff', palette?.[0] ?? '#000']}
          useAngle={true}
          angle={290}
          style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}
        />

        <View
          style={
            orientation === 'portrait'
              ? {
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }
              : { alignItems: 'center' }
          }
        >
          <Pressable
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 5,
              left: 0,
              position: orientation === 'portrait' ? 'relative' : 'absolute',
            }}
            onPress={() => {
              Vibration.vibrate(50);
              openNowPlaying(nowPlayingRef!);
            }}
          >
            <Image
              source={
                activeTrack?.artwork
                  ? { uri: activeTrack?.artwork }
                  : imageFiller
              }
              style={{
                borderColor: '#fff',
                borderRadius: 10,
                borderWidth: 0.5,
                height: 50,
                marginRight: 8,
                width: 50,
              }}
            />

            <View>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: fontFamilyBold,
                  fontSize: orientation === 'portrait' ? 17 : 15,
                  width: WIDTH * 0.35,
                }}
              >
                {activeTrack?.title}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: orientation === 'portrait' ? 14 : 13,
                  marginTop: -2,
                  opacity: 0.8,
                  width: WIDTH * 0.35,
                }}
              >
                {activeTrack?.albumArtist ?? 'Unknown Artist'}
              </Text>
              <Text
                style={{
                  display: orientation === 'portrait' ? 'flex' : 'none',
                  fontSize: 12,
                }}
              >
                {`${formatTrackTime(position)} / ${formatTrackTime(duration)}`}
              </Text>
            </View>
          </Pressable>

          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 20,
            }}
          >
            <Pressable
              disabled={(activeTrackIndex === 0 && position <= 10) || isIdle}
              onPress={() => previous(position)}
            >
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
              style={{ marginRight: -67.5, opacity: 1 }}
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
              onPress={next}
            >
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

          <Text
            style={{
              display: orientation === 'portrait' ? 'none' : 'flex',
              fontFamily: fontFamilyBold,
              fontSize: 14,
              position: orientation === 'portrait' ? 'relative' : 'absolute',
              top: 15,
              right: 0,
            }}
          >
            {`${formatTrackTime(position)} / ${formatTrackTime(duration)}`}
          </Text>
        </View>
      </View>
    )
  );
}
