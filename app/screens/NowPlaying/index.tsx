// * React
import React, {useState, useEffect, useCallback, useRef, useMemo} from 'react';

// * React Native
import {
  BackHandler,
  Button,
  Image,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';

// * Libraries
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {Lyric} from 'react-native-lyric';
import {Shadow} from 'react-native-shadow-2';
import {useMutation} from '@tanstack/react-query';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import axios from 'axios';
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Carousel, {ICarouselInstance} from 'react-native-reanimated-carousel';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SelectDropdown from 'react-native-select-dropdown';
import Slider from '@react-native-community/slider';
import StarRating from 'react-native-star-rating-widget';
import TextTicker from 'react-native-text-ticker';
import TrackPlayer, {RepeatMode, State} from 'react-native-track-player';

// * Store
import {HEIGHT, usePlayerStore, WIDTH} from '../../store';

// * Assets
import imageFiller from '../../assets/images/image-filler.png';
import {RadioButton} from 'react-native-paper';
import {GestureHandlerRootView, ScrollView} from 'react-native-gesture-handler';
import SelectX from '../../components/SelectX';
import Icon from 'react-native-vector-icons/Ionicons';
import GradientEditor from '../../components/GradientEditor';

// * Components

const easing = Easing.bezier(0.25, -0.5, 0.25, 1);
const millisecondsMultiplier = 1010;

export default function NowPlaying({navigation}: any) {
  // ? Refs
  const ref = useRef<ICarouselInstance>(null);
  /* const bottomSheetRef = useRef<BottomSheet>(null);
  // variables
  const snapPoints = useMemo(() => ['25%', '50%'], []);
  // renders
  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props} bottomInset={24}>
        <View
          style={{
            padding: 12,
            margin: 12,
            borderRadius: 12,
            backgroundColor: '#80f',
          }}>
          <Text
            style={{
              textAlign: 'center',
              color: 'white',
              fontWeight: '800',
            }}>
            Footer
          </Text>
        </View>
      </BottomSheetFooter>
    ),
    [],
  ); */

  // ? States
  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);
  const [value, setValue] = React.useState('first');

  // ? Mutations
  const {mutate: saveRating} = useMutation({
    mutationFn: (body: {id?: number; rating: number}) =>
      axios.patch('rateTrack', body),
  });

  // ? StoreStates
  const {position, buffered, duration} = usePlayerStore(
    state => state.progress,
  );
  const {state} = usePlayerStore(state => state.playbackState);
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const queue = usePlayerStore(state => state.queue);
  const artworkQueue = usePlayerStore(state => state.artworkQueue);
  const carouselQueue = usePlayerStore(state => state.carouselQueue);
  const trackRating = usePlayerStore(state => state.trackRating);
  const trackPlayCount = usePlayerStore(state => state.trackPlayCount);
  const lyricsVisible = usePlayerStore(state => state.lyricsVisible);
  const lyrics = usePlayerStore(state => state.lyrics);

  // ? StoreActions
  const playPause = usePlayerStore(state => state.playPause);
  const setTrackRating = usePlayerStore(state => state.setTrackRating);
  const setLyricsVisible = usePlayerStore(state => state.setLyricsVisible);
  const setCarouselQueue = usePlayerStore(state => state.setCarouselQueue);

  // ? Functions
  const handleRepeatMode = async () => {
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

  const formatTrackTime = (secs: number) => {
    secs = Math.round(secs);
    let minutes = Math.floor(secs / 60) || 0;
    let seconds = secs - minutes * 60 || 0;
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  };

  // ? Constants
  const isPlaying = state === State.Playing;

  // ? Reanimated Animations
  const sv = useSharedValue<number>(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${sv.value * 360}deg`}],
  }));
  useEffect(() => {
    sv.value = withRepeat(withTiming(1, {duration, easing}), -1);
  }, []);

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

  // ? Effects
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

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '50%'], []);
  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props} bottomInset={24}>
        <View
          style={{
            padding: 12,
            margin: 12,
            borderRadius: 12,
            backgroundColor: '#80f',
          }}>
          <Text
            style={{
              textAlign: 'center',
              color: 'white',
              fontWeight: '800',
            }}>
            Footer
          </Text>
        </View>
      </BottomSheetFooter>
    ),
    [],
  );

  // callbacks
  const handleSheetChange = useCallback((index: number) => {
    console.log('handleSheetChange', index);
  }, []);
  const handleSnapPress = useCallback((index: number) => {
    bottomSheetRef.current?.snapToIndex(index);
  }, []);
  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  // const handleSheetChanges = useCallback((index: number) => {
  //   console.log('handleSheetChanges', index);
  // }, []);

  // ref
  //const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // callbacks
  // const handlePresentModalPress = useCallback(() => {
  //   bottomSheetModalRef.current?.present();
  // }, []);
  // const handleSheetChanges = useCallback((index: number) => {
  //   console.log('handleSheetChanges', index);
  // }, []);

  // ? StoreStates
  const [palette, setPalette] = useState(activeTrack.palette);
  //const [primaryColor, setPrimaryColor] = useState('');

  function arraymove(fromIndex: number, toIndex: number) {
    var element = palette[fromIndex];
    palette.splice(fromIndex, 1);
    palette.splice(toIndex, 0, element);
  }

  const selections = ['Primary', 'Secondary', 'Tertiary', 'Waveform', 'Icons'];

  const Radios = ({label}: {label: string}) => (
    <RadioButton.Group
      onValueChange={newValue => setValue(newValue)}
      value={value}>
      {palette.map((color: string, key: number) => (
        <View key={key} style={{flexDirection: 'row'}}>
          <RadioButton value={color} />
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'auto',
              backgroundColor: color,
              borderRadius: 5,
              height: 30,
              width: 70,
              padding: 5,
              marginVertical: 2,
            }}>
            <Text style={{color: '#000'}}>{color}</Text>
          </View>
        </View>
      ))}
    </RadioButton.Group>
  );
  const Select = ({label}: {label: string}) => (
    <SelectDropdown
      data={palette}
      onSelect={(selectedItem, index) => {
        console.log('before', palette);
        arraymove(index, 0);
        console.log('after', palette);
      }}
      renderButton={(selectedItem, isOpened) => {
        return (
          <View
            style={{
              //width: 200,
              borderWidth: 1,
              borderRadius: 12,
              //flexDirection: 'row',
              //justifyContent: 'center',
              //alignItems: 'center',
              paddingHorizontal: 12,
            }}>
            {selectedItem && (
              <Icon
                name={selectedItem.icon}
                style={{fontSize: 28, marginRight: 8}}
              />
            )}
            <Text
              style={{
                fontSize: 15,
                fontWeight: '500',
                color: '#000',
              }}>
              {label}
            </Text>
            <Icon
              name={isOpened ? 'chevron-up' : 'chevron-down'}
              style={{color: '#000', fontSize: 15}}
            />
          </View>
        );
      }}
      renderItem={(item, index, isSelected) => {
        return (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'auto',
              backgroundColor: item,
              borderRadius: 5,
              height: 30,
              width: 70,
              padding: 5,
              marginVertical: 2,
            }}>
            <Text style={{color: '#000'}}>{item}</Text>
          </View>
        );
      }}
      showsVerticalScrollIndicator={false}
      dropdownStyle={{
        backgroundColor: 'red',
        borderRadius: 8,
        width: 'auto',
      }}
    />
  );

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
          position: 'absolute',
          opacity: 1,
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
        sections={[{title: '', data: [{key: '1'}]}]}
        renderSectionHeader={() => (
          <View style={{marginTop: 40}}>
            <View
              style={{
                flexDirection: 'row',
                gap: 20,
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                paddingTop: 10,
                paddingRight: 5,
              }}>
              <MaterialIcons name="cast" size={25} onPress={() => {}} />
              <MaterialIcons name="cast" size={25} />
            </View>

            <View style={{alignItems: 'center', height: HEIGHT}}>
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
                    <Shadow
                      distance={20}
                      sides={{top: false}}
                      corners={{topStart: false, topEnd: false}}
                      startColor="#00000020">
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
                            paddingLeft: 15,
                            paddingRight: 20,
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
                              maxWidth: WIDTH - 175,
                            }}>
                            <Text
                              numberOfLines={1}
                              style={{fontSize: 17, fontWeight: '600'}}>
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
                  data={carouselQueue}
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
                        setCarouselQueue([
                          artworkQueue.splice(activeTrackIndex! - 2, 1)[0],
                          carouselQueue[0],
                          carouselQueue[1],
                        ]);
                      }
                    } else if (index > 1) {
                      TrackPlayer.skipToNext();
                      if (activeTrackIndex != queue.length) {
                        ref.current?.prev();
                        setCarouselQueue([
                          carouselQueue[1],
                          carouselQueue[2],
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
                    } Khz`}
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
                  onPress={handleRepeatMode}>
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
                  rating={trackRating}
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
                  onPress={() => setLyricsVisible(!lyricsVisible)}>
                  <MaterialIcons
                    name="lyrics"
                    size={25}
                    style={{
                      color: lyrics ? 'yellow' : 'rgba(255,255,255,.5)',
                    }}
                  />
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

                <Pressable onPress={playPause}>
                  <Ionicons
                    name={isPlaying ? 'pause-circle' : 'play-circle'}
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
          </View>
        )}
        renderItem={() => {
          return <View />;
          // return UpNext({
          //   queue,
          //   artworkQueue,
          //   carouselQueue,
          //   activeTrackIndex,
          //   trackRating,
          //   trackPlayCount,
          //   playRegistered,
          // });
        }}
      />

      {/* <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        footerComponent={renderFooter}>
        <View style={{flex: 1, alignItems: 'center'}}>
          <Text>Awesome 🎉</Text>
        </View>
      </BottomSheet> */}

      {/* <BottomSheet ref={bottomSheetRef} onChange={handleSheetChanges}>
          <BottomSheetView style={{flex: 1, padding: 36, alignItems: 'center'}}>
            <Text>Awesome 🎉</Text>
          </BottomSheetView>
        </BottomSheet> */}

      <Button title="Snap To 90%" onPress={() => handleSnapPress(2)} />
      <Button title="Snap To 50%" onPress={() => handleSnapPress(1)} />
      <Button title="Snap To 25%" onPress={() => handleSnapPress(0)} />
      <Button title="Close" onPress={() => handleClosePress()} />

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}>
        <BottomSheetView
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 10,
            flexWrap: 'wrap',
          }}>
          {selections.map((selection, key) => (
            <Select key={key} label={selection} />
          ))}
        </BottomSheetView>
      </BottomSheet>
    </>
  );
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
