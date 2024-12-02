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
  Vibration,
} from 'react-native';

import {FAB, TouchableRipple} from 'react-native-paper';
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {API_URL, ARTWORK_URL, usePlayerStore, WIDTH} from '../../store';

import {TrackProps} from '../../types';
import LinearGradient from 'react-native-linear-gradient';
import TrackPlayer from 'react-native-track-player';

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
    params: {id, name, duration, totalTracks, tracks},
  },
}: any) {
  const [layout, setLayout] = useState('grid');
  const [playlistTracks, setPlaylistTracks] = useState(null);

  const palette = usePlayerStore(state => state.palette);
  const play = usePlayerStore(state => state.play);

  // ? Effects
  useEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: palette?.[1] ?? '#000'},
    });
  });

  useEffect(() => {
    axios(`${API_URL}playlist/${id}`)
      .then(({data}) => setPlaylistTracks(data))
      .catch(err => console.log(err.message));
  }, []);

  return (
    <>
      <LinearGradient
        colors={[palette[0] ?? '#000', palette[1] ?? '#fff']}
        useAngle={true}
        angle={290}
        style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}
      />

      <ImageBackground
        source={{uri: tracks[0].artwork}}
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
            {playlistTracks &&
              tracks.map((track: TrackProps, i: number) => {
                return (
                  i < 4 && (
                    <Image
                      key={i}
                      source={{uri: track.artwork}}
                      style={{width: 50, height: 50}}
                      resizeMode="cover"
                    />
                  )
                );
              })}
          </View>
          <View style={{width: '60%', marginLeft: -70}}>
            <Text numberOfLines={1} style={{fontSize: 24, fontWeight: '700'}}>
              {name}
            </Text>
            <Text numberOfLines={1} style={{fontSize: 26}}>
              {duration}
            </Text>
            <Text numberOfLines={2} style={{fontSize: 16, marginTop: 10}}>
              d
            </Text>
          </View>
          <FAB
            style={{
              borderRadius: 50,
              position: 'absolute',
              bottom: -30,
              right: 30,
              zIndex: 1000,
            }}
            //large
            icon="play"
            onPress={() => {
              Vibration.vibrate(100);
              play(playlistTracks, playlistTracks![0]);
            }}
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
        data={playlistTracks && playlistTracks}
        contentContainerStyle={{minHeight: '100%', marginTop: 40}}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => (
          <Pressable
            onPress={() => navigation.navigate('NowPlaying')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 5,
              paddingHorizontal: 20,
            }}>
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>
              {index + 1}.{' '}
            </Text>
            <Image
              source={{uri: item.artwork}}
              // style={
              //   state.currentlyPlaying &&
              //   state.currentlyPlaying._id === item._id
              //     ? styles.isPlaying
              //     : styles.image
              // }
              style={{
                height: 45,
                width: 45,
                marginHorizontal: 10,
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
                {item.artists || 'Unknown Artist'}
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
