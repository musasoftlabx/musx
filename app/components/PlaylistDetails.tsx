// * React
import React, { useCallback, useState } from 'react';

// * React Native
import { Alert, Pressable, View } from 'react-native';

// * Libraries
import * as Progress from 'react-native-progress';
import { Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { downloadFile } from '@dr.pogodin/react-native-fs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// * Store
import { API_URL, DOWNLOADS_PATH, usePlayerStore, WIDTH } from '../store';

// * Types
import { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { RootStackParamList, TrackProps } from '../types';

// * Utils
import { fontFamilyBold, lightTheme } from '../utils';

// * Functions
import { queryClient } from '../../App';
import { styles } from '../styles';
import ButtonX from './ButtonX';

export default function PlaylistDetails({
  playlistDetailsRef,
}: {
  playlistDetailsRef: React.Ref<BottomSheetMethods>;
}) {
  // ? Hooks
  const theme = useTheme();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'Artist', ''>
    >();

  // ? States
  const [editPlaylistVisible, setEditPlaylistVisible] = useState(false);
  const [editPlaylistValue, setEditPlaylistValue] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSize, setDownloadSize] = useState(0);
  const [tracksDownloaded, setTracksDownloaded] = useState(0);
  const [totalTracksProgressBar, setTotalTracksProgressBar] = useState(false);

  // ? Store States
  const playlistDetails = usePlayerStore(state => state.playlistDetails);

  // ? Store Actions
  const closePlaylistDetails = usePlayerStore(
    state => state.closePlaylistDetails,
  );

  // ? Mutate
  const { mutate: editPlaylist } = useMutation({
    mutationFn: (body: { playlistId: number; name: string }) =>
      axios.patch('editPlaylist', body),
  });

  const { mutate: deletePlaylist } = useMutation({
    mutationFn: (body: { playlistId: number }) =>
      axios.delete(`deletePlaylist?playlistId=${body.playlistId}`),
  });

  const { mutate: downloadPlaylist } = useMutation({
    mutationFn: () =>
      axios(`${API_URL}playlist/${playlistDetails!.id}`).then(({ data }) =>
        data.map(({ url, path }: TrackProps) => {
          try {
            downloadFile({
              fromUrl: url,
              toFile: `${DOWNLOADS_PATH}/${path.replaceAll('/', '_')}`,
              background: false,
              progress({ bytesWritten, contentLength }) {
                setIsDownloading(true);
                setDownloadProgress(bytesWritten);
                setDownloadSize(contentLength);
              },
            })
              .promise.then(() => setTracksDownloaded(prev => prev + 1))
              .catch(error => {
                setSnackbarMessage(
                  `Error downloading ${playlistDetails?.name}: ${error}`,
                );
                setSnackbarVisible(!snackbarVisible);
              })
              .finally(() => {
                setIsDownloading(false);
                if (tracksDownloaded === data.length)
                  setTotalTracksProgressBar(false);
              });
          } catch (error) {
            setSnackbarMessage(
              `Error downloading ${playlistDetails?.name}: ${error}`,
            );
            setSnackbarVisible(!snackbarVisible);
          }
        }),
      ),
  });

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
                  paddingHorizontal: 20,
                  width: WIDTH,
                }}
              >
                {[
                  {
                    text: 'Download',
                    icon: 'progress-download',
                    action: downloadPlaylist,
                  },
                  {
                    text: 'Edit',
                    icon: 'circle-edit-outline',
                    iconSource: 'material-community-icons',
                    action: () => {
                      setEditPlaylistValue(playlistDetails?.name!);
                      setEditPlaylistVisible(true);
                    },
                  },
                  {
                    text: 'Delete',
                    icon: 'delete-variant',
                    iconSource: 'material-community-icons',
                    action: () => {
                      closePlaylistDetails();
                      Alert.alert(
                        'Confirm deletion',
                        `This will delete ${playlistDetails?.name} permanently. `,
                        [
                          {
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel',
                          },
                          {
                            text: 'OK',
                            onPress: () => {
                              deletePlaylist(
                                { playlistId: playlistDetails!.id },
                                {
                                  onSuccess: () => {
                                    queryClient.refetchQueries({
                                      queryKey: ['playlists'],
                                    });
                                    queryClient.refetchQueries({
                                      queryKey: ['dashboard'],
                                    });
                                  },
                                  onError: error => console.log(error.message),
                                },
                              );
                              // axios
                              //   .delete(`deleteTrack/${playlistDetails?.id}`)
                              //   .then(() => {
                              //     // ? Show the snackbar to indicate that the operation was successful
                              //     setSnackbarMessage(
                              //       `${playlistDetails?.name} deleted!`,
                              //     );
                              //     setSnackbarVisible(!snackbarVisible);
                              //     // ? Remove the deleted track from the queue and reset the queue
                              //     setQueue(
                              //       queue.filter(
                              //         _track =>
                              //           _track.id !== playlistDetails?.id &&
                              //           playlistDetails,
                              //       ),
                              //     );
                              //     // ? Refresh screens to remove occurences of deleted track
                              //     refreshScreens(activeTrack);
                              //   })
                              //   .catch((err: AxiosError) => {
                              //     setSnackbarMessage(err.message);
                              //     setSnackbarVisible(true);
                              //   });
                            },
                          },
                        ],
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
                        backgroundColor: '#fff1',
                        borderColor: '#fff8',
                        borderWidth: 1,
                        borderRadius: 10,
                        flexGrow: 1,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                      }}
                    >
                      {item.text === 'Download' && isDownloading ? (
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
          editPlaylistVisible ? (
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                gap: 5,
                paddingHorizontal: 20,
              }}
            >
              <TextInput
                label="Name *"
                placeholder=""
                onChangeText={v => setEditPlaylistValue(v)}
                maxLength={20}
                value={editPlaylistValue}
                style={[styles.darkTextInput, { width: 'auto' }]}
                activeUnderlineColor={theme.colors.primary}
              />

              <ButtonX
                disabled={!editPlaylistValue}
                // loading={isSubmitting}
                // isSubmitting={isSubmitting}
                // isValid={isValid}
                // touched={dirty}
                borderRadius={0}
                onPress={() =>
                  editPlaylist(
                    {
                      playlistId: playlistDetails?.id!,
                      name: editPlaylistValue,
                    },
                    {
                      onSuccess: () => {
                        setEditPlaylistValue('');
                        setEditPlaylistVisible(false);
                        queryClient.refetchQueries({
                          queryKey: ['playlists'],
                        });
                      },
                      onError: (error: any) => {
                        Alert.alert(
                          error.response.data.subject,
                          error.response.data.body,
                          [{ text: 'OK' }],
                        );
                      },
                    },
                  )
                }
              >
                EDIT
              </ButtonX>
            </View>
          ) : (
            <Text
              style={{
                fontFamily: fontFamilyBold,
                fontSize: 20,
                marginVertical: 20,
                marginHorizontal: 20,
                textAlign: 'center',
              }}
            >
              {playlistDetails?.name}
            </Text>
          )
        }
        renderItem={({
          item,
        }: {
          item: {
            text: string | React.ReactNode;
            icon: string;
            iconSource?: string;
            grid?: boolean;
            action?: (track: any) => void;
          };
        }) =>
          item.grid ? (
            item.text
          ) : (
            <Pressable
              onPress={() => {
                item.action && item.action(playlistDetails);
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
    [playlistDetails, downloadProgress, editPlaylistValue, editPlaylistVisible],
  );

  return (
    <>
      <BottomSheet
        ref={playlistDetailsRef}
        index={-1}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#fff' }}
        backgroundStyle={{ backgroundColor: '#000d', borderRadius: 20 }}
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
