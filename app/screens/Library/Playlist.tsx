import React, {
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
  useEffect,
} from 'react';

import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Text,
  Vibration,
  View,
} from 'react-native';

import {FlashList} from '@shopify/flash-list';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import BottomSheet from '@gorhom/bottom-sheet';
import DraggableFlatList, {
  OpacityDecorator,
  RenderItemParams,
  ScaleDecorator,
  ShadowDecorator,
} from 'react-native-draggable-flatlist';
import SwipeableItem, {
  SwipeableItemImperativeRef,
} from 'react-native-swipeable-item';

import LinearGradientX from '../../components/LinearGradientX';
import ListItem from '../../components/ListItem';
import TrackDetails from '../../components/TrackDetails';

import {
  API_URL,
  HEIGHT,
  LIST_ITEM_HEIGHT,
  usePlayerStore,
  WIDTH,
} from '../../store';

// * Assets
import imageFiller from '../../assets/images/image-filler.png';

import {TrackProps, TracksProps} from '../../types';
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import {formatTrackTime} from '../../functions';
import {Track} from 'react-native-track-player';

export default function Playlist({
  navigation,
  route: {
    params: {id, name, duration, tracks, artwork, artworks, size},
  },
}: any) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);
  const swipeableItemRef = useRef<SwipeableItemImperativeRef>(null);

  // ? States
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [track, setTrack] = useState<TrackProps>();
  const [playlistTracks, setPlaylistTracks] = useState<TracksProps>([]);

  const palette = usePlayerStore(state => state.palette);

  const remove = usePlayerStore(state => state.remove);
  const skipTo = usePlayerStore(state => state.skipTo);

  const {data, isSuccess, isError, isFetching} = useQuery({
    queryKey: ['playlist', id],
    queryFn: ({queryKey}) => axios(`${API_URL}${queryKey[0]}/${queryKey[1]}`),
    select: ({data}) => data,
  });

  useEffect(() => {
    if (data.length > 0) setPlaylistTracks(data);
  }, data);

  // ? Effects
  useLayoutEffect(() => {
    navigation.setOptions({
      title: name,
      headerStyle: {backgroundColor: palette?.[1] ?? '#000'},
    });
  }, [navigation]);

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

  return (
    <>
      <LinearGradientX />

      <ImageBackground source={imageFiller} resizeMode="cover" blurRadius={20}>
        <View
          style={{
            backgroundColor: 'black',
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            opacity: 0,
            zIndex: 2,
          }}
        />
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: 10,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}>
          {!artwork ? (
            <View
              style={{
                borderRadius: 10,
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: 0.5,
                width: 100,
                height: 100,
                overflow: 'hidden',
              }}>
              {artworks.map((artwork: string, i: number) => (
                <Image
                  key={i}
                  source={{uri: artwork}}
                  style={{width: 50, height: 50}}
                  resizeMode="cover"
                />
              ))}
            </View>
          ) : (
            <Image
              source={{uri: artwork}}
              defaultSource={require('../../assets/images/musician.png')}
              style={{width: 100, height: 100, borderRadius: 100}}
              resizeMode="cover"
            />
          )}

          <View style={{gap: 5}}>
            <Text style={{fontSize: 24, fontWeight: '800'}}>
              {tracks} tracks
            </Text>
            <Text style={{fontSize: 20, opacity: 0.5}}>{duration} mins</Text>
            <Text
              numberOfLines={1}
              style={{
                alignSelf: 'flex-start',
                borderColor: '#ffffff4D',
                borderWidth: 1,
                borderRadius: 5,
                fontSize: 18,
                marginTop: 1,
                paddingLeft: 5,
                paddingRight: 3,
              }}>
              {size}
            </Text>
          </View>
        </View>
      </ImageBackground>

      {isFetching && (
        <ActivityIndicator
          size="large"
          color="#fff"
          style={{marginTop: '50%'}}
        />
      )}

      {isSuccess && (
        <DraggableFlatList
          data={playlistTracks}
          onDragBegin={() => Vibration.vibrate(50)}
          onDragEnd={({data, from, to}) => {
            // ? Set the data with the new movements
            setPlaylistTracks(data);

            /* // ? Restore the queue by combining the trimmed tracks
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
            setQueue(restoredQueue); */
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
      )}

      {/* {isSuccess && (
        <FlashList
          data={playlistTracks}
          keyExtractor={(_, index) => index.toString()}
          estimatedItemSize={10}
          estimatedListSize={{height: HEIGHT, width: WIDTH}}
          renderItem={({item}: {item: TrackProps}) => (
            <ListItem
              data={playlistTracks}
              item={item}
              display="bitrate"
              bottomSheetRef={bottomSheetRef}
              setTrack={setTrack}
              setBottomSheetVisible={setBottomSheetVisible}
            />
          )}
        />
      )} */}
    </>
  );
}
