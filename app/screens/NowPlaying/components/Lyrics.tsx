// * React
import React, {useCallback, useEffect} from 'react';

// * React Native
import {Image, ImageBackground, Text, View} from 'react-native';

// * Libraries
import {Lyric} from 'react-native-lyric';
import {Shadow} from 'react-native-shadow-2';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import TrackPlayer, {State} from 'react-native-track-player';

// * Store
import {LIST_ITEM_HEIGHT, usePlayerStore, WIDTH} from '../../../store';

// * Types
import {LyricsButton} from '..';

// * Constants
const millisecondsMultiplier = 1010;
const duration = 1000;
const easing = Easing.bezier(0.25, 0.5, 0.75, 1);
//const easing = Easing.linear((t)=>t);

console.log(easing);

export default function Lyrics({
  lyricsVisible,
  setLyricsVisible,
}: {
  lyricsVisible: boolean;
  setLyricsVisible: (lyricsVisible: boolean) => void;
}) {
  // ? Hooks
  const sv = useSharedValue<number>(0);

  useEffect(() => {
    sv.value = withRepeat(withTiming(1, {duration, easing}), -1);
    //sv.value = withRepeat(withSpring(1, {mass: 1, stiffness: 1}), -1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${sv.value * 360}deg`}],
  }));

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
    <View style={{flex: 1}}>
      <Shadow
        distance={20}
        startColor="#00000020"
        containerStyle={{
          marginBottom: 0,
          width: WIDTH * 0.95,
        }}>
        <View
          style={{
            backgroundColor: palette[1],
            borderRadius: 20,
            width: WIDTH * 0.95,
            height: WIDTH * 0.95,
            overflow: 'hidden',
          }}>
          <ImageBackground
            source={{uri: activeTrack?.artwork}}
            resizeMode="contain"
            blurRadius={15}
            style={{marginTop: -50}}>
            <View
              style={{
                backgroundColor: palette[0],
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                opacity: 0.8,
              }}
            />

            <View
              style={{
                backgroundColor: `${palette[0]}CC`,
                flexWrap: 'nowrap',
                flexDirection: 'row',
                alignItems: 'center',
                height: LIST_ITEM_HEIGHT,
                position: 'absolute',
                marginTop: 50,
                paddingLeft: 10,
                zIndex: 1,
              }}>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                {isPlaying ? (
                  <Animated.Image
                    source={{uri: activeTrack?.artwork}}
                    style={[
                      {borderRadius: 50, height: 45, width: 45},
                      animatedStyle,
                    ]}
                  />
                ) : (
                  <Image
                    source={{uri: activeTrack?.artwork}}
                    style={[{borderRadius: 50, height: 45, width: 45}]}
                  />
                )}

                <View style={{flex: 1, gap: 2}}>
                  <Text
                    numberOfLines={1}
                    style={{fontSize: 16, fontWeight: '600', width: '97%'}}>
                    {activeTrack?.title}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{fontSize: 14, color: '#ffffff80'}}>
                    {activeTrack?.artists ?? 'Unknown Artist'}
                  </Text>
                </View>
              </View>

              <LyricsButton
                palette={palette}
                lyrics={lyrics}
                lyricsVisible={lyricsVisible}
                setLyricsVisible={setLyricsVisible}
              />
            </View>

            <Lyric
              lrc={lyrics}
              autoScroll
              autoScrollAfterUserScroll={300}
              currentTime={position * millisecondsMultiplier}
              lineHeight={60}
              lineRenderer={lineRenderer}
            />
          </ImageBackground>
        </View>
      </Shadow>
    </View>
  );
}
