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
} from 'react-native';
import SwipeableRating from 'react-native-swipeable-rating';
import {Rating, AirbnbRating} from 'react-native-ratings';
import {TabView, SceneMap} from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Slider from '@react-native-community/slider';
import Carousel from 'react-native-snap-carousel';
import LinearGradient from 'react-native-linear-gradient';
import TextTicker from 'react-native-text-ticker';

import TrackPlayer, {
  useTrackPlayerEvents,
  usePlaybackState,
  useProgress,
  RepeatMode,
  Event,
} from 'react-native-track-player';

import BackTo from './BackTo';
import UpNext from './UpNext';
import Popular from './Popular';
import MaterialTabs from 'react-native-material-tabs';
import {Context} from '../../contexts';

const NowPlaying = ({navigation}) => {
  const playBackState = usePlaybackState();
  const {position, buffered, duration} = useProgress();
  const {state, dispatch} = useContext(Context);
  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);

  const carousel = useRef(null);

  const [selectedTab, setSelectedTab] = useState(1);
  const [imageQueue, setImageQueue] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [trackMetadata, setTrackMetadata] = useState({});

  SceneMap({
    first: BackTo,
    second: UpNext,
    third: Popular,
  });

  const handlePlay = () => {
    carousel.current.firstItem(3);
  };

  const __setRepeatMode = async () => {
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

  const getRepeatMode = async () => {
    const repeatMode = await TrackPlayer.getRepeatMode();
    setRepeatMode(repeatMode);
  };

  const populate = async () => {
    const index = await TrackPlayer.getCurrentTrack();
    const track = await TrackPlayer.getTrack(index);
    const queue = await TrackPlayer.getQueue();

    let sliced;

    if (index === 0) {
      sliced = queue.slice(0, index + 2);
    } else if (index === queue.length - 1) {
      sliced = queue.slice(index - 1, 1);
    } else {
      sliced = queue.slice(index - 1, index + 2);
    }
    setImageQueue(sliced.map(track => track.artwork));

    setImageIndex(
      sliced.findIndex(__track => __track.artwork === track.artwork),
    );

    setTrackMetadata(track);
  };

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    if (
      event.type === Event.PlaybackTrackChanged &&
      event.nextTrack !== undefined
    ) {
      populate();
    }
  });

  useEffect(() => {
    getRepeatMode();
    populate();
  }, []);

  const formatTrackTime = secs => {
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
      <Image
        source={{
          uri: imageQueue[imageIndex],
        }}
        blurRadius={8}
        style={styles.absolute}
      />
      <LinearGradient
        colors={state.gradient}
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
                data={imageQueue}
                renderItem={({item, index}) => (
                  <View style={{alignItems: 'center'}} key={index}>
                    <View
                      style={{
                        shadowColor: '#000',
                        shadowOffset: {
                          width: 0,
                          height: 12,
                        },
                        shadowOpacity: 0.58,
                        shadowRadius: 16.0,
                        elevation: 24,
                      }}>
                      <Image
                        source={{
                          uri: item,
                        }}
                        style={{
                          height: 300,
                          width: 300,
                          borderRadius: 12,
                        }}
                      />
                    </View>
                  </View>
                )}
                sliderWidth={sliderWidth}
                itemWidth={itemWidth}
                layout="default"
                /* onPressItem={i =>
                  dispatch({
                    type: 'SKIP_TO',
                    payload: {track: state.nextTracks[i]},
                  })
                }
                onSnapToItem={i =>
                  dispatch({
                    type: 'SKIP_TO',
                    payload: {track: state.nextTracks[i]},
                  })
                } */
                useScrollView={false}
                firstItem={imageIndex}
                enableMomentum={false}
              />

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginHorizontal: 20,
                }}>
                <Icon name="disc" size={21} />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginLeft: 5,
                    marginTop: -3,
                  }}>
                  {state.currentTrack.plays} plays
                </Text>
                <View style={{flex: 1}} />
                <View style={{flex: 1}} />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '400',
                  }}>
                  {state.currentTrack.year
                    ? `Year ${state.currentTrack.year}`
                    : state.currentTrack.sampleRate}
                </Text>
              </View>
              <View style={styles.options}>
                <Pressable style={styles.chip} onPress={__setRepeatMode}>
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
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  top: -10,
                }}>
                <Image
                  source={{
                    uri: state.currentTrack.waveform,
                  }}
                  style={{
                    left: '-48%',
                    top: 0,
                    height: 100,
                    width: Dimensions.get('window').width - 40,
                    position: 'absolute',
                    resizeMode: 'cover',
                    tintColor: 'gray',
                    zIndex: 0,
                    opacity: 0.5,
                  }}
                />
                <View
                  style={{
                    left: '-48%',
                    height: 100,
                    width: Dimensions.get('window').width - 40,
                    maxWidth:
                      `${Math.floor((buffered / duration) * 100)}%` || `${0}%`,
                    overflow: 'hidden',
                    position: 'absolute',
                    resizeMode: 'cover',
                    zIndex: 1,
                  }}>
                  <Image
                    source={{
                      uri: state.currentTrack.waveform,
                    }}
                    style={{
                      height: 100,
                      width: Dimensions.get('window').width - 40,
                      position: 'absolute',
                      resizeMode: 'cover',
                      tintColor: 'white',
                      zIndex: 1,
                    }}
                  />
                </View>
                <View
                  style={{
                    left: '-48%',
                    height: 100,
                    width: Dimensions.get('window').width - 40,
                    maxWidth:
                      `${Math.floor((position / duration) * 100)}%` || `${0}%`,
                    overflow: 'hidden',
                    position: 'absolute',
                    resizeMode: 'cover',
                    zIndex: 2,
                  }}>
                  <Image
                    source={{
                      uri: state.currentTrack.waveform,
                    }}
                    style={{
                      height: 100,
                      width: Dimensions.get('window').width - 40,
                      position: 'absolute',
                      resizeMode: 'cover',
                      zIndex: 2,
                    }}
                  />
                </View>
                <Slider
                  style={{
                    left: '-49%',
                    position: 'absolute',
                    width: Dimensions.get('window').width - 40,
                    top: 41,
                    zIndex: 3,
                  }}
                  value={Math.floor((position / duration) * 100) || 0}
                  thumbTintColor="transparent"
                  onValueChange={value => {
                    dispatch({
                      type: 'SEEK_TO',
                      position: (value / 100) * duration,
                    });
                  }}
                  minimumValue={0}
                  maximumValue={100}
                  minimumTrackTintColor={state.gradient[2] || '#FFF'}
                  maximumTrackTintColor="#FFFFFF"
                />
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 65,
                }}>
                <Text style={styles.startTime}>
                  {formatTrackTime(position)}
                </Text>
                <View style={{flex: 1}} />
                <Text style={styles.endTime}>{formatTrackTime(duration)}</Text>
              </View>

              <View
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
                  {state.currentTrack.sampleRate / 1000}
                  Khz &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
                </Text>
                <Text style={{fontWeight: 'bold'}}>
                  {state.currentTrack.bitrate / 1000}kbps
                </Text>
              </View>

              <Text numberOfLines={1} style={styles.artists}>
                {state.currentTrack.artists.join(' / ') || 'No Artists'}
              </Text>

              <TextTicker
                style={styles.title}
                duration={20000}
                loop
                bounce
                bounceSpeed={10}
                repeatSpacer={50}
                marqueeDelay={3000}>
                {state.currentTrack.title || state.currentTrack.name}
              </TextTicker>

              <Text numberOfLines={1} style={styles.album}>
                {state.currentTrack.album
                  ? state.currentTrack.album === state.currentTrack.title
                    ? state.currentTrack.albumArtist + ' Singles'
                    : state.currentTrack.album
                  : 'No Album'}
              </Text>
              <SwipeableRating
                style={styles.rating}
                rating={state.currentTrack.rating || 0}
                size={28}
                gap={4}
                onPress={rating => dispatch({type: 'RATE', rating})}
                //Vibration.vibrate(50),
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
                  onPress={() => dispatch({type: 'PREVIOUS_TRACK'})}
                  android_ripple={{
                    color: 'white',
                    radius: 39,
                    foreground: true,
                    borderless: true,
                  }}>
                  <Icon name="play-back-circle" size={70} />
                </Pressable>
                <Pressable
                  onPress={() => dispatch({type: 'PLAY_PAUSE'})}
                  android_ripple={{
                    color: 'white',
                    radius: 39,
                    foreground: true,
                    borderless: true,
                  }}>
                  <Icon
                    name={playBackState === 3 ? 'pause-circle' : 'play-circle'}
                    size={100}
                  />
                </Pressable>
                <Pressable
                  onPress={() => dispatch({type: 'NEXT_TRACK'})}
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
            <MaterialTabs
              items={['LYRICS', 'PLAYLIST', 'POPULAR']}
              selectedIndex={selectedTab}
              onChange={setSelectedTab}
              barColor="transparent"
              indicatorColor="#fffe94"
              activeTextColor="white"
              textStyle={{fontSize: 18}}
            />
            <View
              style={{
                borderBottomWidth: 0.3,
                borderBottomColor: 'white',
                marginBottom: 5,
              }}
            />
            {selectedTab === 0 && <BackTo />}
            {selectedTab === 1 && <UpNext />}
            {selectedTab === 2 && <Popular />}
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
    backgroundColor: '#000',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
