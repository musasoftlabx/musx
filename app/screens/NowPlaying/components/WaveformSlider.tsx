// * React
import React from 'react';

// * React Native
import {Image, Text, View} from 'react-native';

// * Libraries
import {MediaPlayerState} from 'react-native-google-cast';
import Slider from '@react-native-community/slider';

// * Store
import {usePlayerStore, WIDTH} from '../../../store';

// * Functions
import {formatTrackTime} from '../../../functions';

// * Assets
import imageFiller from '../../../assets/images/image-filler.png';

export default function WaveformSlider() {
  // ? StoreStates
  const {position, buffered, duration} = usePlayerStore(
    state => state.progress,
  );
  const {state} = usePlayerStore(state => state.playbackState);
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const palette = usePlayerStore(state => state.palette);

  // ? StoreActions
  const seekTo = usePlayerStore(state => state.seekTo);

  // ? Constants
  const isIdle = state === MediaPlayerState.IDLE;

  return (
    <>
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          top: -5,
          marginLeft: 8,
        }}>
        <Image
          source={
            activeTrack?.waveform ? {uri: activeTrack?.waveform} : imageFiller
          }
          style={{
            left: '-49%',
            top: 0,
            height: 100,
            width: WIDTH * 0.95,
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
            width: WIDTH * 0.95,
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
              width: WIDTH * 0.95,
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
            width: WIDTH * 0.95,
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
              width: WIDTH * 0.95,
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
            width: WIDTH,
            top: 41,
            zIndex: 3,
          }}
          value={Math.floor((position ?? 0 / duration) * 100)}
          disabled={isIdle}
          thumbTintColor="transparent"
          onValueChange={value => seekTo((value / 100) * duration)}
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
