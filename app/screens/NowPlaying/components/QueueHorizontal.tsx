// * React
import React, { useCallback } from 'react';

// * React Native
import { Image, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Track } from 'react-native-track-player';

// * Store
import { usePlayerStore, WIDTH } from '../../../store';

// * Types
import { TrackProps } from '../../../types';
import { fontFamilyBold } from '../../../utils';

export default function QueueHorizontal() {
  // ? Store States
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const queue = usePlayerStore(state => state.queue);
  const skipTo = usePlayerStore(state => state.skipTo);
  const trackPlayCount = usePlayerStore(state => state.trackPlayCount);

  const ListItem = ({ item, title }: { item: Track; title: string }) => (
    <Pressable
      style={{ marginHorizontal: 5 }}
      onPress={() => skipTo(item as TrackProps)}
    >
      <View
        style={{
          backgroundColor: '#ffffff26',
          borderRadius: 10,
          gap: 10,
          marginTop: 30,
          paddingHorizontal: 15,
          paddingVertical: 10,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            backgroundColor: '#a7a7a745',
            borderColor: '#ffffff4D',
            borderWidth: 1,
            borderRadius: 3,
            fontFamily: fontFamilyBold,
            fontSize: 8,
            paddingHorizontal: 5,
            paddingTop: 2,
            paddingLeft: 7,
            width: '24%',
          }}
        >
          {title}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Image
            source={{ uri: item?.artwork }}
            style={[{ borderRadius: 10, height: 45, width: 45 }]}
          />
          <View style={{ width: WIDTH * 0.12 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fontFamilyBold,
                fontSize: 16,
                width: '97%',
              }}
            >
              {item?.title}
            </Text>
            <Text
              numberOfLines={1}
              style={{ color: '#ffffff80', fontSize: 14, marginTop: -3 }}
            >
              {item?.artists ?? 'Unknown Artist'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  // ? Callbacks
  const RenderQueue = useCallback(
    () => (
      <View style={{ flex: 1, marginTop: 20 }}>
        {activeTrackIndex !== 0 && (
          <ListItem item={queue[activeTrackIndex - 1]} title="BACK TO" />
        )}

        {queue.length - 1 !== activeTrackIndex && (
          <ListItem item={queue[activeTrackIndex + 1]} title="UP NEXT" />
        )}

        <Text
          style={{
            bottom: 50,
            fontFamily: fontFamilyBold,
            opacity: 0.8,
            position: 'absolute',
            right: 10,
          }}
        >
          {trackPlayCount} play
          {`${trackPlayCount === 1 ? '' : 's'}`}
          {'  ◎  '}
          {`${activeTrackIndex! + 1}/${queue.length}`} enqueue
        </Text>
      </View>
    ),
    [queue, activeTrackIndex],
  );

  return RenderQueue();
}
