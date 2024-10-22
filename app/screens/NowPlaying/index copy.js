import React, {useState, useEffect} from 'react';
import {
  Button,
  Image,
  Dimensions,
  View,
  Pressable,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
} from 'react-native';
import {
  Avatar,
  BottomNavigation,
  Card,
  Title,
  Headline,
  Paragraph,
  RadioButton,
  IconButton,
  List,
  FAB,
  Chip,
  Divider,
  useTheme,
} from 'react-native-paper';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import SwipeableRating from 'react-native-swipeable-rating';
import {TabView, SceneMap} from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Slider from '@react-native-community/slider';

import Carousel from 'react-native-snap-carousel';
import LinearGradient from 'react-native-linear-gradient';
import {colorsFromUrl} from 'react-native-vibrant-color';

import BackTo from './BackTo';
import UpNext from './UpNext';
import Popular from './Popular';
//import SwipeableRating from '../../components/SwipeableRating';

const Tab = createMaterialTopTabNavigator();

const NODE_SERVER = 'http://musasoft.ddns.net:3000/';
const NGINX_SERVER = 'http://musasoft.ddns.net:8080/';

const NowPlaying = ({navigation}) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [activePlaylistSection, setActivePlaylistSection] = useState('UpNext');
  const [waveform, setWaveform] = useState('http://i.c');
  const [gradient, setGradient] = useState(['#000', '#00ffaa']);
  const [rating, setRating] = useState(3);
  const [index, setIndex] = useState(0);
  const [routes] = React.useState([
    {key: 'first', title: 'Back To'},
    {key: 'second', title: 'Second'},
    {key: 'third', title: 'Third'},
  ]);

  const renderScene = SceneMap({
    first: BackTo,
    second: UpNext,
    third: Popular,
  });

  const handlePlay = () => {
    console.log('pressed');
  };

  const handleBackroundColor = i => {
    setCurrentlyPlaying(playlist[i].artwork);
    colorsFromUrl(playlist[i].artwork).then(colors => {
      setGradient([colors.vibrantColor, colors.dominantColor]);

      fetch(`${NODE_SERVER}waveform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: playlist[i].url,
          color: colors.dominantColor,
        }),
      }).then(res =>
        res.text().then(data => {
          let waveformURL = `${NGINX_SERVER}waveforms/${data}`;
          console.log(waveformURL);
          setWaveform(waveformURL);
        }),
      );
    });
  };

  const CarouselCardItem = ({item, i}) => {
    return (
      <View style={styles.itemContainer} key={i}>
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
              uri: item.artwork,
            }}
            style={{
              height: 300,
              width: 300,
              borderRadius: 12,
            }}
          />
        </View>
      </View>
    );
  };

  const DATA = [];
  for (let i = 0; i < 10; i++) {
    DATA.push(i);
  }

  const playlist = [
    {
      url: '/Kenya/Bahati/Adhiambo.mp3',
      artwork:
        'http://musasoft.ddns.net:8080/images/covers/01___Ski_Mask_The_Slump_God_ft_Offset___HipHopTXLcom__i0LNO.jpg',
    },
    {
      url: '/Kenya/Bahati/Mi Amor.mp3',
      artwork:
        'http://musasoft.ddns.net:8080/images/covers/01___Dave_East___HipHopTXLcom__x3fLq.jpg',
    },
    {
      url: '/Kenya/Otile Brown/Jeraha.mp3',
      artwork:
        'http://musasoft.ddns.net:8080/images/covers/01___DJ_Reddy_Rell___Hip_Hop_TXL_Vol_33_Intro__Prod_By_Young_Tzar___DatPiff_Exclusive___cuhEx.jpg',
    },
  ];

  const sliderWidth = Dimensions.get('window').width;
  const itemWidth = Math.round(sliderWidth * 0.7);

  return (
    <>
      <Image
        source={{
          uri: currentlyPlaying,
        }}
        blurRadius={20}
        style={styles.absolute}
      />
      <LinearGradient
        colors={gradient}
        style={{
          opacity: 0.4,
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      />
      <FlatList
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            <View style={styles.container}>
              <Carousel
                data={playlist}
                renderItem={CarouselCardItem}
                sliderWidth={sliderWidth}
                itemWidth={itemWidth}
                layout="default"
                /* layoutCardOffset={20} */
                onSnapToItem={i => handleBackroundColor(i)}
                useScrollView={false}
              />
              <View
                style={{
                  borderWidth: 1,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderColor: '#fff',
                  borderRadius: 7,
                  backgroundColor: '#000',
                  flexDirection: 'row',
                  opacity: 0.7,
                }}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>
                  <Text style={{color: 'yellow'}}>MP3</Text>
                  &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;44.1Khz
                  &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
                </Text>
                <Text style={{fontWeight: 'bold'}}>320Kbps</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 10,
                  marginHorizontal: 20,
                }}>
                <Icon name="disc" size={24} />
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: 'bold',
                    marginLeft: 5,
                    marginTop: -3,
                  }}>
                  23 Plays
                </Text>
                <View style={{flex: 1}} />
                <View style={{flex: 1}} />
                <Text
                  style={{
                    fontSize: 16,
                    //fontStyle: 'italic',
                    textDecorationLine: 'underline',
                  }}>
                  Released 2020
                </Text>
              </View>
              {/* <View
            style={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}>
            <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold'}}>
              MP3
            </Text>
            <Text style={{color: 'white', fontSize: 15, fontWeight: 'bold'}}>
              320Kpbs
            </Text>
          </View> */}
              <View style={styles.options}>
                <Pressable style={styles.chip} onPress={handlePlay}>
                  <MaterialIcons name="repeat" size={25} />
                </Pressable>
                <Pressable style={styles.chip} onPress={handlePlay}>
                  <MaterialIcons name="shuffle" size={25} />
                </Pressable>
                <View style={{flex: 1}}></View>
                <Pressable style={styles.chip} onPress={handlePlay}>
                  <MaterialIcons name="article" size={25} />
                </Pressable>
                <Pressable style={styles.chip} onPress={handlePlay}>
                  <MaterialIcons name="cast" size={25} />
                </Pressable>
              </View>
              <View style={{flexDirection: 'column', alignItems: 'center'}}>
                <Image
                  source={{
                    uri: waveform,
                  }}
                  style={styles.waveform}
                />
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#FFFF00"
                />
              </View>
              <View style={styles.timers}>
                <Text style={styles.startTime}>0:00</Text>
                <View style={{flex: 1}}></View>
                <Text style={styles.endTime}>3:16</Text>
              </View>
              <Text style={styles.artists}>Bahati / Prince Indah</Text>
              <Text style={styles.title}>Adhiambo (feat. Prince Indah)</Text>
              <Text style={styles.album}>Love Like This</Text>
              <SwipeableRating
                style={styles.rating}
                rating={rating}
                size={28}
                gap={4}
                onPress={r => setRating(r)}
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
                  onPress={handlePlay}
                  android_ripple={{
                    color: 'white',
                    radius: 39,
                    foreground: true,
                    borderless: true,
                  }}>
                  <Icon name="play-back-circle" size={70} />
                </Pressable>
                <Pressable
                  onPress={handlePlay}
                  android_ripple={{
                    color: 'white',
                    radius: 39,
                    foreground: true,
                    borderless: true,
                  }}>
                  <Icon name="play-circle" size={100} />
                </Pressable>
                <Pressable
                  onPress={handlePlay}
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
        ListFooterComponent={() => (
          <>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                height: 50,
                marginVertical: 8,
                borderBottomColor: '#fff',
                borderBottomWidth: StyleSheet.hairlineWidth,
              }}>
              <Pressable
                onPress={() => setActivePlaylistSection('BackTo')}
                style={
                  activePlaylistSection === 'BackTo'
                    ? styles.activePlaylistSection
                    : styles.inactivePlaylistSection
                }>
                <Text
                  style={
                    activePlaylistSection === 'BackTo'
                      ? styles.activePlaylistSectionText
                      : styles.inactivePlaylistSectionText
                  }>
                  BACK TO
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setActivePlaylistSection('UpNext')}
                style={
                  activePlaylistSection === 'UpNext'
                    ? styles.activePlaylistSection
                    : styles.inactivePlaylistSection
                }>
                <Text
                  style={
                    activePlaylistSection === 'UpNext'
                      ? styles.activePlaylistSectionText
                      : styles.inactivePlaylistSectionText
                  }>
                  UP NEXT
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setActivePlaylistSection('Popular')}
                style={
                  activePlaylistSection === 'Popular'
                    ? styles.activePlaylistSection
                    : styles.inactivePlaylistSection
                }>
                <Text
                  style={
                    activePlaylistSection === 'Popular'
                      ? styles.activePlaylistSectionText
                      : styles.inactivePlaylistSectionText
                  }>
                  POPULAR
                </Text>
              </Pressable>
            </View>
            {activePlaylistSection === 'BackTo' && <BackTo />}
            {activePlaylistSection === 'UpNext' && <UpNext />}
            {activePlaylistSection === 'Popular' && <Popular />}
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
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cover: {
    //backgroundColor: 'grey',
    //height: Dimensions.get('window').height,
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    height: Dimensions.get('window').height,
    paddingTop: 50,
    zIndex: 4,
    //position: 'absolute',
  },
  waveform: {
    height: 100,
    width: Dimensions.get('window').width - 20,
    resizeMode: 'cover',
    tintColor: 'gray',
  },
  slider: {
    width: Dimensions.get('window').width,
    marginTop: -59,
    zIndex: 1,
  },
  timers: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
