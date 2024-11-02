import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  Image,
  Dimensions,
  View,
  Pressable,
  Text,
  ScrollView,
  SectionList,
  StyleSheet,
  Vibration,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import {Shadow} from 'react-native-shadow-2';
import {useMutation} from '@tanstack/react-query';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import axios from 'axios';
import Carousel, {ICarouselInstance} from 'react-native-reanimated-carousel';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import StarRating from 'react-native-star-rating-widget';
import TextTicker from 'react-native-text-ticker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TrackPlayer, {
  useTrackPlayerEvents,
  usePlaybackState,
  useProgress,
  RepeatMode,
  Event,
  State,
  RatingType,
  useActiveTrack,
  usePlayWhenReady,
  Track,
} from 'react-native-track-player';

import {MD3Colors} from 'react-native-paper';
import {SERVER_URL, usePlayerStore} from '../../store';

import BackTo from './BackTo';
import UpNext from './UpNext';
import Lyrics from './Lyrics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {Lyric} from 'react-native-lyric';

const logoJPG = require('../../assets/images/logo.jpg');
const imageFiller = require('../../assets/images/image-filler.png');

const duration = 2000;
const easing = Easing.bezier(0.25, -0.5, 0.25, 1);
const millisecondsMultiplier = 1001;

const NowPlaying = ({navigation}: any) => {
  const {mutate: saveRating} = useMutation({
    mutationFn: (body: {id?: number; rating: number}) =>
      axios.patch('rateTrack', body),
  });

  const {mutate: updatePlayCount} = useMutation({
    mutationFn: (body: {id?: number}) => axios.patch('updatePlayCount', body),
  });

  const ref = React.useRef<ICarouselInstance>(null);
  //const progress = useSharedValue<number>(0);
  const {state} = usePlaybackState();
  const activeTrack = useActiveTrack();
  const playwhenready = usePlayWhenReady();

  const pauseplay = usePlayerStore(state => state.pauseplay);

  //const isPlaying = playerState === State.Playing;

  const {position, buffered, duration} = useProgress();
  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);

  const [queue, setQueue] = useState<any>([]);
  const [artworkQueue, setArtworkQueue] = useState<string[]>([]);
  const [trimmedArtworkQueue, setTrimmedArtworkQueue] = useState<string[]>([]);
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>();
  const [trackRating, setTrackRating] = useState<Track['rating']>(0);
  const [trackPlayCount, setTrackPlayCount] = useState<number>(0);
  const [playRegistered, setPlayRegistered] = useState<boolean>(false);
  const [lyrics, setLyrics] = useState(null);
  const [lyricsVisible, setLyricsVisible] = useState(false);

  const layout = useWindowDimensions();

  const [tabIndex, setTabIndex] = useState(2);

  const handleSetRepeatMode = async () => {
    if (repeatMode === RepeatMode.Off) {
      await TrackPlayer.setRepeatMode(RepeatMode.Track);
      setRepeatMode(RepeatMode.Track);
    } else if (repeatMode === RepeatMode.Track) {
      await TrackPlayer.setRepeatMode(RepeatMode.Queue);
      setRepeatMode(RepeatMode.Queue);
    } else if (repeatMode === RepeatMode.Queue) {
      await TrackPlayer.setRepeatMode(RepeatMode.Off);
      setRepeatMode(RepeatMode.Off);
    }
  };

  const sv = useSharedValue<number>(0);

  React.useEffect(() => {
    sv.value = withRepeat(withTiming(1, {duration, easing}), -1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${sv.value * 360}deg`}],
  }));

  const lineRenderer = useCallback(
    ({lrcLine: {millisecond, content}, index, active}: any) => (
      <Text
        onPress={() => TrackPlayer.seekTo(millisecond / millisecondsMultiplier)}
        // onLongPress={() =>
        //   isPlaying ? TrackPlayer.pause() : TrackPlayer.play()
        // }
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

  // const getRepeatMode = async () => {
  //   const repeatMode = await TrackPlayer.getRepeatMode();
  //   setRepeatMode(repeatMode);
  // };

  // const populate = async () => {
  //   const index = await TrackPlayer.getCurrentTrack();
  //   const track = await TrackPlayer.getTrack(index);
  //   const queue = await TrackPlayer.getQueue();

  //   let sliced;

  //   if (index === 0) {
  //     sliced = queue.slice(0, index + 2);
  //   } else if (index === queue.length - 1) {
  //     sliced = queue.slice(index - 1, 1);
  //   } else {
  //     sliced = queue.slice(index - 1, index + 2);
  //   }
  //   setImageQueue(sliced.map(track => track.artwork));

  //   setImageIndex(
  //     sliced.findIndex(__track => __track.artwork === track.artwork),
  //   );

  //   setTrackMetadata(track);
  // };

  // useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
  //   if (
  //     event.type === Event.PlaybackTrackChanged &&
  //     event.nextTrack !== undefined
  //   ) {
  //     populate();
  //   }
  // });

  useTrackPlayerEvents(
    [Event.PlaybackActiveTrackChanged, Event.PlaybackProgressUpdated],
    async event => {
      if (event.type === Event.PlaybackActiveTrackChanged) {
        setPlayRegistered(false);

        const _queue = await TrackPlayer.getQueue();
        const _activeTrackIndex = await TrackPlayer.getActiveTrackIndex();
        const _artworkQueue = _queue.map((track: Track['']) => track.artwork);

        setActiveTrackIndex(_activeTrackIndex);
        setQueue(_queue);
        setArtworkQueue(_artworkQueue);
        // setTrimmedArtworkQueue([
        //   ..._artworkQueue.slice(
        //     _activeTrackIndex! - 1,
        //     _activeTrackIndex! + 2,
        //   ),
        // ]);
        setTrimmedArtworkQueue([
          ..._artworkQueue.slice(_activeTrackIndex! - 1, _activeTrackIndex),
          ..._artworkQueue.slice(_activeTrackIndex, _activeTrackIndex! + 2),
        ]);

        setTrackRating(activeTrack?.rating);
        setTrackPlayCount(activeTrack?.plays);

        axios
          .get(
            `${SERVER_URL}/Music/${activeTrack?.path.replace('.mp3', '.lrc')}`,
          )
          .then(({data: lyrics}) => {
            setLyrics(lyrics);
            setLyricsVisible(true);
          })
          .catch(err => {
            setLyrics(null);
            setLyricsVisible(false);
          });

        await AsyncStorage.setItem('queue', JSON.stringify(_queue));
      }

      if (event.type === Event.PlaybackProgressUpdated) {
        if (position >= 10 && playRegistered === false) {
          setPlayRegistered(true);
          setTrackPlayCount(prev => prev + 1);
          TrackPlayer.updateMetadataForTrack(activeTrackIndex!, {
            ...activeTrack,
            plays: activeTrack?.plays! + 1,
          } as Track);
          updatePlayCount(
            {id: activeTrack?.id},
            {onSuccess: ({data}) => console.log(data)},
          );
        }
      }
    },
  );

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack(null);
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  const formatTrackTime = (secs: number) => {
    secs = Math.round(secs);
    let minutes = Math.floor(secs / 60) || 0;
    let seconds = secs - minutes * 60 || 0;
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  };

  const WIDTH = Dimensions.get('window').width;
  const HEIGHT = Dimensions.get('window').height;

  const SECTIONS = [
    {
      title: 'Player',
      data: [
        {
          key: '1',
        },
      ],
    },
  ];

  return (
    <>
      <LinearGradient
        colors={[
          activeTrack?.palette?.[5] ?? '#000',
          activeTrack?.palette?.[1] ?? '#fff',
          activeTrack?.palette?.[0] ?? '#000',
        ]}
        useAngle={true}
        angle={200}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          opacity: 0.8,
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      />

      <SectionList
        contentContainerStyle={{paddingHorizontal: 10}}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        sections={SECTIONS}
        renderSectionHeader={({section}) => (
          <>
            <View
              style={{
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                paddingTop: 10,
                paddingRight: 5,
              }}>
              <MaterialIcons name="cast" size={25} />
            </View>

            <View
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                height: HEIGHT,
              }}>
              {lyrics && lyricsVisible ? (
                <Carousel
                  ref={ref}
                  width={WIDTH}
                  height={WIDTH}
                  mode="parallax"
                  enabled={false}
                  snapEnabled={true}
                  modeConfig={{
                    parallaxScrollingScale: 0.9,
                    parallaxScrollingOffset: 100,
                  }}
                  loop={false}
                  data={['lyric']}
                  defaultIndex={0}
                  renderItem={() => (
                    <View
                      style={{
                        backgroundColor: activeTrack?.palette[1],
                        borderRadius: 20,
                        width: WIDTH,
                        height: WIDTH,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          paddingVertical: 10,
                          paddingHorizontal: 10,
                        }}>
                        <Animated.Image
                          source={{uri: activeTrack?.artwork}}
                          style={[
                            {
                              height: 45,
                              width: 45,
                              marginRight: 8,
                              borderRadius: 10,
                            },
                            animatedStyle,
                          ]}
                        />
                        <View
                          style={{
                            justifyContent: 'center',
                            marginTop: -2,
                            maxWidth: Dimensions.get('window').width - 175,
                          }}>
                          <Text
                            numberOfLines={1}
                            style={{fontSize: 17, fontWeight: '600'}}>
                            {activeTrack?.title || activeTrack?.name}
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
                  )}
                />
              ) : (
                <Carousel
                  ref={ref}
                  width={WIDTH}
                  height={WIDTH}
                  mode="parallax"
                  enabled={true}
                  snapEnabled={true}
                  loop={false}
                  scrollAnimationDuration={2000}
                  modeConfig={{
                    parallaxScrollingScale: 0.9,
                    parallaxScrollingOffset: 130,
                  }}
                  // data={artworkQueue}
                  // defaultIndex={activeTrackIndex}
                  // onSnapToItem={index => TrackPlayer.skip(index)}
                  data={trimmedArtworkQueue}
                  defaultIndex={
                    activeTrackIndex === 0
                      ? 0
                      : activeTrackIndex === queue.length
                      ? 2
                      : 1
                  }
                  onSnapToItem={async index => {
                    if (index < 1) {
                      TrackPlayer.skipToPrevious();
                      if (activeTrackIndex != 0) {
                        ref.current?.next();
                        setTrimmedArtworkQueue((prev: any) => [
                          artworkQueue.splice(activeTrackIndex! - 2, 1)[0],
                          prev[0],
                          prev[1],
                        ]);
                      }
                    } else if (index > 1) {
                      TrackPlayer.skipToNext();
                      if (activeTrackIndex != queue.length) {
                        ref.current?.prev();
                        setTrimmedArtworkQueue((prev: any) => [
                          prev[1],
                          prev[2],
                          artworkQueue.splice(activeTrackIndex! + 2, 1)[0],
                        ]);
                      }
                    }
                  }}
                  renderItem={({
                    index,
                    item,
                  }: {
                    index: number;
                    item: string;
                  }) => (
                    <Shadow
                      startColor={
                        activeTrackIndex! === index ? `#00000066` : '#00000000'
                      }
                      distance={3}>
                      <Image
                        source={item ? {uri: item} : imageFiller}
                        style={{
                          height: WIDTH,
                          width: WIDTH,
                          borderRadius: 15,
                          transform:
                            index === 0
                              ? [{rotateX: '360deg'}, {rotateY: '-310deg'}]
                              : index === 2
                              ? [{rotateX: '0deg'}, {rotateY: '-50deg'}]
                              : [],
                          // transform:
                          //   activeTrackIndex! > index
                          //     ? [{rotateX: '360deg'}, {rotateY: '-310deg'}]
                          //     : activeTrackIndex! < index
                          //     ? [{rotateX: '0deg'}, {rotateY: '-50deg'}]
                          //     : [],
                        }}
                      />
                    </Shadow>
                  )}
                />
              )}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: WIDTH * 0.95,
                  gap: 20,
                }}>
                <View style={{flexDirection: 'row', gap: 5}}>
                  <Ionicons name="musical-notes-sharp" size={21} />

                  <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                    {trackPlayCount} play
                    {`${trackPlayCount === 1 ? '' : 's'}`}
                  </Text>
                </View>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: activeTrack?.palette[1],
                    borderRadius: 7,
                    flexDirection: 'row',
                    opacity: 0.7,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}>
                  <Text style={{fontWeight: 'bold'}}>
                    {`${activeTrack?.format.toLocaleUpperCase()} ${
                      activeTrack?.sampleRate! / 1000
                    } KHz`}
                  </Text>

                  <Text style={{fontWeight: 'bold'}}>
                    &nbsp;&nbsp;/&nbsp;&nbsp;
                  </Text>

                  <Text style={{fontWeight: 'bold'}}>
                    {(activeTrack?.bitrate! / 1000).toFixed(2)} Kbps
                  </Text>
                </View>

                <View style={{flexDirection: 'row', gap: 5}}>
                  <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                    {`${activeTrackIndex! + 1} / ${artworkQueue.length}`}
                  </Text>

                  <Ionicons name="disc" size={21} />
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 20,
                  gap: 10,
                }}>
                <Pressable
                  style={{
                    ...styles.chip,
                    backgroundColor: `${activeTrack?.palette[1]}66`,
                  }}
                  onPress={handleSetRepeatMode}>
                  {repeatMode === RepeatMode.Off ? (
                    <MaterialCommunityIcons name="repeat-off" size={25} />
                  ) : repeatMode === RepeatMode.Track ? (
                    <MaterialCommunityIcons
                      name="repeat-once"
                      size={25}
                      color="#54ff65"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="repeat"
                      size={25}
                      color="#d7ff54"
                    />
                  )}
                </Pressable>

                <StarRating
                  rating={trackRating as RatingType}
                  //rating={activeTrack?.rating}
                  onChange={rating => {
                    Vibration.vibrate(50);
                    setTrackRating(rating);
                    TrackPlayer.updateMetadataForTrack(activeTrackIndex!, {
                      ...activeTrack,
                      rating,
                    });

                    saveRating(
                      {id: activeTrack?.id, rating},
                      {
                        onSuccess: ({data}) => console.log(data),
                        onError: error => console.log(error),
                      },
                    );
                  }}
                />

                <Pressable
                  style={{
                    ...styles.chip,
                    backgroundColor: `${activeTrack?.palette[1]}66`,
                  }}
                  onPress={() => {
                    setLyricsVisible(prev => !prev);
                  }}>
                  <MaterialIcons name="lyrics" size={25} />
                </Pressable>
              </View>

              {/* Waveform */}
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  top: -5,
                  marginLeft: 5,
                }}>
                <Image
                  source={
                    activeTrack?.waveform
                      ? {uri: activeTrack?.waveform}
                      : imageFiller
                  }
                  style={{
                    left: '-49%',
                    top: 0,
                    height: 100,
                    width: WIDTH * 0.9,
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
                    width: WIDTH * 0.9,
                    maxWidth:
                      `${Math.floor((buffered / duration) * 99)}%` || `${0}%`,
                    overflow: 'hidden',
                    position: 'absolute',
                    zIndex: 1,
                  }}>
                  <Image
                    source={
                      activeTrack?.waveform
                        ? {uri: activeTrack?.waveform}
                        : imageFiller
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
                    left: '-49%',
                    height: 100,
                    width: WIDTH * 0.9,
                    maxWidth:
                      `${Math.floor((position / duration) * 99)}%` || `${0}%`,
                    overflow: 'hidden',
                    position: 'absolute',
                    zIndex: 2,
                  }}>
                  <Image
                    source={
                      activeTrack?.waveform
                        ? {uri: activeTrack?.waveform}
                        : imageFiller
                    }
                    style={{
                      height: 100,
                      width: WIDTH * 0.9,
                      position: 'absolute',
                      resizeMode: 'stretch',
                      tintColor: activeTrack?.palette[3],
                      zIndex: 2,
                    }}
                  />
                </View>

                <View style={{flex: 0.01}} />

                <Slider
                  style={{
                    left: '-53%',
                    position: 'absolute',
                    width: WIDTH * 0.97,
                    top: 41,
                    zIndex: 3,
                  }}
                  value={Math.floor((position / duration) * 100)}
                  thumbTintColor="transparent"
                  onValueChange={value =>
                    TrackPlayer.seekTo((value / 100) * duration)
                  }
                  minimumValue={0}
                  maximumValue={100}
                  minimumTrackTintColor={activeTrack?.palette[0] || '#FFF'}
                  maximumTrackTintColor="#fff"
                />
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  marginTop: 60,
                  marginBottom: 10,
                  marginHorizontal: 20,
                  gap: 10,
                }}>
                <Text style={styles.startTime}>
                  {formatTrackTime(position)}
                </Text>
                <View style={{flex: 1}} />
                <Text style={styles.endTime}>{formatTrackTime(duration)}</Text>
              </View>

              <Text numberOfLines={1} style={styles.artists}>
                {activeTrack?.artists || 'No Artists'}
              </Text>

              <TextTicker
                style={styles.title}
                duration={20000}
                loop
                bounce
                bounceSpeed={10}
                repeatSpacer={50}
                marqueeDelay={3000}>
                {activeTrack?.title}
              </TextTicker>

              <View style={{flexDirection: 'row', gap: 3}}>
                <Text numberOfLines={1} style={styles.album}>
                  {activeTrack?.album
                    ? activeTrack?.album === activeTrack?.title
                      ? activeTrack?.albumArtist + ' Singles'
                      : activeTrack?.album
                    : 'No Album'}
                </Text>

                <Text style={{fontSize: 18, fontWeight: '400'}}>
                  (
                  {activeTrack?.year
                    ? `${activeTrack?.year.slice(0, 4)}`
                    : activeTrack?.encoder}
                  )
                </Text>
              </View>

              <View style={styles.controls}>
                <Pressable
                  disabled={activeTrackIndex === 0}
                  onPress={() => TrackPlayer.skip(0)}>
                  <Ionicons
                    name="play-back"
                    size={40}
                    color={activeTrackIndex === 0 ? 'grey' : 'white'}
                  />
                </Pressable>

                <Pressable
                  disabled={activeTrackIndex === 0}
                  onPress={() => TrackPlayer.skipToPrevious()}>
                  <Ionicons
                    name="play-back-circle"
                    size={70}
                    color={activeTrackIndex === 0 ? 'grey' : 'white'}
                  />
                </Pressable>

                <Pressable onPress={() => pauseplay()}>
                  <Ionicons
                    name={
                      state === State.Playing ? 'pause-circle' : 'play-circle'
                    }
                    size={100}
                    color="#fff"
                  />
                </Pressable>

                <Pressable
                  disabled={activeTrackIndex === artworkQueue.length - 1}
                  onPress={() => TrackPlayer.skipToNext()}>
                  <Ionicons
                    name="play-forward-circle"
                    size={70}
                    color={
                      activeTrackIndex === artworkQueue.length - 1
                        ? 'grey'
                        : 'white'
                    }
                  />
                </Pressable>

                <Pressable
                  disabled={activeTrackIndex === artworkQueue.length - 1}
                  onPress={() => TrackPlayer.skip(artworkQueue.length)}>
                  <Ionicons
                    name="play-forward"
                    size={40}
                    color={
                      activeTrackIndex === artworkQueue.length - 1
                        ? 'grey'
                        : 'white'
                    }
                  />
                </Pressable>
              </View>

              <View style={{flex: 1}}></View>
            </View>
          </>
        )}
        renderItem={() => (
          <ScrollView>
            <TabView
              lazy
              navigationState={{
                index: tabIndex,
                routes: [
                  {key: 'backTo', title: 'BACK TO'},
                  {key: 'upNext', title: 'UP NEXT'},
                  //{key: 'lyrics', title: 'LYRICS'},
                ],
              }}
              renderScene={SceneMap({
                backTo: () =>
                  BackTo({
                    queue,
                    artworkQueue,
                    trimmedArtworkQueue,
                    activeTrackIndex,
                    trackRating,
                    trackPlayCount,
                    playRegistered,
                  }),
                upNext: () =>
                  UpNext({
                    queue,
                    artworkQueue,
                    trimmedArtworkQueue,
                    activeTrackIndex,
                    trackRating,
                    trackPlayCount,
                    playRegistered,
                  }),
                //lyrics: Lyrics,
              })}
              renderTabBar={props => (
                <TabBar
                  {...props}
                  indicatorStyle={{backgroundColor: 'yellow'}}
                  style={{
                    backgroundColor: 'transparent',
                    shadowColor: 'transparent',
                    borderBottomWidth: 1,
                    borderBottomColor: 'white',
                  }}
                />
              )}
              onIndexChange={setTabIndex}
              initialLayout={{width: layout.width}}
              //style={{height: 15 * 36 || 0}}
              style={{height: 400}}
            />
          </ScrollView>
        )}
      />
    </>
  );
};

{
  /* <Tab.Navigator initialRouteName="UpNext">
  <Tab.Screen
    name="BackTo"
    component={BackTo}
    options={{tabBarLabel: 'Back To'}}
    style={{height: 100}}
  />
  <Tab.Screen name="UpNext" component={UpNext} />
  <Tab.Screen name="Popular" component={Popular} />
</Tab.Navigator>; */
}

{
  /* <Carousel
                ref={ref}
                width={WIDTH}
                height={WIDTH}
                mode="parallax"
                modeConfig={{
                  parallaxScrollingScale: 0.9,
                  parallaxScrollingOffset: 150,
                }}
                loop={false}
                data={[
                  artworkQueue
                ]}
                //scrollAnimationDuration={1000}
                defaultIndex={activeArtwork}
                snapEnabled={true}
                onSnapToItem={index => skipTo(index)}
                // renderItem={({index, item}) => (
                //   <Image
                //     defaultSource={{uri: imageFiller}}
                //     source={{uri: item}}
                //     style={{height: WIDTH, width: WIDTH, borderRadius: 40}}
                //   />
                // )}
                renderItem={({index, item}: {index: number; item: string}) => {
                  //console.log(index, activeTrackIndex);
                  return (
                    <Shadow
                      key={index}
                      startColor={
                        activeTrackIndex! === index ? `#00000066` : '#00000000'
                      }
                      distance={3}>
                      <Image
                        source={{uri: item}}
                        style={{
                          height: WIDTH,
                          width: WIDTH,
                          borderRadius: 12,
                          transform:
                            activeTrackIndex! > index
                              ? [{rotateX: '360deg'}, {rotateY: '-310deg'}]
                              : activeTrackIndex! < index
                              ? [{rotateX: '0deg'}, {rotateY: '-50deg'}]
                              : [],
                        }}
                      />
                    </Shadow>
                  );
                }}
              /> */
}

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  startTime: {fontSize: 16, fontWeight: 'bold'},
  endTime: {fontSize: 16, fontWeight: 'bold'},
  artists: {
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 5,
    marginBottom: 8,
  },
  album: {
    fontSize: 18,
    fontWeight: '500',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    borderRadius: 10,
    height: 35,
    margin: 10,
    //opacity: 0.6,
    padding: 5,
    paddingHorizontal: 15,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  activePlaylistSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderBottomColor: 'yellow',
    borderBottomWidth: 3,
  },
  inactivePlaylistSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderBottomWidth: 0,
  },
  activePlaylistSectionText: {fontSize: 20, fontWeight: '900', color: 'yellow'},
  inactivePlaylistSectionText: {fontSize: 20, fontWeight: '500'},
});

export default NowPlaying;
