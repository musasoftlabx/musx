import axios from 'axios';
import { IAxiosError, Playlist, TrackProps } from './types';
import { API_URL, DOWNLOADS_PATH } from './store';
import { queryClient } from '../App';
import { downloadFile } from '@dr.pogodin/react-native-fs';

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

export const addPlaylistTrack = (
  track: Playlist | undefined,
  trackId: number,
) => {
  axios
    .post(`${API_URL}addPlaylistTrack`, {
      playlistId: track?.id,
      trackId,
      startsAt: null,
      endsAt: null,
    })
    .then(() => {})
    .catch(err => console.error(err.message));
};

export const refreshScreens = (
  activeTrack: TrackProps,
  activePlaylist?: number | null,
) => {
  queryClient.refetchQueries({ queryKey: ['dashboard'] });
  queryClient.refetchQueries({ queryKey: ['mostPlayed'] });
  queryClient.refetchQueries({ queryKey: ['recentlyPlayed'] });
  queryClient.refetchQueries({ queryKey: ['libraryCount'] });
  queryClient.refetchQueries({
    queryKey: ['artist', activeTrack.albumArtist],
  });
  queryClient.refetchQueries({
    queryKey: ['album', activeTrack.albumArtist, activeTrack.album],
  });
  activePlaylist &&
    queryClient.refetchQueries({
      queryKey: ['playlist', activePlaylist],
    });
};

export const downloadMultipleFiles = async (tracks: TrackProps[]) => {
  try {
    const downloadPromises = tracks.map(
      async ({ name, url, path }: TrackProps) => {
        try {
          const result = downloadFile({
            fromUrl: url,
            toFile: `${DOWNLOADS_PATH}/${path.replaceAll('/', '_')}`,
            background: false,
            progress({ bytesWritten, contentLength }) {
              // setIsDownloading(true);
              // setDownloadProgress(bytesWritten);
              // setDownloadSize(contentLength);
            },
          }).promise;
          console.log(`Successfully downloaded ${name} to ${path}`);
          return result;
          // .promise.then(() => {
          //   setIsDownloading(false);
          //   setSnackbarMessage(`${track.title} downloaded!`);
          //   setSnackbarVisible(!snackbarVisible);
          // })
          // .catch(error => {
          //   setIsDownloading(false);
          //   setSnackbarMessage(
          //     'Download failed. An error occurrred',
          //   );
          //   setSnackbarVisible(!snackbarVisible);
          // })}
        } catch (error) {
          console.error(`Error downloading ${name}:`, error);
          throw error; // Re-throw to be caught by Promise.all
        }
      },
    );
    await Promise.all(downloadPromises);
    console.log('All files downloaded successfully!');
  } catch (error) {
    console.error('One or more downloads failed:', error);
  }
};
