// * React
import React from 'react';

// * React Native
import { Image, Pressable, StyleProp, Vibration, View } from 'react-native';

// * NPM
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import { State } from 'react-native-track-player';
import { Text } from 'react-native-paper';
import { useDeviceOrientation } from '@react-native-community/hooks';
import { useMutation } from '@tanstack/react-query';
import Animated from 'react-native-reanimated';
import axios from 'axios';

// * Store
import { API_URL, usePlayerStore, WIDTH } from '../store';

// * Types
import { TrackProps } from '../types';

// * Functions
import { handleAxiosError, formatTrackTime } from '../functions';

// * Hooks
import useRotate360Animation from '../shared/hooks/useRotate360Animation';

// * Icons
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ListItem({
  isPressable,
  display,
  item,
  tracks,
}: {
  isPressable?: boolean;
  display?: 'size' | 'bitrate' | 'duration' | 'position';
  item: TrackProps;
  tracks?: TrackProps[];
}) {
  // ? Store States
  const { state } = usePlayerStore(state => state.playbackState);
  const activeTrack = usePlayerStore(state => state.activeTrack);

  // ? Store Actions
  const openTrackDetails = usePlayerStore(state => state.openTrackDetails);
  const play = usePlayerStore(state => state.play);
  const setTrackDetails = usePlayerStore(state => state.setTrackDetails);
  const setTrackRating = usePlayerStore(state => state.setTrackRating);

  // ? Mutations
  const { mutate: retrieveLastModifiedPlaylist } = useMutation({
    mutationFn: (body: unknown) => axios(`${API_URL}lastModifiedPlaylist`),
  });

  // ? Constants
  const isActive = activeTrack?.id === item.id;
  const isPlaying = state === State.Playing;

  // ? Hooks
  const orientation = useDeviceOrientation();
  const rotate = useRotate360Animation();

  const itemStyle: StyleProp<Object> = [
    isActive
      ? {
          backgroundColor: '#ffffff4d',
          borderRadius: 10,
          marginHorizontal: 6,
          paddingHorizontal: 5,
        }
      : { marginHorizontal: 10 },
    { alignItems: 'center', flexDirection: 'row', paddingVertical: 7 },
  ];

  const Item = () => (
    <>
      {/* Track details */}
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
        {isActive ? (
          <>
            {isPlaying ? (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Animated.Image
                  source={{ uri: item.artwork }}
                  style={[
                    {
                      borderColor: '#ffffff80',
                      borderRadius: 100,
                      borderWidth: 1,
                      height: 45,
                      width: 45,
                    },
                    rotate,
                  ]}
                />
                {/* <Image
                  source={{ uri: item.artwork }}
                  style={[{ borderRadius: 100, height: 45, width: 45 }]}
                /> */}
                <Icon
                  name="circle-thin"
                  size={26}
                  style={{
                    position: 'absolute',
                    color: '#fff',
                    opacity: 0.7,
                  }}
                />
                <Icon
                  name="circle"
                  size={18}
                  style={{
                    position: 'absolute',
                    color: '#fff',
                    opacity: 0.5,
                  }}
                />
                <Icon
                  name="circle"
                  size={10}
                  style={{ position: 'absolute', color: '#000', opacity: 1 }}
                />
              </View>
            ) : (
              <Image
                source={{ uri: item.artwork }}
                style={[{ borderRadius: 100, height: 45, width: 45 }]}
              />
            )}
          </>
        ) : (
          <Image
            source={{ uri: item.artwork }}
            style={[{ borderRadius: 10, height: 45, width: 45 }]}
          />
        )}
        <View
          style={{
            flexBasis: orientation === 'portrait' ? `${WIDTH * 0.13}%` : 'auto',
            gap: 2,
          }}
        >
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
            <Text
              numberOfLines={1}
              style={
                !display
                  ? {}
                  : display === 'position'
                  ? { fontSize: 16, marginLeft: 3, marginRight: -4 }
                  : {
                      backgroundColor: '#ffffff4D',
                      borderColor: '#fff',
                      borderRadius: 8,
                      borderWidth: 0.5,
                      fontSize: 12,
                      paddingHorizontal: 5,
                      paddingTop: 2,
                      paddingLeft: 7,
                    }
              }
            >
              {display === 'size'
                ? `${(item.size / 1000000).toFixed(2)} MB`
                : display === 'bitrate'
                ? `${(item.bitrate! / 1000).toFixed(0)} Kbps`
                : display === 'duration'
                ? item.duration
                : display === 'position'
                ? `${item.position}.`
                : ''}
            </Text>
            <Text numberOfLines={1} style={{ fontSize: 16, width: '70%' }}>
              {item.title}
            </Text>
          </View>

          <Text
            numberOfLines={1}
            style={{
              fontSize: 14,
              color: '#ffffff80',
              marginLeft: 3,
              maxWidth: orientation === 'portrait' ? '95%' : '85%',
            }}
          >
            {item.artists ?? 'Unknown Artist'}
          </Text>
        </View>
      </View>

      {/* Rating & Plays */}
      <View
        style={{
          alignItems: 'flex-end',
          flex: 1,
          gap: 3,
          justifyContent: 'center',
        }}
      >
        <StarRatingDisplay
          rating={item.rating}
          starSize={16}
          starStyle={{ marginHorizontal: 0 }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text numberOfLines={1} style={{ fontWeight: 'bold' }}>
            {item.plays || 0} play
            {`${item.plays === 1 ? '' : 's'}`}
          </Text>
          <Text>{'  ◎  '}</Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              marginRight: 3,
            }}
          >
            {formatTrackTime(item.duration)} mins
          </Text>
        </View>
      </View>
    </>
  );

  return isPressable ? (
    <Pressable
      onPress={() => play(tracks, item)}
      onLongPress={() => {
        Vibration.vibrate(100);
        openTrackDetails();
        setTrackRating(item.rating);
        retrieveLastModifiedPlaylist(
          {},
          {
            onSuccess: ({ data }) =>
              setTrackDetails({ ...item, lastModifiedPlaylist: data }),
            onError: handleAxiosError,
          },
        );
      }}
      style={itemStyle}
    >
      <Item />
    </Pressable>
  ) : (
    <View style={itemStyle}>
      <Item />
    </View>
  );
}
