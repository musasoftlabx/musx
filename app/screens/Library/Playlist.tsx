// * React
import React, { useState, useRef, useCallback, useEffect } from 'react';

// * React Native
import {
  Image,
  ImageBackground,
  Pressable,
  Vibration,
  View,
} from 'react-native';

// * Libraries
import * as Progress from 'react-native-progress';
import { downloadFile } from '@dr.pogodin/react-native-fs';
import { FlashList } from '@shopify/flash-list';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  useBackHandler,
  useDeviceOrientation,
} from '@react-native-community/hooks';
import axios from 'axios';
import DraggableFlatList, {
  OpacityDecorator,
  RenderItemParams,
  ShadowDecorator,
} from 'react-native-draggable-flatlist';
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import SwipeableItem, {
  SwipeableItemImperativeRef,
} from 'react-native-swipeable-item';
import { State } from 'react-native-track-player';
import { CastButton } from 'react-native-google-cast';
import { useNavigation } from '@react-navigation/native';
import { Snackbar, Text, useTheme } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import dayjs from 'dayjs';

import _ListItem from '../../components/ListItem';
import LinearGradientX from '../../components/LinearGradientX';

// * Store
import { API_URL, DOWNLOADS_PATH, usePlayerStore, WIDTH } from '../../store';

import { formatTrackTime } from '../../functions';

import { TrackProps, TracksProps } from '../../types';
import StatusBarX from '../../components/StatusBarX';
import { queryClient } from '../../../App';
import VerticalListItem from '../../components/Skeletons/VerticalListItem';

// * Icons
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PlayIcon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

import duration from 'dayjs/plugin/duration';
import EditPlaylist from '../../components/EditPlaylist';

dayjs.extend(duration);

export default function Playlist({
  route: {
    params: {
      id,
      name,
      description,
      duration,
      tracks,
      artwork,
      artworks,
      size,
    },
  },
}: any) {
  // ? Refs
  const flashListRef = useRef<any>(null);
  const swipeableItemRef = useRef<SwipeableItemImperativeRef>(null);

  // ? Hooks
  const navigation = useNavigation();
  const orientation = useDeviceOrientation();
  const theme = useTheme();
  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  // ? Store States
  const { state } = usePlayerStore(state => state.playbackState);
  const activePlaylist = usePlayerStore(state => state.activePlaylist);
  const activeTrack: TrackProps = usePlayerStore(state => state.activeTrack);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const palette = usePlayerStore(state => state.palette);
  const play = usePlayerStore(state => state.play);
  const setActivePlaylist = usePlayerStore(state => state.setActivePlaylist);

  // ? States
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [playlistTracks, setPlaylistTracks] = useState<TracksProps>([]);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditPlaylistVisible, setIsEditPlaylistVisible] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSize, setDownloadSize] = useState(0);
  const [tracksDownloaded, setTracksDownloaded] = useState(0);
  const [totalTracksProgressBar, setTotalTracksProgressBar] = useState(false);

  // ? Constants
  const isPlaying = state === State.Playing;

  useEffect(() => {
    if (flashListRef.current) {
      flashListRef.current.scrollToIndex({
        index: activeTrackIndex,
        animated: true,
        viewPosition: 0,
      });
    }
  }, [activeTrackIndex]);

  // ? Queries
  const { data, isSuccess, isFetching } = useQuery({
    queryKey: ['playlist', id],
    queryFn: ({ queryKey }) => {
      axios(`${API_URL}${queryKey[0]}/${queryKey[1]}`).then(({ data }) =>
        setPlaylistTracks(data),
      );
      return null;
    },
  });

  // ? Mutations
  const { mutate: rearrangePlaylist } = useMutation({
    mutationFn: (body: { playlistId: number; trackIds: number[] }) =>
      axios.put(`rearrangePlaylist`, body),
  });

  const { mutate: deletePlaylistTrack } = useMutation({
    mutationFn: (body: { playlistId: number; trackId: number }) =>
      axios.delete(
        `deletePlaylistTrack?playlistId=${body.playlistId}&trackId=${body.trackId}`,
      ),
  });

  // ? Effects
  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: palette?.[1] ?? '#000',
            flexDirection: 'row',
            gap: 20,
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
        >
          <Pressable style={{ flex: 0.05 }} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </Pressable>

          <View style={{ flex: 0.45 }}>
            <Text numberOfLines={1} style={{ fontSize: 20 }}>
              {activeTrack?.title ?? name}
            </Text>

            <Text numberOfLines={1} style={{ fontSize: 12 }}>
              {activeTrack?.artists ?? `${tracks} tracks`}
            </Text>
          </View>

          <View
            style={{
              flex: 0.5,
              flexDirection: 'row',
              gap: 40,
              justifyContent: 'flex-end',
            }}
          >
            {isDownloading ? (
              <Progress.Circle
                color="#fff"
                showsText
                textStyle={{ fontSize: 10 }}
                formatText={_ =>
                  `${((downloadProgress / downloadSize) * 100).toFixed(0)}%`
                }
                progress={downloadProgress / downloadSize || downloadSize}
                size={30}
              />
            ) : (
              <MaterialCommunityIcons
                color="#fff"
                name="progress-download"
                size={24}
                onPress={() => {
                  setTotalTracksProgressBar(true);
                  Vibration.vibrate(100);
                  playlistTracks.map(({ url, path }: TrackProps) => {
                    try {
                      downloadFile({
                        fromUrl: url,
                        toFile: `${DOWNLOADS_PATH}/${path.replaceAll(
                          '/',
                          '_',
                        )}`,
                        background: false,
                        progress({ bytesWritten, contentLength }) {
                          setIsDownloading(true);
                          setDownloadProgress(bytesWritten);
                          setDownloadSize(contentLength);
                        },
                      })
                        .promise.then(() => {
                          setTracksDownloaded(prev => prev + 1);
                          //setTracksDownloaded(tracksDownloaded + 1);
                        })
                        .catch(error => {
                          setSnackbarMessage(
                            `Error downloading ${name}: ${error}`,
                          );
                          setSnackbarVisible(!snackbarVisible);
                        })
                        .finally(() => {
                          setIsDownloading(false);
                          if (tracksDownloaded === playlistTracks.length)
                            setTotalTracksProgressBar(false);
                          //setTracksDownloaded(prev => prev++);
                        });
                    } catch (error) {
                      setSnackbarMessage(`Error downloading ${name}: ${error}`);
                      setSnackbarVisible(!snackbarVisible);
                    }
                  });
                }}
              />
            )}

            <CastButton style={{ height: 24, width: 24, tintColor: '#fff' }} />

            <MaterialCommunityIcons
              color="#fff"
              name="circle-edit-outline"
              size={24}
              onPress={() => {
                Vibration.vibrate(50);
                setIsEditPlaylistVisible(true);
              }}
            />
          </View>
        </View>
      ),
    });
  }, [
    activeTrack,
    navigation,
    palette,
    downloadProgress,
    isDownloading,
    playlistTracks,
    tracksDownloaded,
  ]);

  // ? Functions
  const ListItem = ({ item }: { item: TrackProps }) => {
    const isActive = activeTrack?.id === item.id;
    const isPlaying = state === State.Playing;

    return (
      <Pressable
        onPress={() => {
          setActivePlaylist(id);
          play(playlistTracks, item);
        }}
      >
        <View
          style={[
            isActive
              ? {
                  backgroundColor: '#ffffff4d',
                  borderRadius: 10,
                  marginVertical: 3,
                  marginHorizontal: 6,
                  paddingHorizontal: 5,
                }
              : { marginHorizontal: 10 },
            { alignItems: 'center', flexDirection: 'row', paddingVertical: 7 },
          ]}
          // style={{
          //   flex: 1,
          //   flexWrap: 'nowrap',
          //   flexDirection: 'row',
          //   alignItems: 'center',
          //   height: LIST_ITEM_HEIGHT,
          //   marginHorizontal: 10,
          // }}
        >
          {/* Track details */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {isActive ? (
              <>
                {isPlaying ? (
                  <View
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Animated.Image
                      source={{ uri: item.artwork }}
                      style={[{ borderRadius: 100, height: 45, width: 45 }]}
                    />
                    <Icon
                      name="circle-thin"
                      size={26}
                      style={{
                        color: '#fff',
                        opacity: 0.7,
                        position: 'absolute',
                      }}
                    />
                    <Icon
                      name="circle"
                      size={18}
                      style={{
                        color: '#fff',
                        opacity: 0.5,
                        position: 'absolute',
                      }}
                    />
                    <Icon
                      name="circle"
                      size={10}
                      style={{
                        color: '#000',
                        opacity: 1,
                        position: 'absolute',
                      }}
                    />
                  </View>
                ) : (
                  <Image
                    source={{ uri: item.artwork }}
                    style={[{ borderRadius: 100, height: 45, width: 45 }]}
                  />
                )}
              </>
            ) : (
              <Image
                source={{ uri: item.artwork }}
                style={[{ borderRadius: 10, height: 45, width: 45 }]}
              />
            )}
            <View style={{ flexBasis: '60%', gap: 2 }}>
              <Text
                numberOfLines={1}
                style={{ fontSize: 16, fontWeight: '600', width: '70%' }}
              >
                {item.position}. {item.title}
              </Text>
              <Text
                numberOfLines={1}
                style={{ fontSize: 14, color: '#ffffff80' }}
              >
                {item.artists ?? 'Unknown Artist'}
              </Text>
            </View>
          </View>

          {/* Rating, Plays & Duration */}
          <View
            style={{
              flex: 1,
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: 3,
            }}
          >
            <StarRatingDisplay
              rating={item.rating}
              starSize={16}
              starStyle={{ marginHorizontal: 0 }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text numberOfLines={1} style={{ fontWeight: 'bold' }}>
                {item.plays || 0} play
                {`${item.plays === 1 ? '' : 's'}`}
              </Text>
              <Text>{'  ◎  '}</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  marginRight: 3,
                }}
              >
                {formatTrackTime(item.duration)} mins
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const refetch = () =>
    queryClient
      .refetchQueries({ queryKey: ['playlist', id] })
      .then(() => setRefreshing(false));

  // ? Callbacks
  const RenderQueueListItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<any>) => (
      <ShadowDecorator>
        <OpacityDecorator>
          <Pressable
            //activeOpacity={1}
            onLongPress={drag}
            disabled={isActive}
          >
            <SwipeableItem
              ref={swipeableItemRef}
              item={item}
              onChange={({ openDirection }) =>
                openDirection === 'none' ? {} : {}
              }
              renderUnderlayRight={() => (
                <View
                  style={{
                    backgroundColor: 'rgba(255, 87, 51, .3)',
                    flexDirection: 'row',
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                  }}
                >
                  <Pressable
                    onPress={() => {
                      swipeableItemRef.current?.close({ animated: true });
                    }}
                  >
                    <Text
                      style={{
                        backgroundColor: '#0005',
                        borderWidth: 1,
                        borderColor: '#fff',
                        borderRadius: 5,
                        fontWeight: 'bold',
                        color: 'white',
                        fontSize: 15,
                        paddingTop: 9,
                        paddingRight: 13,
                        paddingBottom: 8,
                        paddingLeft: 15,
                        zIndex: 2,
                      }}
                    >
                      EDIT
                    </Text>
                  </Pressable>
                </View>
              )}
              renderUnderlayLeft={() => (
                <View
                  style={{
                    backgroundColor: 'rgba(255, 87, 51, .3)',
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                  }}
                >
                  <Pressable
                    onPress={() => {
                      // ? Close the item
                      swipeableItemRef.current?.close({ animated: true });
                      // ? Remove the track from list
                      playlistTracks.filter(
                        _track => _track.id !== item.id && _track,
                      );
                      // ? Delete track from playlist table
                      deletePlaylistTrack(
                        { playlistId: id, trackId: item.id },
                        {
                          onSuccess: refetch,
                          onError: error => console.log(error.message),
                        },
                      );
                    }}
                  >
                    <Text
                      style={{
                        backgroundColor: 'red',
                        borderWidth: 1,
                        borderColor: '#fff',
                        borderRadius: 5,
                        fontWeight: 'bold',
                        color: 'white',
                        fontSize: 15,
                        paddingTop: 9,
                        paddingRight: 13,
                        paddingBottom: 8,
                        paddingLeft: 15,
                        zIndex: 2,
                      }}
                    >
                      DELETE
                    </Text>
                  </Pressable>
                </View>
              )}
              activationThreshold={50}
              snapPointsRight={[80]}
              snapPointsLeft={[100]}
            >
              <ListItem item={item} />
            </SwipeableItem>
          </Pressable>
        </OpacityDecorator>
      </ShadowDecorator>
    ),
    [playlistTracks, activeTrack, activePlaylist, isPlaying],
  );

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

      <EditPlaylist
        id={id}
        name={name}
        description={description}
        isEditPlaylistVisible={isEditPlaylistVisible}
        setIsEditPlaylistVisible={setIsEditPlaylistVisible}
      />

      {orientation === 'portrait' ? (
        <>
          <ImageBackground
            source={{
              uri:
                activePlaylist === id && activeTrack
                  ? activeTrack?.artwork
                  : artworks?.[0],
            }}
            resizeMode="cover"
            blurRadius={20}
          >
            <View
              style={{
                backgroundColor: 'rgba(0,0,0,.5)',
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                opacity: 0.2,
                zIndex: 2,
              }}
            />

            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                padding: 10,
              }}
            >
              {!artwork ? (
                <>
                  {playlistTracks.length >= 4 ? (
                    <View
                      style={{
                        borderColor: '#b1b1b1ff',
                        borderRadius: 10,
                        borderWidth: 1,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        marginTop: 0.5,
                        width: 102,
                        height: 102,
                        overflow: 'hidden',
                      }}
                    >
                      {artworks.map(
                        (artwork: string, i: number) =>
                          i <= 4 && (
                            <Image
                              key={i}
                              source={{ uri: artwork }}
                              style={{ width: 50, height: 50 }}
                              resizeMode="cover"
                            />
                          ),
                      )}
                    </View>
                  ) : (
                    <Image
                      source={{ uri: artworks[0] }}
                      style={{ width: 100, height: 100, borderRadius: 10 }}
                    />
                  )}
                </>
              ) : (
                <Image
                  source={{ uri: artwork }}
                  defaultSource={require('../../assets/images/musician.png')}
                  style={{ width: 100, height: 100, borderRadius: 100 }}
                  resizeMode="cover"
                />
              )}

              <View style={{ alignItems: 'center' }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: 'Pacifico',
                    fontSize: 30,
                    textAlign: 'center',
                    textShadowColor: '#000',
                    textShadowRadius: 10,
                    width: WIDTH / 1.5,
                  }}
                >
                  {name}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Rubik',
                    fontSize: 18,
                    marginTop: -2,
                    textShadowColor: '#000',
                    textShadowRadius: 5,
                  }}
                >
                  {tracks} tracks
                </Text>
                <Text
                  style={{
                    fontFamily: 'Rubik',
                    fontSize: 20,
                    marginTop: 3,
                    opacity: 0.8,
                    textShadowColor: '#000',
                    textShadowRadius: 5,
                  }}
                >
                  {duration} mins
                </Text>
              </View>
            </View>

            {!activePlaylist && (
              <PlayIcon
                color="#fff"
                name="play-circle"
                size={60}
                style={{
                  position: 'absolute',
                  borderColor: '#fff',
                  borderRadius: 100,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  bottom: 10,
                  right: 10,
                  zIndex: 5,
                }}
                onPress={() => {
                  setActivePlaylist(id);
                  play(playlistTracks, playlistTracks[0]);
                }}
              />
            )}

            <Ionicons
              color="#fff"
              name="refresh-circle-outline"
              size={30}
              style={{ position: 'absolute', left: 10, bottom: 10 }}
              onPress={() => {
                Vibration.vibrate(50);
                refetch();
              }}
            />

            <Feather
              color="#fff"
              name="lock"
              size={25}
              style={{ position: 'absolute', right: 20, top: 10 }}
              onPress={() => {
                Vibration.vibrate(50);
                refetch();
              }}
            />

            <Text
              numberOfLines={1}
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#fff',
                borderColor: '#fff',
                borderWidth: 1,
                borderRadius: 5,
                color: '#000',
                fontSize: 14,
                fontWeight: 'bold',
                paddingHorizontal: 5,
                paddingTop: 1,
                position: 'absolute',
                left: 10,
                top: 10,
              }}
            >
              {size}
            </Text>
          </ImageBackground>

          {/* <Text style={{ fontSize: 13, textAlign: 'right' }}>
            {dayjs
              .duration(554, 'seconds')
              .format('HH [hrs] mm [mins] ss [sec]')}
          </Text> */}

          {totalTracksProgressBar &&
            tracksDownloaded === playlistTracks.length && (
              <Progress.Bar
                borderColor="#fff"
                borderRadius={0}
                color={theme.colors.primary}
                height={3}
                width={WIDTH}
                progress={(tracksDownloaded / playlistTracks.length) * 100}
              />
            )}

          {isFetching && !data && <VerticalListItem />}

          {isSuccess && (
            <DraggableFlatList
              data={playlistTracks ?? []}
              onDragBegin={() => Vibration.vibrate(50)}
              onDragEnd={({ data }) => {
                // ? Set the data with the new movements
                setPlaylistTracks(data);
                // ? Store rearranged tracks on DB
                rearrangePlaylist(
                  { playlistId: id, trackIds: data.map(({ id }) => id) },
                  {
                    onSuccess: refetch,
                    onError: error => console.log(error.message),
                  },
                );
              }}
              keyExtractor={(_, index) => index.toString()}
              renderItem={RenderQueueListItem}
              activationDistance={10}
              containerStyle={{ flex: 1, marginVertical: 10 }}
            />
          )}
        </>
      ) : (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            gap: 30,
            paddingHorizontal: 20,
            paddingTop: 10,
          }}
        >
          <View style={{ flex: 0.3 }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#ffffff1e',
                borderRadius: 10,
                flexDirection: 'row',
                gap: 15,
                paddingHorizontal: 20,
              }}
            >
              {!artwork ? (
                <>
                  {playlistTracks.length >= 4 ? (
                    <View
                      style={{
                        borderRadius: 10,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        marginTop: 0.5,
                        width: 150,
                        height: 150,
                        overflow: 'hidden',
                      }}
                    >
                      {artworks.map(
                        (artwork: string, i: number) =>
                          i <= 4 && (
                            <Image
                              key={i}
                              source={{ uri: artwork }}
                              style={{ width: 75, height: 75 }}
                              resizeMode="cover"
                            />
                          ),
                      )}
                    </View>
                  ) : (
                    <Image
                      source={{ uri: artworks[0] }}
                      style={{ width: 150, height: 150, borderRadius: 10 }}
                    />
                  )}
                </>
              ) : (
                <Image
                  source={{ uri: artwork }}
                  defaultSource={require('../../assets/images/musician.png')}
                  style={{ width: 150, height: 150, borderRadius: 100 }}
                  resizeMode="cover"
                />
              )}

              <View style={{ height: 200, gap: 10, width: 200 }}>
                <Text
                  style={{
                    color: '#fff',
                    fontFamily: 'LilyScriptOne',
                    fontSize: 20,
                    marginTop: 25,
                  }}
                >
                  {name}
                </Text>

                <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      backgroundColor: '#a7a7a745',
                      borderColor: '#ffffff4D',
                      borderWidth: 1,
                      borderTopLeftRadius: 5,
                      borderBottomLeftRadius: 5,
                      fontSize: 13,
                      paddingLeft: 7,
                      paddingHorizontal: 5,
                      paddingTop: 2,
                    }}
                  >
                    {size}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: '#ffffff4D',
                      borderWidth: 1,
                      borderTopRightRadius: 5,
                      borderBottomRightRadius: 5,
                      fontSize: 13,
                      paddingLeft: 7,
                      paddingHorizontal: 5,
                      paddingTop: 2,
                    }}
                  >
                    {tracks} tracks
                  </Text>
                </View>

                <Text style={{ fontSize: 14, marginTop: 2, opacity: 0.5 }}>
                  {duration} mins
                </Text>

                <PlayIcon
                  color="#fff"
                  name="play-circle"
                  size={60}
                  style={{
                    position: 'absolute',
                    borderColor: '#fff',
                    borderRadius: 100,
                    borderWidth: 2,
                    borderStyle: 'dashed',
                    bottom: 5,
                    right: 15,
                    zIndex: 5,
                  }}
                  onPress={() => {
                    setActivePlaylist(id);
                    play(playlistTracks, playlistTracks[0]);
                  }}
                />
              </View>
            </View>
          </View>

          <View style={{ flex: 0.7 }}>
            {isSuccess && (
              <FlashList
                ref={flashListRef}
                data={playlistTracks ?? []}
                keyExtractor={(_, index) => index.toString()}
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  queryClient
                    .refetchQueries({ queryKey: ['playlist', id] })
                    .then(() => setRefreshing(false));
                }}
                renderItem={({ item }: { item: TrackProps }) => (
                  <ListItem item={item} />
                )}
                // renderItem={({ item }: { item: TrackProps }) => (
                //   <_ListItem
                //     data={playlistTracks}
                //     item={item}
                //     display="bitrate"
                //   />
                // )}
              />
            )}
          </View>
        </View>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
      >
        {snackbarMessage}
      </Snackbar>
    </>
  );
}
