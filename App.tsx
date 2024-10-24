/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
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

import TrackPlayer from 'react-native-track-player';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider, adaptNavigationTheme, useTheme} from 'react-native-paper';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import axios from 'axios';
import {
  DefaultTheme as RNLightTheme,
  DarkTheme as RNDarkTheme,
  NavigationContainer,
} from '@react-navigation/native';

import MainStack from './app/screens/MainStack';
import NowPlaying from './app/screens/NowPlaying';
import AddToPlaylist from './app/screens/AddToPlaylist';
import {darkTheme, lightTheme} from './app/utils';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {URL, useAuthStore, useConfigStore} from './app/store';
import {
  getBrand,
  getBuildNumber,
  getCarrier,
  getLastUpdateTime,
  getSystemVersion,
  getVersion,
} from 'react-native-device-info';

import {GestureHandlerRootView} from 'react-native-gesture-handler';

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

  // const backgroundStyle = {
  //   backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  // };

  const config = useConfigStore((state: {config: any}) => state.config);

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

    init();

    return () => {};
  }, []);

  async function init() {
    await TrackPlayer.setupPlayer();

    await TrackPlayer.add([
      {
        url: 'http://75.119.137.255/Music/Botswana/Vee%20Mampeezy/U%20Kondelela.mp3', // Load media from the network
        title: 'U Kondelela',
        artist: 'Vee Mampeezy',
        album: 'U Kondelela',
        genre: 'Progressive House, Electro House',
        date: '2014-05-20T07:00:00+00:00', // RFC 3339
        artwork:
          'http://75.119.137.255/Music/Botswana/Vee%20Mampeezy/artist.jpg', // Load artwork from the network
        duration: 402,
      },
    ]);

    //TrackPlayer.play();
  }

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
              <Stack.Navigator>
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
            <Stack.Screen
              name="AddToPlaylist"
              component={AddToPlaylist}
              options={{
                title: 'Add to playlist',
                headerTransparent: true,
              }}
            />
          </Stack.Group> */}
              </Stack.Navigator>
            </NavigationContainer>
          </SafeAreaProvider>
        </Provider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;
