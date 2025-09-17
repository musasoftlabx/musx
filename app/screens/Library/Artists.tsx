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
import { Divider, Menu, Text } from 'react-native-paper';
import { CastButton } from 'react-native-google-cast';
import { FlashList } from '@shopify/flash-list';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBackHandler } from '@react-native-community/hooks';
import { useMutation } from '@tanstack/react-query';
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

type ArtistProps = RootStackParamList['Artist'];

export default function Artists({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Artists', ''>) {
  // ? States
  const [artists, setArtists] = useState<ArtistProps[]>([]);
  const [filter, setFilter] = useState<ArtistProps[]>([]);
  const [isSortMenuVisible, setIsSortMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
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

  const { mutate, isPending, isSuccess } = useMutation({
    mutationKey: ['artists'],
    mutationFn: () => axios<ArtistProps[]>(`${API_URL}artists`),
    onSuccess: ({ data }) => (setFilter(data), setArtists(data)),
  });

  // ? Callbacks
  const debouncedSearchCallback = useCallback(
    debounce((text, artists) => {
      if (text?.length >= 2)
        setFilter(
          artists?.filter(
            (artist: ArtistProps) =>
              artist.albumArtist?.toLowerCase().includes(text?.toLowerCase()) &&
              artist.albumArtist,
          ),
        );
      else setFilter(artists);
    }, 500),
    [],
  );

  // ? Effects
  useEffect(mutate, []);

  useEffect(() => {
    if (searchWord?.length >= 2)
      setFilter(
        artists?.filter(
          (artist: ArtistProps) =>
            artist.albumArtist
              ?.toLowerCase()
              .includes(searchWord?.toLowerCase()) && artist.albumArtist,
        ),
      );
  }, [filter?.length]);

  // ? Functions
  const sortArtists = (by: 'tracks' | 'albumArtist', direction?: string) => {
    const sorted = [...artists];
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
                setFilter(artists);
              }}
              style={{ marginRight: 10, opacity: 0.8 }}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </Pressable>

            <TextInput
              autoFocus
              value={searchWord}
              placeholder="Search by Album Artist"
              onChangeText={text => {
                setSearchWord(text);
                debouncedSearchCallback(text, artists);
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
                setFilter(artists);
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
              <Text style={{ fontSize: 12 }}>{artists?.length} artists</Text>
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
                onPress={() => sortArtists('albumArtist')}
                title="Sort by artist"
              />
              <Divider />
              <Menu.Item
                onPress={() => sortArtists('tracks')}
                title="Sort by track (ASC)"
              />
              <Menu.Item
                onPress={() => sortArtists('tracks', 'DESC')}
                title="Sort by track (DESC)"
              />
            </Menu>

            <CastButton style={{ height: 24, width: 24, marginRight: 5 }} />
          </View>
        ),
    });
  }, [navigation, showSearch, searchWord, artists, isSortMenuVisible]);

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
                      borderRadius: 100,
                      marginBottom: 10,
                      height: 100,
                      width: 100,
                    }}
                  />
                  <View style={{ borderRadius: 5, gap: 8 }}>
                    <Text style={{ fontSize: 14, lineHeight: 16 }}>{''}</Text>
                    <Text style={{ fontSize: 14, lineHeight: 10, width: 80 }}>
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
          numColumns={Number((WIDTH / 150).toFixed(0))}
          keyExtractor={(_, index) => index.toString()}
          estimatedItemSize={300}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            queryClient
              .refetchQueries({ queryKey: ['artists'] })
              .then(() => setRefreshing(false));
          }}
          renderItem={({ item }: { item: ArtistProps }) => (
            <Pressable
              onPress={() =>
                navigation.navigate('Artist', {
                  albumArtist: item.albumArtist,
                  artworks: item.artworks,
                  path: item.path,
                  tracks: item.tracks,
                  url: item.url,
                })
              }
              style={{ flex: 1 }}
            >
              <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                {item.artworks?.length === 4 ? (
                  <View
                    style={{
                      borderRadius: 100,
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      marginTop: 0.5,
                      width: 100,
                      height: 100,
                      overflow: 'hidden',
                    }}
                  >
                    {item.artworks.map((artwork: string, i: number) => (
                      <Image
                        key={i}
                        source={{ uri: artwork }}
                        style={{ width: 50, height: 50 }}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                ) : (
                  <Image
                    source={{
                      uri: `${item.url
                        .split('/')
                        .slice(0, -1)
                        .join('/')}/artist.jpg`,
                    }}
                    defaultSource={require('../../assets/images/musician.png')}
                    style={{ width: 100, height: 100, borderRadius: 100 }}
                    resizeMode="cover"
                  />
                )}
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 16,
                    color: 'white',
                    marginTop: 5,
                    marginBottom: 1,
                  }}
                >
                  {item.albumArtist?.includes('Various Artists')
                    ? item.albumArtist.replace('Various Artists', 'V.A.')
                    : item.albumArtist}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    opacity: 0.5,
                  }}
                >
                  {item.tracks} tracks
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
