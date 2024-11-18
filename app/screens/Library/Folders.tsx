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
import {useDeviceOrientation} from '@react-native-community/hooks';
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import {Text} from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BigList from 'react-native-big-list';
import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TrackPlayer from 'react-native-track-player';

// * Store
import {API_URL, ARTWORK_URL, HEIGHT, usePlayerStore, WIDTH} from '../../store';

// * Types
import {TrackProps, TracksProps} from '../../types';
import SvgAnimatedLinearGradient from 'react-native-svg-animated-linear-gradient';
import {Rect} from 'react-native-svg';

const ITEM_HEIGHT = 60;

export default function Folders({navigation}: any) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // ? Hooks
  const orientation = useDeviceOrientation();

  const [path, setPath] = useState('');
  const [data, setData] = useState<TracksProps>();
  const [highlighted, setHighlighted] = useState<TrackProps | null>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);

  // ? StoreStates
  const palette = usePlayerStore(state => state.palette);

  // ? StoreActions
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const play = usePlayerStore(state => state.play);

  // ? Mutations
  const {
    mutate: list,
    isError,
    isPending,
  } = useMutation({
    mutationFn: (path: string) => {
      savePath(path);
      return axios.get(`${API_URL}${path}`);
    },
    onSuccess: ({data}) => setData(data),
  });

  // ? Effects
  useEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: palette?.[0] ?? '#000'},
      headerRight: () =>
        path && path !== '/' ? (
          <MaterialCommunityIcons
            name="folder-home"
            size={24}
            color="white"
            style={{marginRight: 10}}
            onPress={() => (savePath('/'), list('/'))}
          />
        ) : (
          false
        ),
    });
  }, [path, activeTrackIndex]);

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

  useEffect(() => {
    (async () => {
      let path = '';
      const value = await AsyncStorage.getItem('path');

      if (value === null || value === '') {
        await AsyncStorage.setItem('path', '');
        path = '';
      } else path = value;

      list(path);
    })();
  }, []);

  useEffect(() => {
    const heading = path.split('/').slice(-2, -1)[0];
    navigation.setOptions({title: heading === '' ? 'Folders' : heading});

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        const p = `${path.split('/').slice(0, -2).join('/')}/`;
        savePath(p);
        //console.log('pathsplit', p);
        //console.log('path', path);
        if (path === '/') navigation.push('Library');
        else navigation.push('Folders');
        return true;
      },
    );

    return () => backHandler.remove();
  }, [path]);

  // ? Functions
  const savePath = async (value: string) => {
    setPath(value);
    await AsyncStorage.setItem('path', value);
  };

  // useEffect(() => {
  //   if (highlighted) {
  //     console.log(highlighted);
  //     bottomSheetRef.current?.snapToIndex(0);
  //   }
  // }, [highlighted]);

  //console.log(HEIGHT / ITEM_HEIGHT);

  const ItemPlaceholder = () => {
    return new Array().fill(HEIGHT / ITEM_HEIGHT).map(i => (
      <SvgAnimatedLinearGradient
        key={i}
        primaryColor="#e8f7ff"
        secondaryColor="#4dadf7"
        height={ITEM_HEIGHT}>
        <Rect x="0" y="40" rx="4" ry="4" width="40" height="40" />
        <Rect x="55" y="50" rx="4" ry="4" width="200" height="10" />
        <Rect x="280" y="50" rx="4" ry="4" width="10" height="10" />
        <Rect x="55" y="65" rx="4" ry="4" width="150" height="8" />
      </SvgAnimatedLinearGradient>
    ));
  };

  return (
    <>
      <LinearGradient
        colors={[palette[0] ?? '#000', palette[1] ?? '#000']}
        // colors={[
        //   activeTrack?.palette?.[1] ?? '#000',
        //   activeTrack?.palette?.[0] ?? '#fff',
        // ]}
        useAngle={true}
        angle={290}
        style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}
      />

      {orientation === 'portrait' ? (
        <BigList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setTimeout(() => {
              list(path);
              setRefreshing(false);
            }, 1000);
          }}
          renderItem={({item, index}: {item: TrackProps; index: number}) => (
            <>
              {item.hasOwnProperty('name') ? (
                <Pressable
                  onPress={() => {
                    Vibration.vibrate(50);
                    const stripedSlash = item.path === '/' ? '' : item.path;
                    savePath(`${stripedSlash}${item.name}/`);
                    navigation.setOptions({title: item.name});
                    navigation.push('Folders');
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 15,
                      paddingHorizontal: 15,
                    }}>
                    <Image
                      source={require('../../assets/images/folder.png')}
                      style={{
                        marginRight: 20,
                        height: 40,
                        width: 40,
                      }}
                    />
                    <Text variant="bodyMedium">{item.name}</Text>
                  </View>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => play(data, item)}
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
                    <Image
                      source={{uri: `${ARTWORK_URL}${item.artwork}`}}
                      style={{
                        height: 45,
                        width: 45,
                        marginRight: 10,
                        borderRadius: 10,
                      }}
                    />
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
                          style={{
                            alignSelf: 'flex-start',
                            backgroundColor: '#ffffff4D',
                            borderRadius: 5,
                            marginTop: 1,
                            maxWidth: 'auto',
                            paddingVertical: 1,
                            paddingHorizontal: 5,
                          }}>
                          {`${(item.size / 1000000).toFixed(2)} MB`}
                        </Text>

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
                      <StarRatingDisplay
                        rating={item.rating}
                        starSize={16}
                        starStyle={{marginHorizontal: 0}}
                      />

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
            </>
          )}
          /* <View
                style={{
                  flexGrow: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: HEIGHT * 0.8,
                }}>
                <ActivityIndicator
                  size="large"
                  color="#000"
                  style={{
                    position: 'absolute',
                    alignSelf: 'center',
                    backgroundColor: '#fff',
                    borderRadius: 50,
                    padding: 5,
                    top: '50%',
                  }}
                />
              </View> */
          renderEmpty={() =>
            isPending ? (
              <ItemPlaceholder />
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
          // renderEmpty={() =>
          //   isPending ? (
          //     <ActivityIndicator
          //       size="large"
          //       color="#000"
          //       style={{
          //         backgroundColor: '#fff',
          //         borderRadius: 50,
          //         padding: 5,
          //         marginTop: '50%',
          //       }}
          //     />
          //   ) : isError ? (
          //     <View>
          //       <Text variant="titleLarge" style={{fontFamily: 'Abel'}}>
          //         Empty
          //       </Text>
          //     </View>
          //   ) : (
          //     <View />
          //   )
          // }
          getItemLayout={(data, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          renderHeader={() => <View />}
          renderFooter={() => <View style={{flex: 1}} />}
          itemHeight={ITEM_HEIGHT}
          headerHeight={0}
          footerHeight={10}
        />
      ) : (
        <BigList
          data={data}
          numColumns={5}
          keyExtractor={(item, index) => index.toString()}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setTimeout(() => {
              list(path);
              setRefreshing(false);
            }, 1000);
          }}
          renderItem={({item, index}: {item: TrackProps; index: number}) => (
            <>
              {item.hasOwnProperty('name') ? (
                <Pressable
                  onPress={() => {
                    Vibration.vibrate(50);
                    const stripedSlash = item.path === '/' ? '' : item.path;
                    savePath(`${stripedSlash}${item.name}/`);
                    navigation.setOptions({title: item.name});
                    navigation.push('Folders');
                  }}>
                  <View
                    style={{
                      justifyContent: 'space-between',
                      paddingVertical: 15,
                      paddingHorizontal: 15,
                    }}>
                    <Image
                      source={require('../../assets/images/folder.png')}
                      style={{
                        marginRight: 20,
                        height: 40,
                        width: 40,
                      }}
                    />
                    <Text variant="bodyMedium">{item.name}</Text>
                  </View>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => play(data, item)}
                  onLongPress={() => {
                    Vibration.vibrate(100);
                    setHighlighted(item);
                    setBottomSheetVisible(true);
                    bottomSheetRef.current?.snapToIndex(0);
                  }}
                  style={{flexDirection: 'column'}}>
                  <Image
                    source={{uri: `${ARTWORK_URL}${item.artwork}`}}
                    style={{
                      height: 80,
                      width: 80,
                      borderRadius: 10,
                    }}
                  />

                  {/* <View
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
                          style={{
                            alignSelf: 'flex-start',
                            backgroundColor: '#ffffff4D',
                            borderRadius: 5,
                            marginTop: 1,
                            maxWidth: 'auto',
                            paddingVertical: 1,
                            paddingHorizontal: 5,
                          }}>
                          {`${(item.size / 1000000).toFixed(2)} MB`}
                        </Text>

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

                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                      }}>
                      <StarRatingDisplay
                        rating={item.rating}
                        starSize={16}
                        starStyle={{marginHorizontal: 0}}
                      />

                      <Text
                        style={{
                          fontWeight: 'bold',
                          marginRight: 5,
                          marginTop: 5,
                        }}>
                        {item.plays || 0} play{`${item.plays === 1 ? '' : 's'}`}
                      </Text>
                    </View> */}
                </Pressable>
              )}
            </>
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
          itemHeight={90}
          headerHeight={0}
          footerHeight={10}
        />
      )}

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
        />
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
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
});
