// * React
import React, {useState, useRef} from 'react';

// * React Native
import {
  Image,
  ImageBackground,
  View,
  Pressable,
  Text,
  SectionList,
  ActivityIndicator,
} from 'react-native';

// * Libraries
import {FlashList} from '@shopify/flash-list';
import {useBackHandler} from '@react-native-community/hooks';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import BottomSheet from '@gorhom/bottom-sheet';

// * Components
import LinearGradientX from '../../components/LinearGradientX';
import ListItem from '../../components/ListItem';
import StatusBarX from '../../components/StatusBarX';
import TrackDetails from '../../components/TrackDetails';

// * Assets
import imageFiller from '../../assets/images/image-filler.png';

// * Store
import {API_URL, ARTWORK_URL, AUDIO_URL, HEIGHT, WIDTH} from '../../store';

// * Types
import {TrackProps, TracksProps} from '../../types';

export type ArtistProps = {
  albums: {
    album: string;
    artwork: string;
    tracks: number;
    size: string;
  }[];
  singles: TracksProps;
};

export default function Artist({
  navigation,
  route: {
    params: {albumArtist, path, tracks},
  },
}: any) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // ? Hooks
  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  const {
    data: artist,
    isError,
    isFetching,
    isSuccess,
  } = useQuery({
    enabled: albumArtist ? true : false,
    queryKey: ['artist', albumArtist],
    queryFn: ({queryKey}) => axios(`${API_URL}${queryKey[0]}/${queryKey[1]}`),
    select: ({data}) => data,
  });

  // ? States
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [track, setTrack] = useState<TrackProps>();

  return (
    <>
      <StatusBarX />

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
            paddingTop: 50,
            paddingBottom: 10,
            justifyContent: 'center',
          }}>
          <Image
            source={{
              uri: `${AUDIO_URL}${path
                .split('/')
                .slice(0, -1)
                .join('/')}/artist.jpg`,
            }}
            defaultSource={require('../../assets/images/musician.png')}
            style={{borderRadius: 100, height: 100, width: 100}}
            resizeMode="cover"
          />

          <Text style={{fontSize: 30}}>{albumArtist}</Text>
          <Text style={{fontSize: 15}}>{tracks} tracks</Text>
        </View>
      </ImageBackground>

      {isFetching && (
        <ActivityIndicator
          size="large"
          color="#fff"
          style={{marginTop: '50%'}}
        />
      )}

      {isError && (
        <View>
          <Text style={{fontFamily: 'Abel'}}>Empty</Text>
        </View>
      )}

      {isSuccess && (
        <SectionList
          sections={[
            {title: 'Albums', data: [1], horizontal: true},
            {title: 'Singles', data: [1]},
          ]}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 1000);
          }}
          renderSectionHeader={({section: {title}}) =>
            artist.albums.length > 0 ? (
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
                {artist.albums.length > 0
                  ? `${title} (${
                      title === 'Albums'
                        ? artist.albums.length
                        : artist.singles.length
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
                {artist.albums.length > 0 && (
                  <FlashList
                    data={artist.albums}
                    horizontal
                    keyExtractor={(_, index) => index.toString()}
                    estimatedItemSize={10}
                    renderItem={({item}: {item: Omit<TrackProps, ''>}) => (
                      <Pressable
                        onPress={() =>
                          navigation.navigate('Album', {
                            albumArtist,
                            album: item.album,
                          })
                        }
                        style={{margin: 10, width: 100}}>
                        <Image
                          source={{uri: `${ARTWORK_URL}${item.artwork}`}}
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
                {artist.singles.length > 0 && (
                  <FlashList
                    data={artist.singles}
                    keyExtractor={(_, index) => index.toString()}
                    estimatedItemSize={10}
                    estimatedListSize={{height: HEIGHT / 2, width: WIDTH}}
                    renderItem={({item}: {item: TrackProps}) => (
                      <ListItem
                        data={artist.singles}
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
