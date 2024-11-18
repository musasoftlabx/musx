// * React
import React from 'react';

// * React Native
import {Image, Text, View} from 'react-native';

// * Libraries
import Slider from '@react-native-community/slider';
import TrackPlayer from 'react-native-track-player';

// * Store
import {usePlayerStore, WIDTH} from '../../../store';

// * Assets
import imageFiller from '../../../assets/images/image-filler.png';

// * Functions
const formatTrackTime = (secs: number) => {
  secs = Math.round(secs);
  let minutes = Math.floor(secs / 60) || 0;
  let seconds = secs - minutes * 60 || 0;
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
};

export default function WaveformSlider() {
  // ? StoreStates
  const {position, buffered, duration} = usePlayerStore(
    state => state.progress,
  );
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const palette = usePlayerStore(state => state.palette);

  return (
    <>
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          top: -5,
          marginLeft: 53,
        }}>
        <Image
          source={
            activeTrack?.waveform ? {uri: activeTrack?.waveform} : imageFiller
          }
          style={{
            left: '-49%',
            top: 0,
            height: 100,
            width: WIDTH * 0.45,
            position: 'absolute',
            resizeMode: 'stretch',
            tintColor: 'gray',
            zIndex: 0,
            opacity: 0.5,
          }}
        />

        <View
          style={{
            left: '-49%',
            height: 100,
            width: WIDTH * 0.45,
            maxWidth: `${Math.floor((buffered / duration) * 99)}%` || `${0}%`,
            overflow: 'hidden',
            position: 'absolute',
            zIndex: 1,
          }}>
          <Image
            source={
              activeTrack?.waveform ? {uri: activeTrack?.waveform} : imageFiller
            }
            style={{
              height: 100,
              width: WIDTH * 0.45,
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
            left: '-49%',
            height: 100,
            width: WIDTH * 0.45,
            maxWidth: position
              ? `${Math.floor((position / duration) * 99)}%`
              : `${0}%`,
            overflow: 'hidden',
            position: 'absolute',
            zIndex: 2,
          }}>
          <Image
            source={
              activeTrack?.waveform ? {uri: activeTrack?.waveform} : imageFiller
            }
            style={{
              height: 100,
              width: WIDTH * 0.45,
              position: 'absolute',
              resizeMode: 'stretch',
              tintColor: palette[3],
              zIndex: 2,
            }}
          />
        </View>

        <View style={{flex: 0.01}} />

        <Slider
          style={{
            left: '-53%',
            position: 'absolute',
            width: WIDTH * 0.49,
            top: 41,
            zIndex: 3,
          }}
          value={Math.floor((position ?? 0 / duration) * 100)}
          thumbTintColor="transparent"
          onValueChange={value => TrackPlayer.seekTo((value / 100) * duration)}
          minimumValue={0}
          maximumValue={100}
          minimumTrackTintColor={palette[0] || '#FFF'}
          maximumTrackTintColor="#fff"
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginTop: 60,
          marginBottom: 10,
          marginHorizontal: 20,
          gap: 10,
        }}>
        <Text style={{fontSize: 16, fontWeight: 'bold'}}>
          {formatTrackTime(position)}
        </Text>
        <View style={{flex: 1}} />
        <Text style={{fontSize: 16, fontWeight: 'bold'}}>
          {formatTrackTime(duration)}
        </Text>
      </View>
    </>
  );
}
