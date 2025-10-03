// * React
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
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
import { useTheme } from 'react-native-paper';
import { MenuView, MenuComponentRef } from '@react-native-menu/menu';
import { CastButton } from 'react-native-google-cast';
import { FlashList } from '@shopify/flash-list';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDeviceOrientation } from '@react-native-community/hooks';
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
import { Playlist, RootStackParamList } from '../../types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { yupString } from '../../constants/yup';
import { InferType, object } from 'yup';
import CreatePlaylist from '../../components/CreatePlaylist';
import { fontFamilyBold } from '../../utils';

type PlaylistProps = RootStackParamList['Playlists'];

const schema = object({ name: yupString, description: yupString });

export default function Playlists({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Playlist', ''>) {
  // ? Refs
  const menuRef = useRef<MenuComponentRef>(null);

  // ? States
  const [filter, setFilter] = useState<Playlist[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [playlists, setPlaylists] = useState<PlaylistProps[]>([]);
  const [searchWord, setSearchWord] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isAddPlaylistVisible, setIsAddPlaylistVisible] = useState(false);

  // ? Store States
  const palette = usePlayerStore(state => state.palette);

  // ? Hooks
  const orientation = useDeviceOrientation();
  useBackHandler(() => {
    if (showSearch) setShowSearch(false);
    else navigation.goBack();
    return true;
  });

  // ? Queries
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

              <MenuView
                ref={menuRef}
                title="Sort"
                onPressAction={e => {
                  console.log(e);
                }}
                onOpenMenu={() => console.log('opened')}
                onCloseMenu={() => console.log('closed')}
                actions={[
                  { id: 'sort_by_name', title: 'Sort by name' },
                  { id: 'sort_by_tracks_asc', title: 'Sort by tracks (ASC)' },
                  { id: 'sort_by_tracks_desc', title: 'Sort by tracks (DESC)' },
                  {
                    id: 'sort_by_duration_asc',
                    title: 'Sort by duration (ASC)',
                  },
                  {
                    id: 'sort_by_duration_desc',
                    title: 'Sort by duration (DESC)',
                  },
                ]}
                shouldOpenOnLongPress={false}
              >
                <MaterialCommunityIcons
                  color="#fff"
                  name="sort"
                  size={22}
                  onPress={() => (
                    Vibration.vibrate(50), menuRef.current?.show()
                  )}
                />
              </MenuView>

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
  }, [navigation, menuRef, palette, showSearch, searchWord, playlists]);

  // ? Functions
  // const sortPlaylists = (
  //   by: 'name' | 'tracks' | 'duration' | 'modifiedOn',
  //   direction?: string,
  // ) => {
  //   const sorted = [...playlists];
  //   direction
  //     ? setFilter(sorted.sort((a, b) => (b[by] as number) - (a[by] as number)))
  //     : setFilter(sorted.sort((a, b) => (a[by] as number) - (b[by] as number)));
  //   setIsSortMenuVisible(false);
  // };
  const columns = orientation === 'portrait' ? 150 : 200;

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

      <CreatePlaylist
        isAddPlaylistVisible={isAddPlaylistVisible}
        setIsAddPlaylistVisible={setIsAddPlaylistVisible}
      />

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

      {isSuccess && (
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
              style={{ flex: 1 }}
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
                    fontFamily: fontFamilyBold,
                    fontSize: orientation === 'portrait' ? 17 : 13,
                    marginTop: 2,
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
        />
      )}
    </>
  );
}
