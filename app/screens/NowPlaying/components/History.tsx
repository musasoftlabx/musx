// * React
import React, {useState, useCallback, useEffect} from 'react';

// * React Native
import {Image, Text, TouchableOpacity, View} from 'react-native';

// * Libraries
import DraggableFlatList, {
  OpacityDecorator,
  RenderItemParams,
  ScaleDecorator,
  ShadowDecorator,
} from 'react-native-draggable-flatlist';
import {StarRatingDisplay} from 'react-native-star-rating-widget';

// * Store
import {usePlayerStore, WIDTH} from '../../../store';

// * Types
import {QueueProps, TrackProps, TracksProps} from '../../../types';
import TrackPlayer from 'react-native-track-player';

export default function History({
  queue,
  activeTrack,
  activeTrackIndex,
}: QueueProps) {
  // ? States
  const [data, setData] = useState<TracksProps>([]);

  const setQueue = usePlayerStore(state => state.setQueue);

  // ? Effects
  useEffect(() => {
    setData(queue.slice(activeTrackIndex! - 10, activeTrackIndex).reverse());
  }, [activeTrackIndex]);

  // ? Callbacks
  const renderItem = useCallback(
    ({item, drag, isActive}: RenderItemParams<any>) => (
      <ShadowDecorator>
        <ScaleDecorator>
          <OpacityDecorator>
            <TouchableOpacity
              activeOpacity={1}
              onLongPress={drag}
              disabled={isActive}
              style={[
                {
                  height: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                {
                  backgroundColor: isActive ? 'blue' : item.backgroundColor,
                },
              ]}>
              <View
                style={[
                  activeTrack?.id === item.id
                    ? {
                        backgroundColor: '#ffffff4d',
                        borderRadius: 10,
                        flexDirection: 'row',
                        paddingBottom: 6,
                        paddingTop: 6,
                        paddingHorizontal: 10,
                        marginTop: 10,
                      }
                    : {
                        flexDirection: 'row',
                        paddingVertical: 10,
                        paddingHorizontal: 10,
                        marginTop: 10,
                      },
                ]}>
                <Image
                  source={{uri: item.artwork}}
                  style={
                    activeTrack?.id === item.id
                      ? {
                          height: 45,
                          width: 45,
                          marginRight: 8,
                          borderRadius: 100,
                          //transform: [{rotate: spin}],
                        }
                      : {
                          height: 45,
                          width: 45,
                          marginRight: 8,
                          borderRadius: 10,
                        }
                  }
                />
                <View
                  style={{
                    justifyContent: 'center',
                    maxWidth: WIDTH - 175,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{fontSize: 17, fontWeight: '600'}}>
                    {item.title}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{fontSize: 13, fontWeight: '300'}}>
                    {item.artists || 'Unknown Artist'}
                  </Text>
                </View>
                <View style={{flex: 1}} />
                <View
                  style={{justifyContent: 'center', alignItems: 'flex-end'}}>
                  <StarRatingDisplay
                    rating={item.rating}
                    starSize={16}
                    starStyle={{marginHorizontal: 0}}
                  />
                  <Text style={{fontWeight: 'bold', marginRight: 5}}>
                    {item.plays || 0} play{item.plays === 1 ? '' : 's'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </OpacityDecorator>
        </ScaleDecorator>
      </ShadowDecorator>
    ),
    [],
  );

  return (
    <View>
      <Text>uiyf</Text>
    </View>
  );

  return (
    <DraggableFlatList
      data={data}
      onDragEnd={async ({data, from, to}) => {
        setData(data);

        const restoredQueue = [
          ...queue.slice(0, activeTrackIndex + 1),
          ...data,
        ];

        setQueue(restoredQueue);

        await TrackPlayer.move(
          restoredQueue.findIndex(
            (track: TrackProps) =>
              track.id === data.find((x, i) => i === from)?.id,
          ),
          restoredQueue.findIndex(
            (track: TrackProps) =>
              track.id === data.find((x, i) => i === to)?.id,
          ),
        );

        console.log(restoredQueue.map(t => t.title));
        console.error(
          restoredQueue.findIndex(
            (track: TrackProps) =>
              track.title === data.find((x, i) => i === from)?.title,
          ),
          restoredQueue.findIndex(
            (track: TrackProps) =>
              track.title === data.find((x, i) => i === to)?.title,
          ),
        );
      }}
      keyExtractor={({id}) => id.toString()}
      renderItem={renderItem}
      renderPlaceholder={() => (
        <View style={{backgroundColor: 'yellow', height: 60}} />
      )}
      containerStyle={{marginVertical: 10}}
    />
  );
}
