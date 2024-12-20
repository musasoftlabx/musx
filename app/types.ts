/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Home: {queryKey: string; title: string};
  History: {queryKey: string; title: string};
  Playlist: {
    id: number;
    name: string;
    createdOn: string;
    modifiedOn: string;
    tracks: number;
    artworks: string[];
    artwork: string;
    duration: string;
    size: string;
  };
  Playlists: {
    id: number;
    name: string;
    createdOn: string;
    modifiedOn: string;
    tracks: number;
    artworks: string[];
    artwork: string;
    duration: string;
    size: string;
  };
  Folders: undefined;
  MostPlayed: any;
  AddToPlaylist: any;
  TrackMetadata: any;
  Artists: any;
  Artist: {
    albumArtist: string;
    artworks: string[];
    tracks: number;
    url: string;
    path: string;
  };
  Album: {albumArtist: string; album: string};
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  Modal: undefined;
  NotFound: undefined;
  Footer: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type RootTabParamList = {
  TabOne: undefined;
  TabTwo: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
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
  id: number;
  url: string;
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
  lyrics: string;
  name?: string;
  palette: string;
  path: string;
  plays: number;
  rating: any; //RatingType;
  sampleRate: number;
  size: number;
  syncDate: string;
  title: string;
  track: number;
  waveform: string;
  year: string;
  position: number;

  type?: any; //TrackType;
  /** The user agent HTTP header */
  userAgent?: string;
  /** Mime type of the media file */
  contentType?: string;
  /** (iOS only) The pitch algorithm to apply to the sound. */
  pitchAlgorithm?: any; //PitchAlgorithm;
  headers?: {[key: string]: any};
  [key: string]: any;
  artist?: string;
  description?: string;
  date?: string;
  /**
   * (iOS only) Whether the track is presented in the control center as being
   * live
   **/
  isLiveStream?: boolean;
};

export type TracksProps = TrackProps[];

export type QueueProps = {queue: any};
