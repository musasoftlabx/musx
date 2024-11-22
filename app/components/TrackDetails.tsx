// * React
import React from 'react';

// * React Native
import {View, Image, Pressable, Vibration, Alert} from 'react-native';

// * Libraries
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import TrackPlayer, {State} from 'react-native-track-player';
import {Text} from 'react-native-paper';

// * Store
import {ARTWORK_URL, usePlayerStore} from '../store';

// * Assets
import {TrackProps} from '../types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function TrackDetails({
  highlighted,
  navigation,
  bottomSheetRef,
}: {
  highlighted: any;
  navigation: any;
  bottomSheetRef?: any;
}) {
  // ? StoreStates
  const activeTrack = usePlayerStore(state => state.activeTrack);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['64%']}
      enableDynamicSizing={false}
      enablePanDownToClose
      handleIndicatorStyle={{backgroundColor: '#fff'}}
      backgroundStyle={{
        backgroundColor: 'rgba(0, 0, 0, .85)',
        borderRadius: 20,
      }}>
      <BottomSheetFlatList
        data={[
          {
            text: 'Play',
            icon: 'play-arrow',
            action: () => TrackPlayer.play(),
          },
          {
            text: 'Play Next',
            icon: 'queue-play-next',
            action: () => TrackPlayer.skipToNext(),
          },
          {
            text: 'Add to queue',
            icon: 'add-to-queue',
            action: () => TrackPlayer.add(activeTrack),
          },
          {
            text: 'Add to playlist',
            icon: 'playlist-add',
            action: ({id}: {id: number}) =>
              navigation.navigate('AddToPlaylist', {id}),
          },
          {
            text: 'Go to artist',
            icon: 'library-music',
            action: ({id}: {id: number}) => navigation.navigate('Artist', {id}),
          },
          {
            text: 'Delete from library',
            icon: 'delete-forever',
            action: (track: TrackProps) => {
              Alert.alert(
                'Are you sure?',
                'This will delete the file permanently',
                [
                  {text: 'Cancel', onPress: () => {}, style: 'cancel'},
                  {
                    text: 'OK',
                    onPress: () => {
                      {
                        /* <Animatable.Image
                      source={{
                        uri: item.artwork,
                      }}
                      animation="rotate"
                      easing="linear"
                      useNativeDriver={true}
                      iterationCount="infinite"
                      style={styles.isPlaying}
                      transition={{opacity: 0.9}}
                    />; */
                      }

                      // axios(`deleteTrack?track=${highlighted?.id}`, {
                      //   method: 'DELETE',
                      // }).then(() => {
                      //   data.splice(data.indexOf(track), 1);
                      //   TrackPlayer.remove([]);
                      // });
                    },
                  },
                ],
              );
            },
          },
        ]}
        keyExtractor={i => i.text}
        ListHeaderComponent={
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 20,
              marginBottom: 10,
              marginHorizontal: 20,
            }}>
            <Image
              source={{uri: `${ARTWORK_URL}${highlighted?.artwork}`}}
              style={{
                height: 45,
                width: 45,
                marginRight: 10,
                borderRadius: 10,
              }}
            />
            <View style={{justifyContent: 'center', marginLeft: 5}}>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                {highlighted?.title}
              </Text>
              <Text>{highlighted?.albumArtist}</Text>
            </View>
          </View>
        }
        renderItem={({
          item,
        }: {
          item: {
            text: string;
            icon: string;
            action: (track: TrackProps) => void;
          };
        }) => (
          <Pressable
            onPress={() => {
              bottomSheetRef.current?.snapToIndex(-1);
              item.action(activeTrack);
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 15,
              }}>
              <MaterialIcons
                name={item.icon}
                size={24}
                color="#fff"
                style={{marginRight: 10}}
              />
              <Text style={{color: '#fff', fontSize: 16}}>{item.text}</Text>
            </View>
          </Pressable>
        )}
      />
    </BottomSheet>
  );
}
