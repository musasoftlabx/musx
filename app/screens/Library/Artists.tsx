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

import axios from 'axios';

import {API_URL, AUDIO_URL, usePlayerStore} from '../../store';
import {useBackHandler} from '@react-native-community/hooks';
import LinearGradient from 'react-native-linear-gradient';

export default function Artists({navigation}: any) {
  const [layout, setLayout] = useState('grid');
  const [artists, setArtists] = useState(null);

  const palette = usePlayerStore(state => state.palette);
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
    axios(`${API_URL}artists`).then(({data}) => setArtists(data));
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
        data={artists}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        contentContainerStyle={{minHeight: '100%'}}
        renderItem={({item, index}) => {
          return (
            <>
              {layout === 'grid' ? (
                <Pressable
                  onPress={() =>
                    navigation.navigate('Artist', {
                      artist: item.albumArtist,
                      plays: item.plays,
                    })
                  }
                  style={{flexBasis: '33%'}}>
                  <View style={{paddingVertical: 12, alignItems: 'center'}}>
                    <Image
                      source={{
                        uri: `${AUDIO_URL}${item?.path
                          .split('/')
                          .slice(0, -1)
                          .join('/')}/artist.jpg`,
                      }}
                      //defaultSource={require('../../assets/images/musician.png')}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 100,
                      }}
                      resizeMode="cover"
                      onError={(e: any) => {
                        e.target.onerror = null;
                        e.target.src = require('../../assets/images/musician.png');
                      }}
                    />
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 16,
                        color: 'white',
                        marginTop: 5,
                        marginBottom: 1,
                      }}>
                      {item.albumArtist}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        opacity: 0.5,
                      }}>
                      {item.tracks} tracks
                    </Text>
                  </View>
                </Pressable>
              ) : (
                <Pressable onPress={() => navigation.navigate('NowPlaying')}>
                  <View style={styles.item}>
                    <Image
                      source={{
                        uri: `${AUDIO_URL}${item?.path
                          .split('/')
                          .slice(-1)}/artist.jpg`,
                      }}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 100,
                      }}
                      onError={(e: any) => {
                        e.target.onerror = null;
                        e.target.src = require('../../assets/images/musician.png');
                      }}
                    />
                    <View
                      style={{
                        justifyContent: 'center',
                        marginTop: -2,
                        maxWidth: Dimensions.get('window').width - 180,
                      }}>
                      <Text numberOfLines={1} style={styles.title}>
                        {item.artist}
                      </Text>
                      <Text numberOfLines={1} style={styles.album}>
                        {item.plays}
                      </Text>
                    </View>
                    <View style={{flex: 1}} />
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                      }}>
                      <Text style={{fontWeight: 'bold', marginRight: 5}}>
                        {item.tracks}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              )}
            </>
          );
        }}
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
