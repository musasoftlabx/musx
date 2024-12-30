// * React
import React from 'react';

// * React Native
import {FlatList, Pressable, View} from 'react-native';

// * Libraries
import {useQuery} from '@tanstack/react-query';
import {Avatar, Text} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// * Components
import LinearGradientX from '../../components/LinearGradientX';

// * Store
import {usePlayerStore} from '../../store';

export default function Library({navigation}: any) {
  // ? StoreStates
  const palette = usePlayerStore(state => state.palette);

  // ? Queries
  const {data} = useQuery({
    queryKey: ['libraryCount'],
    queryFn: ({queryKey}) =>
      axios.get<{
        artists: number;
        tracks: number;
        playlists: number;
        plays: number;
      }>(`${queryKey[0]}`),
    select: ({data}) => data,
  });

  return (
    <>
      <LinearGradientX />

      <FlatList
        data={[
          {
            title: 'Scan Library',
            subtitle: 'This will scan the library for new tracks.',
            icon: 'disc',
            count: '',
          },
          {
            title: 'Artists',
            subtitle: 'artists',
            icon: 'account-music-outline',
            count: data?.artists ?? 0,
          },
          {
            title: 'Playlists',
            subtitle: 'playlists',
            icon: 'playlist-music',
            count: data?.playlists ?? 0,
          },
          {
            title: 'Folders',
            subtitle: 'tracks',
            icon: 'folder-music',
            count: data?.tracks ?? 0,
          },
        ]}
        renderItem={({item}) => (
          <Pressable
            onPress={() => {
              navigation.navigate(item.title.replaceAll(' ', ''));
              AsyncStorage.setItem('libraryScreen', item.title);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 15,
              marginVertical: 10,
            }}>
            <Avatar.Icon
              icon={item.icon}
              color="white"
              size={50}
              style={{backgroundColor: palette[1] ?? 'rgba(255, 255, 255, .5)'}}
            />
            <View>
              <Text variant="titleLarge">{item.title}</Text>
              {item.subtitle && (
                <Text variant="titleMedium">{`${item.count?.toLocaleString()} ${
                  item.subtitle
                }`}</Text>
              )}
            </View>
          </Pressable>
        )}
        keyExtractor={item => item.title}
        ListHeaderComponent={() => (
          <Text variant="headlineLarge" style={{marginBottom: 10}}>
            Library
          </Text>
        )}
        style={{margin: 20}}
      />
    </>
  );
}
