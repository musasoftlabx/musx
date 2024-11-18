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
          setQueue(_queue);

          await TrackPlayer.setQueue(_queue);
          await TrackPlayer.skip(Number(savedActiveTrackIndex));
          await TrackPlayer.seekTo(Number(playPosition));
          openNowPlaying(ref);
        }
      } catch (err: any) {
        console.log('Setup Player Error:', err.message);
      }
    })();
  }, []);

  useEffect(() => {
    if (castState)
      if (castState === 'connected') {
        setCastState(castState);
        setCastClient(castClient);

        // ? Check if cast client is empty to add new tracks and play. If not empty, continue with previous queue
        if (!castClient || JSON.stringify(castClient) === '{}') {
          TrackPlayer.setVolume(0);
          TrackPlayer.getQueue().then(async queue => {
            if (queue.length > 0) {
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
                            duration: track.duration,
                          },
                        },
                      }))
                      .slice(activeTrackIndex) as any,
                  },
                })
                .then(() => castClient?.play());
            }
          });
        }
      } else TrackPlayer.setVolume(1);
  }, [castState, activeTrackIndex]);

  useEffect(() => {
    if (castMediaStatus)
      setPlaybackState({state: castMediaStatus?.playerState});
  }, [castMediaStatus]);

  useEffect(() => {
    if (streamPosition) {
      setProgress({
        position: streamPosition,
        buffered: 0,
        duration: castMediaStatus?.mediaInfo?.metadata?.duration,
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
      if (event.type === Event.PlaybackActiveTrackChanged) {
        setLyricsVisible(false);

        // ? Save variables to store to be accessed by components
        setPlayRegistered(false);
        setActiveTrack(activeTrack);
        setProgress(progress);
        setTrackRating(activeTrack?.rating);
        setTrackPlayCount(activeTrack?.plays);
        setPalette(activeTrack?.palette);

        // ? Get active track lyrics. Display the lyrics if found else display artwork
        axios
          .get(
            `${SERVER_URL}/Music/${activeTrack?.path.replace('.mp3', '.lrc')}`,
          )
          .then(({data: lyrics}) => {
            setLyrics(lyrics);
            setLyricsVisible(true);
          })
          .catch(() => {
            setLyrics('');
            setLyricsVisible(false);
          });

        const _activeTrackIndex = await TrackPlayer.getActiveTrackIndex();
        setActiveTrackIndex(_activeTrackIndex);

        const _queue = await TrackPlayer.getQueue();
        setQueue(_queue);

        // ? Defer getting and storing the queue for performance
        setTimeout(async () => {
          // ? Store the queue and the active track index to restore state incase the app crashes or is dismissed
          await AsyncStorage.setItem('queue', JSON.stringify(_queue));
          await AsyncStorage.setItem(
            'activeTrackIndex',
            _activeTrackIndex!.toString(),
          );
        }, 3000);
      }

      if (castState != 'connected') {
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
              .then(({data}) => console.log(data));
          }
        }

        if (event.type === Event.PlaybackState) {
          setPlaybackState(playbackState);
          console.log('ps:', playbackState);
        }
      }

      if (event.type === Event.PlaybackQueueEnded) {
        await AsyncStorage.removeItem('queue');
        await AsyncStorage.removeItem('activeTrackIndex');
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
            <NowPlaying nowPlayingRef={nowPlayingRef} />
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
