// * React
import React, {useEffect, useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';

// * React Native
import {StatusBar, useColorScheme} from 'react-native';

// * Libraries
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  DefaultTheme as RNLightTheme,
  DarkTheme as RNDarkTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {
  getBrand,
  getBuildNumber,
  getSystemVersion,
  getVersion,
} from 'react-native-device-info';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider, adaptNavigationTheme, useTheme} from 'react-native-paper';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BottomSheet from '@gorhom/bottom-sheet';
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

// * Components
import AddToPlaylist from './app/screens/AddToPlaylist';
import MainStack from './app/screens/MainStack';
import NowPlaying from './app/screens/NowPlaying';

// * Utils
import {darkTheme, lightTheme} from './app/utils';

// * Store
import {API_URL, SERVER_URL, usePlayerStore} from './app/store';

const Stack = createNativeStackNavigator();
const {DarkTheme, LightTheme} = adaptNavigationTheme({
  reactNavigationDark: RNDarkTheme,
  reactNavigationLight: RNLightTheme,
});

export const queryClient = new QueryClient();

let deviceInfo: string = '';
const info = {
  brand: getBrand(),
  build: getBuildNumber(),
  appVersion: getVersion(),
  sysVersion: getSystemVersion(),
};

function App(): React.JSX.Element {
  // ? Refs
  const ref = useRef<BottomSheet>(null);
  //const nowPlayingRef = useRef<BottomSheet>(null);

  //const isDarkMode = useColorScheme() === 'dark';
  const mode: string = useColorScheme() || 'light';

  const [root, setRoot] = useState('');

  // * Axios config
  axios.defaults.baseURL = API_URL;
  axios.defaults.timeout = 60000;
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  axios.defaults.headers.post['Accept'] = 'application/json';

  const progress = useProgress();
  const playbackState = usePlaybackState();
  const activeTrack = useActiveTrack();

  const nowPlayingRef = usePlayerStore(state => state.nowPlayingRef);
  const trackPlayCount = usePlayerStore(state => state.trackPlayCount);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const playRegistered = usePlayerStore(state => state.playRegistered);
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

  useEffect(() => {
    (async () => {
      try {
        await TrackPlayer.setupPlayer({
          autoHandleInterruptions: true,
        });

        await TrackPlayer.updateOptions({
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

        const savedQueue = await AsyncStorage.getItem('queue');
        const savedActiveTrackIndex = await AsyncStorage.getItem(
          'activeTrackIndex',
        );

        if (savedQueue) {
          const _queue = JSON.parse(savedQueue);
          setQueue(_queue);
          await TrackPlayer.setQueue(_queue);
          await TrackPlayer.skip(Number(savedActiveTrackIndex));
          openNowPlaying(ref);
          //openNowPlaying(nowPlayingRef);
        }
      } catch (err: any) {
        console.warn(err.message);
      }
    })();

    setNowPlayingRef(ref);
  }, []);

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
        }, 1000);
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
            .then(({data}) => console.log(data));
        }
      }

      if (event.type === Event.PlaybackState) {
        setPlaybackState(playbackState);
        console.log(playbackState);
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
        <Provider theme={mode === 'dark' ? darkTheme : lightTheme}>
          <SafeAreaProvider>
            <NavigationContainer
              theme={mode === 'dark' ? DarkTheme : LightTheme}>
              <Stack.Navigator initialRouteName={root}>
                <Stack.Screen
                  name="MainStack"
                  component={MainStack}
                  options={{headerShown: false}}
                />

                {/* <Stack.Group screenOptions={{presentation: 'modal'}}>
                  <Stack.Screen
                    name="NowPlaying"
                    component={NowPlaying}
                    options={{
                      headerShown: false,
                      gestureEnabled: true,
                      gestureDirection: 'vertical',
                    }}
                  />
                </Stack.Group> */}

                {/* <Stack.Screen
                    name="AddToPlaylist"
                    component={AddToPlaylist}
                    options={{
                      title: 'Add to playlist',
                      headerTransparent: true,
                    }}
                  /> */}
              </Stack.Navigator>
            </NavigationContainer>

            <NowPlaying nowPlayingRef={nowPlayingRef} />
          </SafeAreaProvider>
        </Provider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;
