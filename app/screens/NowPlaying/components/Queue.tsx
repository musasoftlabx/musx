// * React
import React, {useState, useCallback, useRef, useEffect} from 'react';

// * React Native
import {FlatList, Image, View, Text, Vibration} from 'react-native';

// * Libraries
import {
  OpacityDecorator,
  RenderItemParams,
  ScaleDecorator,
  ShadowDecorator,
} from 'react-native-draggable-flatlist';
import {SegmentedButtons} from 'react-native-paper';
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import {TouchableOpacity} from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import SwipeableItem, {
  SwipeableItemImperativeRef,
} from 'react-native-swipeable-item';
import {Track} from 'react-native-track-player';

// * Store
import {HEIGHT, LIST_ITEM_HEIGHT, usePlayerStore} from '../../../store';

// * Functions
import {formatTrackTime} from '../../../functions';

// * Types
import {TrackProps, TracksProps} from '../../../types';

export default function Queue() {
  // ? Refs
  const swipeableItemRef = useRef<SwipeableItemImperativeRef>(null);

  // ? StoreStates
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const queue = usePlayerStore(state => state.queue);

  // ? StoreActions
  const moveTrack = usePlayerStore(state => state.moveTrack);
  const remove = usePlayerStore(state => state.remove);
  const setQueue = usePlayerStore(state => state.setQueue);
  const skipTo = usePlayerStore(state => state.skipTo);

  // ? States
  const [tab, setTab] = useState('upNext');
  const [backToData, setBackToData] = useState(queue);
  const [upNextData, setUpNextData] = useState<Track[]>(queue);

  // ? Effects
  useEffect(() => {
    setBackToData(
      queue
        .slice(
          activeTrackIndex - 10 > 0 ? activeTrackIndex - 10 : 0,
          activeTrackIndex,
        )
        .reverse(),
    );

    setUpNextData(queue.slice(activeTrackIndex + 1, activeTrackIndex + 10));
  }, [queue, activeTrackIndex]);

  // ? Functions
  const ListItem = ({item}: {item: TrackProps}) => (
    <TouchableOpacity activeOpacity={1} onPress={() => skipTo(item)}>
      <View
        style={{
          flex: 1,
          flexWrap: 'nowrap',
          flexDirection: 'row',
          alignItems: 'center',
          height: LIST_ITEM_HEIGHT,
          marginHorizontal: 10,
        }}>
        {/* Track details */}
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <Image
            source={{uri: item.artwork}}
            style={[{borderRadius: 10, height: 45, width: 45}]}
          />
          <View style={{flexBasis: '60%', gap: 2}}>
            <Text
              numberOfLines={1}
              style={{fontSize: 16, fontWeight: '600', width: '97%'}}>
              {item.title}
            </Text>
            <Text numberOfLines={1} style={{fontSize: 14, color: '#ffffff80'}}>
              {item.artists ?? 'Unknown Artist'}
            </Text>
          </View>
        </View>
        {/* Rating, Plays & Duration */}
        <View
          style={{
            flex: 1,
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 3,
          }}>
          <StarRatingDisplay
            rating={item.rating}
            starSize={16}
            starStyle={{marginHorizontal: 0}}
          />
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text numberOfLines={1} style={{fontWeight: 'bold'}}>
              {item.plays || 0} play
              {`${item.plays === 1 ? '' : 's'}`}
            </Text>
            <Text>{' / '}</Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                marginRight: 3,
              }}>
              {formatTrackTime(item.duration)} mins
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ? Callbacks
  const RenderQueueListItem = useCallback(
    ({item, drag, isActive}: RenderItemParams<any>) => (
      <ShadowDecorator>
        <ScaleDecorator>
          <OpacityDecorator>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => skipTo(item)}
              onLongPress={drag}
              disabled={isActive}>
              <SwipeableItem
                ref={swipeableItemRef}
                item={item}
                onChange={({openDirection}) =>
                  openDirection === 'none' ? {} : {}
                }
                renderUnderlayLeft={() => (
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 87, 51, .3)',
                      justifyContent: 'flex-end',
                      flexDirection: 'row',
                      paddingHorizontal: 15,
                      paddingVertical: 10,
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        swipeableItemRef.current?.close({animated: true});
                        remove(item);
                      }}>
                      <Text
                        style={{
                          backgroundColor: 'red',
                          borderWidth: 1,
                          borderColor: '#fff',
                          borderRadius: 5,
                          fontWeight: 'bold',
                          color: 'white',
                          fontSize: 15,
                          paddingTop: 9,
                          paddingRight: 13,
                          paddingBottom: 8,
                          paddingLeft: 15,
                          zIndex: 2,
                        }}>
                        DELETE
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                activationThreshold={0}
                snapPointsLeft={[150]}>
                <ListItem item={item} />
              </SwipeableItem>
            </TouchableOpacity>
          </OpacityDecorator>
        </ScaleDecorator>
      </ShadowDecorator>
    ),
    [],
  );

  const QueueCallback = useCallback(
    () => (
      <>
        <SegmentedButtons
          value={tab}
          onValueChange={state => setTab(state)}
          buttons={[
            {
              value: 'backTo',
              label: 'BACK TO',
              labelStyle: {fontWeight: 'bold'},
              checkedColor: '#000',
              uncheckedColor: '#fff',
              style: {borderColor: '#fff'},
            },
            {
              value: 'upNext',
              label: 'UP NEXT',
              labelStyle: {fontWeight: 'bold'},
              checkedColor: '#000',
              uncheckedColor: '#fff',
              style: {borderColor: '#fff'},
            },
          ]}
          style={{marginHorizontal: 60, marginTop: 20}}
          theme={{colors: {secondaryContainer: '#fff'}}}
        />

        {tab === 'upNext' ? (
          <DraggableFlatList
            data={upNextData}
            onDragBegin={() => Vibration.vibrate(50)}
            onDragEnd={({data, from, to}) => {
              // ? Set the data with the new movements
              //setUpNextData(data);
              tab === 'upNext'
                ? setUpNextData(data)
                : setBackToData(
                    queue
                      .slice(
                        activeTrackIndex - 10 > 0 ? activeTrackIndex - 10 : 0,
                        activeTrackIndex,
                      )
                      .reverse(),
                  );
              // ? Restore the queue by combining the trimmed tracks
              const restoredQueue = [
                ...queue.slice(0, activeTrackIndex + 1),
                ...data,
                ...queue.slice(11),
              ];
              // ? Get the index from and to based on the whole queue
              const _from = restoredQueue.findIndex(
                track => track.id === data.find((_, i) => i === from)?.id,
              );
              const _to = restoredQueue.findIndex(
                track => track.id === data.find((_, i) => i === to)?.id,
              );
              // ? Set the player queue with the new movements
              moveTrack(_from, _to);
              // ? Set the store queue with the new movements
              setQueue(restoredQueue);
            }}
            keyExtractor={({id}) => id.toString()}
            renderItem={RenderQueueListItem}
            activationDistance={0}
            ListEmptyComponent={() => (
              <View
                style={{
                  height: HEIGHT / 3,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text>No tracks</Text>
              </View>
            )}
            containerStyle={{marginVertical: 10}}
          />
        ) : (
          <FlatList
            data={backToData as TracksProps}
            keyExtractor={({id}) => id.toString()}
            renderItem={({item}: {item: TrackProps}) => (
              <ListItem item={item} />
            )}
            style={{marginVertical: 5}}
          />
        )}
      </>
    ),
    [tab, queue],
  );

  return (
    queue.length > 1 && (
      <>
        <SegmentedButtons
          value={tab}
          onValueChange={state => setTab(state)}
          buttons={[
            {
              value: 'backTo',
              label: 'BACK TO',
              labelStyle: {fontWeight: 'bold'},
              checkedColor: '#000',
              uncheckedColor: '#fff',
              style: {borderColor: '#fff'},
            },
            {
              value: 'upNext',
              label: 'UP NEXT',
              labelStyle: {fontWeight: 'bold'},
              checkedColor: '#000',
              uncheckedColor: '#fff',
              style: {borderColor: '#fff'},
            },
          ]}
          style={{marginHorizontal: 60, marginTop: 20}}
          theme={{colors: {secondaryContainer: '#fff'}}}
        />

        {tab === 'upNext' ? (
          <DraggableFlatList
            data={upNextData}
            onDragBegin={() => Vibration.vibrate(50)}
            onDragEnd={({data, from, to}) => {
              // ? Set the data with the new movements
              //setUpNextData(data);
              tab === 'upNext'
                ? setUpNextData(data)
                : setBackToData(
                    queue
                      .slice(
                        activeTrackIndex - 10 > 0 ? activeTrackIndex - 10 : 0,
                        activeTrackIndex,
                      )
                      .reverse(),
                  );
              // ? Restore the queue by combining the trimmed tracks
              const restoredQueue = [
                ...queue.slice(0, activeTrackIndex + 1),
                ...data,
                ...queue.slice(11),
              ];
              // ? Get the index from and to based on the whole queue
              const _from = restoredQueue.findIndex(
                track => track.id === data.find((_, i) => i === from)?.id,
              );
              const _to = restoredQueue.findIndex(
                track => track.id === data.find((_, i) => i === to)?.id,
              );
              // ? Set the player queue with the new movements
              moveTrack(_from, _to);
              // ? Set the store queue with the new movements
              setQueue(restoredQueue);
            }}
            keyExtractor={(_, index) => index.toString()}
            renderItem={RenderQueueListItem}
            activationDistance={0}
            ListEmptyComponent={() => (
              <View
                style={{
                  height: HEIGHT / 3,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text>No tracks</Text>
              </View>
            )}
            containerStyle={{marginVertical: 10}}
          />
        ) : (
          <FlatList
            data={backToData as TracksProps}
            keyExtractor={({id}) => id.toString()}
            renderItem={({item}: {item: TrackProps}) => (
              <ListItem item={item} />
            )}
            style={{marginVertical: 5}}
          />
        )}
      </>
    )
  );
  //return queue.length > 1 && <QueueCallback />;
}
