// * React
import React from 'react';

// * React Native
import { View, Image, Pressable, Vibration } from 'react-native';

// * Libraries
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import { State } from 'react-native-track-player';
import { Text } from 'react-native-paper';
import Animated, {
  Easing,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// * Store
import { usePlayerStore, WIDTH } from '../store';

// * Types
import { ArtistProps } from '../screens/Library/Artist';
import { TrackProps, TracksProps } from '../types';

// * Functions
import { formatTrackTime } from '../functions';

// * Icons
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ListItem({
  data,
  item,
  display,
}: {
  data: TracksProps | ArtistProps['albums'];
  item: TrackProps;
  display?: 'size' | 'bitrate' | 'duration';
}) {
  // ? StoreStates
  const { state } = usePlayerStore(state => state.playbackState);
  const activeTrack = usePlayerStore(state => state.activeTrack);

  // ? StoreActions
  const play = usePlayerStore(state => state.play);
  const openTrackDetails = usePlayerStore(state => state.openTrackDetails);
  const setTrackDetails = usePlayerStore(state => state.setTrackDetails);
  const setTrackRating = usePlayerStore(state => state.setTrackRating);

  // ? Constants
  const isActive = activeTrack?.id === item.id;
  const isPlaying = state === State.Playing;

  // ? Hooks
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotateZ: withRepeat(
          withSequence(
            withTiming(0 + 'deg', { duration: 0, easing: Easing.linear }),
            withTiming(360 + 'deg', { duration: 3000, easing: Easing.linear }),
          ),
          -1,
          false,
        ),
      },
    ],
  }));

  return (
    <Pressable
      onPress={() => play(data, item)}
      onLongPress={() => {
        Vibration.vibrate(100);
        setTrackDetails(item);
        openTrackDetails();
        setTrackRating(item.rating);
      }}
      style={[
        isActive
          ? {
              backgroundColor: '#ffffff4d',
              borderRadius: 10,
              marginVertical: 3,
              marginHorizontal: 6,
              paddingHorizontal: 5,
            }
          : { marginHorizontal: 10 },
        { alignItems: 'center', flexDirection: 'row', paddingVertical: 7 },
      ]}
    >
      {/* Track details */}
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
        {isActive ? (
          <>
            {isPlaying ? (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Animated.Image
                  source={{ uri: item.artwork }}
                  style={[
                    { borderRadius: 100, height: 45, width: 45 },
                    animatedStyle,
                  ]}
                />
                <Icon
                  name="circle-thin"
                  size={26}
                  style={{ position: 'absolute', color: '#fff', opacity: 0.7 }}
                />
                <Icon
                  name="circle"
                  size={18}
                  style={{ position: 'absolute', color: '#fff', opacity: 0.5 }}
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
        <View style={{ flexBasis: `${WIDTH * 0.12}%`, gap: 2 }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 6 }}>
            <Text
              numberOfLines={1}
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#ffffff4D',
                borderRadius: 5,
                marginTop: 1,
                maxWidth: 'auto',
                paddingVertical: 1,
                paddingHorizontal: 5,
              }}
            >
              {display === 'size'
                ? `${(item.size / 1000000).toFixed(2)} MB`
                : display === 'bitrate'
                ? `${(item.bitrate! / 1000).toFixed(0)} Kbps`
                : display === 'duration'
                ? item.duration
                : ''}
            </Text>
            <Text
              numberOfLines={1}
              style={{ fontSize: 16, fontWeight: '600', width: '70%' }}
            >
              {item.title}
            </Text>
          </View>
          <Text
            numberOfLines={1}
            style={{ fontSize: 14, color: '#ffffff80', marginLeft: 3 }}
          >
            {item.artists ?? 'Unknown Artist'}
          </Text>
        </View>
      </View>
      {/* Rating & Plays */}
      <View
        style={{
          flex: 1,
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 3,
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
    </Pressable>
  );
}
