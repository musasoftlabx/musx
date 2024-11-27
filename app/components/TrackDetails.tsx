// * React
import React, {useState} from 'react';

// * React Native
import {View, Image, Pressable, Vibration, Alert} from 'react-native';

// * Libraries
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {Snackbar, Text} from 'react-native-paper';
import axios, {AxiosError} from 'axios';
import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TrackPlayer, {State} from 'react-native-track-player';

// * Store
import {ARTWORK_URL, usePlayerStore} from '../store';

// * Assets
import {TrackProps} from '../types';

export default function TrackDetails({
  track,
  navigation,
  bottomSheetRef,
  queriesToRefetch,
  fetchTracks,
}: {
  track: TrackProps;
  navigation: any;
  bottomSheetRef?: any;
  queriesToRefetch: string[];
  fetchTracks?: () => void;
}) {
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const queryClient = useQueryClient();

  // ? Mutations
  //const {mutate} = useMutation(() => axios.delete(`deleteTrack`));

  // ? StoreStates
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const queue = usePlayerStore(state => state.queue);

  // ? StoreActions
  const play = usePlayerStore(state => state.play);
  const next = usePlayerStore(state => state.next);
  const setQueue = usePlayerStore(state => state.setQueue);

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['68%']}
        enableDynamicSizing={false}
        enablePanDownToClose
        handleIndicatorStyle={{backgroundColor: '#fff'}}
        backgroundStyle={{
          backgroundColor: 'rgba(0, 0, 0, .85)',
          borderRadius: 20,
        }}>
        <BottomSheetFlatList
          data={[
            {
              text: 'Play',
              icon: 'play-arrow',
              action: () => {
                play([track], track);
              },
            },
            {
              text: 'Play Next',
              icon: 'queue-play-next',
              action: async () => {
                await TrackPlayer.add(track, activeTrackIndex + 1);
                const queue = await TrackPlayer.getQueue();
                setQueue(queue);
              },
            },
            {
              text: 'Add to queue',
              icon: 'add-to-queue',
              action: () => async () => {
                await TrackPlayer.add(track);
                const queue = await TrackPlayer.getQueue();
                setQueue(queue);
              },
            },
            {
              text: 'Add to playlist',
              icon: 'playlist-add',
              action: ({id}: {id: number}) =>
                navigation.navigate('AddToPlaylist', {id}),
            },
            {
              text: 'Go to artist',
              icon: 'account-music-outline',
              iconSource: 'material-community-icons',
              action: () =>
                navigation.navigate('Artist', {
                  albumArtist: track.albumArtist,
                  tracks: track.tracks,
                  path: track.path,
                }),
            },
            {
              text: 'View Metadata',
              icon: 'database-outline',
              iconSource: 'material-community-icons',
              action: ({id}: {id: number}) =>
                navigation.navigate('Artist', {id}),
            },
            {
              text: 'Refresh Metadata',
              icon: 'database-refresh-outline',
              iconSource: 'material-community-icons',
              action: ({id}: {id: number}) =>
                navigation.navigate('Artist', {id}),
            },
            {
              text: 'Delete from library',
              icon: 'delete-variant',
              iconSource: 'material-community-icons',
              action: (track: TrackProps) => {
                // ? Close the bottom sheet
                bottomSheetRef.current.close();

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
          keyExtractor={i => i.text}
          ListHeaderComponent={
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 20,
                marginBottom: 10,
                marginHorizontal: 20,
              }}>
              <Image
                source={{uri: `${ARTWORK_URL}${track?.artwork}`}}
                style={{
                  height: 45,
                  width: 45,
                  marginRight: 10,
                  borderRadius: 10,
                }}
              />
              <View style={{justifyContent: 'center', marginLeft: 5}}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                  {track?.title}
                </Text>
                <Text>{track?.albumArtist}</Text>
              </View>
            </View>
          }
          renderItem={({
            item,
          }: {
            item: {
              text: string;
              icon: string;
              iconSource?: string;
              action: (track: TrackProps) => void;
            };
          }) => (
            <Pressable
              onPress={() => {
                bottomSheetRef.current?.snapToIndex(-1);
                item.action(track);
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
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
          )}
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
