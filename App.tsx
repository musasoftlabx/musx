// * React
import React, {useEffect, useRef} from 'react';

// * React Native
import {Appearance, StatusBar} from 'react-native';

// * Libraries
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  DefaultTheme as RNLightTheme,
  DarkTheme as RNDarkTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PaperProvider, adaptNavigationTheme} from 'react-native-paper';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useAppState} from '@react-native-community/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BottomSheet from '@gorhom/bottom-sheet';
import {
  useCastState,
  useMediaStatus,
  useRemoteMediaClient,
  useStreamPosition,
} from 'react-native-google-cast';
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  useTrackPlayerEvents,
  Event,
  usePlaybackState,
  useActiveTrack,
  useProgress,
  Track,
  State,
} from 'react-native-track-player';

// * Screens
import NowPlaying from './app/screens/NowPlaying';
import TabNavigator from './app/navigators/TabNavigator';

// * Utils
import {darkTheme} from './app/utils';

// * Store
import {API_URL, SERVER_URL, usePlayerStore} from './app/store';

// * Constants
export const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();
const {DarkTheme} = adaptNavigationTheme({
  reactNavigationDark: RNDarkTheme,
  reactNavigationLight: RNLightTheme,
});

// * Axios config
axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 60000;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';

Appearance.setColorScheme('dark'); // ? Always force dark mode

export default function App(): React.JSX.Element {
  // ? Refs
  const ref = useRef<BottomSheet>(null);

  // ? Hooks
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const castClient = useRemoteMediaClient();
  const castState = useCastState();
  const castMediaStatus = useMediaStatus();
  const streamPosition = useStreamPosition();
  const currentAppState = useAppState();

  // ? StoreStates
  const nowPlayingRef = usePlayerStore(state => state.nowPlayingRef);
  const trackPlayCount = usePlayerStore(state => state.trackPlayCount);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const playRegistered = usePlayerStore(state => state.playRegistered);

  // ? StoreActions
  const setPlaybackState = usePlayerStore(state => state.setPlaybackState);
  const setProgress = usePlayerStore(state => state.setProgress);
  const setPlayRegistered = usePlayerStore(state => state.setPlayRegistered);
  const setActiveTrack = usePlayerStore(state => state.setActiveTrack);
  const setActiveTrackIndex = usePlayerStore(
    state => state.setActiveTrackIndex,
  );
  const setQueue = usePlayerStore(state => state.setQueue);
  const setTrackRating = usePlayerStore(state => state.setTrackRating);
  const setTrackPlayCount = usePlayerStore(state => state.setTrackPlayCount);
  const setPalette = usePlayerStore(state => state.setPalette);
  const setLyrics = usePlayerStore(state => state.setLyrics);
  const setLyricsVisible = usePlayerStore(state => state.setLyricsVisible);
  const openNowPlaying = usePlayerStore(state => state.openNowPlaying);
  const setNowPlayingRef = usePlayerStore(state => state.setNowPlayingRef);
  const setCastState = usePlayerStore(state => state.setCastState);
  const setCastClient = usePlayerStore(state => state.setCastClient);

  // ? Functions
  const fetchLyrics = (path: string) => {
    axios
      .get(`${SERVER_URL}/Music/${path.replace('.mp3', '.lrc')}`)
      .then(({data: lyrics}) => {
        setLyrics(lyrics);
        setLyricsVisible(true);
      })
      .catch(() => {
        setLyrics('');
        setLyricsVisible(false);
      });
  };

  // ? Effects
  useEffect(() => {
    setNowPlayingRef(ref); // ? Set Now Playing Bottom Sheet Ref

    (async () => {
      try {
        TrackPlayer.setupPlayer({autoHandleInterruptions: true});

        TrackPlayer.updateOptions({
          android: {
            appKilledPlaybackBehavior:
              AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            alwaysPauseOnInterruption: true,
          },
          progressUpdateEventInterval: 0.1,
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
          ],
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SeekTo,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
          ],
        });

        const playPosition = await AsyncStorage.getItem('playPosition');
        const savedQueue = await AsyncStorage.getItem('queue');
        const savedActiveTrackIndex = await AsyncStorage.getItem(
          'activeTrackIndex',
        );

        if (savedQueue) {
          const _queue = JSON.parse(savedQueue);
          await TrackPlayer.setQueue(_queue);
          await TrackPlayer.skip(Number(savedActiveTrackIndex));
          await TrackPlayer.seekTo(Number(playPosition));
          openNowPlaying(ref);
          setQueue(_queue);
        }
      } catch (err: any) {
        console.log('Setup Player Error:', err.message);
      }
    })();
  }, []);

  useEffect(() => {
    if (castState === 'connected') {
      setCastState(castState);
      setCastClient(castClient);
      //TrackPlayer.pause();
      TrackPlayer.setVolume(0);

      // ? Check if cast client is empty to add new tracks and play. If not empty, continue with previous queue
      if (!castClient || JSON.stringify(castClient) === '{}') {
        TrackPlayer.getQueue().then(queue => {
          castClient
            ?.loadMedia({
              queueData: {
                items: queue
                  .map((track, index) => ({
                    mediaInfo: {
                      contentUrl: track.url,
                      contentType: 'audio/mpeg',
                      metadata: {
                        type: 'musicTrack',
                        images: [{url: track.artwork}],
                        title: track.title,
                        albumTitle: track.albumArtist,
                        albumArtist: track.albumArtist,
                        artist: track.artists,
                        releaseDate: track.year,
                        trackNumber: index + 1,
                        discNumber: 1,
                      },
                      customData: {
                        id: track.id,
                        title: track.title,
                        albumArtist: track.albumArtist,
                        duration: track.duration,
                        artists: track.artists,
                        album: track.album,
                        rating: track.rating ?? 0,
                        plays: track.plays,
                        year: track.year,
                        waveform: track.waveform,
                        sampleRate: track.sampleRate,
                        palette: track.palette,
                        genre: track.genre,
                        format: track.format,
                        encoder: track.encoder,
                        bitrate: track.bitrate,
                        artwork: track.artwork,
                      },
                    },
                  }))
                  .slice(activeTrackIndex) as any,
              },
            })
            .then(() => castClient?.play());
        });
      } else TrackPlayer.setVolume(0);
      //} //else playbackState.state === State.Paused && TrackPlayer.play();
    } else TrackPlayer.setVolume(1);
  }, [castClient, castState]);

  useEffect(() => {
    if (castMediaStatus?.currentItemId) {
      const {mediaInfo} = castMediaStatus as any;
      // const {rating, plays, palette, duration, path} =
      //   mediaInfo?.customData as any;

      // ? Save variables to store to be accessed by components
      setLyricsVisible(false);
      setPlayRegistered(false);
      setActiveTrack(mediaInfo?.customData);
      setTrackRating(mediaInfo?.customData?.rating);
      setTrackPlayCount(mediaInfo?.customData?.plays);
      setPalette(mediaInfo?.customData?.palette);
      setProgress({
        position: 0,
        buffered: 0,
        duration: mediaInfo?.customData?.duration,
      });

      // ? Get active track lyrics. Display the lyrics if found else display artwork
      fetchLyrics(mediaInfo?.contentUrl);

      TrackPlayer.getQueue().then(async queue => {
        // ? Get the active track index
        const activeTrackIndex = queue.findIndex(
          track => track.id === mediaInfo?.customData.id,
        );

        // ? Set the track index
        setActiveTrackIndex(activeTrackIndex);

        // ? Set the queue
        setQueue(queue);

        // ? Store the queue and the active track index to restore state incase the app crashes or is dismissed
        AsyncStorage.setItem('activeTrackIndex', activeTrackIndex!.toString());
        AsyncStorage.setItem('queue', JSON.stringify(queue));
      });
    }
  }, [castMediaStatus?.currentItemId]);

  useEffect(() => {
    if (castMediaStatus)
      setPlaybackState({state: castMediaStatus?.playerState});
  }, [castMediaStatus]);

  useEffect(() => {
    if (streamPosition) {
      setProgress({
        position: streamPosition,
        buffered: 0,
        duration: castMediaStatus?.mediaInfo?.streamDuration as number,
      });

      if (streamPosition >= 10 && playRegistered === false) {
        setPlayRegistered(true);
        setTrackPlayCount(trackPlayCount + 1);
        TrackPlayer.updateMetadataForTrack(activeTrackIndex!, {
          ...activeTrack,
          plays: activeTrack?.plays + 1,
        } as Track);
        axios
          .patch('updatePlayCount', {id: activeTrack?.id})
          .then(({data}) => console.log(data));
      }
    }
  }, [streamPosition]);

  useEffect(() => {
    (async () => {
      if (currentAppState !== 'active') {
        const _activeTrackIndex = await TrackPlayer.getActiveTrackIndex();
        const _queue = await TrackPlayer.getQueue();

        if (_activeTrackIndex && _queue.length > 0) {
          AsyncStorage.setItem('playPosition', progress.position.toString());
          AsyncStorage.setItem('queue', JSON.stringify(_queue));
          AsyncStorage.setItem(
            'activeTrackIndex',
            _activeTrackIndex!.toString(),
          );
        }
      }
    })();
  }, [currentAppState]);

  useTrackPlayerEvents(
    [
      Event.PlaybackActiveTrackChanged,
      Event.PlaybackProgressUpdated,
      Event.PlaybackState,
      Event.PlaybackQueueEnded,
    ],
    async event => {
      if (castState && castState !== 'connected') {
        if (event.type === Event.PlaybackActiveTrackChanged) {
          setLyricsVisible(false);

          // ? Save variables to store to be accessed by components
          setPlayRegistered(false);
          setActiveTrack(activeTrack);
          setTrackRating(activeTrack?.rating);
          setTrackPlayCount(activeTrack?.plays);
          setPalette(activeTrack?.palette);
          setProgress({
            position: 0,
            buffered: 0,
            duration: activeTrack?.duration!,
          });

          // ? Get active track lyrics. Display the lyrics if found else display artwork
          fetchLyrics(activeTrack?.path);

          // ? Set the active track index
          const _activeTrackIndex = await TrackPlayer.getActiveTrackIndex();
          setActiveTrackIndex(_activeTrackIndex);

          // ? Set the queue
          TrackPlayer.getQueue().then(queue => {
            setQueue(queue);
            // ? Store the queue and the active track index to restore state incase the app crashes or is dismissed
            AsyncStorage.setItem('queue', JSON.stringify(queue));
            AsyncStorage.setItem(
              'activeTrackIndex',
              _activeTrackIndex!.toString(),
            );
          });
        }

        if (event.type === Event.PlaybackProgressUpdated) {
          setProgress(progress);

          if (progress.position >= 10 && playRegistered === false) {
            setPlayRegistered(true);
            setTrackPlayCount(trackPlayCount + 1);
            TrackPlayer.updateMetadataForTrack(activeTrackIndex!, {
              ...activeTrack,
              plays: activeTrack?.plays + 1,
            } as Track);
            axios
              .patch('updatePlayCount', {id: activeTrack?.id})
              .then(({data}) => console.log(data))
              .catch(error => console.log(error));
          }
        }

        if (event.type === Event.PlaybackState) {
          setPlaybackState(playbackState);
          console.log('trackplayer:', playbackState);
        }

        if (event.type === Event.PlaybackQueueEnded) {
          await AsyncStorage.removeItem('queue');
          await AsyncStorage.removeItem('activeTrackIndex');
        }
      }
    },
  );

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <StatusBar
        animated
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={darkTheme}>
          <SafeAreaProvider>
            <NavigationContainer theme={DarkTheme}>
              <Stack.Navigator>
                <Stack.Screen
                  name="TabNavigator"
                  component={TabNavigator}
                  options={{headerShown: false}}
                />
              </Stack.Navigator>
            </NavigationContainer>
            <NowPlaying />
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
