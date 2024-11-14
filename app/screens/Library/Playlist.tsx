import React, {useState, useEffect} from 'react';

import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  View,
  Pressable,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';

import {FAB, TouchableRipple} from 'react-native-paper';
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {API_URL, ARTWORK_URL, WIDTH} from '../../store';

import {TrackProps} from '../../types';

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

export default function Playlist({
  navigation,
  route: {
    params: {id},
  },
}: any) {
  const [layout, setLayout] = useState('grid');
  const [playlist, setPlaylist] = useState(null);

  useEffect(() => {
    axios(`${API_URL}playlist/${id}`).then(({data}) => setPlaylist(data));
  }, []);

  return (
    <>
      <ImageBackground
        source={{
          uri: `${state.NGINX_SERVER}${
            playlist && playlist.tracks[0].coverArtURL
          }`,
        }}
        resizeMode="cover"
        blurRadius={20}>
        <View style={{flexDirection: 'row', padding: 20}}>
          <View
            style={{
              flexDirection: 'column',
              flexBasis: '50%',
              flexWrap: 'wrap',
              width: 100,
              height: 100,
            }}>
            {playlist &&
              route.params.tracks.map((track: TrackProps, i: number) => {
                return (
                  i < 4 && (
                    <Image
                      key={i}
                      source={{uri: `${ARTWORK_URL}${track.artwork}`}}
                      style={{width: 50, height: 50}}
                      resizeMode="cover"
                    />
                  )
                );
              })}
          </View>
          <View style={{width: '60%', marginLeft: -70}}>
            <Text numberOfLines={1} style={{fontSize: 24, fontWeight: '700'}}>
              {route.params.name}
            </Text>
            <Text numberOfLines={1} style={{fontSize: 26}}>
              {route.params.duration}
            </Text>
            <Text numberOfLines={2} style={{fontSize: 16, marginTop: 10}}>
              {route.params.description}
            </Text>
          </View>
          <FAB
            style={{position: 'absolute', bottom: -30, right: 30}}
            large
            icon="plus"
            onPress={() => console.log('Pressed')}
          />
          {/* <TouchableRipple
            onPress={() => console.log('Pressed')}
            rippleColor="rgba(0, 0, 0, .82)"
            style={{position: 'absolute', bottom: -35, right: 35}}>
            <MaterialIcons name="play-circle-filled" size={70} color="white" />
          </TouchableRipple> */}
        </View>
      </ImageBackground>

      <FlatList
        data={playlist && playlist.tracks}
        contentContainerStyle={{minHeight: '100%'}}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => (
          <Pressable
            onPress={() => navigation.navigate('NowPlaying')}
            style={{
              flexDirection: 'row',
              paddingVertical: 15,
              paddingHorizontal: 20,
            }}>
            <Image
              source={{uri: `${ARTWORK_URL}${item.artwork}`}}
              // style={
              //   state.currentlyPlaying &&
              //   state.currentlyPlaying._id === item._id
              //     ? styles.isPlaying
              //     : styles.image
              // }
              style={{
                height: 45,
                width: 45,
                marginRight: 10,
                borderRadius: 10,
              }}
            />
            <View
              style={{
                justifyContent: 'center',
                marginTop: -2,
                maxWidth: WIDTH - 180,
              }}>
              <Text numberOfLines={1} style={styles.title}>
                {item.title || item.name}
              </Text>
              <Text numberOfLines={1} style={styles.artists}>
                {(item.artists && item.artists.join(' / ')) || 'Unknown Artist'}
              </Text>
              <Text numberOfLines={1} style={styles.album}>
                {item.album || 'Unknown Album'}
              </Text>
            </View>
            <View style={{flex: 1}} />
            <View style={{justifyContent: 'center', alignItems: 'flex-end'}}>
              <StarRatingDisplay
                rating={item.rating}
                starSize={16}
                starStyle={{marginHorizontal: 0}}
              />

              <Text style={{fontWeight: 'bold', marginRight: 5}}>
                {item.plays || 0} plays
              </Text>
            </View>
          </Pressable>
        )}
      />
    </>
  );
}

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
  },
});
