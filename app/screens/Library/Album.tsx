import React, {useState, useEffect} from 'react';

import {
  Image,
  Dimensions,
  View,
  Pressable,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';

import {StarRatingDisplay} from 'react-native-star-rating-widget';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

import {API_URL, ARTWORK_URL, usePlayerStore} from '../../store';

import {TracksProps} from '../../types';

export default function Album({
  navigation,
  route: {
    params: {albumArtist, album},
  },
}: any) {
  const [tracks, setTracks] = useState<TracksProps>();

  const palette = usePlayerStore(state => state.palette);

  // ? Effects
  useEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: palette?.[1] ?? '#000'},
    });
  });

  useEffect(() => {
    axios(`${API_URL}artist/${albumArtist}/album/${album}`)
      .then(({data}) => setTracks(data))
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

      <FlatList
        scrollEnabled={false}
        data={tracks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => (
          <Pressable>
            <View style={styles.item}>
              <Image
                source={{uri: `${ARTWORK_URL}${item.artwork}`}}
                style={styles.image}
              />
              <View
                style={{
                  justifyContent: 'center',
                  marginTop: -2,
                  maxWidth: Dimensions.get('window').width - 175,
                }}>
                <Text numberOfLines={1} style={styles.title}>
                  {item.title}
                </Text>
                <Text numberOfLines={1} style={styles.artists}>
                  {item.artists || 'Unknown Artist'}
                </Text>
              </View>
              <View style={{flex: 1}} />
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                }}>
                <StarRatingDisplay
                  rating={item.rating}
                  starSize={16}
                  starStyle={{marginHorizontal: 0}}
                />
                <Text style={{fontWeight: 'bold', marginRight: 5}}>
                  {item.plays || 0} plays
                </Text>
              </View>
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
    paddingHorizontal: 10,
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
