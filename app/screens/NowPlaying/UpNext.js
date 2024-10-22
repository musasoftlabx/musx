import React, {useContext, useEffect, useState} from 'react';
import {
  Animated,
  Easing,
  View,
  Pressable,
  Image,
  FlatList,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';

import TrackPlayer from 'react-native-track-player';

import SwipeableRating from 'react-native-swipeable-rating';

import {Context} from '../../contexts';

import * as Animatable from 'react-native-animatable';

/* const spinValue = new Animated.Value(0);

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
}); */

const UpNext = () => {
  const {state, dispatch} = useContext(Context);
  const [queue, setQueue] = useState(null);

  const getQueue = async () => {
    setQueue(await TrackPlayer.getQueue());
  };

  useEffect(() => {
    getQueue();
  }, []);

  return (
    <FlatList
      data={queue}
      keyExtractor={(item, index) => index.toString()}
      scrollEnabled={false}
      renderItem={({item}) => (
        <Pressable
          onPress={() => dispatch({type: 'SKIP_TO', payload: {track: item}})}>
          <View
            style={
              state.currentTrack._id === item._id
                ? {
                    flexDirection: 'row',
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    borderRadius: 20,
                    marginVertical: 5,
                  }
                : {
                    flexDirection: 'row',
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                  }
            }>
            {state.currentTrack._id === item._id ? (
              <Image
                source={{
                  uri: item.artwork,
                }}
                style={styles.isPlaying}
              />
            ) : (
              <Image
                source={{
                  uri: item.artwork,
                }}
                style={styles.image}
              />
            )}

            <View
              style={{
                justifyContent: 'center',
                marginTop: -2,
                maxWidth: Dimensions.get('window').width - 175,
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
              <SwipeableRating
                rating={item.rating || 0}
                size={15}
                allowHalves={true}
                color={'#FFD700'}
                emptyColor={'#FFD700'}
              />
              <Text style={{fontWeight: 'bold', marginRight: 5}}>
                {item.plays || 0} plays
              </Text>
            </View>
          </View>
        </Pressable>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    //transform: [{rotate: spin}],
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

export default UpNext;
