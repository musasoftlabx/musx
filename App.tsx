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
import {URL, useAuthStore, useConfigStore, usePlayerStore} from './app/store';
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

  const config = useConfigStore((state: {config: any}) => state.config);

  const trackChange = usePlayerStore(state => state.trackChange);
  const restoreSavedQueue = usePlayerStore(state => state.restoreSavedQueue);

  useEffect(() => {
    //console.log(URL());
    // ? Axios
    const Axios = axios.create({
      baseURL: URL(),
      timeout: 10000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Axios.interceptors.request.use(
    //   (req: any) => {
    //     req.headers.Authorization = `Bearer ${token}`;
    //     req.headers.DeviceInfo = deviceInfo;
    //     return req;
    //   },
    //   err => Promise.reject(err),
    // );

    // Axios.interceptors.response.use(
    //   (res: any) => {
    //     res.data.__aT && login(res.data.__aT);
    //     return res;
    //   },
    //   err => {
    //     if (err.code === 'ERR_NETWORK') {
    //       Alert.alert(
    //         err.message,
    //         'We could not establish a connection to the server. Kindly ensure you are connected.',
    //         [{onPress: () => {}, text: 'OK'}, {text: 'Cancel'}],
    //       );
    //     } else {
    //       err.response.data.forceLogout && logout() /* router.push("/login") */;
    //     }
    //     return Promise.reject(err);
    //   },
    // );

    //restore();
    config(Axios);
    //configTheme(mode);

    return () => {};
  }, []);

  useEffect(() => {
    const setUpTrackPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          android: {
            appKilledPlaybackBehavior:
              AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          },
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
    [Event.PlaybackActiveTrackChanged],
    async event =>
      event.type === Event.PlaybackActiveTrackChanged && trackChange(event),
  );

  useTrackPlayerEvents([Event.PlaybackState], async (event: any) => {
    if (event.type === Event.PlaybackState) {
      //console.log('PlaybackState', event);
    }
  });

  useTrackPlayerEvents([Event.PlaybackQueueEnded], event => {
    console.log('Queue ended');
  });

  return (
    <GestureHandlerRootView style={{flex: 1}}>
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
