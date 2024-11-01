// * React Native
import {Platform} from 'react-native';

// * React Native Libraries
import AsyncStorage from '@react-native-async-storage/async-storage';
//import {MMKV} from 'react-native-mmkv';

// * JS Libraries
import axios, {AxiosInstance} from 'axios';
import dayjs from 'dayjs';
import {create} from 'zustand';
import TrackPlayer, {State} from 'react-native-track-player';
import {useNavigation} from '@react-navigation/native';

//export const storage = new MMKV();

interface IAuthStore {
  token?: string | null;
  loading?: boolean;
  restore: () => void;
  login: (token: string) => void;
  logout: () => void;
}

interface IPlayerStore {
  currentTrack: any;
  nextTracks: any;
  play: (params: any) => void;
  pauseplay: () => void;
  stop: () => void;
  previous: () => void;
  next: () => void;
  queue: () => void;
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

export const menuURL = `${URL()}public/images/menu/`;
export const photoURL = `${URL()}public/images/photos/`;
export const purchasesURL = `${URL()}public/docs/purchases/`;
export const salesURL = `${URL()}public/docs/sales/`;
export const signaturesURL = `${URL()}public/images/signatures/`;

export const audioURL = `${URL()}Music/`;
export const artworkURL = `${URL()}Artwork/`;

export const usePlayerStore = create<IPlayerStore>(set => ({
  currentTrack: {},
  nextTracks: [],

  play: async (params: any) => {
    const currentTrack = {
      ...params.currentTrack,
      url: `${AUDIO_URL}${params.currentTrack.path}`,
      artwork: `${ARTWORK_URL}${params.currentTrack.artwork}`,
      palette: JSON.parse(params.currentTrack.palette),
      //waveform: `${WAVEFORM_URL}${params.currentTrack.waveform}`,
    };

    const nextTracks = params.nextTracks.map((track: any) => {
      return {
        ...track,
        url: `${AUDIO_URL}${track.path}`,
        artwork: `${ARTWORK_URL}${track.artwork}`,
        palette: JSON.parse(track.palette),
      };
    });

    set(state => ({...state, currentTrack, nextTracks}));

    await AsyncStorage.setItem(
      'queue',
      JSON.stringify([currentTrack, ...nextTracks]),
    );

    console.warn(currentTrack);

    await TrackPlayer.setQueue([currentTrack, ...nextTracks]);
    await TrackPlayer.play();
    // await TrackPlayer.reset();
    // await TrackPlayer.add(currentTrack);
    // await TrackPlayer.play();
    // await TrackPlayer.add(nextTracks);
  },
  pauseplay: async () => {
    const {state} = await TrackPlayer.getPlaybackState();

    if (State.Paused === state || State.Stopped === state)
      await TrackPlayer.play();
    else await TrackPlayer.pause();
  },
  stop: async () => TrackPlayer.stop(),
  previous: async () => TrackPlayer.skipToPrevious(),
  next: async () => TrackPlayer.skipToNext(),
  queue: async () => await TrackPlayer.getQueue(),
  seekTo: async (position: any) => TrackPlayer.seekTo(position),
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
  trackChange: async ({
    index,
    track: {id},
  }: {
    index: number;
    track: {id: number; plays: number};
  }) => {
    // await TrackPlayer.updateMetadataForTrack(index, {
    //   ...track,
    //   plays: track.plays + 1,
    // });

    set(state => ({
      ...state,
      currentTrack: {...state.currentTrack, plays: state.currentTrack + 1},
    }));

    // try {
    //   const res = await axios.put(`${API_URL}updatePlayCount`, {id});
    //   console.log(res.data);
    // } catch (err: any) {
    //   console.error(err.message);
    // }
  },
  restoreSavedQueue: async () => {
    const savedQueue = await AsyncStorage.getItem('queue');

    if (savedQueue) {
      const queue = JSON.parse(savedQueue);
      set(state => ({
        ...state,
        currentTrack: queue[0],
        nextTracks: queue.slice(1),
      }));
      //await TrackPlayer.load(queue[0]);
      await TrackPlayer.setQueue(queue);
      //await TrackPlayer.setQueue(queue.slice(1));
      //console.log(queue.slice(1));
    } else {
      console.log('☺️');
      const navigation = useNavigation();
      navigation.goBack(null);
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
