import React, {useState, useLayoutEffect, useRef} from 'react';

import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Text,
  View,
} from 'react-native';

import {FlashList} from '@shopify/flash-list';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import BottomSheet from '@gorhom/bottom-sheet';

import LinearGradientX from '../../components/LinearGradientX';
import ListItem from '../../components/ListItem';
import TrackDetails from '../../components/TrackDetails';

import {API_URL, HEIGHT, usePlayerStore, WIDTH} from '../../store';

// * Assets
import imageFiller from '../../assets/images/image-filler.png';

import {TrackProps} from '../../types';

export default function Playlist({
  navigation,
  route: {
    params: {id, name, duration, tracks, artwork, artworks, size},
  },
}: any) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // ? States
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [track, setTrack] = useState<TrackProps>();

  const palette = usePlayerStore(state => state.palette);

  const {
    data: playlistTracks,
    isSuccess,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ['playlist', id],
    queryFn: ({queryKey}) => axios(`${API_URL}${queryKey[0]}/${queryKey[1]}`),
    select: ({data}) => data,
  });

  // ? Effects
  useLayoutEffect(() => {
    navigation.setOptions({
      title: name,
      headerStyle: {backgroundColor: palette?.[1] ?? '#000'},
    });
  }, [navigation]);

  return (
    <>
      <LinearGradientX />

      <ImageBackground source={imageFiller} resizeMode="cover" blurRadius={20}>
        <View
          style={{
            backgroundColor: 'black',
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            opacity: 0,
            zIndex: 2,
          }}
        />
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: 10,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}>
          {!artwork ? (
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
              {artworks.map((artwork: string, i: number) => (
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
              source={{uri: artwork}}
              defaultSource={require('../../assets/images/musician.png')}
              style={{width: 100, height: 100, borderRadius: 100}}
              resizeMode="cover"
            />
          )}

          <View style={{gap: 5}}>
            <Text style={{fontSize: 24, fontWeight: '800'}}>
              {tracks} tracks
            </Text>
            <Text style={{fontSize: 20, opacity: 0.5}}>{duration} mins</Text>
            <Text
              numberOfLines={1}
              style={{
                alignSelf: 'flex-start',
                borderColor: '#ffffff4D',
                borderWidth: 1,
                borderRadius: 5,
                fontSize: 18,
                marginTop: 1,
                paddingLeft: 5,
                paddingRight: 3,
              }}>
              {size}
            </Text>
          </View>
        </View>
      </ImageBackground>

      {isFetching && (
        <ActivityIndicator
          size="large"
          color="#fff"
          style={{marginTop: '50%'}}
        />
      )}

      {isSuccess && (
        <FlashList
          data={playlistTracks}
          keyExtractor={(_, index) => index.toString()}
          estimatedItemSize={10}
          estimatedListSize={{height: HEIGHT, width: WIDTH}}
          renderItem={({item}: {item: TrackProps}) => (
            <ListItem
              data={playlistTracks}
              item={item}
              display="bitrate"
              bottomSheetRef={bottomSheetRef}
              setTrack={setTrack}
              setBottomSheetVisible={setBottomSheetVisible}
            />
          )}
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
