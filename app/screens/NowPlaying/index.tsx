import React, {useContext, useState, useEffect, useRef} from 'react';
import {
  Button,
  Image,
  Dimensions,
  View,
  Pressable,
  Text,
  ScrollView,
  FlatList,
  SectionList,
  StyleSheet,
  Vibration,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import SwipeableRating from 'react-native-swipeable-rating';
import {Rating, AirbnbRating} from 'react-native-ratings';
import {TabView, SceneMap} from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Slider from '@react-native-community/slider';
import Carousel, {ICarouselInstance} from 'react-native-reanimated-carousel';
import LinearGradient from 'react-native-linear-gradient';
import TextTicker from 'react-native-text-ticker';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

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
} from 'react-native-track-player';

// import BackTo from './BackTo';
// import UpNext from './UpNext';
// import Popular from './Popular';
import MaterialTabs from 'react-native-material-tabs';
import {MD3Colors} from 'react-native-paper';
import Animated, {useSharedValue} from 'react-native-reanimated';
//import {getColors} from 'react-native-image-colors';
import {usePlayerStore} from '../../store';
import Queue from './Queue';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NowPlaying = ({navigation}: any) => {
  //const [nextTracks, setNextTracks] = useState<any>();

  const ref = React.useRef<ICarouselInstance>(null);
  //const progress = useSharedValue<number>(0);
  const {state} = usePlaybackState();
  const activeTrack = useActiveTrack();
  const playwhenready = usePlayWhenReady();

  const currentTrack = usePlayerStore(state => state.currentTrack);
  const nextTracks = usePlayerStore(state => state.nextTracks);
  const pauseplay = usePlayerStore(state => state.pauseplay);
  const next = usePlayerStore(state => state.next);
  const previous = usePlayerStore(state => state.previous);
  const seekTo = usePlayerStore(state => state.seekTo);
  const skipTo = usePlayerStore(state => state.skipTo);
  const rate = usePlayerStore(state => state.rate);

  const playerState = usePlaybackState();
  //const isPlaying = playerState === State.Playing;

  const {position, buffered, duration} = useProgress();
  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);

  const carousel = useRef(null);

  const [selectedTab, setSelectedTab] = useState(1);
  const [imageQueue, setImageQueue] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [trackMetadata, setTrackMetadata] = useState({});

  const [colors, setColors] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'first', title: 'First'},
    {key: 'second', title: 'Second'},
  ]);

  const handlePlay = () => {
    //carousel.current.firstItem(3);
  };

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

  //TrackPlayer.getQueue().then(tracks => console.log('len', tracks.length));
  useEffect(() => {
    //if (playwhenready) console.log('ok', playwhenready);
    //else console.log('no', playwhenready);
    //TrackPlayer.getQueue().then(tracks => setNextTracks(tracks));
    //getRepeatMode();
    //populate();
    //const a = async () => {
    // const url = `http://75.119.137.255/Artwork/Botswana_Vee_Mampeezy_U_Kondelela.jpg`;
    // getColors(url, {fallback: '#228B22', cache: true, key: url}).then(
    //   (colors: any) => setColors(colors),
    // );
    //setState((prev) =>{...prev, gradient})
    //};
    console.log(nextTracks.length);
  }, []);

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

  const sliderWidth = Dimensions.get('window').width;
  const itemWidth = Math.round(sliderWidth * 0.7);

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
        //colors={state.gradient}
        colors={['#000', '#fff']}
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
                paddingTop: 15,
                paddingRight: 5,
              }}>
              <MaterialIcons name="cast" size={25} />
            </View>

            <View
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                height: Dimensions.get('window').height,
              }}>
              <Carousel
                ref={ref}
                width={WIDTH}
                height={WIDTH}
                mode="parallax"
                modeConfig={{
                  parallaxScrollingScale: 0.9,
                  parallaxScrollingOffset: 50,
                }}
                loop={false}
                data={[
                  activeTrack?.artwork,
                  ...nextTracks.map(({artwork}: {artwork: string}) => artwork),
                ]}
                //scrollAnimationDuration={1000}
                snapEnabled={true}
                onSnapToItem={index => skipTo(index)}
                renderItem={({index, item}) => (
                  <Image
                    source={{uri: item}}
                    style={{height: WIDTH, width: WIDTH, borderRadius: 12}}
                  />
                )}
                // renderItem={({index, item}) =>
                //   imageLoaded ? (
                //     <Image
                //       source={{uri: item}}
                //       style={{height: WIDTH, width: WIDTH, borderRadius: 12}}
                //     />
                //   ) : (
                //     <Image
                //       source={{uri: '../../../assets/images/404.png'}}
                //       style={{height: WIDTH, width: WIDTH, borderRadius: 12}}
                //       onLoadEnd={() => setImageLoaded(true)}
                //     />
                //   )
                // }
              />

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginHorizontal: 20,
                  marginTop: WIDTH * 0.9,
                }}>
                <Icon name="disc" size={21} />

                <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 5}}>
                  {activeTrack?.plays || 0} play
                  {`${activeTrack?.plays === 1 ? '' : 's'}`}
                </Text>

                <View style={{flex: 1}} />

                <Text style={{fontSize: 18, fontWeight: '400'}}>
                  {activeTrack?.year
                    ? `Year ${activeTrack?.year}`
                    : activeTrack?.sampleRate}
                </Text>
              </View>

              <View style={styles.options}>
                <Pressable style={styles.chip} onPress={handleSetRepeatMode}>
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
                <Pressable style={styles.chip} onPress={handlePlay}>
                  <MaterialIcons name="shuffle" size={25} />
                </Pressable>
                <View style={{flex: 1}} />
                <Pressable style={styles.chip} onPress={handlePlay}>
                  <MaterialIcons name="article" size={25} />
                </Pressable>
                <Pressable style={styles.chip} onPress={handlePlay}>
                  <MaterialIcons name="playlist-play" size={28} />
                </Pressable>
              </View>

              {/* Waveform */}
              <View style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                {/* <View
                  style={{
                    left: '-48%',
                    height: 70,
                    width: Dimensions.get('window').width - 40,
                    maxWidth:
                      `${Math.floor((position / duration) * 100)}%` || `${0}%`,
                    overflow: 'hidden',
                    position: 'absolute',
                    zIndex: 2,
                  }}>
                  <Image
                    source={{uri: currentTrack.waveform}}
                    style={{
                      height: 70,
                      width: Dimensions.get('window').width - 40,
                      position: 'absolute',
                      resizeMode: 'stretch',
                      zIndex: 2,
                    }}
                  />
                </View> */}

                <Slider
                  style={{
                    left: '-49%',
                    position: 'absolute',
                    width: Dimensions.get('window').width - 30,
                    top: 25,
                    zIndex: 3,
                  }}
                  value={Math.floor((position / duration) * 100) || 0}
                  thumbTintColor="transparent"
                  onValueChange={value => seekTo((value / 100) * duration)}
                  minimumValue={0}
                  maximumValue={100}
                  minimumTrackTintColor={currentTrack.gradient?.[2] || '#FFF'}
                  maximumTrackTintColor="#FFFFFF"
                />
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 50,
                }}>
                <Text style={styles.startTime}>
                  {formatTrackTime(position)}
                </Text>
                <View style={{flex: 1}} />
                <Text style={styles.endTime}>{formatTrackTime(duration)}</Text>
              </View>

              {/* <View
                style={{
                  borderWidth: 1,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderColor: '#fff',
                  borderRadius: 7,
                  backgroundColor: '#000',
                  flexDirection: 'row',
                  marginBottom: 15,
                  opacity: 0.7,
                }}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>
                  <Text style={{color: 'yellow'}}>MP3</Text>
                  &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
                  {currentTrack.sampleRate / 1000}
                  Khz &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
                </Text>
                <Text style={{fontWeight: 'bold'}}>
                  {currentTrack?.bitrate / 1000}kbps
                </Text>
              </View> */}

              <Text numberOfLines={1} style={styles.artists}>
                {activeTrack?.artists || 'No Artists'}
              </Text>

              {/* <Text numberOfLines={1} style={styles.artists}>
                {JSON.stringify(playerState)}
              </Text> */}

              <TextTicker
                style={styles.title}
                duration={20000}
                loop
                bounce
                bounceSpeed={10}
                repeatSpacer={50}
                marqueeDelay={3000}>
                {activeTrack?.title || activeTrack?.name}
              </TextTicker>

              <Text numberOfLines={1} style={styles.album}>
                {activeTrack?.album
                  ? activeTrack?.album === activeTrack?.title
                    ? activeTrack?.albumArtist + ' Singles'
                    : activeTrack?.album
                  : 'No Album'}
              </Text>

              <SwipeableRating
                style={styles.rating}
                rating={currentTrack?.rating ?? 0}
                size={28}
                gap={4}
                onPress={rating => {
                  //Vibration.vibrate(50);
                  rate(activeTrack, rating);
                }}
                minRating={0.5}
                allowHalves={true}
                swipeable={true}
                xOffset={Dimensions.get('window').width / 2 - 80}
                color={'#FFD700'}
                emptyColor={'#FFD700'}
              />

              <View style={styles.controls}>
                <Pressable
                  onPress={handlePlay}
                  android_ripple={{
                    color: 'white',
                    radius: 39,
                    foreground: true,
                    borderless: true,
                  }}>
                  <Icon name="play-back" size={40} />
                </Pressable>
                <Pressable
                  onPress={() => previous()}
                  android_ripple={{
                    color: 'white',
                    radius: 39,
                    foreground: true,
                    borderless: true,
                  }}>
                  <Icon name="play-back-circle" size={70} />
                </Pressable>
                <Pressable
                  onPress={() => pauseplay()}
                  android_ripple={{
                    color: 'white',
                    radius: 39,
                    foreground: true,
                    borderless: true,
                  }}>
                  <Icon
                    name={state === 'playing' ? 'pause-circle' : 'play-circle'}
                    size={100}
                  />
                </Pressable>
                <Pressable
                  onPress={() => next()}
                  android_ripple={{
                    color: 'white',
                    radius: 39,
                    foreground: true,
                    borderless: true,
                  }}>
                  <Icon name="play-forward-circle" size={70} />
                </Pressable>

                <Pressable
                  onPress={handlePlay}
                  android_ripple={{
                    color: 'white',
                    radius: 39,
                    foreground: true,
                    borderless: true,
                  }}>
                  <Icon name="play-forward" size={40} />
                </Pressable>
              </View>

              <View style={{flex: 1}}></View>
            </View>
          </>
        )}
        renderItem={() => (
          <>
            <TabView
              navigationState={{index, routes}}
              renderScene={SceneMap({
                first: Queue,
                second: () => (
                  <View
                    style={{flex: 1, backgroundColor: '#673ab7', height: 100}}>
                    <Text>wefeww</Text>
                  </View>
                ),
              })}
              onIndexChange={setIndex}
              initialLayout={{width: layout.width}}
            />
            {/* <MaterialTabs
              items={['QUEUE', 'LYRICS', 'PLAYLIST']}
              selectedIndex={selectedTab}
              onChange={setSelectedTab}
              barColor="transparent"
              indicatorColor="#fffe94"
              activeTextColor="white"
              textStyle={{fontSize: 18}}
            /> */}
            <View
              style={{
                borderBottomWidth: 0.3,
                borderBottomColor: 'white',
                marginBottom: 5,
              }}
            />
            {/* {selectedTab === 0 && <Queue />} */}
            {/* {selectedTab === 0 && <Lyrics navigation={undefined} />} */}
            {/* {selectedTab === 2 && <Playlist navigation={undefined} />} */}
          </>
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

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  startTime: {fontSize: 18, fontWeight: 'bold', marginLeft: 20},
  endTime: {fontSize: 18, fontWeight: 'bold', marginRight: 20},
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
  rating: {
    marginTop: 15,
    marginBottom: 15,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    backgroundColor: 'grey',
    borderRadius: 10,
    height: 35,
    margin: 10,
    opacity: 0.6,
    padding: 5,
    paddingHorizontal: 15,
    //backgroundColor: '#000',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  options: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
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
