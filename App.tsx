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
import {
  MediaInfo,
  MediaPlayerState,
  MediaStatus,
  useCastSession,
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
  RatingType,
} from 'react-native-track-player';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PaperProvider, adaptNavigationTheme} from 'react-native-paper';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BottomSheet from '@gorhom/bottom-sheet';
import Sound from 'react-native-sound';

// * Screens
import TabNavigator from './app/navigators/TabNavigator';

// * Utils
import {darkTheme} from './app/utils';

// * Store
import {API_URL, AUDIO_URL, usePlayerStore} from './app/store';

// * Constants
export const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();
const {DarkTheme} = adaptNavigationTheme({
  reactNavigationDark: RNDarkTheme,
  reactNavigationLight: RNLightTheme,
});

// ? Axios config
axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 60000;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';

// ? Always force dark mode
Appearance.setColorScheme('dark');

// ? Setup Track Player
TrackPlayer.setupPlayer({autoHandleInterruptions: true});

//AsyncStorage.removeItem('queue');
//AsyncStorage.removeItem('activeTrackIndex');

export default function App(): React.JSX.Element {
  // ? Refs
  const nowPlayingRef = useRef<BottomSheet>(null);
  const trackDetailsRef = useRef<BottomSheet>(null);

  // ? Hooks
  const activeTrack = useActiveTrack();
  const castClient = useRemoteMediaClient();
  const castMediaStatus = useMediaStatus();
  const castState = useCastState();
  const castSession = useCastSession();
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const streamPosition = useStreamPosition();

  // ? StoreStates
  const _activeTrack = usePlayerStore(state => state.activeTrack);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const isCrossFading = usePlayerStore(state => state.isCrossFading);
  const playRegistered = usePlayerStore(state => state.playRegistered);
  const queue = usePlayerStore(state => state.queue);
  const streamViaHLS = usePlayerStore(state => state.streamViaHLS);

  // ? StoreActions
  const play = usePlayerStore(state => state.play);
  const setPlaybackState = usePlayerStore(state => state.setPlaybackState);
  const setProgress = usePlayerStore(state => state.setProgress);
  const setPlayRegistered = usePlayerStore(state => state.setPlayRegistered);
  const setActiveTrack = usePlayerStore(state => state.setActiveTrack);
  const setActiveTrackIndex = usePlayerStore(
    state => state.setActiveTrackIndex,
  );
  const setIsCrossFading = usePlayerStore(state => state.setIsCrossFading);
  const setQueue = usePlayerStore(state => state.setQueue);
  const setTrackRating = usePlayerStore(state => state.setTrackRating);
  const setTrackPlayCount = usePlayerStore(state => state.setTrackPlayCount);
  const setPalette = usePlayerStore(state => state.setPalette);
  const setLyrics = usePlayerStore(state => state.setLyrics);
  const setLyricsVisible = usePlayerStore(state => state.setLyricsVisible);
  const openNowPlaying = usePlayerStore(state => state.openNowPlaying);
  const setTrackDetailsRef = usePlayerStore(state => state.setTrackDetailsRef);
  const setNowPlayingRef = usePlayerStore(state => state.setNowPlayingRef);
  const setCastState = usePlayerStore(state => state.setCastState);
  const setCastClient = usePlayerStore(state => state.setCastClient);
  const setStreamViaHLS = usePlayerStore(state => state.setStreamViaHLS);

  // ? Functions
  const fetchLyrics = (url: string) => {
    axios(url)
      .then(({data: lyrics}) => {
        setLyrics(lyrics);
        setLyricsVisible(true);
      })
      .catch(() => {
        setLyrics('');
        setLyricsVisible(false);
      });
  };

  const transcode = () => {
    axios(
      `${API_URL}transcode?path=${activeTrack!.path}&duration=${
        activeTrack?.duration
      }&bitrate=`,
    ).catch(() => {});
  };

  // ? Effects
  useEffect(() => {
    setNowPlayingRef(nowPlayingRef); // ? Set Now Playing Ref
    setTrackDetailsRef(trackDetailsRef); // ? Set Track Details Ref

    (async () => {
      // ? Update Track Player options
      TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior:
            AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          alwaysPauseOnInterruption: true,
        },
        progressUpdateEventInterval: 1,
        ratingType: RatingType.FiveStars,
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.Stop,
          Capability.SeekTo,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.Stop,
          Capability.SeekTo,
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
      });

      const streamViaHLS = AsyncStorage.getItem('streamViaHLS');
      setStreamViaHLS(Boolean(streamViaHLS));

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
        openNowPlaying(nowPlayingRef);
      }
    })();
  }, []);

  useEffect(() => {
    if (castSession) {
      setCastState(castState);
      setCastClient(castClient);
      if (queue.length > 0) play(queue, _activeTrack, progress.position);
    }
  }, [castSession]);

  useEffect(() => {
    if (castMediaStatus?.currentItemId) {
      castClient?.getMediaStatus().then(status => {
        const {mediaInfo} = status as MediaStatus;
        const {contentUrl, customData} = mediaInfo as MediaInfo;
        const {id, rating, plays, palette, duration, path} = customData as any;

        // ? Invoke transcoder to transcode the file to HLS chunks
        streamViaHLS && transcode();

        // ? Save variables to store to be accessed by components
        setLyricsVisible(false);
        setPlayRegistered(false);
        setActiveTrack(customData as any);
        setTrackRating(rating);
        setTrackPlayCount(plays);
        setPalette(palette);
        setProgress({position: 0, buffered: 0, duration});

        // ? Get active track lyrics. Display the lyrics if found else display artwork
        fetchLyrics(`${AUDIO_URL}${path.replace('.mp3', '.lrc')}`);

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
          // ? Invoke transcoder to transcode the file to HLS chunks
          streamViaHLS && transcode();

          // ? Save variables to store to be accessed by components
          setLyricsVisible(false);
          setPlayRegistered(false);
          setIsCrossFading(false);
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
          fetchLyrics(
            `${AUDIO_URL}${activeTrack!.path.replace('.mp3', '.lrc')}`,
          );

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

            return false;
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

          // if (
          //   progress.duration >= 20 &&
          //   progress.duration - progress.position <= 20 &&
          //   !isCrossFading
          // ) {
          //   setIsCrossFading(true);

          //   const crossfader = new Sound(
          //     queue[activeTrackIndex + 1].url,
          //     Sound.MAIN_BUNDLE,
          //     e => {
          //       if (e) {
          //         TrackPlayer.skipToNext();
          //         console.log('failed to load the sound', e);
          //         return;
          //       }

          //       crossfader.setVolume(0);
          //       crossfader.play();

          //       let fadeOutInterval = setInterval(async () => {
          //         const currentTrackVolume = await TrackPlayer.getVolume();
          //         const crossfaderVolume = crossfader.getVolume();

          //         await TrackPlayer.setVolume(currentTrackVolume - 0.1);
          //         crossfader.setVolume(crossfaderVolume + 0.1);

          //         if (currentTrackVolume <= 0) {
          //           crossfader.getCurrentTime(async seconds => {
          //             await TrackPlayer.skipToNext();
          //             await TrackPlayer.seekTo(seconds + 1.8);
          //             clearInterval(fadeOutInterval);

          //             let fadeInInterval = setInterval(async () => {
          //               await TrackPlayer.setVolume(
          //                 (await TrackPlayer.getVolume()) + 0.5,
          //               );

          //               crossfader.setVolume(crossfader.getVolume() - 0.3);

          //               if (crossfader.getVolume() <= 0) {
          //                 await TrackPlayer.setVolume(1);
          //                 crossfader.stop();
          //                 clearInterval(fadeInInterval);
          //                 crossfader.release();
          //               }
          //             }, 1000);
          //           });
          //         }
          //       }, 1000);
          //     },
          //   );
          // }
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
