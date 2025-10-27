// * React
import React, { useCallback, useEffect, useRef } from 'react';

// * React Native
import { Alert, StatusBar } from 'react-native';

// * Libraries
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { setThemePreference } from '@vonovak/react-native-theme-control';
import GoogleCast, {
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
  useProgress,
  Track,
  RatingType,
  useActiveTrack,
} from 'react-native-track-player';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet from '@gorhom/bottom-sheet';
import axios, { AxiosError } from 'axios';
import Sound from 'react-native-sound';

// * Navigators
import TabNavigator from './app/navigators/TabNavigator';

// * Utils
import { darkTheme, ReactNavigationDarkTheme } from './app/utils';

// * Store
import { API_URL, AUDIO_URL, usePlayerStore } from './app/store';

// * Types
import { TrackProps } from './app/types';

// * Functions
import { refreshScreens } from './app/functions';

// * Components
import TrackDetails from './app/components/TrackDetails';

// * Screens
import NowPlaying from './app/screens/NowPlaying';
import tinycolor from 'tinycolor2';
import PlaylistDetails from './app/components/PlaylistDetails';

// * Constants
export const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();

// ? Axios config
axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 60000;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';

// ? Always force dark mode
setThemePreference('dark'); // 'light', 'dark', or 'system'

// ? Setup Track Player
//TrackPlayer.setupPlayer({ autoHandleInterruptions: true });

// ? Remove track items in storage
//AsyncStorage.removeItem('queue');
//AsyncStorage.removeItem('activeTrackIndex');

export default function App(): React.JSX.Element {
  // ? Refs
  const nowPlayingRef = useRef<BottomSheet>(null);
  const trackDetailsRef = useRef<BottomSheet>(null);
  const playlistDetailsRef = useRef<BottomSheet>(null);

  // ? Hooks
  const activeTrack = useActiveTrack();
  const castClient = useRemoteMediaClient();
  const castMediaStatus = useMediaStatus();
  const castState = useCastState();
  const castSession = useCastSession();
  const progress = useProgress();
  const streamPosition = useStreamPosition();
  const sessionManager = GoogleCast.getSessionManager();

  // ? Store States
  const _activeTrack = usePlayerStore(state => state.activeTrack);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const bitrate = usePlayerStore(state => state.bitrate);
  const isCrossFading = usePlayerStore(state => state.isCrossFading);
  const playRegistered = usePlayerStore(state => state.playRegistered);
  const queue = usePlayerStore(state => state.queue);
  const activePlaylist = usePlayerStore(state => state.activePlaylist);
  const streamViaHLS = usePlayerStore(state => state.streamViaHLS);
  const trackDetails = usePlayerStore(state => state.trackDetails);

  // ? Store Actions
  const openNowPlaying = usePlayerStore(state => state.openNowPlaying);
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
  const setTrackDetailsRef = usePlayerStore(state => state.setTrackDetailsRef);
  const setPlaylistDetailsRef = usePlayerStore(
    state => state.setPlaylistDetailsRef,
  );
  const setNowPlayingRef = usePlayerStore(state => state.setNowPlayingRef);
  const setCastState = usePlayerStore(state => state.setCastState);
  const setCastClient = usePlayerStore(state => state.setCastClient);
  const setStreamViaHLS = usePlayerStore(state => state.setStreamViaHLS);
  const setBitrate = usePlayerStore(state => state.setBitrate);

  // ? Functions
  const fetchLyrics = (url: string) => {
    axios(url)
      .then(({ data: lyrics }) => {
        setLyrics(lyrics);
        setLyricsVisible(true);
      })
      .catch(() => {
        setLyrics('');
        setLyricsVisible(false);
      });
  };

  const transcode = (path: string, duration: number) => {
    axios(
      `${API_URL}transcode?path=${path}&duration=${duration}&bitrate=${bitrate}`,
    ).catch((error: AxiosError) =>
      console.log('Transcode Error:', error.message),
    );
  };

  // ? Effects
  useEffect(() => {
    setNowPlayingRef(nowPlayingRef); // ? Set Now Playing Ref
    setTrackDetailsRef(trackDetailsRef); // ? Set Track Details Ref
    setPlaylistDetailsRef(playlistDetailsRef); // ? Set Playlist Details Ref

    (async () => {
      // ? Update Track Player options
      TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior:
            AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          stopForegroundGracePeriod: 60 * 60,
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
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
      });

      //await sessionManager.endCurrentSession();

      // ? Retrieve streamViaHLS
      const streamViaHLS = await AsyncStorage.getItem('streamViaHLS');
      if (!streamViaHLS) setStreamViaHLS(false);
      else setStreamViaHLS(Boolean(streamViaHLS));

      // ? Retrieve bitrate
      const bitrate = await AsyncStorage.getItem('bitrate');
      if (!bitrate) setBitrate('Max');
      else setBitrate(bitrate);

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

      // ? Retrieve active track
      const storedActiveTrack = await AsyncStorage.getItem('activeTrack');
      if (storedActiveTrack)
        setPalette(JSON.parse(JSON.parse(storedActiveTrack).palette));
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
        const { mediaInfo } = status as MediaStatus;
        const { customData } = mediaInfo as MediaInfo;
        const { id, rating, plays, palette, duration, path } =
          customData as TrackProps;

        // ? Invoke transcoder to transcode the file to HLS chunks
        streamViaHLS && transcode(path, duration);

        // ? Save variables to store to be accessed by components
        setLyricsVisible(false);
        setPlayRegistered(false);
        setActiveTrack(customData as TrackProps);
        setTrackRating(rating);
        setTrackPlayCount(plays);
        setProgress({ position: 0, buffered: 0, duration });

        // ? Compute palette colors
        setPalette(
          JSON.parse(palette).map((color: string) => {
            const brightness = tinycolor(color).getBrightness();
            if (brightness >= 150)
              return `#${tinycolor(color).darken(50).toHex()}`;
            else return color;
          }),
        );

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
      setPlaybackState({ state: castMediaStatus?.playerState });

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
          .then(({ data: { plays } }) => {
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
      Event.PlayerError,
    ],
    event => {
      if (!castSession) {
        if (event.type === Event.PlaybackActiveTrackChanged) {
          // ? Deconstruct (event) to get track object
          const { track } = event;

          // ? Invoke transcoder to transcode the file to HLS chunks
          streamViaHLS && transcode(track?.path, track?.duration!);

          // ? Clear previous track rating & progress
          setTrackRating(0);
          setProgress({
            position: 0,
            buffered: 0,
            duration: track?.duration!,
          });

          // ? Set track info
          setActiveTrack(track);
          //setActiveTrackIndex(track?.position);
          setTrackRating(track?.rating);
          setTrackPlayCount(track?.plays);

          // ? Set extra player details
          setLyricsVisible(false);
          setPlayRegistered(false);
          setIsCrossFading(false);

          // ? Compute palette colors
          const palette = JSON.parse(track?.palette).map((color: string) => {
            const brightness = tinycolor(color).getBrightness();
            if (brightness >= 150)
              return `#${tinycolor(color).darken(50).toHex()}`;
            else return color;
          });

          // ? Set palette on UI
          setPalette(palette);

          // ? Get active track lyrics. Display the lyrics if found else display artwork
          fetchLyrics(`${AUDIO_URL}${track?.path.replace('.mp3', '.lrc')}`);

          // ? Store active track on storage to retrieve when app closes
          AsyncStorage.setItem('activeTrack', JSON.stringify(track));

          TrackPlayer.getActiveTrackIndex().then(i => {
            setActiveTrackIndex(i);
            AsyncStorage.setItem('activeTrackIndex', i!.toString()); // ? Store the active track index to restore state incase the app crashes or is dismissed
          });
        }

        if (event.type === Event.PlaybackProgressUpdated) {
          // ? Deconstruct (event) to get track object
          const { position, buffered, duration, track } = event;

          // ? Set progress to store
          setProgress({ position, buffered, duration });

          if (position >= 10 && playRegistered === false) {
            setPlayRegistered(true);

            // ? Update the active track play count
            axios
              .patch('updatePlayCount', { id: activeTrack?.id })
              .then(({ data: { plays } }) => {
                setTrackPlayCount(plays);
                TrackPlayer.updateMetadataForTrack(track, {
                  ...activeTrack,
                  plays,
                } as Track);

                refreshScreens(activeTrack as TrackProps, activePlaylist);
              })
              .catch(error => console.log('Update Play Count Error:', error));

            // ? Transcode the next track if HLS is enabled
            if (streamViaHLS && queue.length > 1) {
              const currentIndex = queue.findIndex(
                track => track.id === activeTrack?.id,
              );

              transcode(
                queue[currentIndex + 1].path,
                queue[currentIndex + 1].duration!,
              );
            }
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
          setPlaybackState({ state: event.state });
        }

        if (event.type === Event.PlaybackQueueEnded) {
          AsyncStorage.removeItem('queue');
          AsyncStorage.removeItem('activeTrackIndex');
        }

        if (event.type === Event.PlayerError) {
          Alert.alert(`Playback error ${event.code}`, event.message);
        }
      }
    },
  );

  // const RenderApp = useCallback(
  //   () => (
  //     <GestureHandlerRootView style={{ flex: 1 }}>
  //       <StatusBar
  //         animated
  //         backgroundColor="transparent"
  //         barStyle="light-content"
  //         translucent
  //       />

  //       <QueryClientProvider client={queryClient}>
  //         <PaperProvider theme={darkTheme}>
  //           <SafeAreaProvider>
  //             <NavigationContainer theme={ReactNavigationDarkTheme}>
  //               <Stack.Navigator>
  //                 <Stack.Screen
  //                   name="TabNavigator"
  //                   component={TabNavigator}
  //                   options={{ headerShown: false }}
  //                 />
  //               </Stack.Navigator>
  //               <PlaylistDetails playlistDetailsRef={playlistDetailsRef} />
  //               <TrackDetails trackDetailsRef={trackDetailsRef} />
  //               <NowPlaying />
  //             </NavigationContainer>
  //           </SafeAreaProvider>
  //         </PaperProvider>
  //       </QueryClientProvider>
  //     </GestureHandlerRootView>
  //   ),
  //   [],
  // );

  // return RenderApp();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        animated
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />

      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={darkTheme}>
          <SafeAreaProvider>
            <NavigationContainer theme={ReactNavigationDarkTheme}>
              <Stack.Navigator>
                <Stack.Screen
                  name="TabNavigator"
                  component={TabNavigator}
                  options={{ headerShown: false }}
                />
              </Stack.Navigator>
              <PlaylistDetails playlistDetailsRef={playlistDetailsRef} />
              <TrackDetails trackDetailsRef={trackDetailsRef} />
              <NowPlaying />
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
