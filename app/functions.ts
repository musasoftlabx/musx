import axios from 'axios';
import {IAxiosError, TrackProps} from './types';
import {API_URL} from './store';
import {queryClient} from '../App';

export const formatTrackTime = (secs: number) => {
  secs = Math.round(secs);
  let minutes = Math.floor(secs / 60) || 0;
  let seconds = secs - minutes * 60 || 0;
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
};

export const arrayMove = (
  fromIndex: number,
  toIndex: number,
  palette: string[],
) => {
  let element = palette[fromIndex];
  palette.splice(fromIndex, 1);
  palette.splice(toIndex, 0, element);
};

export const addPlaylistTrack = (track: TrackProps, trackId: number) => {
  axios
    .post(`${API_URL}addPlaylistTrack`, {
      playlistId: track.id,
      trackId,
      startsAt: null,
      endsAt: null,
    })
    .then(() => {})
    .catch(err => console.error(err.message));
};

export const refreshScreens = (
  activeTrack: TrackProps,
  selectedPlaylist?: number | null,
) => {
  queryClient.refetchQueries({queryKey: ['dashboard']});
  queryClient.refetchQueries({queryKey: ['mostPlayed']});
  queryClient.refetchQueries({queryKey: ['recentlyPlayed']});
  queryClient.refetchQueries({queryKey: ['libraryCount']});
  queryClient.refetchQueries({
    queryKey: ['artist', activeTrack.albumArtist],
  });
  queryClient.refetchQueries({
    queryKey: ['album', activeTrack.albumArtist, activeTrack.album],
  });
  selectedPlaylist &&
    queryClient.refetchQueries({
      queryKey: ['playlist', selectedPlaylist],
    });
};
