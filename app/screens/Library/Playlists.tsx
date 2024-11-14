import React, {useState, useEffect} from 'react';

import {Image, View, Pressable, Text, FlatList, StyleSheet} from 'react-native';

import axios from 'axios';

import {API_URL, ARTWORK_URL, WIDTH} from '../../store';

import {TrackProps} from '../../types';

export default function Playlists({navigation}: any) {
  const [layout, setLayout] = useState('grid');
  const [playlists, setPlaylists] = useState(null);

  useEffect(() => {
    axios(`${API_URL}playlists`).then(({data}) => setPlaylists(data));
  }, []);

  return (
    <FlatList
      data={playlists}
      keyExtractor={(item, index) => index.toString()}
      numColumns={3}
      contentContainerStyle={{minHeight: '100%'}}
      renderItem={({item}: {item: TrackProps}) => (
        <>
          {layout === 'grid' ? (
            <Pressable
              onPress={() =>
                navigation.navigate('Playlist', {
                  id: item.id,
                  name: item.name,
                  duration: item.duration,
                  totalTracks: item.totalTracks,
                  tracks: item.tracks,
                })
              }
              style={{flexBasis: '33%'}}>
              <View style={{paddingVertical: 12, alignItems: 'center'}}>
                <View
                  style={{
                    flexDirection: 'row',
                    flexBasis: '50%',
                    flexWrap: 'wrap',
                    width: 100,
                    height: 100,
                  }}>
                  {item.tracks.map((track: TrackProps, i: number) => (
                    <Image
                      key={i}
                      source={{uri: `${ARTWORK_URL}${track.artwork}`}}
                      style={{width: 50, height: 50}}
                      resizeMode="cover"
                    />
                  ))}
                </View>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: 'white',
                    marginTop: 8,
                  }}>
                  {item.name}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 16,
                    color: 'white',
                    marginVertical: 1,
                  }}>
                  {item.totalTracks} tracks
                </Text>
                <Text style={{fontSize: 14, opacity: 0.5}}>
                  {item.duration}
                </Text>
              </View>
            </Pressable>
          ) : (
            <Pressable onPress={() => navigation.navigate('NowPlaying')}>
              <View style={styles.item}>
                <Image
                  source={{uri: `${ARTWORK_URL}${item.artwork}`}}
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
                    maxWidth: WIDTH - 180,
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
                  style={{justifyContent: 'center', alignItems: 'flex-end'}}>
                  <Text style={{fontWeight: 'bold', marginRight: 5}}>
                    {item.tracks}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        </>
      )}
    />
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
