// * React
import React, {useState, useCallback} from 'react';

// * Assets
import {SegmentedButtons} from 'react-native-paper';

// * Components
import BackTo from './BackTo';
import UpNext from './UpNext';

// * Store
import {usePlayerStore} from '../../../store';
import {
  OpacityDecorator,
  RenderItemParams,
  ScaleDecorator,
  ShadowDecorator,
} from 'react-native-draggable-flatlist';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {View} from 'react-native-animatable';
import {Image, Text} from 'react-native';
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import {formatTrackTime} from '../../../functions';

export default function Queue() {
  // ? StoreStates
  const queue = usePlayerStore(state => state.queue);

  // ? StoreActions
  const skipTo = usePlayerStore(state => state.skipTo);

  // ? States
  const [tab, setTab] = useState('upNext');

  // ? Callbacks
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
              checkedColor: '#000',
              uncheckedColor: '#fff',
            },
            {
              value: 'upNext',
              label: 'UP NEXT',
              checkedColor: '#000',
              uncheckedColor: '#fff',
            },
          ]}
          style={{borderColor: '#fff', marginHorizontal: 60, marginTop: 20}}
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
              disabled={isActive}
              style={[
                {height: 60, alignItems: 'center', justifyContent: 'center'},
                {backgroundColor: isActive ? 'blue' : item.backgroundColor},
              ]}>
              <View
                style={{
                  flex: 1,
                  flexWrap: 'nowrap',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginHorizontal: 10,
                }}>
                {/* Track details */}
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
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

                    <Text
                      numberOfLines={1}
                      style={{fontSize: 14, color: '#ffffff80'}}>
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
          </OpacityDecorator>
        </ScaleDecorator>
      </ShadowDecorator>
    ),
    [],
  );

  return queue.length > 1 && <QueueCallback />;
}
