// * React Native
import {Dimensions, Vibration} from 'react-native';

// * Libraries
import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet from '@gorhom/bottom-sheet';
import Sound from 'react-native-sound';
import TrackPlayer, {Progress, State, Track} from 'react-native-track-player';
import tinycolor from 'tinycolor2';

// * Types
import {TrackProps, TracksProps} from './types';

export const SERVER_URL = `http://75.119.137.255`;
export const API_URL = `${SERVER_URL}:3000/`;
export const AUDIO_URL = `${SERVER_URL}/Music/`;
export const ARTWORK_URL = `${SERVER_URL}/Artwork/`;
export const WAVEFORM_URL = `${SERVER_URL}/Waveform/`;
export const WIDTH = Dimensions.get('window').width;
export const HEIGHT = Dimensions.get('window').height;
export const ASPECT_RATIO = WIDTH / HEIGHT;
export const LIST_ITEM_HEIGHT = 60;

interface IPlayerStore {
  progress: Progress;
  playbackState: any;
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
  setProgress: (queue: Progress) => void;
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
  play: (params: any, selected: TrackProps, position?: number) => void;
  playPause: () => void;
  previous: (position: number) => void;
  next: () => void;
  seekTo: (position: number) => void;
}

export const usePlayerStore = create<IPlayerStore>((set, get) => ({
  progress: {position: 0, buffered: 0, duration: 0},
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
  play: async (data: TracksProps, selected: TrackProps, position?: number) => {
    const tracks = data.map((track: TrackProps) => {
      if (track.hasOwnProperty('format')) {
        const _palette = Array.isArray(track.palette)
          ? track.palette
          : JSON.parse(track.palette);

        const palette = _palette.map((color: string) => {
          const brightness = tinycolor(color).getBrightness();

          if (brightness >= 150)
            return `#${tinycolor(color).darken(50).toHex()}`;
          else return color;
        });

        return {
          ...track,
          url: `${AUDIO_URL}${track.path}`,
          artwork: track.artwork.includes(ARTWORK_URL)
            ? track.artwork
            : `${ARTWORK_URL}${track.artwork}`,
          waveform: track.waveform.includes(WAVEFORM_URL)
            ? track.waveform
            : `${WAVEFORM_URL}${track.waveform}`,
          palette,
        };
      }
    });

    // ? Remove undefined items (folders)
    const queue: any = tracks.filter((track: any) => track);

    // ? Find index of currently selected track
    const selectedIndex = queue.findIndex(
      (track: TrackProps) => track.id === selected.id,
    );

    const castState = get().castState;
    const castClient = get().castClient;

    if (castState === 'connected') {
      set({queue});

      castClient
        .loadMedia({
          queueData: {
            items: queue
              .slice(selectedIndex)
              .map((track: TrackProps, index: number) => ({
                mediaInfo: {
                  contentUrl: track.url,
                  contentType: 'audio/mpeg',
                  metadata: {
                    type: 'musicTrack',
                    images: [{url: track.artwork}],
                    title: track.title,
                    albumTitle: track.albumArtist,
                    albumArtist: track.albumArtist,
                    artist: track.artists,
                    releaseDate: track.year,
                    trackNumber: index + 1,
                    discNumber: 1,
                  },
                  customData: {
                    id: track.id,
                    title: track.title,
                    albumArtist: track.albumArtist,
                    duration: track.duration,
                    artists: track.artists,
                    album: track.album,
                    rating: track.rating ?? 0,
                    plays: track.plays,
                    year: track.year,
                    waveform: track.waveform,
                    sampleRate: track.sampleRate,
                    palette: track.palette,
                    genre: track.genre,
                    format: track.format,
                    encoder: track.encoder,
                    bitrate: track.bitrate,
                    artwork: track.artwork,
                  },
                },
              })),
          },
        })
        .then(() => {
          position && castClient.seek({position});
          castClient.play();
          AsyncStorage.setItem('queue', JSON.stringify(queue));
          AsyncStorage.setItem('activeTrackIndex', selectedIndex.toString());
        });
    } else {
      await TrackPlayer.setQueue(queue);
      await TrackPlayer.skip(selectedIndex);
      await TrackPlayer.play();
    }

    const nowPlayingRef = get().nowPlayingRef!;
    get().openNowPlaying(nowPlayingRef);
  },
  playPause: () => {
    Vibration.vibrate(50);

    const {state} = get().playbackState;
    const castState = get().castState;

    if (
      state === State.Paused ||
      state === State.Stopped ||
      state === State.Ready
    )
      castState === 'connected' ? get().castClient.play() : TrackPlayer.play();
    else
      castState === 'connected'
        ? get().castClient.pause()
        : TrackPlayer.pause();
  },
  previous: (position: number) => {
    Vibration.vibrate(50);

    const castState = get().castState;

    if (position <= 10)
      castState === 'connected'
        ? get().castClient?.queuePrev()
        : TrackPlayer.skipToPrevious();
    else
      castState === 'connected'
        ? get().castClient?.seek({position: 0})
        : TrackPlayer.seekTo(0);
  },
  next: () => {
    Vibration.vibrate(50);

    const castState = get().castState;

    castState === 'connected'
      ? get().castClient?.queueNext()
      : TrackPlayer.skipToNext();

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

    castState === 'connected'
      ? get().castClient?.seek({position})
      : TrackPlayer.seekTo(position);
  },
}));
