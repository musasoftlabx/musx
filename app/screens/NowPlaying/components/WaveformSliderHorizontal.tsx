// * React
import React from 'react';

// * React Native
import { Image, View } from 'react-native';

// * Libraries
import { MediaPlayerState } from 'react-native-google-cast';
import { Text } from 'react-native-paper';
import Slider from '@react-native-community/slider';

// * Store
import { usePlayerStore, WIDTH } from '../../../store';

// * Functions
import { formatTrackTime } from '../../../functions';

// * Assets
import imageFiller from '../../../assets/images/image-filler.png';
import { fontFamilyBold } from '../../../utils';

export default function WaveformSliderHorizontal() {
  // ? StoreStates
  const { position, buffered, duration } = usePlayerStore(
    state => state.progress,
  );
  const { state } = usePlayerStore(state => state.playbackState);
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const palette = usePlayerStore(state => state.palette);
  const seekTo = usePlayerStore(state => state.seekTo);

  // ? Constants
  const isIdle = state === MediaPlayerState.IDLE;

  return (
    <View style={{ marginHorizontal: 20 }}>
      <Text
        style={{
          fontSize: 16,
          fontFamily: fontFamilyBold,
          top: -38,
          position: 'absolute',
        }}
      >
        {formatTrackTime(position)}
      </Text>

      <Image
        source={
          activeTrack?.waveform ? { uri: activeTrack?.waveform } : imageFiller
        }
        style={{
          left: 50,
          top: -76,
          height: 100,
          width: WIDTH * 0.9,
          opacity: 0.7,
          position: 'absolute',
          resizeMode: 'stretch',
          tintColor: 'gray',
          zIndex: 0,
        }}
      />

      <View
        style={{
          left: 50,
          top: -76,
          height: 100,
          width: WIDTH * 0.9,
          maxWidth: `${Math.floor((buffered / duration) * 99)}%` || `${0}%`,
          overflow: 'hidden',
          position: 'absolute',
          zIndex: 1,
        }}
      >
        <Image
          source={
            activeTrack?.waveform ? { uri: activeTrack?.waveform } : imageFiller
          }
          style={{
            height: 100,
            width: WIDTH * 0.9,
            position: 'absolute',
            resizeMode: 'stretch',
            tintColor: 'white',
            opacity: 0.5,
            zIndex: 1,
          }}
        />
      </View>

      <View
        style={{
          left: 50,
          top: -76,
          height: 100,
          width: WIDTH * 0.9,
          maxWidth: position
            ? `${Math.floor((position / duration) * 99)}%`
            : `${0}%`,
          overflow: 'hidden',
          position: 'absolute',
          zIndex: 2,
        }}
      >
        <Image
          source={
            activeTrack?.waveform ? { uri: activeTrack?.waveform } : imageFiller
          }
          style={{
            height: 100,
            width: WIDTH * 0.9,
            position: 'absolute',
            resizeMode: 'stretch',
            tintColor: palette?.[3],
            zIndex: 2,
          }}
        />
      </View>

      <Slider
        style={{
          left: 35,
          top: -35,
          right: 35,
          position: 'absolute',
          zIndex: 3,
        }}
        value={Math.floor((position ?? 0 / duration) * 100)}
        disabled={isIdle}
        thumbTintColor="transparent"
        onValueChange={value => seekTo((value / 100) * duration)}
        minimumValue={0}
        maximumValue={100}
        minimumTrackTintColor={palette?.[0] || '#FFF'}
        maximumTrackTintColor="#fff"
      />

      <Text
        style={{
          fontSize: 16,
          fontFamily: fontFamilyBold,
          top: -38,
          position: 'absolute',
          right: 0,
        }}
      >
        {formatTrackTime(duration)}
      </Text>
    </View>
  );
}
