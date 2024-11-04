/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

// import TrackPlayer, {
//   Capability,
//   useTrackPlayerEvents,
//   Event,
//   State,
// } from 'react-native-track-player';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider, adaptNavigationTheme, useTheme} from 'react-native-paper';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import axios from 'axios';
import {
  DefaultTheme as RNLightTheme,
  DarkTheme as RNDarkTheme,
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';

import MainStack from './app/screens/MainStack';
import NowPlaying from './app/screens/NowPlaying';
import AddToPlaylist from './app/screens/AddToPlaylist';
import {darkTheme, lightTheme} from './app/utils';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  API_URL,
  SERVER_URL,
  URL,
  useAuthStore,
  useConfigStore,
  usePlayerStore,
} from './app/store';
import {
  getBrand,
  getBuildNumber,
  getCarrier,
  getLastUpdateTime,
  getSystemVersion,
  getVersion,
} from 'react-native-device-info';

import {GestureHandlerRootView} from 'react-native-gesture-handler';
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  useTrackPlayerEvents,
  Event,
  State,
  usePlaybackState,
  useActiveTrack,
  usePlayWhenReady,
  useProgress,
  RepeatMode,
  Track,
} from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

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
  //const isDarkMode = useColorScheme() === 'dark';
  const mode: string = useColorScheme() || 'light';

  const [root, setRoot] = useState('');

  // const backgroundStyle = {
  //   backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  // };

  // * Axios config
  axios.defaults.baseURL = API_URL;
  axios.defaults.timeout = 60000;
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  axios.defaults.headers.post['Accept'] = 'application/json';

  const activeTrack = useActiveTrack();
  const playwhenready = usePlayWhenReady();
  const progress = useProgress();
  const playbackState = usePlaybackState();

  const config = useConfigStore((state: {config: any}) => state.config);

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
  const setArtworkQueue = usePlayerStore(state => state.setArtworkQueue);
  const setCarouselQueue = usePlayerStore(state => state.setCarouselQueue);
  const setTrackRating = usePlayerStore(state => state.setTrackRating);
  const setTrackPlayCount = usePlayerStore(state => state.setTrackPlayCount);
  const setLyrics = usePlayerStore(state => state.setLyrics);
  const setLyricsVisible = usePlayerStore(state => state.setLyricsVisible);

  //const isPlaying = playerState === State.Playing;

  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);

  useEffect(() => {
    const setUpTrackPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer();
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

        if (savedQueue) {
          const queue = JSON.parse(savedQueue);

          //await TrackPlayer.load(queue[0]);
          await TrackPlayer.setQueue(queue);
          //await TrackPlayer.setQueue(queue.slice(1));
          //console.log(queue.slice(1));

          setRoot('NowPlaying');
        } else {
          setRoot('MainStack');
        }

        //restoreSavedQueue();
        // await TrackPlayer.getQueue().then(tracks =>
        //   console.log('lext:', tracks.length),
        // );

        // const savedQueue = await AsyncStorage.getItem('queue');
        // if (savedQueue) {
        //   const queue = JSON.parse(savedQueue);
        //   await TrackPlayer.add(queue);
        //   restoreSavedQueue({
        //     currentTrack: queue[0],
        //     nextTracks: queue.unshift(),
        //   });
        // }

        // restoreSavedQueue({
        //   currentTrack: queue[0],
        //   nextTracks: queue.unshift(),
        // })
      } catch (e) {
        console.log(e);
      }
    };
    setUpTrackPlayer();
  }, []);

  useTrackPlayerEvents(
    [
      Event.PlaybackActiveTrackChanged,
      Event.PlaybackProgressUpdated,
      Event.PlaybackState,
    ],
    async event => {
      if (event.type === Event.PlaybackActiveTrackChanged) {
        setPlayRegistered(false);

        const _queue = await TrackPlayer.getQueue();
        const _activeTrackIndex = await TrackPlayer.getActiveTrackIndex();
        const _artworkQueue = _queue.map((track: Track['']) => track.artwork);

        setActiveTrackIndex(_activeTrackIndex);
        setActiveTrack(activeTrack);
        setQueue(_queue);
        setArtworkQueue(_artworkQueue);

        setProgress(progress);
        // setCarouselQueue([
        //   ..._artworkQueue.slice(
        //     _activeTrackIndex! - 1,
        //     _activeTrackIndex! + 2,
        //   ),
        // ]);
        setCarouselQueue([
          ..._artworkQueue.slice(_activeTrackIndex! - 1, _activeTrackIndex),
          ..._artworkQueue.slice(_activeTrackIndex, _activeTrackIndex! + 2),
        ]);

        setTrackRating(activeTrack?.rating);
        setTrackPlayCount(activeTrack?.plays);

        axios
          .get(
            `${SERVER_URL}/Music/${activeTrack?.path.replace('.mp3', '.lrc')}`,
          )
          .then(({data: lyrics}) => {
            setLyrics(lyrics);
            setLyricsVisible(true);
          })
          .catch(() => {
            setLyrics(null);
            setLyricsVisible(false);
          });

        await AsyncStorage.setItem('queue', JSON.stringify(_queue));
      }

      if (event.type === Event.PlaybackProgressUpdated) {
        setProgress(progress);

        if (progress.position >= 10 && playRegistered === false) {
          setPlayRegistered(true);
          setTrackPlayCount(trackPlayCount + 1);
          TrackPlayer.updateMetadataForTrack(activeTrackIndex!, {
            ...activeTrack,
            plays: activeTrack?.plays! + 1,
          } as Track);
          // updatePlayCount(
          //   {id: activeTrack?.id},
          //   {onSuccess: ({data}) => console.log(data)},
          // );
          axios
            .patch('updatePlayCount', {id: activeTrack?.id})
            .then(({data}) => console.log(data));
        }
      }

      if (event.type === Event.PlaybackState) {
        setPlaybackState(playbackState);
        console.log(playbackState);
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
              {/* <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          /> */}
              <Stack.Navigator initialRouteName={root}>
                <Stack.Screen
                  name="MainStack"
                  component={MainStack}
                  options={{headerShown: false}}
                />

                {/* <Stack.Screen
                  name="NowPlaying"
                  component={NowPlaying}
                  options={{
                    headerShown: false,
                    gestureEnabled: true,
                    gestureDirection: 'vertical',
                  }}
                /> */}

                <Stack.Group screenOptions={{presentation: 'modal'}}>
                  <Stack.Screen
                    name="NowPlaying"
                    component={NowPlaying}
                    options={{
                      headerShown: false,
                      gestureEnabled: true,
                      gestureDirection: 'vertical',
                    }}
                  />
                </Stack.Group>
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
          </SafeAreaProvider>
        </Provider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;
