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
  CastState,
  MediaInfo,
  MediaPlayerState,
  MediaStatus,
  useCastSession,
  useCastState,
  useDevices,
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
  RatingType,
} from 'react-native-track-player';

// * Screens
import NowPlaying from './app/screens/NowPlaying';
import TabNavigator from './app/navigators/TabNavigator';

// * Utils
import {darkTheme} from './app/utils';

// * Store
import {
  API_URL,
  ARTWORK_URL,
  SERVER_URL,
  usePlayerStore,
  WAVEFORM_URL,
} from './app/store';
import {TrackProps} from './app/types';

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
  const castMediaStatus = useMediaStatus();
  const castState = useCastState();
  const castSession = useCastSession();
  const streamPosition = useStreamPosition();
  const currentAppState = useAppState();

  // ? StoreStates
  const _activeTrack = usePlayerStore(state => state.activeTrack);
  const queue = usePlayerStore(state => state.queue);
  const nowPlayingRef = usePlayerStore(state => state.nowPlayingRef);
  const trackPlayCount = usePlayerStore(state => state.trackPlayCount);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const playRegistered = usePlayerStore(state => state.playRegistered);

  // ? StoreActions
  const play = usePlayerStore(state => state.play);
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
          progressUpdateEventInterval: 1,
          //ratingType: RatingType.Heart,
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
            //Capability.SeekTo,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
            //Capability.SeekTo,
          ],
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            //Capability.SeekTo,
          ],
        });

        const playPosition = await AsyncStorage.getItem('playPosition');
        const savedQueue = await AsyncStorage.getItem('queue');
        const savedActiveTrackIndex = await AsyncStorage.getItem(
          'activeTrackIndex',
        );

        if (savedQueue) {
          const _queue = JSON.parse(savedQueue);

          if (!castSession) {
            await TrackPlayer.setQueue(_queue);
            await TrackPlayer.skip(Number(savedActiveTrackIndex));
            playPosition && TrackPlayer.seekTo(Number(playPosition));
          }

          setQueue(_queue);
          setActiveTrackIndex(Number(savedActiveTrackIndex));
          openNowPlaying(ref);
        }
      } catch (err: any) {
        console.log('Setup Player Error:', err.message);
      }
    })();
  }, []);

  useEffect(() => {
    if (castSession) {
      setCastState(castState);
      setCastClient(castClient);
      if (queue.length > 0)
        play(
          queue.slice(activeTrackIndex).map(track => ({
            ...track,
            artwork: track.artwork,
            waveform: track.waveform,
          })),
          _activeTrack,
          progress.position,
        );
    }
  }, [castSession]);

  useEffect(() => {
    if (castMediaStatus?.currentItemId) {
      castClient?.getMediaStatus().then(status => {
        const {mediaInfo} = status as MediaStatus;
        const {contentUrl, customData} = mediaInfo as MediaInfo;
        const {id, rating, plays, palette, duration} = customData as any;

        // ? Save variables to store to be accessed by components
        setLyricsVisible(false);
        setPlayRegistered(false);
        setActiveTrack(customData as any);
        setTrackRating(rating);
        setTrackPlayCount(plays);
        setPalette(palette);
        setProgress({position: 0, buffered: 0, duration});

        // ? Get active track lyrics. Display the lyrics if found else display artwork
        fetchLyrics(contentUrl);

        // ? Get the active track index
        const activeTrackIndex = queue.findIndex(track => track.id === id);

        // ? Set the track index
        setActiveTrackIndex(activeTrackIndex);

        // ? Store the queue and the active track index to restore state incase the app crashes or is dismissed
        AsyncStorage.setItem('activeTrackIndex', activeTrackIndex.toString());
      });
    }
  }, [castMediaStatus?.currentItemId]);

  useEffect(() => {
    if (castMediaStatus) {
      setPlaybackState({state: castMediaStatus?.playerState});

      console.log('cms;', castMediaStatus?.playerState);

      if (castMediaStatus?.playerState === MediaPlayerState.PLAYING)
        TrackPlayer.stop();

      if (castMediaStatus?.playerState === MediaPlayerState.IDLE) {
        TrackPlayer.pause();
        TrackPlayer.setQueue(queue).then(() =>
          TrackPlayer.skip(activeTrackIndex),
        );
      }
    }
  }, [castMediaStatus?.playerState]);

  useEffect(() => {
    if (castSession && streamPosition) {
      setProgress({
        position: streamPosition,
        buffered: 0,
        duration: castMediaStatus?.mediaInfo?.streamDuration as number,
      });

      if (streamPosition >= 10 && playRegistered === false) {
        setPlayRegistered(true);

        axios
          .patch('updatePlayCount', {
            // @ts-ignore
            id: castMediaStatus?.mediaInfo?.customData?.id,
          })
          .then(({data: {plays}}) => {
            setTrackPlayCount(plays);
            // const updateQueued = queue.map(track =>
            //   // @ts-ignore
            //   track.id === castMediaStatus?.mediaInfo?.customData?.id
            //     ? {...track, data}
            //     : track,
            // );
            // setQueue(updateQueued);
            // AsyncStorage.setItem('queue', JSON.stringify(updateQueued));
          })
          .catch(error => console.log(error));
      }
    }
  }, [streamPosition]);

  useEffect(() => {
    if (currentAppState !== 'active')
      AsyncStorage.setItem('playPosition', progress.position.toString());
  }, [currentAppState]);

  useTrackPlayerEvents(
    [
      Event.PlaybackActiveTrackChanged,
      Event.PlaybackProgressUpdated,
      Event.PlaybackState,
      Event.PlaybackQueueEnded,
    ],
    event => {
      if (!castSession) {
        if (event.type === Event.PlaybackActiveTrackChanged) {
          // ? Save variables to store to be accessed by components
          setLyricsVisible(false);
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

          fetchLyrics(activeTrack?.path); // ? Get active track lyrics. Display the lyrics if found else display artwork

          TrackPlayer.getActiveTrackIndex().then(i => {
            setActiveTrackIndex(i);
            AsyncStorage.setItem('activeTrackIndex', i!.toString()); // ? Store the active track index to restore state incase the app crashes or is dismissed
          });

          TrackPlayer.getQueue().then(queue => {
            setQueue(queue);
            AsyncStorage.setItem('queue', JSON.stringify(queue)); // ? Store the queue to restore state incase the app crashes or is dismissed
          });
        }

        if (event.type === Event.PlaybackProgressUpdated) {
          setProgress(progress);

          if (progress.position >= 10 && playRegistered === false) {
            setPlayRegistered(true);

            axios
              .patch('updatePlayCount', {id: activeTrack?.id})
              .then(({data: {plays}}) => {
                setTrackPlayCount(plays);
                TrackPlayer.updateMetadataForTrack(activeTrackIndex!, {
                  ...activeTrack,
                  plays,
                } as Track);
              })
              .catch(error => console.log(error));
          }
        }

        if (event.type === Event.PlaybackState) {
          setPlaybackState(playbackState);
          console.log('trackplayer:', playbackState);
        }

        if (event.type === Event.PlaybackQueueEnded) {
          AsyncStorage.removeItem('queue');
          AsyncStorage.removeItem('activeTrackIndex');
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
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
