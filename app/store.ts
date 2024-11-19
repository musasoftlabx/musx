// * React Native
import {Dimensions, Platform, Vibration} from 'react-native';

// * React Native Libraries
import AsyncStorage from '@react-native-async-storage/async-storage';
//import {MMKV} from 'react-native-mmkv';
import Sound from 'react-native-sound';
import tinycolor from 'tinycolor2';

// * JS Libraries
import axios, {AxiosInstance} from 'axios';
import dayjs from 'dayjs';
import {create} from 'zustand';
import TrackPlayer, {State, Track} from 'react-native-track-player';
import {useNavigation} from '@react-navigation/native';
import {TrackProps} from './types';
import BottomSheet from '@gorhom/bottom-sheet';

//export const storage = new MMKV();

interface IAuthStore {
  token?: string | null;
  loading?: boolean;
  restore: () => void;
  login: (token: string) => void;
  logout: () => void;
}

interface IPlayerStore {
  playbackState: any;
  progress: any;
  activeTrack: any;
  queue: Track[];
  artworkQueue: string[];
  carouselQueue: string[];
  activeTrackIndex: number;
  trackRating: number;
  trackPlayCount: number;
  playRegistered: boolean;
  lyricsVisible: boolean;
  lyrics: null | string;
  palette: string[];
  nowPlayingRef: BottomSheet | null;
  castState: any;
  castClient: any;
  setProgress: (queue: {
    position: number;
    buffered: number;
    duration: number;
  }) => void;
  setPlaybackState: (playbackState: any) => void;
  setQueue: (queue: Track[]) => void;
  setArtworkQueue: (artworkQueue: string[]) => void;
  setCarouselQueue: (carouselQueue: string[]) => void;
  setActiveTrack: (activeTrack?: Track) => void;
  setActiveTrackIndex: (activeTrackIndex?: number) => void;
  setTrackRating: (trackRating?: number) => void;
  setTrackPlayCount: (trackPlayCount: number) => void;
  setPlayRegistered: (playRegistered: boolean) => void;
  setPalette: (palette: string[]) => void;
  setLyricsVisible: (lyricsVisible: boolean) => void;
  setLyrics: (lyrics: null | string) => void;
  openNowPlaying: (nowPlayingRef: BottomSheet | {}) => void;
  closeNowPlaying: (nowPlayingRef: BottomSheet | {}) => void;
  setNowPlayingRef: (nowPlayingRef: BottomSheet | {}) => void;
  setCastState: (castState: any) => void;
  setCastClient: (castClient: any) => void;

  play: (params: any, selected: TrackProps) => void;
  playPause: () => void;
  stop: () => void;
  previous: (position: number) => void;
  next: () => void;
  seekTo: (position: number) => void;
  skipTo: (index: number) => void;
  rate: (activeTrack: {id?: number}, rating: number) => void;
}
interface IConfigStore {
  axios: AxiosInstance | any;
  user: {
    username: string;
    firstName: string;
    lastName: string;
  };
  theme: string;
  config: (params: any) => void;
  configUser: (params: any) => void;
  configTheme: (params: any) => void;
}

interface IBottomSheetStore {
  props: any;
  setProps: (params: any) => void;
}

interface IFilterStore {
  from: string;
  to: string;
  setRange: (params: any) => void;
}

export const SERVER_URL = `http://75.119.137.255`;
export const API_URL = `${SERVER_URL}:3000/`;
export const AUDIO_URL = `${SERVER_URL}/Music/`;
export const ARTWORK_URL = `${SERVER_URL}/Artwork/`;
export const WAVEFORM_URL = `${SERVER_URL}/Waveform/`;

export const URL = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'http://75.119.137.255:3000/';
  } else {
    return Platform.OS === 'android'
      ? //? 'http://192.168.100.42:3333/' 'https://foresee-crm-backend.onrender.com/' 'http://10.0.2.2:3333/'
        'http://75.119.137.255:3000/'
      : //'http://10.0.2.2:3333/'
        'http://localhost:3333/';
  }
};

export const formatTrackTime = (secs: number) => {
  secs = Math.round(secs);
  let minutes = Math.floor(secs / 60) || 0;
  let seconds = secs - minutes * 60 || 0;
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
};

export const audioURL = `${URL()}Music/`;
export const artworkURL = `${URL()}Artwork/`;

export const WIDTH = Dimensions.get('window').width;
export const HEIGHT = Dimensions.get('window').height;
export const ASPECT_RATIO = WIDTH / HEIGHT;

export const usePlayerStore = create<IPlayerStore>((set, get) => ({
  progress: {},
  playbackState: {},
  queue: [],
  activeTrack: {},
  activeTrackIndex: 0,
  artworkQueue: [],
  carouselQueue: [],
  trackRating: 0,
  trackPlayCount: 0,
  playRegistered: false,
  lyricsVisible: false,
  palette: [],
  lyrics: null,
  nowPlayingRef: null,
  castState: {},
  castClient: {},
  setProgress: progress => set(state => ({...state, progress})),
  setPlaybackState: playbackState => set(state => ({...state, playbackState})),
  setQueue: queue => set(state => ({...state, queue})),
  setActiveTrack: activeTrack => set(state => ({...state, activeTrack})),
  setActiveTrackIndex: activeTrackIndex =>
    set(state => ({...state, activeTrackIndex})),
  setArtworkQueue: artworkQueue => set(state => ({...state, artworkQueue})),
  setCarouselQueue: carouselQueue => set(state => ({...state, carouselQueue})),
  setTrackRating: trackRating => set(state => ({...state, trackRating})),
  setTrackPlayCount: trackPlayCount =>
    set(state => ({...state, trackPlayCount})),
  setPlayRegistered: playRegistered =>
    set(state => ({...state, playRegistered})),
  setPalette: palette => set(state => ({...state, palette})),
  setLyricsVisible: lyricsVisible => set(state => ({...state, lyricsVisible})),
  setLyrics: lyrics => set(state => ({...state, lyrics})),
  openNowPlaying: (nowPlayingRef: any) => {
    set(state => ({...state, nowPlayingRef}));
    nowPlayingRef.current?.snapToIndex(0);
  },
  closeNowPlaying: (nowPlayingRef: any) => {
    set(state => ({...state, nowPlayingRef}));
    nowPlayingRef.current?.close();
  },
  setNowPlayingRef: (nowPlayingRef: any) =>
    set(state => ({...state, nowPlayingRef})),
  setCastState: (castState: any) => set(state => ({...state, castState})),
  setCastClient: (castClient: any) => set(state => ({...state, castClient})),

  play: async (data: any, selected: TrackProps) => {
    const tracks = data.map(
      (track: {
        id: number;
        path: string;
        artwork: string;
        waveform: string;
        palette: string;
      }) => {
        if (track.hasOwnProperty('format')) {
          const _palette = JSON.parse(track.palette);

          const palette = _palette.map((color: string) => {
            const brightness = tinycolor(color).getBrightness();

            if (brightness >= 150)
              return `#${tinycolor(color).darken(50).toHex()}`;
            else return color;
          });

          return {
            ...track,
            url: `${AUDIO_URL}${track.path}`,
            artwork: `${ARTWORK_URL}${track.artwork}`,
            waveform: `${WAVEFORM_URL}${track.waveform}`,
            palette,
          };
        }
      },
    );

    // ? Remove undefined items (folders)
    const queue: any = tracks.filter((track: any) => track);

    // ? Find index of currently selected track
    const selectedIndex = queue.findIndex(
      (track: TrackProps) => track.id === selected.id,
    );

    await TrackPlayer.setQueue(queue);
    await TrackPlayer.skip(selectedIndex);
    await TrackPlayer.play();

    const nowPlayingRef = get().nowPlayingRef!;
    get().openNowPlaying(nowPlayingRef);
  },
  playPause: async () => {
    Vibration.vibrate(50);

    const {state} = get().playbackState;
    const castState = get().castState;

    if (
      state === State.Paused ||
      state === State.Stopped ||
      state === State.Ready
    ) {
      TrackPlayer.play();
      if (castState === 'connected') get().castClient.play();
    } else {
      TrackPlayer.pause();
      if (castState === 'connected') get().castClient.pause();
    }
  },
  stop: async () => TrackPlayer.stop(),
  previous: (position: number) => {
    Vibration.vibrate(50);

    const castState = get().castState;

    if (position <= 10) {
      TrackPlayer.skipToPrevious();
      if (castState === 'connected') get().castClient?.queuePrev();
    } else {
      TrackPlayer.seekTo(0);
      if (castState === 'connected') get().castClient?.seek({position: 0});
    }
  },
  next: () => {
    Vibration.vibrate(50);

    const castState = get().castState;

    TrackPlayer.skipToNext();
    if (castState === 'connected') get().castClient?.queueNext();

    return false;

    const activeTrackIndex = get().activeTrackIndex;
    const queue = get().queue;

    const crossfader = new Sound(
      queue[activeTrackIndex + 1].url,
      Sound.MAIN_BUNDLE,
      e => {
        if (e) {
          TrackPlayer.skipToNext();
          console.log('failed to load the sound', e);
          return;
        }

        crossfader.setVolume(0);
        crossfader.play();

        let fadeOutInterval = setInterval(async () => {
          const currentTrackVolume = await TrackPlayer.getVolume();
          const crossfaderVolume = crossfader.getVolume();

          await TrackPlayer.setVolume(currentTrackVolume - 0.1);
          crossfader.setVolume(crossfaderVolume + 0.1);

          if (currentTrackVolume <= 0) {
            crossfader.getCurrentTime(async seconds => {
              await TrackPlayer.skipToNext();
              await TrackPlayer.seekTo(seconds + 1.8);
              clearInterval(fadeOutInterval);

              let fadeInInterval = setInterval(async () => {
                await TrackPlayer.setVolume(
                  (await TrackPlayer.getVolume()) + 0.5,
                );

                crossfader.setVolume(crossfader.getVolume() - 0.3);

                if (crossfader.getVolume() <= 0) {
                  await TrackPlayer.setVolume(1);
                  crossfader.stop();
                  clearInterval(fadeInInterval);
                  crossfader.release();
                }
              }, 1000);
            });
          }
        }, 1000);
      },
    );
  },
  seekTo: (position: number) => {
    Vibration.vibrate(50);

    const castState = get().castState;

    TrackPlayer.seekTo(position);
    if (castState === 'connected') get().castClient?.seek({position});
  },
  skipTo: async (index: any) => await TrackPlayer.skip(index),
  rate: async (activeTrack: any, rating: number) => {
    const index = await TrackPlayer.getActiveTrackIndex();
    await TrackPlayer.updateMetadataForTrack(index!, {...activeTrack, rating});
    set(state => ({...state, currentTrack: {...state.currentTrack, rating}}));
    console.log(`${API_URL}rate`);
    try {
      const res = await axios.put(`${API_URL}rate`, {
        body: JSON.stringify({id: activeTrack.id, rating}),
      });
      console.log(res);
    } catch (err: any) {
      console.error(err.message);
    }
  },
}));

export const useAuthStore = create<IAuthStore>(set => ({
  token: null,
  loading: true,
  restore: async () => {
    const token = await AsyncStorage.getItem('token');
    set({token, loading: false});
  },
  login: async token => {
    set({token, loading: false});
    await AsyncStorage.setItem('token', token);
  },
  logout: async () => {
    set({token: undefined, loading: false});
    await AsyncStorage.removeItem('token');
  },
}));

export const useConfigStore = create<IConfigStore>(set => ({
  axios: {},
  user: {
    username: '',
    firstName: '',
    lastName: '',
  },
  theme: 'light',
  config: (params: any) => set({axios: params}),
  configUser: (params: any) => set({user: params}),
  configTheme: (theme: string) => set({theme}),
}));

export const useFilterStore = create<IFilterStore>(set => ({
  from: dayjs().format('YYYY-MM-DD'),
  to: dayjs().format('YYYY-MM-DD'),
  setRange: ({from, to}) => set({from, to}),
}));

export const useBottomSheetStore = create<IBottomSheetStore>(set => ({
  props: {},
  setProps: (params: object) => set({props: params}),
}));
