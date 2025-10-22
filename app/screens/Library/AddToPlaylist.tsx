// * React
import React, { useCallback, useEffect, useState } from 'react';

// * React Native
import {
  Image,
  Pressable,
  View,
  ToastAndroid,
  StyleSheet,
  FlatList,
  Vibration,
  TextInput,
  ActivityIndicator,
} from 'react-native';

// * NPM
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Text } from 'react-native-paper';
import axios from 'axios';
import debounce from 'lodash/debounce';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

// * Components
import CreatePlaylist from '../../components/CreatePlaylist';
import EmptyRecords from '../../components/EmptyRecords';
import LinearGradientX from '../../components/LinearGradientX';
import StatusBarX from '../../components/StatusBarX';

// * Store
import { API_URL, HEIGHT, usePlayerStore, WIDTH } from '../../store';

// * Icons
import ArrowBackIcon from 'react-native-vector-icons/Ionicons';
import CloseIcon from 'react-native-vector-icons/Ionicons';
import PlaylistAddIcon from 'react-native-vector-icons/MaterialIcons';
import SearchIcon from 'react-native-vector-icons/Ionicons';

// * Functions
import { handleAxiosError } from '../../functions';
import { queryClient } from '../../../App';

// * Types
import { AddToPlaylistProps, Playlist, RootStackParamList } from '../../types';

// * Assets
import PlaylistImage from '../../assets/images/Playlists.png';

const Skeleton = () => (
  <FlatList
    data={new Array(
      Number((HEIGHT / 150).toFixed(0)) * Number((WIDTH / 150).toFixed(0)),
    ).fill(0)}
    numColumns={Number((WIDTH / 150).toFixed(0))}
    keyExtractor={(_, index) => index.toString()}
    contentContainerStyle={{ alignItems: 'center' }}
    renderItem={() => (
      <View style={{ paddingHorizontal: 20 }}>
        <SkeletonPlaceholder highlightColor="#fff5" backgroundColor="#fff5">
          <View style={{ alignItems: 'center', paddingTop: 20 }}>
            <View
              style={{
                borderRadius: 10,
                marginBottom: 10,
                height: 100,
                width: 100,
              }}
            />
            <View style={{ alignItems: 'center', borderRadius: 5, gap: 8 }}>
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
);

export default function AddToPlaylist({
  navigation,
  route: {
    params: { id, name },
  },
}: NativeStackScreenProps<RootStackParamList, 'Playlist', ''>) {
  // ? Store States
  const palette = usePlayerStore(state => state.palette);

  // ? States
  const [isAddPlaylistVisible, setIsAddPlaylistVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<Playlist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchWord, setSearchWord] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // ? Queries
  const { isFetching } = useQuery({
    queryKey: ['playlists'],
    queryFn: ({ queryKey }) => {
      axios<Playlist[]>(`${API_URL}${queryKey[0]}`).then(({ data }) => {
        setFilter(data);
        setPlaylists(data);
      });
      return null;
    },
  });

  // ? Mutations
  const { mutate: addPlaylistTrack } = useMutation({
    mutationFn: (body: AddToPlaylistProps) =>
      axios.post(`${API_URL}addPlaylistTrack`, body),
  });

  // ? Effects
  useEffect(() => {
    navigation.setOptions({
      header: () =>
        showSearch ? (
          <View
            style={[styles.header, { backgroundColor: palette?.[1] ?? '#000' }]}
          >
            <ArrowBackIcon
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

            <CloseIcon
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
                flex: 0.4,
                flexDirection: 'row',
                gap: 20,
              }}
            >
              <ArrowBackIcon
                color="#fff"
                name="arrow-back"
                size={22}
                onPress={() => (Vibration.vibrate(100), navigation.goBack())}
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
                flex: 0.6,
                flexDirection: 'row',
                gap: 50,
                justifyContent: 'flex-end',
              }}
            >
              <PlaylistAddIcon
                color="#fff"
                name="playlist-add"
                size={30}
                onPress={() => (
                  Vibration.vibrate(100), setIsAddPlaylistVisible(true)
                )}
              />

              <SearchIcon
                color="#fff"
                name="search"
                size={24}
                onPress={() => (Vibration.vibrate(100), setShowSearch(true))}
              />
            </View>
          </View>
        ),
    });
  }, [navigation, palette, playlists, showSearch, searchWord]);

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

  const refetch = () =>
    queryClient
      .refetchQueries({ queryKey: ['playlists'] })
      .then(() => setIsRefreshing(false));

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

      <CreatePlaylist
        isAddPlaylistVisible={isAddPlaylistVisible}
        setIsAddPlaylistVisible={setIsAddPlaylistVisible}
      />

      <View style={{ flex: 1, marginTop: 60, paddingHorizontal: 10 }}>
        <FlashList
          data={filter}
          keyExtractor={(_, index) => index.toString()}
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            refetch();
          }}
          renderItem={({ item }) => (
            <Pressable
              style={{
                flexDirection: 'row',
                gap: 15,
                marginVertical: 10,
              }}
              onPress={() =>
                addPlaylistTrack(
                  { playlistId: item.id, trackId: id },
                  {
                    onSuccess: () => {
                      ToastAndroid.showWithGravity(
                        'Track added',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                      );
                      queryClient.refetchQueries({ queryKey: ['dashboard'] });
                      queryClient.refetchQueries({ queryKey: ['playlists'] });
                      navigation.goBack();
                    },
                    onError: handleAxiosError,
                  },
                )
              }
            >
              <View
                style={{
                  borderColor: '#f0ecd9ff',
                  borderRadius: 10,
                  borderWidth: 2,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  width: 54,
                  height: 54,
                  overflow: 'hidden',
                }}
              >
                {item.artworks.length >= 4 ? (
                  <>
                    {item.artworks.map(
                      (artwork: string, i: number) =>
                        i <= 4 && (
                          <Image
                            key={i}
                            source={{ uri: artwork }}
                            style={{ width: 25, height: 25 }}
                            resizeMode="cover"
                          />
                        ),
                    )}
                  </>
                ) : (
                  <Image
                    source={{ uri: item.artworks?.[0] }}
                    style={{ width: 50, height: 50, borderRadius: 10 }}
                  />
                )}
              </View>

              <View style={{ gap: 5, justifyContent: 'center' }}>
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 17, fontWeight: 'bold' }}
                >
                  {item.name}
                </Text>

                <Text numberOfLines={1} style={{ fontSize: 15, opacity: 0.7 }}>
                  {item.tracks} track
                  {item.tracks === 1 ? '' : 's'}
                </Text>
              </View>

              <View style={{ flex: 1 }} />

              <View
                style={{ alignItems: 'flex-end', justifyContent: 'center' }}
              >
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 15, fontWeight: 'bold', opacity: 0.5 }}
                >
                  Duration
                </Text>

                <Text
                  numberOfLines={1}
                  style={{ fontSize: 16, fontWeight: 'bold' }}
                >
                  {item.duration}
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            !isFetching ? (
              <View style={{ height: HEIGHT * 0.8, justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : (
              <EmptyRecords
                image={PlaylistImage}
                context="playlists"
                reload={refetch}
              />
            )
          }
        />
      </View>
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
