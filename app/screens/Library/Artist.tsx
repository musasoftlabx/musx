// * React
import React, { useState } from 'react';

// * React Native
import {
  Image,
  ImageBackground,
  Pressable,
  SectionList,
  Vibration,
  View,
} from 'react-native';

// * Libraries
import { FlashList } from '@shopify/flash-list';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBackHandler } from '@react-native-community/hooks';
import { useQuery } from '@tanstack/react-query';
import { Text } from 'react-native-paper';
import axios from 'axios';

// * Components
import { queryClient } from '../../../App';
import HorizontalListItem from '../../components/Skeletons/HorizontalListItem';
import LinearGradientX from '../../components/LinearGradientX';
import ListItem from '../../components/ListItem';
import StatusBarX from '../../components/StatusBarX';
import VerticalListItem from '../../components/Skeletons/VerticalListItem';

// * Assets
import imageFiller from '../../assets/images/image-filler.png';

// * Store
import { API_URL, HEIGHT, usePlayerStore, WIDTH } from '../../store';

// * Types
import { RootStackParamList, TrackProps, TracksProps } from '../../types';

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
    params: { albumArtist, artworks, tracks, url },
  },
}: NativeStackScreenProps<RootStackParamList, 'Artist', ''>) {
  // ? Hooks
  // useBackHandler(() => {
  //   navigation.goBack();
  //   return true;
  // });

  const {
    data: artist,
    isError,
    isFetching,
    isPending,
    isRefetching,
    isSuccess,
  } = useQuery({
    enabled: albumArtist ? true : false,
    queryKey: ['artist', albumArtist],
    queryFn: ({ queryKey }) => axios(`${API_URL}${queryKey[0]}/${queryKey[1]}`),
    select: ({ data }) => data,
  });

  // ? States
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // ? Store Actions
  const play = usePlayerStore(state => state.play);
  const openTrackDetails = usePlayerStore(state => state.openTrackDetails);
  const setTrackDetails = usePlayerStore(state => state.setTrackDetails);
  const setTrackRating = usePlayerStore(state => state.setTrackRating);

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
          }}
        >
          {artworks?.length > 0 ? (
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
              {artworks.map((artwork: string, i: number) => (
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
                uri: `${url.split('/').slice(0, -1).join('/')}/artist.jpg`,
              }}
              defaultSource={require('../../assets/images/musician.png')}
              style={{ width: 100, height: 100, borderRadius: 100 }}
              resizeMode="cover"
            />
          )}

          <Text
            numberOfLines={1}
            style={{
              color: '#fff',
              fontFamily: 'Pacifico',
              fontSize: 30,
              paddingHorizontal: 10,
              textAlign: 'center',
              textShadowColor: '#000',
              textShadowRadius: 10,
            }}
          >
            {albumArtist}
          </Text>
          <Text style={{ fontSize: 15 }}>{tracks} tracks</Text>
        </View>
      </ImageBackground>

      {isFetching && !artist && (
        <SectionList
          sections={[
            { title: 'Albums', data: [1], horizontal: true },
            { title: 'Singles', data: [1] },
          ]}
          renderSectionHeader={({ section: { title } }) => (
            <Text
              numberOfLines={1}
              style={{
                color: '#fff',
                fontWeight: '800',
                fontSize: 18,
                marginTop: 10,
                marginBottom: 5,
                marginLeft: 10,
              }}
            >
              {title}
            </Text>
          )}
          renderItem={({ section: { horizontal } }) =>
            horizontal ? <HorizontalListItem /> : <VerticalListItem />
          }
        />
      )}

      {isError && (
        <View>
          <Text style={{ fontFamily: 'Abel' }}>Empty</Text>
        </View>
      )}

      {isSuccess && (
        <SectionList
          sections={[
            { title: 'Albums', data: [1], horizontal: true },
            { title: 'Singles', data: [1] },
          ]}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            queryClient
              .refetchQueries({ queryKey: ['artist', albumArtist] })
              .then(() => setRefreshing(false));
          }}
          renderSectionHeader={({ section: { title } }) =>
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
                }}
              >
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
          renderItem={({ section: { horizontal } }) =>
            horizontal ? (
              <>
                {artist.albums.length > 0 && (
                  <FlashList
                    data={artist.albums}
                    horizontal
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item }: { item: Omit<TrackProps, ''> }) => (
                      <Pressable
                        onPress={() =>
                          navigation.navigate('Album', {
                            albumArtist,
                            album: item.album,
                          })
                        }
                        style={{ margin: 10, width: 100 }}
                      >
                        <Image
                          source={{ uri: item.artwork }}
                          style={{
                            borderRadius: 10,
                            width: 100,
                            height: 100,
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
                          }}
                        >
                          {item.album}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 13,
                            color: 'rgba(255, 255, 255, .5)',
                            marginBottom: 1,
                            marginLeft: 3,
                          }}
                        >
                          {item.tracks} tracks
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{
                            alignSelf: 'flex-start',
                            borderColor: '#ffffff4D',
                            borderWidth: 1,
                            borderRadius: 5,
                            color: 'rgba(255, 255, 255, .8)',
                            fontSize: 14,
                            marginTop: 1,
                            paddingHorizontal: 5,
                          }}
                        >
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
                    renderItem={({ item }: { item: TrackProps }) => (
                      <ListItem
                        tracks={artist.singles}
                        item={item}
                        display="bitrate"
                      />
                    )}
                  />
                )}
              </>
            )
          }
        />
      )}
    </>
  );
}
