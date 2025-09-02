// * React
import React, {useCallback, useState} from 'react';

// * React Native
import {Alert, Image, Pressable, Text, Vibration, View} from 'react-native';

// * Libraries
import {Avatar, Chip, Snackbar} from 'react-native-paper';
import {downloadFile} from '@dr.pogodin/react-native-fs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import axios, {AxiosError} from 'axios';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import StarRating from 'react-native-star-rating-widget';

// * Store
import {API_URL, DOWNLOADS_PATH, usePlayerStore, WIDTH} from '../store';

// * Assets
import imageFiller from '../assets/images/image-filler.png';

// * Types
import {BottomSheetDefaultBackdropProps} from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';
import {RootStackParamList, TrackProps} from '../types';
import {lightTheme} from '../utils';
import {addPlaylistTrack} from '../functions';

type PlaylistProps = RootStackParamList['Playlist'];

export default function TrackDetails({
  trackDetailsRef,
  track,
  queriesToRefetch,
}: {
  trackDetailsRef: any;
  track: TrackProps;
  queriesToRefetch: string[];
}) {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'Artist', ''>
    >();
  const queryClient = useQueryClient();

  const {data: lastPlaylist} = useQuery({
    queryKey: ['playlists'],
    queryFn: () => axios<PlaylistProps>(`${API_URL}lastPlaylist`),
    select: ({data}) => data,
  });

  // ? Mutations
  const {mutate: saveRating} = useMutation({
    mutationFn: (body: {id?: number; rating: number}) =>
      axios.patch('rateTrack', body),
  });

  const [error, setError] = useState<boolean>(false);
  const [lastPlaylistImageError, setLastPlaylistImageError] =
    useState<boolean>(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // ? Mutations
  //const {mutate} = useMutation(() => axios.delete(`deleteTrack`));

  // ? StoreStates
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const trackRating = usePlayerStore(state => state.trackRating);
  const queue = usePlayerStore(state => state.queue);
  //const trackDetailsRef = usePlayerStore(state => state.trackDetailsRef);

  // ? StoreActions
  const addAsNextTrack = usePlayerStore(state => state.addAsNextTrack);
  const addTrackToEndOfQueue = usePlayerStore(
    state => state.addTrackToEndOfQueue,
  );
  const play = usePlayerStore(state => state.play);
  const next = usePlayerStore(state => state.next);
  const setTrackRating = usePlayerStore(state => state.setTrackRating);
  const setQueue = usePlayerStore(state => state.setQueue);
  const closeTrackDetails = usePlayerStore(state => state.closeTrackDetails);

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

  return (
    <>
      <BottomSheet
        ref={trackDetailsRef}
        index={-1}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{backgroundColor: '#fff'}}
        backgroundStyle={{
          backgroundColor: 'rgba(0, 0, 0, .9)',
          borderRadius: 20,
        }}>
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
                  }}>
                  {[
                    {
                      text: 'Play',
                      icon: 'play-arrow',
                      action: () => {
                        closeTrackDetails();
                        play([track], track);
                      },
                    },
                    {
                      text: 'Play Next',
                      icon: 'queue-play-next',
                      action: () => {
                        closeTrackDetails();
                        addAsNextTrack(track, activeTrackIndex + 1);
                      },
                    },
                    {
                      text: 'Play After Next',
                      icon: 'page-next-outline',
                      iconSource: 'material-community-icons',
                      action: () => {
                        closeTrackDetails();
                        addAsNextTrack(track, activeTrackIndex + 2);
                      },
                    },
                    {
                      text: 'Add to queue',
                      icon: 'add-to-queue',
                      action: () => {
                        closeTrackDetails();
                        addTrackToEndOfQueue(track);
                      },
                    },
                    {
                      text: 'Clear queue',
                      icon: 'remove-from-queue',
                      action: () => {
                        closeTrackDetails();
                        addTrackToEndOfQueue(track);
                      },
                    },
                    {
                      text: 'Save queue',
                      icon: 'save',
                      iconSource: 'foundation',
                      action: () => {},
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
                        }}>
                        {item.iconSource === 'material-community-icons' ? (
                          <MaterialCommunityIcons
                            name={item.icon}
                            size={24}
                            color="#fff"
                          />
                        ) : item.iconSource === 'foundation' ? (
                          <FontAwesome
                            name={item.icon}
                            size={24}
                            color="#fff"
                          />
                        ) : (
                          <MaterialIcons
                            name={item.icon}
                            size={24}
                            color="#fff"
                          />
                        )}
                        <Text style={{color: '#fff', fontSize: 16}}>
                          {item.text}
                        </Text>
                      </Pressable>
                    ) : (
                      <View key={key} style={{flexBasis: `30%`, flexGrow: 1}} />
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
                    padding: 20,
                    width: WIDTH,
                  }}>
                  {[
                    {
                      text: `Add to ${lastPlaylist?.name}`,
                      icon: 'render-image',
                      action: () => {
                        closeTrackDetails();
                        addPlaylistTrack(lastPlaylist, track.id);
                        setSnackbarMessage('Track added to playlist!');
                        setSnackbarVisible(true);
                      },
                    },
                    {
                      text: 'Add to playlist',
                      icon: 'playlist-add',
                      action: () => {
                        closeTrackDetails();
                        navigation.navigate('AddToPlaylist', {id: track.id});
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
                          flexBasis: key === 0 ? `65%` : '30%',
                          flexGrow: 1,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                        }}>
                        {item.icon === 'render-image' ? (
                          lastPlaylist && lastPlaylist?.tracks >= 4 ? (
                            <View
                              style={{
                                borderRadius: 5,
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                marginTop: 0.5,
                                width: 30,
                                height: 30,
                                overflow: 'hidden',
                              }}>
                              {lastPlaylist?.artworks.map(
                                (artwork: string, i: number) => (
                                  <Image
                                    key={i}
                                    source={{uri: artwork}}
                                    defaultSource={imageFiller}
                                    style={{width: 15, height: 15}}
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
                                width: 30,
                                height: 30,
                              }}
                            />
                          )
                        ) : (
                          <MaterialIcons
                            name={item.icon}
                            size={30}
                            color="#fff"
                          />
                        )}
                        {/* <Text
                          style={{
                            color: '#fff',
                            fontSize: 16,
                            marginTop: 3,
                            overflow: 'hidden',
                          }}>
                          {item.text}
                        </Text> */}
                      </Pressable>
                    ) : (
                      <View key={key} style={{flexBasis: `30%`, flexGrow: 1}} />
                    ),
                  )}
                </View>
              ),
            },
            {
              icon: 'account-music-outline',
              iconSource: 'material-community-icons',
              text: (
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                  <Text style={{fontSize: 16.5, color: '#fff'}}>
                    Go to artist
                  </Text>
                  <View>
                    <Chip
                      avatar={
                        track && (
                          <Avatar.Image
                            size={24}
                            source={
                              error
                                ? imageFiller
                                : {
                                    uri: `${track?.url
                                      .split('/')
                                      .slice(0, -1)
                                      .join('/')}/artist.jpg`,
                                  }
                            }
                            onError={() => setError(true)}
                          />
                        )
                      }
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: '#fff',
                        borderRadius: 20,
                        borderWidth: 1,
                      }}
                      textStyle={{color: '#fff'}}
                      onPress={() => {
                        closeTrackDetails();
                        Vibration.vibrate(100);
                        navigation.navigate('Artist', {
                          albumArtist: track.albumArtist,
                          artworks: track.artworks,
                          path: track.path,
                          tracks: track.tracks,
                          url: track.url,
                        });
                      }}>
                      {track?.albumArtist}
                    </Chip>
                  </View>
                </View>
              ),
            },
            {
              text: 'View Metadata',
              icon: 'database-refresh-outline',
              iconSource: 'material-community-icons',
              action: (track: TrackProps) => {
                // ? Close the bottom sheet
                closeTrackDetails();

                navigation.navigate('TrackMetadata', track);
                /* {
                   id,
                   path: path.split('/').slice(0, -1),
                 } */
              },
            },
            {
              text: 'Download track',
              icon: 'progress-download',
              iconSource: 'material-community-icons',
              action: (track: TrackProps) => {
                closeTrackDetails();
                downloadFile({
                  fromUrl: track.url,
                  toFile: `${DOWNLOADS_PATH}/${track.path.replaceAll(
                    '/',
                    '_',
                  )}`,
                  background: true,
                })
                  .promise.then(v => console.log(v))
                  .catch(error => console.log(error.message));
              },
            },
            {
              text: 'Delete from library',
              icon: 'delete-variant',
              iconSource: 'material-community-icons',
              action: (track: TrackProps) => {
                // ? Close the bottom sheet
                closeTrackDetails();

                if (track.id === activeTrack.id)
                  Alert.alert(
                    `Currently playing!`,
                    `${track.title} is currently playing hence cannot be deleted.`,
                    [{text: 'OK', onPress: () => {}}],
                  );
                else
                  Alert.alert(
                    'Confirm deletion',
                    `This will delete ${track.title} permanently. `,
                    [
                      {text: 'Cancel', onPress: () => {}, style: 'cancel'},
                      {
                        text: 'OK',
                        onPress: () => {
                          axios
                            .delete(`deleteTrack/${track.id}`)
                            .then(() => {
                              // ? Show the snackbar to indicate that the operation was successful
                              setSnackbarMessage(`${track.title} deleted!`);
                              setSnackbarVisible(!snackbarVisible);
                              // ? Remove the deleted track from the queue and reset the queue
                              setQueue(
                                queue.filter(
                                  _track => _track.id !== track.id && track,
                                ),
                              );
                              // ? Fetch the tracks to update the User Interface listing
                              queryClient.refetchQueries({
                                queryKey: queriesToRefetch,
                              });
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
          ]}
          keyExtractor={(_, i) => i.toString()}
          ListHeaderComponent={
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                marginTop: 20,
                marginBottom: 10,
                marginHorizontal: 20,
              }}>
              {track && (
                <Image
                  source={{uri: track?.artwork}}
                  style={{
                    borderRadius: 10,
                    marginRight: 10,
                    height: 45,
                    width: 45,
                  }}
                />
              )}
              <View style={{justifyContent: 'center', marginLeft: 5}}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                  {track?.title}
                </Text>
                <Text>{track?.albumArtist}</Text>
              </View>
            </View>
          }
          ListFooterComponent={
            <StarRating
              rating={trackRating ?? 0}
              style={{alignSelf: 'center'}}
              onChange={rating => {
                Vibration.vibrate(50);
                setTrackRating(rating);
                saveRating(
                  {id: track?.id, rating},
                  {
                    onSuccess: ({data}) => console.log(data),
                    onError: error => console.log(error),
                  },
                );
              }}
            />
          }
          ListFooterComponentStyle={{marginVertical: 15}}
          renderItem={({
            item,
          }: {
            item: {
              text: string | React.ReactNode;
              icon?: string;
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
                  item.action && item.action(track);
                }}>
                <View
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 10,
                    padding: 15,
                  }}>
                  {item.iconSource === 'material-community-icons' ? (
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={24}
                      color="#fff"
                    />
                  ) : (
                    <MaterialIcons name={item.icon} size={24} color="#fff" />
                  )}
                  <Text style={{color: '#fff', fontSize: 16}}>{item.text}</Text>
                </View>
              </Pressable>
            )
          }
        />
      </BottomSheet>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}>
        {snackbarMessage}
      </Snackbar>
    </>
  );
}
