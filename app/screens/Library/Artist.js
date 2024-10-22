import React, {useContext, useState, useEffect, useFocusEffect} from 'react';
import {
  Animated,
  Easing,
  BackHandler,
  Button,
  Image,
  ImageBackground,
  Dimensions,
  View,
  Pressable,
  Text,
  ScrollView,
  FlatList,
  SectionList,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import SwipeableRating from 'react-native-swipeable-rating';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';

import {Context} from '../../contexts';

import Discography from './Artist/Discography';
import Favourites from './Artist/Favourites';
import Related from './Artist/Related';

const spinValue = new Animated.Value(0);

// First set up animation
Animated.loop(
  Animated.timing(spinValue, {
    toValue: 1,
    duration: 3000,
    easing: Easing.linear, // Easing is an additional import from react-native
    useNativeDriver: true, // To make use of native driver for performance
  }),
).start();

// Next, interpolate beginning and end values (in this case 0 and 1)
const spin = spinValue.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '360deg'],
});

const Tab = createMaterialTopTabNavigator();

const Artist = ({route, navigation}) => {
  const {artist: albumArtist, plays} = route.params;
  const [layout, setLayout] = useState('grid');
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cp, setCp] = useState(null);
  const {state, dispatch} = useContext(Context);
  const [sections, setSections] = useState([
    {
      title: 'Header',
      data: [1],
      dataset: [
        {
          name: 'Playlists',
          icon: require(`../../assets/icons/Playlists.png`),
        },
        {
          name: 'Folders',
          icon: require(`../../assets/icons/Folders.png`),
        },
        {
          name: 'Artists',
          icon: require(`../../assets/icons/Artists.png`),
        },
        {
          name: 'Albums',
          icon: require(`../../assets/icons/Albums.png`),
        },
      ],
    },
    {
      title: 'Favorite Artists',
      horizontal: true,
      data: [1],
    },
    {
      title: 'Most Played',
      horizontal: true,
      data: [1],
    },
    {
      title: 'Recently Added',
      horizontal: true,
      data: [1],
    },
    {
      title: 'Recently Played',
      horizontal: true,
      data: [1],
    },
  ]);

  useEffect(() => {
    fetch(`${state.NODE_SERVER}artist/${albumArtist}`).then(res =>
      res.json().then(data => {
        setArtist(data);
        setLoading(false);
      }),
    );
  }, []);

  return (
    <>
      <ImageBackground
        source={{
          uri: `${state.NGINX_SERVER}${
            artist && artist.singles[0].coverArtURL
          }`,
        }}
        resizeMode="cover"
        blurRadius={20}>
        {/* <View
                              style={{
                                top: 0,
                                bottom: 0,
                                right: 0,
                                left: 0,
                                position: 'absolute',
                                backgroundColor: 'black',
                                opacity: 0.6,
                                zIndex: 2,
                              }}
                            /> */}
        <View
          style={{
            flexDirection: 'row',
            padding: 20,
            zIndex: 2,
          }}>
          <Image
            source={{
              uri: `${state.NGINX_SERVER}dir${
                artist && artist.artistDirectory
              }/artist.jpg`,
            }}
            defaultSource={require('../../assets/icons/musician.png')}
            style={{
              width: 100,
              height: 100,
              borderRadius: 10,
              marginRight: 15,
            }}
            resizeMode="cover"
          />
          <View
            style={{
              width: '60%',
              justifyContent: 'space-around',
            }}>
            <Text numberOfLines={1} style={{fontSize: 24, fontWeight: '700'}}>
              {albumArtist}
            </Text>
            <Text numberOfLines={1} style={{fontSize: 18}}>
              {plays} plays
            </Text>
          </View>
        </View>
      </ImageBackground>

      <Tab.Navigator>
        <Tab.Screen
          name="Discography"
          children={props => (
            <Discography artist={artist && artist} {...props} />
          )}
        />
        <Tab.Screen name="Favourites" component={Favourites} />
        <Tab.Screen name="Related" component={Related} />
      </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  imageShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 12,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
    justifyContent: 'center',
  },
  isPlaying: {
    height: 45,
    width: 45,
    marginRight: 8,
    borderRadius: 100,
    transform: [{rotate: spin}],
  },
  image: {
    height: 45,
    width: 45,
    marginRight: 8,
    borderRadius: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  artists: {
    fontSize: 14,
    fontWeight: '300',
    fontStyle: 'italic',
  },
  album: {
    fontSize: 12,
    fontWeight: '300',
  },
  plays: {
    backgroundColor: 'grey',
    borderRadius: 10,
    height: 35,
    margin: 10,
    opacity: 0.6,
    padding: 5,
    paddingHorizontal: 15,
    backgroundColor: '#000',
  },
});

export default Artist;
