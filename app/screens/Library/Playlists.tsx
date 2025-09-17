// * React
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react';

// * React-Native
import {
  FlatList,
  Image,
  View,
  Pressable,
  TextInput,
  Vibration,
} from 'react-native';

// * Libraries
import { Button, Divider, Menu } from 'react-native-paper';
import { CastButton } from 'react-native-google-cast';
import { FlashList } from '@shopify/flash-list';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBackHandler } from '@react-native-community/hooks';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Text } from 'react-native-paper';
import axios from 'axios';
import debounce from 'lodash/debounce';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

// * Components
import LinearGradientX from '../../components/LinearGradientX';
import StatusBarX from '../../components/StatusBarX';

// * Store
import { API_URL, HEIGHT, WIDTH, usePlayerStore } from '../../store';

// * Constants
import { queryClient } from '../../../App';

// * Types
import { RootStackParamList } from '../../types';

type PlaylistProps = RootStackParamList['Playlists'];

export default function Playlists({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Playlist', ''>) {
  // ? States
  const [filter, setFilter] = useState<PlaylistProps[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isSortMenuVisible, setIsSortMenuVisible] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistProps[]>([]);
  const [searchWord, setSearchWord] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // ? StoreStates
  const palette = usePlayerStore(state => state.palette);

  // ? Hooks
  useBackHandler(() => {
    if (showSearch) setShowSearch(false);
    else navigation.goBack();
    return true;
  });

  const { isPending, isSuccess } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => {
      axios<PlaylistProps[]>(`${API_URL}playlists`).then(({ data }) => {
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
            (playlist: PlaylistProps) =>
              playlist.name?.toLowerCase().includes(text?.toLowerCase()) &&
              playlist.name,
          ),
        );
      else setFilter(playlists);
    }, 500),
    [],
  );

  useEffect(() => {
    if (searchWord?.length >= 2)
      setFilter(
        playlists?.filter(
          (playlist: PlaylistProps) =>
            playlist.name?.toLowerCase().includes(searchWord?.toLowerCase()) &&
            playlist.name,
        ),
      );
  }, [filter?.length]);

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

  useLayoutEffect(() => {
    navigation.setOptions({
      header: ({ route: { name } }) =>
        showSearch ? (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: palette?.[1] ?? '#000',
              flexDirection: 'row',
              gap: 10,
              paddingHorizontal: 20,
              paddingVertical: 5,
            }}
          >
            <Pressable
              onPress={() => {
                Vibration.vibrate(50);
                setShowSearch(false);
                setSearchWord('');
                setFilter(playlists);
              }}
              style={{ marginRight: 10, opacity: 0.8 }}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </Pressable>

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
                flexGrow: 1,
                fontSize: 18,
              }}
            />

            <Pressable
              onPress={() => {
                Vibration.vibrate(50);
                setSearchWord('');
                setFilter(playlists);
              }}
              style={{ opacity: 0.8 }}
            >
              <Ionicons name="close" size={22} color="white" />
            </Pressable>
          </View>
        ) : (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: palette?.[1] ?? '#000',
              flexDirection: 'row',
              gap: 40,
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}
          >
            <Pressable
              onPress={() => navigation.goBack()}
              style={{ opacity: 0.8 }}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </Pressable>

            <View style={{ marginLeft: -10 }}>
              <Text style={{ fontSize: 22 }}>{name}</Text>
              <Text style={{ fontSize: 12 }}>
                {playlists?.length} playlists
              </Text>
            </View>

            <View style={{ flex: 1 }} />

            <Pressable
              onPress={() => (Vibration.vibrate(50), setShowSearch(true))}
              style={{ marginRight: 10, opacity: 0.8 }}
            >
              <Ionicons name="search" size={22} color="white" />
            </Pressable>

            <Menu
              mode="elevated"
              visible={isSortMenuVisible}
              onDismiss={() => setIsSortMenuVisible(false)}
              anchor={
                <Pressable
                  onPress={() => (
                    Vibration.vibrate(50), setIsSortMenuVisible(true)
                  )}
                  style={{ marginRight: 10, opacity: 0.8 }}
                >
                  <MaterialCommunityIcons name="sort" size={22} color="white" />
                </Pressable>
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
            </Menu>

            <CastButton style={{ height: 24, width: 24, marginRight: 5 }} />
          </View>
        ),
    });
  }, [
    navigation,
    palette,
    showSearch,
    searchWord,
    playlists,
    isSortMenuVisible,
  ]);

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

      {isPending && (
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
                    <Text
                      style={{ fontSize: 14, lineHeight: 16, width: 100 }}
                    />
                    <Text style={{ fontSize: 14, lineHeight: 10, width: 80 }} />
                    <Text style={{ fontSize: 14, lineHeight: 8, width: 50 }} />
                  </View>
                </View>
              </SkeletonPlaceholder>
            </View>
          )}
        />
      )}

      {isSuccess && (
        <FlashList
          data={filter}
          numColumns={Number((WIDTH / 150).toFixed(0))}
          keyExtractor={(_, index) => index.toString()}
          estimatedItemSize={300}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            queryClient
              .refetchQueries({ queryKey: ['playlists'] })
              .then(() => setRefreshing(false));
          }}
          renderItem={({ item }: { item: PlaylistProps }) => (
            <Pressable
              onPress={() => navigation.navigate('Playlist', item)}
              style={{ flex: 1 }}
            >
              <View
                style={{ paddingVertical: 12, alignItems: 'center', gap: 3 }}
              >
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
                  style={{ color: '#fff', fontSize: 16, marginTop: 5 }}
                >
                  {item.name}
                </Text>

                <View
                  style={{ alignItems: 'center', flexDirection: 'row', gap: 3 }}
                >
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
                    }}
                  >
                    {item.size}
                  </Text>

                  <Text style={{ fontSize: 14, opacity: 0.5 }}>
                    {item.tracks} tracks
                  </Text>
                </View>

                <Text style={{ fontSize: 14, opacity: 0.5 }}>
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
        />
      )}
    </>
  );
}
