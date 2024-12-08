// * React
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

// * React-Native
import {
  View,
  Text,
  SectionList,
  Pressable,
  Image,
  Vibration,
  TextInput,
} from 'react-native';

// * Libraries
import {useBackHandler} from '@react-native-community/hooks';
import {CastButton} from 'react-native-google-cast';
import {FlashList} from '@shopify/flash-list';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import BottomSheet from '@gorhom/bottom-sheet';
import debounce from 'lodash/debounce';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// * Components
import LinearGradientX from '../components/LinearGradientX';
import ListEmptyItem from '../components/ListEmptyItem';
import ListItem from '../components/ListItem';
import StatusBarX from '../components/StatusBarX';
import TrackDetails from '../components/TrackDetails';

// * Store
import {HEIGHT, usePlayerStore, WIDTH} from '../store';

// * Types
import {TrackProps, TracksProps} from '../types';

type SearchProps = {
  tracks: TracksProps;
  albums: [];
  artists: [];
};

export default function Search({navigation}: any) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // ? States
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [searchWord, setSearchWord] = useState('');
  const [data, setData] = useState<SearchProps>();
  const [track, setTrack] = useState<TrackProps>();
  const [showSearch, setShowSearch] = useState(false);

  // ? StoreStates
  const palette = usePlayerStore(state => state.palette);

  // ? Hooks
  const {data: searchHistory} = useQuery({
    queryKey: ['searchHistory'],
    queryFn: ({queryKey}) => axios(queryKey[0]),
    select: ({data}) => data,
  });

  const {mutate: search, isPending} = useMutation({
    mutationFn: () => axios(`search?query=${searchWord}`),
    onSuccess: ({data}) => setData(data),
  });

  useBackHandler(() => {
    showSearch && setShowSearch(false);
    return true;
  });

  // ? Effects
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerStyle: {backgroundColor: palette?.[1] ?? '#000'},
      header: () =>
        showSearch ? (
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 10,
              paddingHorizontal: 15,
              paddingVertical: 5,
            }}>
            <Pressable
              onPress={() => (Vibration.vibrate(50), setShowSearch(false))}
              style={{marginRight: 10, opacity: 0.8}}>
              <Ionicons name="arrow-back" size={22} color="white" />
            </Pressable>
            <TextInput
              autoFocus
              value={searchWord}
              placeholder="Search by title, artists, album"
              onChangeText={text => setSearchWord(text)}
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
                setData(undefined);
              }}
              style={{marginRight: 10, opacity: 0.8}}>
              <Ionicons name="close" size={22} color="white" />
            </Pressable>
          </View>
        ) : (
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 40,
              padding: 17,
            }}>
            <Text style={{fontSize: 22}}>Search</Text>
            <View style={{flex: 1}} />
            <Pressable
              onPress={() => (Vibration.vibrate(50), setShowSearch(true))}
              style={{marginRight: 10, opacity: 0.8}}>
              <Ionicons name="search" size={22} color="white" />
            </Pressable>
            <CastButton style={{height: 24, width: 24, marginRight: 5}} />
          </View>
        ),
    });
  }, [navigation, showSearch, searchWord]);

  useEffect(() => {
    if (searchWord.length >= 3) debouncedSearchCallback();
  }, [searchWord]);

  // ? Callbacks
  const debouncedSearchCallback = useCallback(
    debounce(() => search(), 1500),
    [],
  );

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

      {isPending && <ListEmptyItem />}

      {data ? (
        <SectionList
          sections={[
            {title: 'Albums', data: [1], horizontal: true},
            {title: 'Singles', data: [1]},
          ]}
          renderSectionHeader={({section: {title}}) =>
            data.albums.length > 0 ? (
              <Text
                numberOfLines={1}
                style={{
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: 18,
                  marginTop: 10,
                  marginBottom: 5,
                  marginLeft: 10,
                }}>
                {data.albums.length > 0
                  ? `${title} (${
                      title === 'Albums'
                        ? data.albums.length
                        : data.artists.length
                    })`
                  : `No ${title}`}
              </Text>
            ) : (
              <View />
            )
          }
          renderItem={({section: {horizontal}}) =>
            horizontal ? (
              <>
                {data.albums.length > 0 && (
                  <FlashList
                    data={data.albums}
                    horizontal
                    keyExtractor={(_, index) => index.toString()}
                    estimatedItemSize={10}
                    renderItem={({item}: {item: Omit<TrackProps, ''>}) => (
                      <Pressable
                        onPress={() =>
                          navigation.navigate('Album', {
                            albumArtist: item.albumArtist,
                            album: item.album,
                          })
                        }
                        style={{margin: 10, width: 100}}>
                        <Image
                          source={{uri: item.artwork}}
                          style={{
                            width: 100,
                            height: 100,
                            borderRadius: 10,
                          }}
                          resizeMode="cover"
                        />
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 16,
                            color: 'rgba(255, 255, 255, .8)',
                            marginTop: 5,
                            marginBottom: 1,
                            marginLeft: 3,
                          }}>
                          {item.album}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 13,
                            color: 'rgba(255, 255, 255, .5)',
                            marginBottom: 1,
                            marginLeft: 3,
                          }}>
                          {item.tracks} tracks
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{
                            alignSelf: 'flex-start',
                            borderColor: '#ffffff4D',
                            borderWidth: 1,
                            borderRadius: 5,
                            fontSize: 14,
                            marginTop: 1,
                            paddingHorizontal: 5,
                          }}>
                          {item.size}
                        </Text>
                      </Pressable>
                    )}
                  />
                )}
              </>
            ) : (
              <>
                {data.tracks.length > 0 && (
                  <FlashList
                    data={data.tracks}
                    keyExtractor={(_, index) => index.toString()}
                    estimatedItemSize={10}
                    estimatedListSize={{height: HEIGHT / 2, width: WIDTH}}
                    renderItem={({item}: {item: TrackProps}) => (
                      <ListItem
                        data={data.tracks}
                        item={item}
                        display="bitrate"
                        bottomSheetRef={bottomSheetRef}
                        setTrack={setTrack}
                        setBottomSheetVisible={setBottomSheetVisible}
                      />
                    )}
                  />
                )}
              </>
            )
          }
          style={{marginTop: 60}}
        />
      ) : (
        <SectionList
          sections={[{title: 'Recent Searches', data: [1]}]}
          renderSectionHeader={({section: {title}}) => (
            <Text
              numberOfLines={1}
              style={{
                fontWeight: '800',
                fontSize: 16,
                marginTop: 10,
                marginBottom: 5,
                marginLeft: 18,
              }}>
              {title}
            </Text>
          )}
          renderItem={() => (
            <>
              {searchHistory?.length > 0 && (
                <FlashList
                  data={searchHistory}
                  keyExtractor={(_, index) => index.toString()}
                  estimatedItemSize={10}
                  estimatedListSize={{height: HEIGHT / 2, width: WIDTH}}
                  renderItem={({item}: {item: string}) => (
                    <Pressable
                      onPress={() => setSearchWord(item)}
                      style={{
                        alignItems: 'center',
                        flexDirection: 'row',
                        gap: 15,
                        padding: 20,
                      }}>
                      <MaterialIcons name="history" size={24} />
                      <Text style={{marginTop: -2}}>{item}</Text>
                      <View style={{flex: 1}} />
                      <Feather name="arrow-up-left" size={24} color="#fff7" />
                    </Pressable>
                  )}
                />
              )}
            </>
          )}
          style={{marginTop: 60}}
        />
      )}

      {track && (
        <TrackDetails
          track={track}
          navigation={navigation}
          bottomSheetRef={bottomSheetRef}
          queriesToRefetch={['artist']}
        />
      )}
    </>
  );
}
