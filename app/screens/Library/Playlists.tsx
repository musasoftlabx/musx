import React, {useState, useEffect} from 'react';

import {ActivityIndicator, Image, Pressable, Text, View} from 'react-native';

import axios from 'axios';

import {API_URL, usePlayerStore} from '../../store';

import {FlashList} from '@shopify/flash-list';
import {useBackHandler} from '@react-native-community/hooks';
import {useQuery} from '@tanstack/react-query';
import LinearGradientX from '../../components/LinearGradientX';

type PlaylistProps = {
  id: number;
  name: string;
  createdOn: string;
  modifiedOn: string;
  tracks: number;
  artworks: string[];
  artwork: string;
  duration: string;
  size: string;
};

export default function Playlists({navigation}: any) {
  const [layout, setLayout] = useState('grid');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const palette = usePlayerStore(state => state.palette);

  const {
    data: playlists,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ['playlists'],
    queryFn: ({queryKey}) => axios(`${API_URL}${queryKey[0]}`),
    select: ({data}) => data,
  });

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

  return (
    <>
      <LinearGradientX />

      <FlashList
        data={playlists}
        numColumns={3}
        keyExtractor={(_, index) => index.toString()}
        estimatedItemSize={300}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 1000);
        }}
        renderItem={({item}: {item: PlaylistProps}) => (
          <Pressable
            onPress={() => navigation.navigate('Playlist', item)}
            style={{flex: 1}}>
            <View style={{paddingVertical: 12, alignItems: 'center', gap: 3}}>
              {item.tracks >= 4 ? (
                <View
                  style={{
                    borderRadius: 10,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    marginTop: 0.5,
                    width: 100,
                    height: 100,
                    overflow: 'hidden',
                  }}>
                  {item.artworks.map((artwork: string, i: number) => (
                    <Image
                      key={i}
                      source={{uri: artwork}}
                      style={{width: 50, height: 50}}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              ) : (
                <Image
                  source={{uri: item.artworks[0]}}
                  style={{width: 100, height: 100, borderRadius: 10}}
                />
              )}

              <Text numberOfLines={1} style={{color: '#fff', fontSize: 16}}>
                {item.name}
              </Text>

              <View
                style={{alignItems: 'center', flexDirection: 'row', gap: 3}}>
                <Text
                  numberOfLines={1}
                  style={{
                    alignSelf: 'flex-start',
                    borderColor: '#ffffff4D',
                    borderWidth: 1,
                    borderRadius: 5,
                    fontSize: 14,
                    marginTop: 1,
                    paddingLeft: 5,
                    paddingRight: 3,
                  }}>
                  {item.size}
                </Text>

                <Text style={{fontSize: 14, opacity: 0.5}}>
                  {item.tracks} tracks
                </Text>
              </View>

              <Text style={{fontSize: 14, opacity: 0.5}}>
                {item.duration} mins
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={() =>
          isFetching ? (
            <ActivityIndicator
              size="large"
              color="#fff"
              style={{marginTop: '50%'}}
            />
          ) : isError ? (
            <View>
              <Text style={{fontFamily: 'Abel'}}>Empty</Text>
            </View>
          ) : (
            <View />
          )
        }
      />
    </>
  );
}
