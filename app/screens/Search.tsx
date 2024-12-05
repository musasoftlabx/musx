import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Button, View, Text, SectionList, Pressable, Image} from 'react-native';
import StatusBarX from '../components/StatusBarX';
import LinearGradientX from '../components/LinearGradientX';
import debounce from 'lodash/debounce';
import axios from 'axios';
import {useMutation} from '@tanstack/react-query';
import {FlashList} from '@shopify/flash-list';
import {TrackProps, TracksProps} from '../types';
import ListItem from '../components/ListItem';
import {HEIGHT, WIDTH} from '../store';
import BottomSheet from '@gorhom/bottom-sheet';
import TrackDetails from '../components/TrackDetails';

const Search = ({navigation}: any) => {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // ? States
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [searchWord, setSearchWord] = useState('');
  const [data, setData] = useState<{
    tracks: TracksProps;
    albums: [];
    artists: [];
  }>();
  const [track, setTrack] = useState<TrackProps>();

  const {mutate: search} = useMutation({
    mutationFn: () => axios(`search/${searchWord}`),
    onSuccess: ({data}) => setData(data),
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerSearchBarOptions: {
        autoFocus: true,
        placeholder: 'Search by title, artists, album',
        shouldShowHintSearchIcon: true,
        onChangeText: (text: {nativeEvent: {text: string}}) =>
          setSearchWord(text.nativeEvent.text),
      },
    });
  }, [navigation]);

  useEffect(() => {
    if (searchWord.length >= 3) {
      //debounce(search, 1500);
      search();
    }
  }, [searchWord]);

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

      {data && (
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
};

export default Search;
