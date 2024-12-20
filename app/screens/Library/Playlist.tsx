// * React
import React, {
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
  useEffect,
} from 'react';

// * React Native
import {
  Image,
  ImageBackground,
  Pressable,
  Text,
  Vibration,
  View,
} from 'react-native';

// * Libraries
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useMutation, useQuery} from '@tanstack/react-query';
import {useBackHandler} from '@react-native-community/hooks';
import axios from 'axios';
import DraggableFlatList, {
  OpacityDecorator,
  RenderItemParams,
  ShadowDecorator,
} from 'react-native-draggable-flatlist';
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import SwipeableItem, {
  SwipeableItemImperativeRef,
} from 'react-native-swipeable-item';

import LinearGradientX from '../../components/LinearGradientX';

import {API_URL, LIST_ITEM_HEIGHT, usePlayerStore} from '../../store';

// * Assets
import imageFiller from '../../assets/images/image-filler.png';

import {formatTrackTime} from '../../functions';

import {TrackProps, TracksProps} from '../../types';
import StatusBarX from '../../components/StatusBarX';
import {queryClient} from '../../../App';
import VerticalListItem from '../../components/Skeletons/VerticalListItem';

export default function Playlist({
  navigation,
  route: {
    params: {id, name, duration, tracks, artwork, artworks, size},
  },
}: any) {
  // ? Refs
  const swipeableItemRef = useRef<SwipeableItemImperativeRef>(null);

  // ? States
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [playlistTracks, setPlaylistTracks] = useState<TracksProps>([]);

  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const palette = usePlayerStore(state => state.palette);

  const play = usePlayerStore(state => state.play);

  const {data, isSuccess, isError, isFetching} = useQuery({
    queryKey: ['playlist', id],
    queryFn: ({queryKey}) => axios(`${API_URL}${queryKey[0]}/${queryKey[1]}`),
    select: ({data}) => data,
  });

  const {mutate: rearrangePlaylist} = useMutation({
    mutationFn: (body: {playlistId: number; trackIds: number[]}) =>
      axios.put(`rearrangePlaylist`, body),
  });

  const {mutate: deletePlaylistTrack} = useMutation({
    mutationFn: (body: {playlistId: number; trackId: number}) =>
      axios.delete(
        `deletePlaylistTrack?playlistId=${body.playlistId}&trackId=${body.trackId}`,
      ),
  });

  // ? Hooks
  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  useEffect(() => {
    if (data?.length > 0) setPlaylistTracks(data);
  }, [data]);

  // ? Effects
  useLayoutEffect(() => {
    navigation.setOptions({
      title: name,
      headerStyle: {backgroundColor: palette?.[1] ?? '#000'},
    });
  }, [navigation, activeTrackIndex]);

  // ? Functions
  const ListItem = ({item}: {item: TrackProps}) => (
    <Pressable onPress={() => play(playlistTracks, item)}>
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
              {item.position}. {item.title}
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
    </Pressable>
  );

  const refetch = () =>
    queryClient
      .refetchQueries({queryKey: ['playlist', id]})
      .then(() => setRefreshing(false));

  // ? Callbacks
  const RenderQueueListItem = useCallback(
    ({item, drag, isActive}: RenderItemParams<any>) => (
      <ShadowDecorator>
        <OpacityDecorator>
          <TouchableOpacity
            activeOpacity={1}
            onLongPress={drag}
            disabled={isActive}>
            <SwipeableItem
              ref={swipeableItemRef}
              item={item}
              onChange={({openDirection}) =>
                openDirection === 'none' ? {} : {}
              }
              renderUnderlayRight={() => (
                <View
                  style={{
                    backgroundColor: 'rgba(255, 87, 51, .3)',
                    flexDirection: 'row',
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      swipeableItemRef.current?.close({animated: true});
                    }}>
                    <Text
                      style={{
                        backgroundColor: '#0005',
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
                      EDIT
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
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
                      // ? Close the item
                      swipeableItemRef.current?.close({animated: true});
                      // ? Remove the track from list
                      playlistTracks.filter(
                        _track => _track.id !== item.id && _track,
                      );
                      // ? Delete track from playlist table
                      deletePlaylistTrack(
                        {playlistId: id, trackId: item.id},
                        {
                          onSuccess: refetch,
                          onError: error => console.log(error.message),
                        },
                      );
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
              activationThreshold={50}
              snapPointsRight={[80]}
              snapPointsLeft={[100]}>
              <ListItem item={item} />
            </SwipeableItem>
          </TouchableOpacity>
        </OpacityDecorator>
      </ShadowDecorator>
    ),
    [],
  );

  return (
    <>
      <StatusBarX />

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
            gap: 13,
            paddingHorizontal: 10,
            paddingVertical: 20,
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
                marginTop: 3,
                paddingLeft: 5,
                paddingRight: 3,
              }}>
              {size}
            </Text>
          </View>
        </View>
      </ImageBackground>

      {isFetching && <VerticalListItem />}

      {isSuccess && (
        <DraggableFlatList
          data={playlistTracks}
          onDragBegin={() => Vibration.vibrate(50)}
          onDragEnd={({data}) => {
            // ? Set the data with the new movements
            setPlaylistTracks(data);
            // ? Store rearranged tracks on DB///
            rearrangePlaylist(
              {playlistId: id, trackIds: data.map(({id}) => id)},
              {
                onSuccess: refetch,
                onError: error => console.log(error.message),
              },
            );
          }}
          keyExtractor={(_, index) => index.toString()}
          renderItem={RenderQueueListItem}
          activationDistance={10}
          containerStyle={{flex: 1, marginVertical: 10}}
        />
      )}
    </>
  );
}
