// * React
import React, {useState, useCallback, useRef} from 'react';

// * React Native
import {Image, View, Text} from 'react-native';

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
import SwipeableItem, {
  SwipeableItemImperativeRef,
} from 'react-native-swipeable-item';

// * Components
import BackTo from './BackTo';
import UpNext from './UpNext';

// * Store
import {LIST_ITEM_HEIGHT, usePlayerStore} from '../../../store';

// * Functions
import {formatTrackTime} from '../../../functions';

// * Types
import {TrackProps} from '../../../types';

export default function Queue() {
  // ? Refs
  const swipeableItemRef = useRef<SwipeableItemImperativeRef>(null);

  // ? StoreStates
  const queue = usePlayerStore(state => state.queue);

  // ? StoreActions
  const remove = usePlayerStore(state => state.remove);
  const skipTo = usePlayerStore(state => state.skipTo);

  // ? States
  const [tab, setTab] = useState('upNext');

  const ListItem = ({item}: {item: TrackProps}) => (
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
          <UpNext RenderQueueListItem={RenderQueueListItem} />
        ) : (
          <BackTo RenderQueueListItem={RenderQueueListItem} />
        )}
      </>
    ),
    [tab],
  );

  return queue.length > 1 && <QueueCallback />;
}
