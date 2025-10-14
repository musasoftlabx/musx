// * React
import React, { useState, useEffect, useCallback, Key } from 'react';

// * React-Native
import {
  FlatList,
  Image,
  View,
  Pressable,
  TextInput,
  Vibration,
  StyleSheet,
} from 'react-native';

// * Libraries
import { CastButton } from 'react-native-google-cast';
import { FlashList } from '@shopify/flash-list';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDeviceOrientation } from '@react-native-community/hooks';
import { useBackHandler } from '@react-native-community/hooks';
import { useQuery } from '@tanstack/react-query';
import { Divider, Menu, Text } from 'react-native-paper';
import axios from 'axios';
import debounce from 'lodash/debounce';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

// * Components
import CreatePlaylist from '../../components/CreatePlaylist';
import LinearGradientX from '../../components/LinearGradientX';
import StatusBarX from '../../components/StatusBarX';

// * Store
import { API_URL, HEIGHT, WIDTH, usePlayerStore } from '../../store';

// * Constants
import { queryClient } from '../../../App';

// * Types
import { Playlist, RootStackParamList } from '../../types';

export default function Playlists({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Playlist', ''>) {
  // ? States
  const [isAddPlaylistVisible, setIsAddPlaylistVisible] =
    useState<boolean>(false);
  const [isSortMenuVisible, setIsSortMenuVisible] = useState(false);
  const [filter, setFilter] = useState<Playlist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchWord, setSearchWord] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // ? Store States
  const palette = usePlayerStore(state => state.palette);

  // ? Store Actions
  const openPlaylistDetails = usePlayerStore(
    state => state.openPlaylistDetails,
  );
  const setPlaylistDetails = usePlayerStore(state => state.setPlaylistDetails);

  // ? Hooks
  const orientation = useDeviceOrientation();
  useBackHandler(() => {
    if (showSearch) setShowSearch(false);
    else navigation.goBack();
    return true;
  });

  // ? Queries
  const { isFetching, isSuccess } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => {
      axios<Playlist[]>(`${API_URL}playlists`).then(({ data }) => {
        setFilter(data);
        setPlaylists(data);
      });
      return null;
    },
  });

  // ? Callbacks
  const debouncedSearchCallback = useCallback(
    debounce((text, playlists) => {
      if (text?.length >= 2)
        setFilter(
          playlists?.filter(
            (playlist: Playlist) =>
              playlist.name?.toLowerCase().includes(text?.toLowerCase()) &&
              playlist.name,
          ),
        );
      else setFilter(playlists);
    }, 500),
    [],
  );

  // ? Effects
  useEffect(() => {
    if (searchWord?.length >= 2)
      setFilter(
        playlists?.filter(
          (playlist: Playlist) =>
            playlist.name?.toLowerCase().includes(searchWord?.toLowerCase()) &&
            playlist.name,
        ),
      );
  }, [filter?.length]);

  useEffect(() => {
    navigation.setOptions({
      header: ({ route: { name } }) =>
        showSearch ? (
          <View
            style={[styles.header, { backgroundColor: palette?.[1] ?? '#000' }]}
          >
            <Ionicons
              color="#fff"
              name="arrow-back"
              size={22}
              style={{ marginRight: 10 }}
              onPress={() => {
                Vibration.vibrate(50);
                setShowSearch(false);
                setSearchWord('');
                setFilter(playlists);
              }}
            />

            <TextInput
              autoFocus
              value={searchWord}
              placeholder="Search by playlist name"
              onChangeText={text => {
                setSearchWord(text);
                debouncedSearchCallback(text, playlists);
              }}
              style={{
                borderBottomColor: '#fff5',
                borderBottomWidth: 0.5,
                color: '#fff',
                flexGrow: 1,
                fontSize: 18,
              }}
            />

            <Ionicons
              color="#fff"
              name="close"
              size={22}
              onPress={() => {
                Vibration.vibrate(50);
                setSearchWord('');
                setFilter(playlists);
                if (searchWord.length === 0) setShowSearch(false);
              }}
            />
          </View>
        ) : (
          <View
            style={[styles.header, { backgroundColor: palette?.[1] ?? '#000' }]}
          >
            <View
              style={{
                alignItems: 'center',
                flex: 0.3,
                flexDirection: 'row',
                gap: 20,
              }}
            >
              <Ionicons
                color="#fff"
                name="arrow-back"
                size={22}
                onPress={() => navigation.goBack()}
              />

              <View>
                <Text style={{ fontSize: 22 }}>{name}</Text>
                <Text style={{ fontSize: 12, marginTop: -3 }}>
                  {playlists?.length} items
                </Text>
              </View>
            </View>

            <View
              style={{
                alignItems: 'center',
                flex: 0.7,
                flexDirection: 'row',
                gap: 40,
                justifyContent: 'flex-end',
              }}
            >
              <MaterialIcons
                color="#fff"
                name="playlist-add"
                size={22}
                onPress={() => {
                  setIsAddPlaylistVisible(true);
                }}
              />

              <Menu
                key={Boolean(isSortMenuVisible) as unknown as Key}
                visible={isSortMenuVisible}
                onDismiss={() => setIsSortMenuVisible(false)}
                anchor={
                  <MaterialCommunityIcons
                    color="#fff"
                    name="sort"
                    size={22}
                    onPress={() => (
                      Vibration.vibrate(50), setIsSortMenuVisible(true)
                    )}
                  />
                }
              >
                <Menu.Item
                  onPress={() => sortPlaylists('name')}
                  title="Sort by name"
                />
                <Divider />
                <Menu.Item
                  onPress={() => sortPlaylists('tracks')}
                  title="Sort by tracks (ASC)"
                />
                <Menu.Item
                  onPress={() => sortPlaylists('tracks', 'DESC')}
                  title="Sort by tracks (DESC)"
                />
                <Divider />
                <Menu.Item
                  onPress={() => sortPlaylists('duration')}
                  title="Sort by duration (ASC)"
                />
                <Menu.Item
                  onPress={() => sortPlaylists('duration', 'DESC')}
                  title="Sort by duration (DESC)"
                />
                <Divider />
                <Menu.Item
                  onPress={() => sortPlaylists('modifiedOn')}
                  title="Sort by date created (ASC)"
                />
                <Menu.Item
                  onPress={() => sortPlaylists('modifiedOn', 'DESC')}
                  title="Sort by date created (DESC)"
                />
              </Menu>

              <Ionicons
                color="#fff"
                name="search"
                size={22}
                onPress={() => (Vibration.vibrate(50), setShowSearch(true))}
              />

              <CastButton
                style={{ height: 24, width: 24, tintColor: '#fff' }}
              />
            </View>
          </View>
        ),
    });
  }, [
    navigation,
    isSortMenuVisible,
    palette,
    showSearch,
    searchWord,
    playlists,
  ]);

  // ? Functions
  const sortPlaylists = (
    by: 'name' | 'tracks' | 'duration' | 'modifiedOn',
    direction?: string,
  ) => {
    const sorted = [...playlists];
    direction
      ? setFilter(sorted.sort((a, b) => (b[by] as number) - (a[by] as number)))
      : setFilter(sorted.sort((a, b) => (a[by] as number) - (b[by] as number)));
    setIsSortMenuVisible(false);
  };

  const columns = orientation === 'portrait' ? 150 : 200;

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

      <CreatePlaylist
        isAddPlaylistVisible={isAddPlaylistVisible}
        setIsAddPlaylistVisible={setIsAddPlaylistVisible}
      />

      {isFetching && (
        <FlatList
          data={new Array(
            Number((HEIGHT / 150).toFixed(0)) *
              Number((WIDTH / 150).toFixed(0)),
          ).fill(0)}
          numColumns={Number((WIDTH / 150).toFixed(0))}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ alignItems: 'center' }}
          renderItem={() => (
            <View style={{ paddingHorizontal: 20 }}>
              <SkeletonPlaceholder
                highlightColor="#fff5"
                backgroundColor="#fff5"
              >
                <View style={{ alignItems: 'center', paddingTop: 20 }}>
                  <View
                    style={{
                      borderRadius: 10,
                      marginBottom: 10,
                      height: 100,
                      width: 100,
                    }}
                  />
                  <View
                    style={{ alignItems: 'center', borderRadius: 5, gap: 8 }}
                  >
                    <Text style={{ fontSize: 14, lineHeight: 16, width: 100 }}>
                      {''}
                    </Text>
                    <Text style={{ fontSize: 14, lineHeight: 10, width: 80 }}>
                      {''}
                    </Text>
                    <Text style={{ fontSize: 14, lineHeight: 8, width: 50 }}>
                      {''}
                    </Text>
                  </View>
                </View>
              </SkeletonPlaceholder>
            </View>
          )}
        />
      )}

      {(isSuccess || playlists.length === 0) && (
        <FlashList
          data={filter}
          numColumns={Number((WIDTH / columns).toFixed(0))}
          keyExtractor={(_, index) => index.toString()}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            queryClient
              .refetchQueries({ queryKey: ['playlists'] })
              .then(() => setRefreshing(false));
          }}
          renderItem={({ item }: { item: Playlist }) => (
            <Pressable
              onPress={() => navigation.navigate('Playlist', item)}
              onLongPress={() => {
                Vibration.vibrate(50);
                setPlaylistDetails(item);
                openPlaylistDetails();
              }}
            >
              <View
                style={{ paddingVertical: 12, alignItems: 'center', gap: 3 }}
              >
                {item.tracks >= 4 ? (
                  <View
                    style={{
                      borderColor: '#f0ecd9ff',
                      borderRadius: 10,
                      borderWidth: 2,
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      width: 104,
                      height: 104,
                      overflow: 'hidden',
                    }}
                  >
                    {item.artworks.map(
                      (artwork: string, i: number) =>
                        i <= 4 && (
                          <Image
                            key={i}
                            source={{ uri: artwork }}
                            style={{ width: 50, height: 50 }}
                            resizeMode="cover"
                          />
                        ),
                    )}
                  </View>
                ) : (
                  <Image
                    source={{ uri: item.artworks[0] }}
                    style={{ width: 100, height: 100, borderRadius: 10 }}
                  />
                )}

                <Text
                  numberOfLines={1}
                  style={{
                    color: '#fff',
                    fontSize: orientation === 'portrait' ? 16 : 13,
                    marginTop: 5,
                    textAlign: 'center',
                    width: '90%',
                  }}
                >
                  {item.name}
                </Text>

                <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      backgroundColor: '#a7a7a745',
                      borderColor: '#ffffff4D',
                      borderWidth: 1,
                      borderTopLeftRadius: 5,
                      borderBottomLeftRadius: 5,
                      fontSize: 13,
                      paddingLeft: 7,
                      paddingHorizontal: 5,
                      paddingTop: 2,
                    }}
                  >
                    {item.size}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: '#ffffff4D',
                      borderWidth: 1,
                      borderTopRightRadius: 5,
                      borderBottomRightRadius: 5,
                      fontSize: 13,
                      paddingLeft: 7,
                      paddingHorizontal: 5,
                      paddingTop: 2,
                    }}
                  >
                    {item.tracks} tracks
                  </Text>
                </View>

                <Text style={{ fontSize: 14, marginTop: 2, opacity: 0.5 }}>
                  {item.duration} mins
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text>Empty</Text>
            </View>
          }
          contentContainerStyle={{ paddingHorizontal: 5 }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
