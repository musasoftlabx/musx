/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {Track} from 'react-native-track-player';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  //Root: NavigatorScreenParams<RootTabParamList> | undefined;
  //Modal: undefined;
  //NotFound: undefined;
  //Footer: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, Screen>;

export type RootTabParamList = {
  TabOne: undefined;
  TabTwo: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    StackScreenProps<RootStackParamList>
  >;

export interface IAxiosError {
  response: {
    data: {
      subject: string;
      body: string;
    };
  };
}

export type TrackProps = {
  album: string;
  albumArtist: string;
  artists: string;
  artwork: string;
  bitrate: number;
  channelLayout: string;
  channels: number;
  duration: number;
  encoder: string;
  format: string;
  genre: string;
  id: number;
  lyrics: string;
  name?: string;
  palette: string[];
  path: string;
  plays: number;
  rating: number;
  sampleRate: number;
  size: number;
  syncDate: string;
  title: string;
  track: number;
  waveform: string;
  year: string;
} & Track;

export type TracksProps = TrackProps[];

export type QueueProps = {queue: any; activeTrack: any; activeTrackIndex: any};
