import React from 'react';

// * React Native
import {View, StyleSheet, Image, Text, Pressable} from 'react-native';

// * Libraries
import {Shadow} from 'react-native-shadow-2';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import TrackPlayer, {State} from 'react-native-track-player';

// * Store
import {usePlayerStore, WIDTH} from '../store';

// * Assets
import imageFiller from '../assets/images/image-filler.png';

export default function Footer() {
  // ? Hooks
  const navigation: any = useNavigation();

  // ? StoreStates
  const {position, buffered, duration} = usePlayerStore(
    state => state.progress,
  );
  const {state} = usePlayerStore(state => state.playbackState);
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const queue = usePlayerStore(state => state.queue);

  // ? StoreActions
  const playPause = usePlayerStore(state => state.playPause);

  // ? Constants
  const isPlaying = state === State.Playing;
  const activeStates = [
    State.Playing,
    State.Paused,
    State.Buffering,
    State.Ready,
    State.Loading,
  ];

  return (
    activeStates.includes(state) && (
      <Shadow
        distance={23}
        startColor="#00000020"
        sides={{top: true}}
        style={{width: WIDTH, bottom: -1}}>
        <LinearGradient
          colors={[
            activeTrack?.palette?.[5] ?? '#000',
            activeTrack?.palette?.[1] ?? '#fff',
            activeTrack?.palette?.[0] ?? '#000',
          ]}
          useAngle={true}
          angle={290}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 1)',
            opacity: 0.7,
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
        />

        <Slider
          style={{
            width: WIDTH * 1.1,
            marginTop: -10,
            marginBottom: -10,
            marginLeft: -20,
          }}
          value={Math.floor((position ?? 0 / duration) * 100)}
          thumbTintColor="transparent"
          minimumValue={0}
          maximumValue={100}
          minimumTrackTintColor={activeTrack?.palette?.[2] || '#FFF'}
          maximumTrackTintColor="#FFFFFF"
        />

        <Pressable onPress={() => navigation.navigate('NowPlaying')}>
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 10,
              paddingHorizontal: 20,
              gap: 5,
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

            <View
              style={{
                justifyContent: 'center',
                marginTop: -2,
                maxWidth: WIDTH - 220,
                gap: 2,
              }}>
              <Text numberOfLines={1} style={styles.title}>
                {activeTrack?.title}
              </Text>
              <Text numberOfLines={1} style={styles.artists}>
                {activeTrack?.albumArtist ?? 'Unknown Artist'}
              </Text>
            </View>

            <View style={{flex: 1}} />

            <View style={{flexDirection: 'row', alignItems: 'center', gap: 20}}>
              <Pressable
                disabled={activeTrackIndex === 0}
                onPress={() => {
                  if (position <= 10) TrackPlayer.skipToPrevious();
                  else TrackPlayer.seekTo(0);
                }}
                android_ripple={{
                  color: 'white',
                  radius: 39,
                  foreground: true,
                  borderless: true,
                }}>
                <Icon
                  name="play-back"
                  size={25}
                  color={activeTrackIndex === 0 ? 'grey' : 'white'}
                />
              </Pressable>

              <Pressable onPress={playPause}>
                <Icon
                  name={isPlaying ? 'pause-circle' : 'play-circle'}
                  size={45}
                />
              </Pressable>

              <Pressable
                disabled={activeTrackIndex === queue.length - 1}
                onPress={() => TrackPlayer.skipToNext()}
                android_ripple={{
                  color: 'white',
                  radius: 39,
                  foreground: true,
                  borderless: true,
                }}>
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
        </Pressable>
      </Shadow>
    )
  );
}

const styles = StyleSheet.create({
  title: {fontSize: 17, fontWeight: '600'},
  artists: {fontSize: 14, fontWeight: '300'},
  album: {fontSize: 12, fontWeight: '300'},
});
