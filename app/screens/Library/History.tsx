// * React
import React, {useEffect, useRef, useState} from 'react';

// * React Native
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Pressable,
  StyleSheet,
  Vibration,
  View,
} from 'react-native';

// * Libraries
import {useMutation} from '@tanstack/react-query';
import {useBackHandler} from '@react-native-community/hooks';
import {Text} from 'react-native-paper';
import axios from 'axios';
import BigList from 'react-native-big-list';
import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TrackPlayer from 'react-native-track-player';

// * Store
import {API_URL, ARTWORK_URL, HEIGHT, usePlayerStore, WIDTH} from '../../store';

// * Types
import {TrackProps, TracksProps} from '../../types';

export default function Folders({navigation}: any) {
  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [data, setData] = useState<TracksProps>();
  const [highlighted, setHighlighted] = useState<TrackProps | null>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);

  // ? StoreStates
  const palette = usePlayerStore(state => state.palette);

  // ? StoreActions
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const play = usePlayerStore(state => state.play);

  // ? Mutations
  const {
    mutate: list,
    isError,
    isPending,
  } = useMutation({
    mutationFn: () => {
      return axios.get(`${API_URL}plays`);
    },
    onSuccess: ({data}) => setData(data),
  });

  // ? Effects
  useEffect(list, []);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: palette?.[1] ?? '#000'},
    });
  });

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (bottomSheetVisible) {
          bottomSheetRef.current?.close();
          setBottomSheetVisible(false);
          setHighlighted(null);
          return true;
        } else {
          setBottomSheetVisible(true);
          return false;
        }
      },
    );

    return () => backHandler.remove();
  }, [bottomSheetVisible]);

  return (
    <>
      <LinearGradient
        colors={[palette[0] ?? '#000', palette[1] ?? '#fff']}
        useAngle={true}
        angle={290}
        style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}
      />

      <BigList
        data={data}
        numColumns={1}
        keyExtractor={(item, index) => index.toString()}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => {
            list();
            setRefreshing(false);
          }, 1000);
        }}
        renderItem={({item, index}: {item: TrackProps; index: number}) => (
          <Pressable
            onPress={() => play([item], item)}
            onLongPress={() => {
              Vibration.vibrate(100);
              setHighlighted(item);
              setBottomSheetVisible(true);
              bottomSheetRef.current?.snapToIndex(0);
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 15,
                paddingHorizontal: 10,
              }}>
              {/* <MaterialIcons
                      name="more-vert"
                      size={25}
                      style={{marginRight: 10}}
                      onPress={() => onOpen(item)}
                    /> */}
              <Image
                source={{uri: `${ARTWORK_URL}${item.artwork}`}}
                style={{
                  height: 45,
                  width: 45,
                  marginRight: 10,
                  borderRadius: 10,
                }}
              />
              {/* <Text variant="bodyMedium">{item.title}</Text> */}
              <View
                style={{
                  justifyContent: 'center',
                  marginTop: -2,
                  maxWidth: WIDTH - 190,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    overflow: 'hidden',
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{fontSize: 17, fontWeight: '600'}}>
                    {item.title}
                  </Text>
                </View>
                <Text numberOfLines={1} style={styles.artists}>
                  {item.artists ?? 'Unknown Artist'}
                </Text>
              </View>
              <View style={{flex: 1}} />
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    marginRight: 5,
                    marginTop: 5,
                  }}>
                  Last played on {item.playedOn}
                </Text>
                <Text
                  style={{
                    fontWeight: 'bold',
                    marginRight: 5,
                    marginTop: 5,
                  }}>
                  {item.plays || 0} play{`${item.plays === 1 ? '' : 's'}`}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
        renderEmpty={() =>
          isPending ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: HEIGHT,
              }}>
              <ActivityIndicator
                size="large"
                color="#fff"
                style={{alignSelf: 'center'}}
              />
            </View>
          ) : isError ? (
            <View>
              <Text variant="titleLarge" style={{fontFamily: 'Abel'}}>
                Empty
              </Text>
            </View>
          ) : (
            <View />
          )
        }
        renderHeader={() => <View />}
        renderFooter={() => <View style={{flex: 1}} />}
        itemHeight={60}
        headerHeight={0}
        footerHeight={10}
      />

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
              action: ({id}: {id: number}) =>
                navigation.navigate('Artist', {id}),
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
          contentContainerStyle={{}}
        />
      </BottomSheet>

      {/* <Footer /> */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 12,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
    justifyContent: 'center',
  },
  isPlaying: {
    height: 45,
    width: 45,
    marginRight: 8,
    borderRadius: 100,
    //transform: [{rotate: spin}],
  },

  artists: {
    fontSize: 14,
    fontWeight: '300',
    fontStyle: 'italic',
  },
  album: {
    backgroundColor: '#ffffff4D',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: '300',
  },
  plays: {
    backgroundColor: 'grey',
    borderRadius: 10,
    height: 35,
    margin: 10,
    opacity: 0.6,
    padding: 5,
    paddingHorizontal: 15,
  },
});
