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
import {
  MediaHlsSegmentFormat,
  MediaInfo,
  MediaQueueData,
  MediaStreamType,
  RemoteMediaClient,
} from 'react-native-google-cast';
import {DownloadDirectoryPath, mkdir} from '@dr.pogodin/react-native-fs';

export const SERVER_URL = `http://75.119.137.255`;
export const API_URL = `${SERVER_URL}:3000/`;
export const AUDIO_URL = `${SERVER_URL}/Music/`;
export const ARTWORK_URL = `${SERVER_URL}/Artwork/`;
export const WAVEFORM_URL = `${SERVER_URL}/Waveform/`;
export const TRANSCODES_URL = `${SERVER_URL}/Transcodes/`;
export const DOWNLOADS_PATH = `${DownloadDirectoryPath}/MusX_player/`;
export const WIDTH = Dimensions.get('window').width;
export const HEIGHT = Dimensions.get('window').height;
export const ASPECT_RATIO = WIDTH / HEIGHT;
export const LIST_ITEM_HEIGHT = 60;

mkdir(DOWNLOADS_PATH);

const handleHLSstreaming = (queue: any) =>
  queue.map((track: TrackProps) => ({
    ...track,
    type: 'hls',
    url: `${TRANSCODES_URL}${track.path.split('/').slice(-1)}`.replace(
      '.mp3',
      '.m3u8',
    ),
  }));

const mediaInfo = (streamViaHLS: boolean, track: TrackProps): MediaInfo => ({
  // TODO: Uncomment next two lines if HLS bug is fixed
  //contentUrl: track.url,
  //contentType: streamViaHLS ? 'application/x-mpegURL' : 'audio/mpeg',
  contentUrl: `${AUDIO_URL}${track.path}`,
  contentType: 'audio/mpeg',
  metadata: {
    type: 'musicTrack',
    images: [{url: track.artwork}],
    title: track.title,
    albumTitle: track.album,
    albumArtist: track.albumArtist,
    artist: track.artists,
    releaseDate: track.year,
    trackNumber: 1,
    discNumber: 1,
  },
  customData: {
    id: track.id,
    path: track.path,
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
});

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
  isCrossFading: boolean;
  lyricsVisible: boolean;
  lyrics: null | string;
  palette: string[];
  nowPlayingRef: BottomSheet | null;
  trackDetailsRef: BottomSheet | null;
  trackDetails: any;
  castState: any;
  castClient: RemoteMediaClient | null;
  streamViaHLS: boolean;
  bitrate: string;
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
  setIsCrossFading: (isCrossFading: boolean) => void;
  setPalette: (palette: string[]) => void;
  setLyricsVisible: (lyricsVisible: boolean) => void;
  setLyrics: (lyrics: null | string) => void;
  setNowPlayingRef: (nowPlayingRef: BottomSheet | {}) => void;
  openNowPlaying: (nowPlayingRef: BottomSheet | {}) => void;
  closeNowPlaying: (nowPlayingRef: BottomSheet | {}) => void;
  setTrackDetailsRef: (trackDetailsRef: BottomSheet | {}) => void;
  setTrackDetails: (trackDetails: TrackProps) => void;
  openTrackDetails: () => void;
  closeTrackDetails: () => void;
  setCastState: (castState: any) => void;
  setCastClient: (castClient: any) => void;
  play: (params: any, selected: TrackProps, position?: number) => void;
  playPause: () => void;
  previous: (position: number) => void;
  next: () => void;
  seekTo: (position: number) => void;
  skipTo: (track: TrackProps) => void;
  remove: (track: TrackProps) => void;
  moveTrack: (from: number, to: number) => void;
  addAsNextTrack: (track: TrackProps, index: number) => void;
  addTrackToEndOfQueue: (track: TrackProps) => void;
  setStreamViaHLS: (streamViaHLS: boolean) => void;
  setBitrate: (bitrate: string) => void;
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
  isCrossFading: false,
  lyricsVisible: false,
  palette: [],
  lyrics: null,
  nowPlayingRef: null,
  trackDetailsRef: null,
  trackDetails: null,
  castState: {},
  castClient: null,
  streamViaHLS: false,
  bitrate: '',
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
  setIsCrossFading: isCrossFading => set(state => ({...state, isCrossFading})),
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
  openTrackDetails: () => {
    const trackDetailsRef: any = get().trackDetailsRef;
    trackDetailsRef.current?.snapToIndex(0);
  },
  closeTrackDetails: () => {
    const trackDetailsRef: any = get().trackDetailsRef;
    trackDetailsRef.current?.close();
  },
  setTrackDetailsRef: (trackDetailsRef: any) =>
    set(state => ({...state, trackDetailsRef})),
  setTrackDetails: (trackDetails: TrackProps) =>
    set(state => ({...state, trackDetails})),
  setCastState: (castState: any) => set(state => ({...state, castState})),
  setCastClient: (castClient: any) => set(state => ({...state, castClient})),
  setStreamViaHLS: (streamViaHLS: boolean) =>
    set(state => ({...state, streamViaHLS})),
  setBitrate: (bitrate: string) => set(state => ({...state, bitrate})),

  // ? Player actions
  play: async (data: TracksProps, selected: TrackProps, position?: number) => {
    TrackPlayer.removeUpcomingTracks();

    const tracks = data.map((track: TrackProps) => {
      if (track.hasOwnProperty('format')) {
        const _palette = Array.isArray(track.palette)
          ? track.palette
          : JSON.parse(track.palette);

        // const palette = _palette.map((color: string) => {
        //   const brightness = tinycolor(color).getBrightness();

        //   if (brightness >= 150)
        //     return `#${tinycolor(color).darken(50).toHex()}`;
        //   else return color;
        // });

        //return {...track, palette};
        return {...track, palette: ['#000', '#000']};
      }
    });

    // ? Remove undefined items (folders)
    const _queue: any = tracks.filter((track: any) => track);

    let queue: any = [];

    if (get().streamViaHLS) queue = handleHLSstreaming(_queue);
    else queue = _queue;

    // ? Find index of currently selected track
    const selectedIndex = queue.findIndex(
      (track: TrackProps) => track.id === selected.id,
    );

    const castState = get().castState;
    const castClient = get().castClient;
    const setActiveTrack = get().setActiveTrack;

    if (castState === 'connected') {
      set({queue});

      setActiveTrack(get().queue[selectedIndex]);

      castClient
        ?.loadMedia({
          queueData: {
            name: 'MusX Queue',
            startIndex: selectedIndex,
            items: queue.map((track: TrackProps) => ({
              mediaInfo: mediaInfo(get().streamViaHLS, track),
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

    // ? Retrieve playBack state, castClient & castState state
    const {state} = get().playbackState;
    const castClient = get().castClient;
    const castState = get().castState;

    if (
      state === State.Paused ||
      state === State.Stopped ||
      state === State.Ready
    )
      castState === 'connected' ? castClient?.play() : TrackPlayer.play();
    else castState === 'connected' ? castClient?.pause() : TrackPlayer.pause();
  },
  previous: (position: number) => {
    Vibration.vibrate(50);

    // ? Retrieve castClient & castState state
    const castClient = get().castClient;
    const castState = get().castState;

    if (position <= 10)
      castState === 'connected'
        ? castClient?.queuePrev()
        : TrackPlayer.skipToPrevious();
    else
      castState === 'connected'
        ? castClient?.seek({position: 0})
        : TrackPlayer.seekTo(0);
  },
  next: () => {
    Vibration.vibrate(50);

    // ? Retrieve castClient & castState state
    const castClient = get().castClient;
    const castState = get().castState;

    if (castState === 'connected') castClient?.queueNext();
    else TrackPlayer.skipToNext();
  },
  seekTo: (position: number) => {
    Vibration.vibrate(50);

    // ? Retrieve castClient & castState state
    const castClient = get().castClient;
    const castState = get().castState;

    if (castState === 'connected') castClient?.seek({position});
    else TrackPlayer.seekTo(position);
  },
  skipTo: (track: TrackProps) => {
    Vibration.vibrate(50);

    // ? Retrieve castClient & castState state
    const castClient = get().castClient;
    const castState = get().castState;

    // ? Retrieve queue state
    const queue = get().queue;

    // ? Get the index of the track in queue to skip to
    const skipToIndex = queue.findIndex(({id}) => id === track.id);

    if (castState === 'connected')
      castClient?.loadMedia({
        queueData: {
          startIndex: skipToIndex,
          items: queue.map((track, index) => ({
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
          })) as MediaQueueData['items'],
        },
      });
    else TrackPlayer.skip(skipToIndex);
  },
  remove: (track: TrackProps) => {
    Vibration.vibrate(50);

    // ? Retrieve castClient & castState state
    const castClient = get().castClient;
    const castState = get().castState;

    // ? Retrieve queue, activeTrackIndex state & setQueue action
    const activeTrackIndex = get().activeTrackIndex;
    const queue = get().queue;
    const setQueue = get().setQueue;

    // ? Remove track from queue
    setQueue(queue.filter(_track => _track.id !== track.id && _track));

    if (castState === 'connected')
      castClient?.loadMedia({
        autoplay: false,
        queueData: {
          startIndex: activeTrackIndex,
          items: queue.map((track, index) => ({
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
          })) as MediaQueueData['items'],
        },
      });
    else TrackPlayer.remove(queue.findIndex(_track => _track.id === track.id));
  },
  moveTrack: async (from: number, to: number) => {
    // ? Retrieve castClient & castState state
    const castClient = get().castClient;
    const castState = get().castState;

    // ? Retrieve queue & activeTrackIndex states
    const activeTrackIndex = get().activeTrackIndex;
    const queue = get().queue;

    if (castState === 'connected')
      castClient?.loadMedia({
        autoplay: false,
        queueData: {
          startIndex: activeTrackIndex,
          items: queue.map((track, index) => ({
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
          })) as MediaQueueData['items'],
        },
      });
    else {
      await TrackPlayer.move(from, to);
      await TrackPlayer.move(to, from);
      await TrackPlayer.move(from, to);
      // await TrackPlayer.move(_to, _from);
      // const __queue = await TrackPlayer.getQueue();
      // console.log(__queue.map(track => track.title));
      // await TrackPlayer.move(_from, _to);
      // const ___queue = await TrackPlayer.getQueue();
      // console.log(___queue.map(track => track.title));
    }
  },
  addAsNextTrack: (track: TrackProps, index: number) => {
    // ? Convert the palette from string to array
    const palette = JSON.parse(track.palette).map((color: string) => {
      const brightness = tinycolor(color).getBrightness();

      if (brightness >= 150) return `#${tinycolor(color).darken(50).toHex()}`;
      else return color;
    });

    track.palette = palette;

    // ? Retrieve castClient & castState state
    const castClient = get().castClient;
    const castState = get().castState;

    // ? Retrieve queue state & setQueue action
    const queue = get().queue;
    const setQueue = get().setQueue;

    // ? Add track after current track
    queue.splice(index, 0, track);

    // ? Set Queue
    if (get().streamViaHLS) setQueue(handleHLSstreaming([...queue]));
    else setQueue([...queue]);

    // ? Save queue to storage
    AsyncStorage.setItem('queue', JSON.stringify([...queue]));

    if (castState === 'connected')
      castClient?.getMediaStatus().then(status => {
        const currentItemId = status?.currentItemId;

        castClient.queueInsertItem(
          {
            preloadTime: 10,
            mediaInfo: mediaInfo(get().streamViaHLS, track) as MediaInfo,
          },
          currentItemId! + 1,
        );
      });
    else TrackPlayer.add(track, index);
  },
  addTrackToEndOfQueue: (track: TrackProps) => {
    // ? Convert the palette from string to array
    //track.palette = JSON.parse(track.palette);
    const palette = JSON.parse(track.palette).map((color: string) => {
      const brightness = tinycolor(color).getBrightness();

      if (brightness >= 150) return `#${tinycolor(color).darken(50).toHex()}`;
      else return color;
    });

    track.palette = palette;

    // ? Retrieve castClient & castState state
    const castClient = get().castClient;
    const castState = get().castState;

    // ? Retrieve queue state & setQueue action
    const queue = get().queue;
    const setQueue = get().setQueue;

    // ? Add track to end of queue
    const _queue = [...queue, track];

    // ? Set Queue
    if (get().streamViaHLS) setQueue(handleHLSstreaming(_queue));
    else setQueue(_queue);

    // ? Save queue to storage
    AsyncStorage.setItem('queue', JSON.stringify(_queue));

    if (castState === 'connected')
      castClient?.queueInsertItem({
        preloadTime: 10,
        mediaInfo: mediaInfo(get().streamViaHLS, track) as MediaInfo,
      });
    else TrackPlayer.add(track);
  },
}));
