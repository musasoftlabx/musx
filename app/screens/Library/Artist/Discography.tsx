import React, {useState} from 'react';

import {
  Animated,
  Easing,
  Dimensions,
  Image,
  FlatList,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {StarRatingDisplay} from 'react-native-star-rating-widget';

import {ARTWORK_URL} from '../../../store';

import {TrackProps} from '../../../types';

const spinValue = new Animated.Value(0);

Animated.loop(
  Animated.timing(spinValue, {
    toValue: 1,
    duration: 3000,
    easing: Easing.linear,
    useNativeDriver: false,
  }),
).start();

const spin = spinValue.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '360deg'],
});

export default function Discography({navigation, artist}: any) {
  const singles = artist && artist.singles;
  const [sections, setSections] = useState([
    {
      title: 'Albums',
      horizontal: true,
      data: [1],
    },
    {
      title: 'Singles',
      data: [1],
    },
  ]);

  return (
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
                <View
                  style={{
                    margin: 10,
                    width: 100,
                  }}>
                  <Image
                    source={{
                      uri: `${ARTWORK_URL}${item.artwork}`,
                    }}
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
                    {item.name}
                  </Text>
                </View>
              )}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <FlatList
              scrollEnabled={false}
              data={singles}
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
                        {item.title || item.name}
                      </Text>
                      <Text numberOfLines={1} style={styles.artists}>
                        {(item.artists && item.artists.join(' / ')) ||
                          'Unknown Artist'}
                      </Text>
                      <Text numberOfLines={1} style={styles.album}>
                        {item.album || 'Unknown Album'}
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
  );
}

{
  /* <Pressable
                  onPress={
                    (() =>
                      dispatch({
                        type: 'PLAY',
                        payload: {
                          index: index,
                          currentlyPlaying: item,
                          //playlist: folders,
                          isPlaying: true,
                        },
                      }),
                    navigation.navigate('NowPlaying'))
                  }>
                  <View style={styles.item}>
                    <Animated.Image
                      source={{
                        uri: item.artwork,
                      }}
                      style={
                        state.currentlyPlaying &&
                        state.currentlyPlaying._id === item._id
                          ? styles.isPlaying
                          : styles.image
                      }
                    />
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
                        {(item.artists && item.artists.join(' / ')) ||
                          'Unknown Artist'}
                      </Text>
                      <Text numberOfLines={1} style={styles.album}>
                        {item.album || 'Unknown Album'}
                      </Text>
                    </View>
                    <View style={{flex: 1}} />
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                      }}>
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
                </Pressable> */
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
