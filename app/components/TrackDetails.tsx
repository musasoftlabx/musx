// * React
import React, {useState} from 'react';

// * React Native
import {View, Image, Pressable, Text, Alert, Vibration} from 'react-native';

// * Libraries
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {Avatar, Chip, Snackbar} from 'react-native-paper';
import axios, {AxiosError} from 'axios';
import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// * Store
import {usePlayerStore} from '../store';

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
  const addAsNextTrack = usePlayerStore(state => state.addAsNextTrack);
  const addTrackToEndOfQueue = usePlayerStore(
    state => state.addTrackToEndOfQueue,
  );
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
          backgroundColor: 'rgba(0, 0, 0, .9)',
          borderRadius: 20,
        }}>
        <BottomSheetFlatList
          data={[
            {
              text: 'Play',
              icon: 'play-arrow',
              action: () => {
                bottomSheetRef.current?.close();
                play([track], track);
              },
            },
            {
              text: 'Play Next',
              icon: 'queue-play-next',
              action: () => {
                bottomSheetRef.current?.close();
                addAsNextTrack(track, activeTrackIndex + 1);
              },
            },
            {
              text: 'Add to queue',
              icon: 'add-to-queue',
              action: () => {
                bottomSheetRef.current?.close();
                addTrackToEndOfQueue(track);
              },
            },
            {
              text: 'Add to playlist',
              icon: 'playlist-add',
              action: ({id}: {id: number}) => {
                bottomSheetRef.current?.close();
                navigation.navigate('AddToPlaylist', {id});
              },
            },
            {
              text: (
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                  <Text style={{fontSize: 16.5, color: '#fff'}}>
                    Go to artist
                  </Text>
                  <View>
                    <Chip
                      avatar={
                        <Avatar.Image
                          size={24}
                          source={{
                            uri: `${track.url
                              .split('/')
                              .slice(0, -1)
                              .join('/')}/artist.jpg`,
                          }}
                        />
                      }
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: '#fff',
                        borderRadius: 20,
                        borderWidth: 1,
                      }}
                      textStyle={{color: '#fff'}}
                      onPress={() => {
                        bottomSheetRef.current?.close();
                        Vibration.vibrate(100);
                        navigation.navigate('Artist', {
                          albumArtist: track?.albumArtist,
                          tracks: track?.tracks,
                          path: track.path,
                          url: track.url,
                        });
                      }}>
                      {track?.albumArtist}
                    </Chip>
                  </View>
                </View>
              ),
              icon: 'account-music-outline',
              iconSource: 'material-community-icons',
            },
            {
              text: 'View Metadata',
              icon: 'database-refresh-outline',
              iconSource: 'material-community-icons',
              action: (track: TrackProps) =>
                navigation.navigate('TrackMetadata', track),
              /* {
                id,
                path: path.split('/').slice(0, -1),
              } */
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
          keyExtractor={(_, i) => i.toString()}
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
                source={{uri: track?.artwork}}
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
              text: string | React.ReactNode;
              icon: string;
              iconSource?: string;
              action?: (track: TrackProps) => void;
            };
          }) => (
            <Pressable
              onPress={() => {
                item.action && item.action(track);
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
