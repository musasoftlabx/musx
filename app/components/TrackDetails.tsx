// * React
import React, { useCallback, useState } from 'react';

// * React Native
import {
  Alert,
  Image,
  Pressable,
  ToastAndroid,
  Vibration,
  View,
} from 'react-native';

// * NPM
import * as Progress from 'react-native-progress';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { Chip, Text } from 'react-native-paper';
import { downloadFile } from '@dr.pogodin/react-native-fs';
import { FlashList } from '@shopify/flash-list';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import StarRating from 'react-native-star-rating-widget';
import TrackPlayer from 'react-native-track-player';

// * Icons
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// * Store
import { API_URL, DOWNLOADS_PATH, usePlayerStore } from '../store';

// * Types
import { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { AddToPlaylistProps, RootStackParamList, TrackProps } from '../types';

// * Utils
import { fontFamilyBold, lightTheme } from '../utils';

// * Functions
import { handleAxiosError, refreshScreens } from '../functions';

// * Constants
import { queryClient } from '../../App';

export default function TrackDetails({
  trackDetailsRef,
}: {
  trackDetailsRef: React.Ref<BottomSheetMethods>;
}) {
  // ? Hooks
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'Artist', ''>
    >();

  // ? Mutations
  const { mutate: saveRating } = useMutation({
    mutationFn: (body: { id?: number; rating: number }) =>
      axios.patch('rateTrack', body),
  });

  const { mutate: deleteTrack } = useMutation({
    mutationFn: (body: unknown) =>
      axios.delete(`deleteTrack/${trackDetails?.id}`),
  });

  // ? States
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSize, setDownloadSize] = useState(0);

  // ? Store States
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const activePlaylist = usePlayerStore(state => state.activePlaylist);
  const queue = usePlayerStore(state => state.queue);
  const trackRating = usePlayerStore(state => state.trackRating);
  const trackDetails = usePlayerStore(state => state.trackDetails);

  // ? Store Actions
  const addAsNextTrack = usePlayerStore(state => state.addAsNextTrack);
  const addTrackToEndOfQueue = usePlayerStore(
    state => state.addTrackToEndOfQueue,
  );
  const closeTrackDetails = usePlayerStore(state => state.closeTrackDetails);
  const next = usePlayerStore(state => state.next);
  const play = usePlayerStore(state => state.play);
  const setTrackRating = usePlayerStore(state => state.setTrackRating);
  const setQueue = usePlayerStore(state => state.setQueue);

  // ? Mutations
  const { mutate: addPlaylistTrack } = useMutation({
    mutationFn: (body: AddToPlaylistProps) =>
      axios.post(`${API_URL}addPlaylistTrack`, body),
  });

  // ? Callbacks
  const RenderBackdrop = useCallback(
    (
      props: React.JSX.IntrinsicAttributes & BottomSheetDefaultBackdropProps,
    ) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.5}
        enableTouchThrough
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        style={{
          backgroundColor: lightTheme.colors.primary,
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      />
    ),
    [],
  );

  const RenderedBottomSheet = useCallback(
    () => (
      <BottomSheetFlatList
        data={[
          {
            grid: true,
            text: (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 10,
                  paddingVertical: 20,
                }}
              >
                {[
                  {
                    text: 'Play',
                    icon: 'play-arrow',
                    action: () => {
                      closeTrackDetails();
                      play([trackDetails], trackDetails!);
                    },
                  },
                  {
                    text: 'Play Next',
                    icon: 'queue-play-next',
                    action: () => {
                      closeTrackDetails();
                      addAsNextTrack(trackDetails!, activeTrackIndex + 1);
                    },
                  },
                  {
                    text: 'Play After Next',
                    icon: 'page-next-outline',
                    iconSource: 'material-community-icons',
                    action: () => {
                      closeTrackDetails();
                      addAsNextTrack(trackDetails!, activeTrackIndex + 2);
                    },
                  },
                  {
                    text: 'Add to queue',
                    icon: 'add-to-queue',
                    action: () => {
                      closeTrackDetails();
                      addTrackToEndOfQueue(trackDetails!);
                    },
                  },
                  {
                    text: 'Add to playlist',
                    icon: 'playlist-add',
                    action: () => {
                      closeTrackDetails();
                      navigation.navigate('AddToPlaylist', {
                        id: trackDetails?.id,
                        name: 'Add to playlist',
                      });
                    },
                  },
                ].map((item, key) =>
                  item ? (
                    <Pressable
                      onPress={item.action}
                      key={key}
                      style={{
                        alignItems: 'center',
                        backgroundColor: '#fff5',
                        borderColor: '#fff8',
                        borderWidth: 1,
                        borderRadius: 10,
                        flexBasis: `30%`,
                        flexGrow: 1,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                      }}
                    >
                      {item.iconSource === 'material-community-icons' ? (
                        <MaterialCommunityIcons
                          color="#fff"
                          name={item.icon}
                          size={24}
                        />
                      ) : item.iconSource === 'foundation' ? (
                        <FontAwesome color="#fff" name={item.icon} size={24} />
                      ) : (
                        <MaterialIcons
                          color="#fff"
                          name={item.icon}
                          size={24}
                        />
                      )}
                      <Text style={{ color: '#fff', fontSize: 14 }}>
                        {item.text}
                      </Text>
                    </Pressable>
                  ) : (
                    <View key={key} style={{ flexBasis: `30%`, flexGrow: 1 }} />
                  ),
                )}
              </View>
            ),
          },
          {
            grid: true,
            text: [
              {
                text: `Add to ${trackDetails?.lastModifiedPlaylist?.name}`,
                icon: 'render-image',
                action: () => {
                  Vibration.vibrate(100);
                  closeTrackDetails();
                  addPlaylistTrack(
                    {
                      playlistId: trackDetails?.lastModifiedPlaylist
                        ?.id as number,
                      trackId: trackDetails?.id as number,
                    },
                    {
                      onSuccess: () => {
                        ToastAndroid.showWithGravity(
                          'Track added!',
                          ToastAndroid.SHORT,
                          ToastAndroid.CENTER,
                        );
                        queryClient.refetchQueries({
                          queryKey: ['dashboard'],
                        });
                        queryClient.refetchQueries({
                          queryKey: ['playlists'],
                        });
                      },
                      onError: handleAxiosError,
                    },
                  );
                },
              },
            ].map((item, key) =>
              item ? (
                <Pressable
                  key={key}
                  onPress={item.action}
                  style={{
                    alignItems: 'center',
                    backgroundColor: 'rgba(241, 185, 242, 0.33)',
                    borderColor: '#fff5',
                    borderWidth: 1,
                    borderRadius: 10,
                    flexDirection: 'row',
                    gap: 15,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}
                >
                  {item.icon === 'render-image' ? (
                    trackDetails?.lastModifiedPlaylist &&
                    trackDetails?.lastModifiedPlaylist?.tracks >= 4 ? (
                      <View
                        style={{
                          borderRadius: 5,
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          marginVertical: 0.5,
                          width: 40,
                          height: 40,
                          overflow: 'hidden',
                        }}
                      >
                        {trackDetails?.lastModifiedPlaylist?.artworks.length >=
                        4 ? (
                          <>
                            {trackDetails?.lastModifiedPlaylist.artworks.map(
                              (artwork: string, i: number) =>
                                i <= 4 && (
                                  <Image
                                    key={i}
                                    source={{ uri: artwork }}
                                    style={{ width: 20, height: 20 }}
                                    resizeMode="cover"
                                  />
                                ),
                            )}
                          </>
                        ) : (
                          <Image
                            source={{
                              uri: trackDetails?.lastModifiedPlaylist
                                .artworks?.[0],
                            }}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                            }}
                          />
                        )}
                      </View>
                    ) : (
                      <Image
                        source={{
                          uri: trackDetails?.lastModifiedPlaylist
                            ?.artworks?.[0],
                        }}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                        }}
                      />
                    )
                  ) : (
                    <MaterialIcons color="#fff" name={item.icon} size={30} />
                  )}

                  <View style={{ width: '83%' }}>
                    <Text style={{ color: '#fff', fontSize: 14, marginTop: 3 }}>
                      Last playlist
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: '#fff',
                        fontFamily: fontFamilyBold,
                        fontSize: 16,
                        marginTop: -2,
                      }}
                    >
                      {item?.text}
                    </Text>
                  </View>
                </Pressable>
              ) : (
                <View key={key} />
              ),
            ),
          },
          {
            text: (
              <>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 16.5,
                    textDecorationLine: 'underline',
                  }}
                >
                  Go to artist
                </Text>

                <View>
                  <FlashList
                    data={trackDetails?.artists.split('/')}
                    keyExtractor={(_, index) => index.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item: artist }) => (
                      <Chip
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: '#fff',
                          borderRadius: 5,
                          borderWidth: 1,
                          margin: 10,
                        }}
                        textStyle={{ color: '#fff' }}
                        onPress={() => {
                          Vibration.vibrate(100);
                          closeTrackDetails();
                          navigation.navigate('Artist', {
                            albumArtist: trackDetails?.albumArtist!,
                            artworks: trackDetails?.artworks,
                            path: trackDetails?.path!,
                            tracks: trackDetails?.tracks,
                            url: trackDetails?.url!,
                          });
                        }}
                      >
                        {artist?.trim()}
                      </Chip>
                    )}
                  />
                </View>
              </>
            ),
          },
          {
            grid: true,
            text: (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                {[
                  {
                    text: 'Download',
                    icon: 'progress-download',
                    action: handleDownloadTrack,
                  },
                  {
                    text: 'Metadata',
                    icon: 'database-refresh-outline',
                    iconSource: 'material-community-icons',
                    action: () =>
                      navigation.navigate('TrackMetadata', trackDetails),
                  },
                  {
                    text: 'Remove',
                    icon: 'delete-variant',
                    iconSource: 'material-community-icons',
                    action: handleDeleteTrack,
                  },
                ].map((item, key) =>
                  item ? (
                    <Pressable
                      key={key}
                      onPress={item.action}
                      style={{
                        alignItems: 'center',
                        backgroundColor: '#fff1',
                        borderColor: '#fff4',
                        borderWidth: 1,
                        borderRadius: 10,
                        flex: 1,
                        gap: 3,
                        paddingVertical: 5,
                      }}
                    >
                      {item.text === 'Download' && isDownloading ? (
                        <Progress.Circle
                          color="#fff"
                          formatText={() =>
                            `${(
                              (downloadProgress / downloadSize) *
                              100
                            ).toFixed(0)}%`
                          }
                          progress={
                            downloadProgress / downloadSize || downloadSize
                          }
                          showsText
                          size={30}
                          textStyle={{ fontSize: 10 }}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          color="#fff"
                          name={item.icon}
                          size={30}
                        />
                      )}
                      <Text
                        numberOfLines={1}
                        style={{ color: '#fff', overflow: 'hidden' }}
                      >
                        {item.text === 'Download' && isDownloading
                          ? 'Downloading...'
                          : item?.text}
                      </Text>
                    </Pressable>
                  ) : (
                    <View key={key} />
                  ),
                )}
              </View>
            ),
          },
        ]}
        keyExtractor={(_: number, i: number) => i.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 5 }}
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', gap: 15 }}>
            <Image
              source={{ uri: trackDetails?.artwork }}
              style={{ borderRadius: 10, height: 45, width: 45 }}
            />

            <View style={{ justifyContent: 'center', width: '85%' }}>
              <Text
                numberOfLines={1}
                style={{ fontFamily: fontFamilyBold, fontSize: 18 }}
              >
                {trackDetails?.title}
              </Text>
              <Text numberOfLines={1}>{trackDetails?.artists}</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <StarRating
            rating={trackRating ?? 0}
            style={{ alignSelf: 'center' }}
            onChange={rating => {
              Vibration.vibrate(100);
              setTrackRating(rating);
              TrackPlayer.updateMetadataForTrack(activeTrackIndex!, {
                ...activeTrack,
                rating,
              });
              saveRating(
                { id: trackDetails?.id, rating },
                {
                  onSuccess: () => refreshScreens(activeTrack, activePlaylist), // ? Refresh screens to apply changes of rated track
                  onError: handleAxiosError,
                },
              );
            }}
          />
        }
        ListFooterComponentStyle={{ marginTop: 30, marginBottom: 40 }}
        renderItem={({
          item,
        }: {
          item: {
            text: string | React.ReactNode;
            icon: string;
            iconSource?: string;
            grid?: boolean;
            action?: (track: TrackProps) => void;
          };
        }) =>
          item.grid ? (
            item.text
          ) : (
            <Pressable
              onPress={() => {
                item.action && item.action(trackDetails!);
              }}
            >
              {item.iconSource === 'material-community-icons' ? (
                <MaterialCommunityIcons
                  color="#fff"
                  name={item.icon}
                  size={24}
                />
              ) : (
                <MaterialIcons color="#fff" name={item.icon} size={24} />
              )}
              {item.text}
            </Pressable>
          )
        }
      />
    ),
    [trackDetails, trackRating, downloadProgress],
  );

  // ? Functions
  const handleDeleteTrack = () => {
    closeTrackDetails();
    Alert.alert(
      'Confirm deletion',
      `This will delete ${trackDetails?.title} permanently. `,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            activeTrack?.id === trackDetails?.id && next(); // ? Skip to next track to avoid buffering errors

            deleteTrack(
              {},
              {
                onSuccess: () => {
                  // ? Show the snackbar to indicate that the operation was successful
                  ToastAndroid.showWithGravity(
                    `${trackDetails?.title} deleted!`,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                  );
                  // ? Remove the deleted track from the queue and reset the queue
                  setQueue(
                    queue.filter(
                      _track => _track.id !== trackDetails?.id && trackDetails,
                    ),
                  );
                  // ? Refresh screens to remove occurences of deleted track
                  refreshScreens(activeTrack);
                },
                onError: handleAxiosError,
              },
            );
          },
        },
      ],
    );
  };

  const handleDownloadTrack = () =>
    downloadFile({
      fromUrl: trackDetails?.url!,
      toFile: `${DOWNLOADS_PATH}/${trackDetails?.path.replaceAll('/', '_')}`,
      background: true,
      progress({ bytesWritten, contentLength }) {
        setIsDownloading(true);
        setDownloadProgress(bytesWritten);
        setDownloadSize(contentLength);
      },
    })
      .promise.then(() => {
        setIsDownloading(false);
        ToastAndroid.showWithGravity(
          `${trackDetails?.title} downloaded!`,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      })
      .catch(() => {
        setIsDownloading(false);
        ToastAndroid.showWithGravity(
          'Download failed. An error occurrred',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      });

  return (
    <BottomSheet
      ref={trackDetailsRef}
      index={-1}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={RenderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#fff' }}
      backgroundStyle={{
        backgroundColor: 'rgba(0, 0, 0, .85)',
        borderRadius: 20,
      }}
    >
      <RenderedBottomSheet />
    </BottomSheet>
  );
}
