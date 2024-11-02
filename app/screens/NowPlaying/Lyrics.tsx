import React, {useCallback, useEffect, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Lyric} from 'react-native-lyric';
import TrackPlayer, {
  Event,
  State,
  useActiveTrack,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import {TQueue} from '../../types';
import {SERVER_URL} from '../../store';
import axios from 'axios';

const spinValue = new Animated.Value(0);

// First set up animation
Animated.loop(
  Animated.timing(spinValue, {
    toValue: 1,
    duration: 3000,
    easing: Easing.linear, // Easing is an additional import from react-native
    useNativeDriver: true, // To make use of native driver for performance
  }),
).start();

// Next, interpolate beginning and end values (in this case 0 and 1)
const spin = spinValue.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '360deg'],
});

const Lyrics = ({
  queue,
  artworkQueue,
  trimmedArtworkQueue,
  activeTrackIndex,
  trackRating,
  trackPlayCount,
  playRegistered,
}: TQueue) => {
  const {position} = useProgress();
  const {state} = usePlaybackState();
  const activeTrack = useActiveTrack();

  const isPlaying = state === State.Playing;

  const [lyrics, setLyrics] = useState(null);

  const lineRenderer = useCallback(
    ({lrcLine: {millisecond, content}, index, active}: any) => (
      <Text
        onPress={() => TrackPlayer.seekTo(millisecond / 1005)}
        // onLongPress={() =>
        //   isPlaying ? TrackPlayer.pause() : TrackPlayer.play()
        // }
        style={{
          fontSize: active ? 22 : 18,
          textAlign: 'center',
          color: active ? 'yellow' : 'rgba(255,255,255,.5)',
          fontWeight: active ? 'bold' : '500',
        }}>
        {content}
      </Text>
    ),
    [],
  );

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/Music/${activeTrack?.path.replace('.mp3', '.lrc')}`)
      .then(({data: lyrics}) => setLyrics(lyrics))
      .catch(err => setLyrics(null));
  }, [activeTrack]);

  return lyrics ? (
    <View
      style={{
        backgroundColor: activeTrack?.palette[1],
        borderRadius: 20,
        marginVertical: 15,
      }}>
      <View style={styles.item}>
        <Image source={{uri: activeTrack?.artwork}} style={styles.image} />
        {/* <Animated.Image
          source={{uri: activeTrack?.artwork}}
          style={
            activeTrack?.id === activeTrack?.id
              ? styles.isPlaying
              : styles.image
          }
        /> */}
        <View
          style={{
            justifyContent: 'center',
            marginTop: -2,
            maxWidth: Dimensions.get('window').width - 175,
          }}>
          <Text numberOfLines={1} style={styles.title}>
            {activeTrack?.title || activeTrack?.name}
          </Text>
          <Text numberOfLines={1} style={styles.artists}>
            {activeTrack?.artists || 'Unknown Artist'}
          </Text>
          <Text numberOfLines={1} style={styles.album}>
            {activeTrack?.album || 'Unknown Album'}
          </Text>
        </View>
        <View style={{flex: 1}} />
        <View style={{justifyContent: 'center', alignItems: 'flex-end'}}>
          <Text style={{fontWeight: 'bold', marginRight: 5}}>
            {activeTrack?.plays || 0} play{activeTrack?.plays === 1 ? '' : 's'}
          </Text>
        </View>
      </View>

      <Lyric
        style={{height: 50, marginBottom: 50}}
        lrc={lyrics}
        autoScroll
        autoScrollAfterUserScroll={300}
        currentTime={position * 1005}
        lineHeight={30}
        height={200}
        lineRenderer={lineRenderer}
      />
    </View>
  ) : (
    <View>
      <Text>{'dsfewf'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  imageShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 12,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
    justifyContent: 'center',
  },
  isPlaying: {
    height: 45,
    width: 45,
    marginRight: 8,
    borderRadius: 100,
    transform: [{rotate: spin}],
  },
  image: {
    height: 45,
    width: 45,
    marginRight: 8,
    borderRadius: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  artists: {
    fontSize: 14,
    fontWeight: '300',
    fontStyle: 'italic',
  },
  album: {
    fontSize: 12,
    fontWeight: '300',
  },
  plays: {
    backgroundColor: 'grey',
    borderRadius: 10,
    height: 35,
    margin: 10,
    opacity: 0.6,
    padding: 5,
    paddingHorizontal: 15,
  },
});

export default Lyrics;
