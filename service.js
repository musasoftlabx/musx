//import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function () {
  let playPosition = 0;

  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.destroy());
  TrackPlayer.addEventListener(Event.RemoteNext, () =>
    TrackPlayer.skipToNext(),
  );
  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    if (playPosition <= 10) TrackPlayer.skipToPrevious();
    else TrackPlayer.seekTo(0);
  });
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) =>
    TrackPlayer.seekTo(position),
  );
  // TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, ({position}) => {
  //   playPosition = position;
  //   AsyncStorage.setItem('playPosition', position.toString());
  // });
};
