// * React
import React from 'react';

// * React Native
import {FlatList, Pressable, View} from 'react-native';

// * Libraries
import {useQuery} from '@tanstack/react-query';
import {Avatar, Text} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

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
      <LinearGradient
        colors={[palette[0] ?? '#000', palette[1] ?? '#000']}
        useAngle={true}
        angle={180}
        style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}
      />

      <FlatList
        data={[
          {
            id: 'Artists',
            title: 'Artists',
            icon: 'account-music-outline',
            count: data?.artists ?? 0,
          },
          {
            id: 'History',
            title: 'History',
            subtitle: 'plays',
            icon: 'disc',
            count: data?.plays ?? 0,
          },
          {
            id: 'Playlists',
            title: 'Playlists',
            icon: 'playlist-music',
            count: data?.playlists ?? 0,
          },
          {
            id: 'Folders',
            title: 'Folders',
            subtitle: 'tracks',
            icon: 'folder-music',
            count: data?.tracks ?? 0,
          },
        ]}
        renderItem={({item}) => (
          <Pressable
            onPress={() => {
              navigation.navigate(item.id);
              AsyncStorage.setItem('libraryScreen', item.id);
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
              <Text variant="titleMedium">{`${item.count?.toLocaleString()} ${
                item.subtitle ? item.subtitle : item.title.toLowerCase()
              }`}</Text>
            </View>
          </Pressable>
        )}
        keyExtractor={item => item.id}
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
