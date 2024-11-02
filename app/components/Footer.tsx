import React, {useMemo, useState} from 'react';

import {
  Dimensions,
  View,
  StyleSheet,
  Image,
  Text,
  Pressable,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  State,
  useActiveTrack,
} from 'react-native-track-player';

import {usePlayerStore} from '../store';

import {Track} from '../types';

const logoJPG = require('../assets/images/logo.jpg');

const Footer = () => {
  const {position, duration} = useProgress();
  const {state} = usePlaybackState();
  const _activeTrack = useActiveTrack();

  const [selectedTab, setSelectedTab] = useState(1);
  const [artworkQueue, setArtworkQueue] = useState<string[]>([]);
  const [activeArtwork, setActiveArtwork] = useState(0);
  const [activeTrack, setActiveTrack] = useState<Track>();
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>();
  const [trackPlayCount, setTrackPlayCount] = useState<number>(0);
  const [playRegistered, setPlayRegistered] = useState<boolean>(false);

  const currentTrack = usePlayerStore(state => state.currentTrack);
  const pauseplay = usePlayerStore(state => state.pauseplay);
  const next = usePlayerStore(state => state.next);

  useMemo(() => {
    setPlayRegistered(false);

    TrackPlayer.getQueue().then((queue: any) =>
      setArtworkQueue(queue.map(({artwork}: {artwork: string}) => artwork)),
    );

    TrackPlayer.getActiveTrackIndex().then((index: any) => {
      setActiveArtwork(index);
      setActiveTrackIndex(index);
    });
  }, [_activeTrack]);

  const navigation = useNavigation();

  const activeStates = [
    State.Playing,
    State.Paused,
    State.Buffering,
    State.Ready,
  ];

  return (
    activeStates.includes(state!) && (
      <View
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          width: '100%',
          zIndex: 1000,
        }}>
        <LinearGradient
          colors={[
            activeTrack?.palette?.[5] ?? '#000',
            activeTrack?.palette?.[1] ?? '#fff',
            activeTrack?.palette?.[0] ?? '#000',
          ]}
          useAngle={true}
          angle={290}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: 0.7,
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
        />

        <Slider
          style={{
            width: Dimensions.get('window').width * 1.1,
            marginTop: -10,
            marginBottom: -10,
            marginLeft: -20,
            //height: 40,
          }}
          value={Math.floor((position / duration) * 100) || 0}
          thumbTintColor="transparent"
          minimumValue={0}
          maximumValue={100}
          minimumTrackTintColor={activeTrack?.palette?.[2] || '#FFF'}
          maximumTrackTintColor="#FFFFFF"
        />

        <Pressable onPress={() => navigation.navigate('NowPlaying')}>
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 10,
              paddingHorizontal: 20,
              gap: 5,
            }}>
            <Image
              source={
                activeTrack?.artwork ? {uri: activeTrack?.artwork} : logoJPG
              }
              style={{
                height: 45,
                width: 45,
                marginRight: 8,
                borderRadius: 10,
              }}
            />

            <View
              style={{
                justifyContent: 'center',
                marginTop: -2,
                maxWidth: Dimensions.get('window').width - 175,
                gap: 2,
              }}>
              <Text numberOfLines={1} style={styles.title}>
                {activeTrack?.title}
              </Text>
              <Text numberOfLines={1} style={styles.artists}>
                {activeTrack?.artists ?? 'Unknown Artist'}
              </Text>
            </View>

            <View style={{flex: 1}} />

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Pressable onPress={() => pauseplay()} style={{marginRight: 30}}>
                <Icon
                  name={
                    state === State.Playing ? 'pause-circle' : 'play-circle'
                  }
                  size={45}
                />
              </Pressable>

              <Pressable
                disabled={activeTrackIndex === artworkQueue.length - 1}
                onPress={() => TrackPlayer.skipToNext()}
                android_ripple={{
                  color: 'white',
                  radius: 39,
                  foreground: true,
                  borderless: true,
                }}>
                <Icon
                  name="play-forward"
                  size={25}
                  color={
                    activeTrackIndex === artworkQueue.length - 1
                      ? 'grey'
                      : 'white'
                  }
                />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  title: {fontSize: 17, fontWeight: '600'},
  artists: {fontSize: 14, fontWeight: '300'},
  album: {fontSize: 12, fontWeight: '300'},
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

export default Footer;
