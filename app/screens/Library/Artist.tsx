import React, {useState, useEffect} from 'react';

import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Dimensions,
  View,
  Pressable,
  Text,
  FlatList,
  SectionList,
  StyleSheet,
} from 'react-native';

import {StarRatingDisplay} from 'react-native-star-rating-widget';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

import {API_URL, ARTWORK_URL, AUDIO_URL, usePlayerStore} from '../../store';

import {TrackProps} from '../../types';
import {useBackHandler} from '@react-native-community/hooks';

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

export default function Artist({
  navigation,
  route: {
    params: {albumArtist, path, tracks},
  },
}: any) {
  const [artist, setArtist] = useState<{
    albums: [];
    singles: {
      title: string;
      artists: string;
      artwork: string;
      plays: number;
      rating: number;
    }[];
  }>();
  const [sections] = useState([
    {title: 'Albums', horizontal: true, data: [1]},
    {title: 'Singles', data: [1]},
  ]);

  // ? StoreStates
  const palette = usePlayerStore(state => state.palette);

  // ? StoreActions
  const play = usePlayerStore(state => state.play);

  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  // ? Effects
  useEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: palette?.[1] ?? '#000'},
    });
  });

  useEffect(() => {
    axios(`${API_URL}artist/${albumArtist}`)
      .then(({data}) => setArtist(data))
      .catch(err => console.log(err.message));
  }, []);

  return (
    <>
      <LinearGradient
        colors={[palette[0] ?? '#000', palette[1] ?? '#000']}
        useAngle={true}
        angle={290}
        style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}
      />

      <ImageBackground
        source={{
          uri: `${AUDIO_URL}${path
            .split('/')
            .slice(0, -1)
            .join('/')}/artist.jpg`,
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
          {/* <Image
            source={{
              uri: `${state.NGINX_SERVER}dir${
                artist && artist.artistDirectory
              }/artist.jpg`,
            }}
            defaultSource={require('../../assets/images/musician.png')}
            style={{
              width: 100,
              height: 100,
              borderRadius: 10,
              marginRight: 15,
            }}
            resizeMode="cover"
          /> */}
          <View
            style={{
              width: '60%',
              justifyContent: 'space-around',
            }}>
            <Text numberOfLines={1} style={{fontSize: 24, fontWeight: '700'}}>
              {albumArtist}
            </Text>
            <Text numberOfLines={1} style={{fontSize: 18}}>
              {tracks} tracks
            </Text>
          </View>
        </View>
      </ImageBackground>

      <SectionList
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        sections={sections}
        keyExtractor={(item, index) => index.toString()}
        renderSectionHeader={({section}) => (
          <Text
            style={{
              fontWeight: '800',
              fontSize: 18,
              color: '#fff',
              marginTop: 20,
              marginBottom: 5,
              marginLeft: 10,
            }}>
            {section.title}
          </Text>
        )}
        renderItem={({section, index}) => (
          <>
            {section.horizontal ? (
              <FlatList
                horizontal
                data={artist && artist.albums}
                renderItem={({item}: {item: TrackProps}) => (
                  <Pressable
                    onPress={() =>
                      navigation.navigate('Album', {
                        albumArtist,
                        album: item.album,
                      })
                    }
                    style={{margin: 10, width: 100}}>
                    <Image
                      source={{uri: `${ARTWORK_URL}${item.artwork}`}}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 10,
                      }}
                      resizeMode="cover"
                    />
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 16,
                        color: 'white',
                        marginTop: 5,
                        marginBottom: 1,
                        marginLeft: 3,
                        opacity: 0.5,
                      }}>
                      {item.album}
                    </Text>
                  </Pressable>
                )}
                showsHorizontalScrollIndicator={false}
              />
            ) : (
              <FlatList
                scrollEnabled={false}
                data={artist && artist.singles}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => (
                  <Pressable onPress={() => play([item], item)}>
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
            )}
          </>
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
