// * React
import React, {useCallback} from 'react';

// * React Native
import {Text, View} from 'react-native';

// * Libraries
import * as Animatable from 'react-native-animatable';
import {Lyric} from 'react-native-lyric';
import {Shadow} from 'react-native-shadow-2';
import TrackPlayer, {isPlaying, State} from 'react-native-track-player';

// * Store
import {usePlayerStore, WIDTH} from '../../../store';

const millisecondsMultiplier = 1010;

export default function Lyrics() {
  // ? StoreStates
  const {position} = usePlayerStore(state => state.progress);
  const {state} = usePlayerStore(state => state.playbackState);
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const lyrics = usePlayerStore(state => state.lyrics);
  const palette = usePlayerStore(state => state.palette);

  // ? Constants
  const isPlaying = state === State.Playing;

  // ? Callbacks
  const lineRenderer = useCallback(
    ({lrcLine: {millisecond, content}, index, active}: any) => (
      <Text
        onPress={() => TrackPlayer.seekTo(millisecond / millisecondsMultiplier)}
        style={{
          fontSize: active ? 28 : 22,
          textAlign: 'center',
          color: active ? 'yellow' : 'rgba(255,255,255,.5)',
          fontWeight: active ? 'bold' : '500',
        }}>
        {content}
      </Text>
    ),
    [],
  );

  return (
    <Shadow
      distance={20}
      //sides={{top: false}}
      //corners={{topStart: false, topEnd: false}}
      startColor="#00000020"
      containerStyle={{
        flex: 1,
        marginVertical: 15,
        marginBottom: 0,
        width: WIDTH * 0.95,
      }}>
      <View
        style={{
          backgroundColor: palette[1],
          borderRadius: 20,
          width: WIDTH * 0.95,
          height: WIDTH * 0.95,
        }}>
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 10,
            paddingLeft: 15,
            paddingRight: 20,
          }}>
          <Animatable.Image
            animation={isPlaying ? 'rotate' : ''}
            easing="linear"
            iterationCount="infinite"
            iterationDelay={3000}
            source={{uri: activeTrack?.artwork}}
            style={[
              {
                height: 45,
                width: 45,
                marginRight: 8,
                borderRadius: 50,
              },
            ]}
          />
          <View
            style={{
              justifyContent: 'center',
              marginTop: -2,
              maxWidth: WIDTH - 175,
            }}>
            <Text numberOfLines={1} style={{fontSize: 17, fontWeight: '600'}}>
              {activeTrack?.title}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 14,
                fontWeight: '300',
                fontStyle: 'italic',
              }}>
              {activeTrack?.artists || 'Unknown Artist'}
            </Text>
          </View>
          <View style={{flex: 1}} />
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}>
            <Text style={{fontWeight: 'bold', marginRight: 5}}>
              {activeTrack?.plays || 0} play
              {activeTrack?.plays === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        <Lyric
          style={{marginBottom: 30}}
          lrc={lyrics}
          autoScroll
          autoScrollAfterUserScroll={300}
          currentTime={position * millisecondsMultiplier}
          lineHeight={60}
          height={200}
          lineRenderer={lineRenderer}
        />
      </View>
    </Shadow>
  );
}
