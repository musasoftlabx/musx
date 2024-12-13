// * React
import React from 'react';

// * React Native
import {View, Image, Pressable, Vibration} from 'react-native';

// * Libraries
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import {State} from 'react-native-track-player';
import {Text} from 'react-native-paper';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

// * Store
import {usePlayerStore, WIDTH} from '../store';

// * Types
import {ArtistProps} from '../screens/Library/Artist';
import {TrackProps, TracksProps} from '../types';

// * Functions
import {formatTrackTime} from '../functions';

const duration = 2000;
const easing = Easing.bezier(0.25, -0.5, 0.25, 1);

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
  const {state} = usePlayerStore(state => state.playbackState);
  const activeTrack = usePlayerStore(state => state.activeTrack);

  // ? StoreActions
  const play = usePlayerStore(state => state.play);
  const openTrackDetails = usePlayerStore(state => state.openTrackDetails);
  const setTrackDetails = usePlayerStore(state => state.setTrackDetails);

  // ? Constants
  const isActive = activeTrack.id === item.id;
  const isPlaying = state === State.Playing;

  // ? Hooks
  const sv = useSharedValue<number>(0);

  React.useEffect(() => {
    sv.value = withRepeat(withTiming(1, {duration, easing}), -1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${sv.value * 360}deg`}],
  }));

  return (
    <Pressable
      onPress={() => play(data, item)}
      onLongPress={() => {
        Vibration.vibrate(100);
        setTrackDetails(item);
        openTrackDetails();
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
          : {marginHorizontal: 10},
        {alignItems: 'center', flexDirection: 'row', paddingVertical: 7},
      ]}>
      {/* Track details */}
      <View style={{alignItems: 'center', flexDirection: 'row', gap: 10}}>
        {isActive ? (
          <>
            {isPlaying ? (
              <Animated.Image
                source={{uri: item.artwork}}
                style={[
                  {borderRadius: 100, height: 45, width: 45},
                  animatedStyle,
                ]}
              />
            ) : (
              <Image
                source={{uri: item.artwork}}
                style={[{borderRadius: 100, height: 45, width: 45}]}
              />
            )}
          </>
        ) : (
          <Image
            source={{uri: item.artwork}}
            style={[{borderRadius: 10, height: 45, width: 45}, animatedStyle]}
          />
        )}
        <View style={{flexBasis: `${WIDTH * 0.12}%`, gap: 2}}>
          <View style={{alignItems: 'center', flexDirection: 'row', gap: 6}}>
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
              }}>
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
              style={{fontSize: 16, fontWeight: '600', width: '97%'}}>
              {item.title}
            </Text>
          </View>
          <Text
            numberOfLines={1}
            style={{fontSize: 14, color: '#ffffff80', marginLeft: 3}}>
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
        }}>
        {item.rating !== 0 ? (
          <StarRatingDisplay
            rating={item.rating}
            starSize={16}
            starStyle={{marginHorizontal: 0}}
          />
        ) : (
          <Text>{formatTrackTime(item.duration)} mins</Text>
        )}
        <Text numberOfLines={1} style={{fontWeight: 'bold', marginRight: 3}}>
          {item.plays || 0} play
          {`${item.plays === 1 ? '' : 's'}`}
        </Text>
      </View>
    </Pressable>
  );
}
