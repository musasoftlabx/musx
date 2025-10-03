// * React
import React, { useCallback, useState } from 'react';

// * React Native
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  Vibration,
  View,
} from 'react-native';

// * Libraries
import * as Progress from 'react-native-progress';
import { Chip, Snackbar, Text } from 'react-native-paper';
import { downloadFile } from '@dr.pogodin/react-native-fs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import axios, { AxiosError } from 'axios';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import StarRating from 'react-native-star-rating-widget';
import TrackPlayer from 'react-native-track-player';

// * Store
import { API_URL, DOWNLOADS_PATH, usePlayerStore, WIDTH } from '../store';

// * Assets
import imageFiller from '../assets/images/image-filler.png';

// * Types
import { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { RootStackParamList, TrackProps } from '../types';

// * Utils
import { lightTheme } from '../utils';

// * Functions
import { addPlaylistTrack, refreshScreens } from '../functions';

type PlaylistProps = RootStackParamList['Playlist'];

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

  // ? Queries
  const { data: lastPlaylist } = useQuery({
    queryKey: ['lastPlaylist'],
    queryFn: () => axios<PlaylistProps>(`${API_URL}lastPlaylist`),
    select: ({ data }) => data,
  });

  // ? Mutations
  const { mutate: saveRating } = useMutation({
    mutationFn: (body: { id?: number; rating: number }) =>
      axios.patch('rateTrack', body),
  });
  //const {mutate: deleteTrack} = useMutation(() => axios.delete(`deleteTrack`));

  // ? States
  const [_, setLastPlaylistImageError] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSize, setDownloadSize] = useState(0);

  // ? Store States
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const queue = usePlayerStore(state => state.queue);
  const activePlaylist = usePlayerStore(state => state.activePlaylist);
  const trackRating = usePlayerStore(state => state.trackRating);
  const trackDetails = usePlayerStore(state => state.trackDetails);

  // ? Store Actions
  const addAsNextTrack = usePlayerStore(state => state.addAsNextTrack);
  const addTrackToEndOfQueue = usePlayerStore(
    state => state.addTrackToEndOfQueue,
  );
  const play = usePlayerStore(state => state.play);
  const next = usePlayerStore(state => state.next);
  const setTrackRating = usePlayerStore(state => state.setTrackRating);
  const setQueue = usePlayerStore(state => state.setQueue);
  const closeTrackDetails = usePlayerStore(state => state.closeTrackDetails);

  // ? Callbacks
  const renderBackdrop = useCallback(
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
                  justifyContent: 'flex-end',
                  padding: 20,
                  width: WIDTH,
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
            text: (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 10,
                  justifyContent: 'flex-end',
                  paddingHorizontal: 20,
                  width: WIDTH,
                }}
              >
                {[
                  {
                    text: `Add to ${lastPlaylist?.name}`,
                    icon: 'render-image',
                    action: () => {
                      closeTrackDetails();
                      addPlaylistTrack(lastPlaylist, trackDetails?.id!);
                      setSnackbarMessage('Track added to playlist!');
                      setSnackbarVisible(true);
                    },
                  },
                ].map((item, key) =>
                  item ? (
                    <Pressable
                      onPress={item.action}
                      key={key}
                      style={{
                        alignItems: 'center',
                        backgroundColor: 'rgba(241, 185, 242, 0.33)',
                        borderColor: '#fff8',
                        borderWidth: 1,
                        borderRadius: 10,
                        flexBasis: key === 0 ? `65%` : '30%',
                        flexGrow: 1,
                        flexDirection: 'row',
                        gap: 15,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                      }}
                    >
                      {item.icon === 'render-image' ? (
                        lastPlaylist && lastPlaylist?.tracks >= 4 ? (
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
                            {lastPlaylist?.artworks.map(
                              (artwork: string, i: number) =>
                                i <= 4 && (
                                  <Image
                                    key={i}
                                    source={{ uri: artwork }}
                                    defaultSource={imageFiller}
                                    style={{ width: 20, height: 20 }}
                                    resizeMode="cover"
                                    onError={() =>
                                      console.log(
                                        'track details playlist image could not load',
                                      )
                                    }
                                  />
                                ),
                            )}
                          </View>
                        ) : (
                          <Image
                            source={
                              imageFiller
                              // lastPlaylistImageError
                              //   ? imageFiller
                              //   : {uri: lastPlaylist?.artworks[0]}
                            }
                            defaultSource={imageFiller}
                            onError={() => setLastPlaylistImageError(true)}
                            style={{
                              borderRadius: 10,
                              height: 30,
                              width: 30,
                            }}
                          />
                        )
                      ) : (
                        <MaterialIcons
                          color="#fff"
                          name={item.icon}
                          size={30}
                        />
                      )}
                      <View>
                        <Text
                          style={{ color: '#fff', fontSize: 14, marginTop: 3 }}
                        >
                          Last playlist
                        </Text>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 16,
                            fontWeight: '600',
                            marginTop: -2,
                            overflow: 'hidden',
                          }}
                        >
                          {item?.text}
                        </Text>
                      </View>
                    </Pressable>
                  ) : (
                    <View key={key} style={{ flexBasis: `30%`, flexGrow: 1 }} />
                  ),
                )}
              </View>
            ),
          },
          {
            text: (
              <View style={{ gap: 5 }}>
                <Text
                  style={{
                    color: '#ffffff0',
                    fontSize: 16.5,
                    textDecorationLine: 'underline',
                  }}
                >
                  Go to artist
                </Text>

                <FlatList
                  data={trackDetails?.artists.split('/')}
                  horizontal
                  scrollEnabled
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item: artist }) => (
                    <Chip
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: '#fff',
                        borderRadius: 5,
                        borderWidth: 1,
                        height: 33,
                        margin: 5,
                      }}
                      textStyle={{ color: '#fff' }}
                      onPress={() => {
                        closeTrackDetails();
                        Vibration.vibrate(100);
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
                  keyExtractor={(_, index) => index.toString()}
                  style={{ height: 55, width: WIDTH }}
                />
              </View>
            ),
          },
          {
            grid: true,
            text: (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 10,
                  justifyContent: 'flex-end',
                  paddingHorizontal: 20,
                  width: WIDTH,
                }}
              >
                {[
                  {
                    text: 'Download track',
                    icon: 'progress-download',
                    action: () => {
                      downloadFile({
                        fromUrl: trackDetails?.url!,
                        toFile: `${DOWNLOADS_PATH}/${trackDetails?.path.replaceAll(
                          '/',
                          '_',
                        )}`,
                        background: true,
                        progress({ bytesWritten, contentLength }) {
                          setIsDownloading(true);
                          setDownloadProgress(bytesWritten);
                          setDownloadSize(contentLength);
                        },
                      })
                        .promise.then(() => {
                          setIsDownloading(false);
                          setSnackbarMessage(
                            `${trackDetails?.title} downloaded!`,
                          );
                          setSnackbarVisible(!snackbarVisible);
                        })
                        .catch(error => {
                          setIsDownloading(false);
                          setSnackbarMessage(
                            'Download failed. An error occurrred',
                          );
                          setSnackbarVisible(!snackbarVisible);
                        });
                    },
                  },
                  {
                    text: 'View Metadata',
                    icon: 'database-refresh-outline',
                    iconSource: 'material-community-icons',
                    action: () =>
                      navigation.navigate('TrackMetadata', trackDetails),
                  },
                  {
                    text: 'Delete from library',
                    icon: 'delete-variant',
                    iconSource: 'material-community-icons',
                    action: () => {
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
                              TrackPlayer.skipToNext();
                              axios
                                .delete(`deleteTrack/${trackDetails?.id}`)
                                .then(() => {
                                  // ? Show the snackbar to indicate that the operation was successful
                                  setSnackbarMessage(
                                    `${trackDetails?.title} deleted!`,
                                  );
                                  setSnackbarVisible(!snackbarVisible);
                                  // ? Remove the deleted track from the queue and reset the queue
                                  setQueue(
                                    queue.filter(
                                      _track =>
                                        _track.id !== trackDetails?.id &&
                                        trackDetails,
                                    ),
                                  );
                                  // ? Refresh screens to remove occurences of deleted track
                                  refreshScreens(activeTrack);
                                })
                                .catch((err: AxiosError) => {
                                  setSnackbarMessage(err.message);
                                  setSnackbarVisible(true);
                                });
                            },
                          },
                        ],
                      );
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
                        flexGrow: 1,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                      }}
                    >
                      {item.text === 'Download track' && isDownloading ? (
                        <Progress.Circle
                          color="#fff"
                          showsText
                          textStyle={{ fontSize: 10 }}
                          formatText={_ =>
                            `${(
                              (downloadProgress / downloadSize) *
                              100
                            ).toFixed(0)}%`
                          }
                          progress={
                            downloadProgress / downloadSize || downloadSize
                          }
                          size={30}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          color="#fff"
                          name={item.icon}
                          size={30}
                        />
                      )}
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 14,
                          marginTop: 3,
                          overflow: 'hidden',
                        }}
                      >
                        {item?.text}
                      </Text>
                    </Pressable>
                  ) : (
                    <View key={key} style={{ flexBasis: `30%`, flexGrow: 1 }} />
                  ),
                )}
              </View>
            ),
          },
        ]}
        keyExtractor={(_: number, i: number) => i.toString()}
        ListHeaderComponent={
          <View
            style={{
              flexDirection: 'row',
              marginTop: 5,
              marginHorizontal: 20,
            }}
          >
            {trackDetails && (
              <Image
                source={{ uri: trackDetails?.artwork }}
                style={{
                  borderRadius: 10,
                  marginRight: 10,
                  height: 45,
                  width: 45,
                }}
              />
            )}
            <View style={{ justifyContent: 'center', marginLeft: 5 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                {trackDetails?.title}
              </Text>
              <Text>{trackDetails?.artists}</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <StarRating
            rating={trackRating ?? 0}
            style={{ alignSelf: 'center' }}
            onChange={rating => {
              Vibration.vibrate(50);
              setTrackRating(rating);
              TrackPlayer.updateMetadataForTrack(activeTrackIndex!, {
                ...activeTrack,
                rating,
              });
              saveRating(
                { id: trackDetails?.id, rating },
                {
                  onSuccess: () => refreshScreens(activeTrack, activePlaylist), // ? Refresh screens to apply changes of rated track
                  onError: error => console.log(error),
                },
              );
            }}
          />
        }
        ListFooterComponentStyle={{ marginTop: 30, marginBottom: 70 }}
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
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  gap: 10,
                  padding: 15,
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
                <Text style={{ color: '#fff', fontSize: 16 }}>{item.text}</Text>
              </View>
            </Pressable>
          )
        }
      />
    ),
    [trackDetails, trackRating, downloadProgress],
  );

  return (
    <>
      <BottomSheet
        ref={trackDetailsRef}
        index={-1}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#fff' }}
        backgroundStyle={{
          backgroundColor: 'rgba(0, 0, 0, .85)',
          borderRadius: 20,
        }}
      >
        <RenderedBottomSheet />
      </BottomSheet>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
      >
        {snackbarMessage}
      </Snackbar>
    </>
  );
}
