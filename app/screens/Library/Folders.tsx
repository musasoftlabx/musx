import {useQuery, useQueryClient} from '@tanstack/react-query';
import axios from 'axios';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  BackHandler,
  Button,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import BigList from 'react-native-big-list';
import {Text} from 'react-native-paper';
import {
  NavigationProp,
  ParamListBase,
  useFocusEffect,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  API_URL,
  ARTWORK_URL,
  AUDIO_URL,
  SERVER_URL,
  useConfigStore,
  usePlayerStore,
  WAVEFORM_URL,
} from '../../store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import {Modalize} from 'react-native-modalize';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TrackPlayer from 'react-native-track-player';
import {TTrack} from '../../types';
import StarRating, {StarRatingDisplay} from 'react-native-star-rating-widget';

const Folders = ({navigation, route}: any) => {
  const play = usePlayerStore(state => state.play);
  //console.log(navigation);
  const queryClient = useQueryClient();
  const [path, setPath] = useState('');
  const [data, setData] = useState([]);

  //const {state, dispatch} = useContext(Context);
  const [actionSheet, setActionSheet] = useState({});

  // const {data, isFetching, isFetched} = useQuery({
  //   queryKey: ['directory'],
  //   queryFn: ({queryKey}) => axios.get(`http://75.119.137.255:3000/${path}`),
  //   select: data => data.data,
  // });

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: 'rgba(0, 0, 0, 0.3)'},
      headerRight: () => (
        <View style={{flexDirection: 'row'}}>
          <MaterialCommunityIcons
            name="folder-home"
            size={24}
            color="white"
            style={{marginRight: 10}}
            onPress={async () => {
              await AsyncStorage.setItem('currentPath', ' ');
              //getData();
            }}
          />
        </View>
      ),
    });
  });

  useEffect(() => {
    const getset = async () => {
      //await AsyncStorage.removeItem('path');
      let x = '';
      const value = await AsyncStorage.getItem('path');
      console.log('value:', value);

      if (value === null) {
        await AsyncStorage.setItem('path', '');
        x = '';
      } else {
        x = value;
      }
      console.log('x:', x);

      const res = await axios.get(`${API_URL}${x}`);
      setData(res.data);
      savePath(x);
      //navigation.push('LibraryStack');
      //console.log(res.data);

      // navigation.setOptions({
      //   //...navigation,
      //   title: x.split('/').pop() === '' ? 'Folders' : path.split('/').pop(),
      //   //title: 'yug',
      // });
    };

    getset();
  }, []);

  useEffect(() => {
    const heading = path.split('/').slice(-2, -1)[0];
    navigation.setOptions({title: heading === '' ? 'Folders' : heading});

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        const p = `${path.split('/').slice(0, -2).join('/')}/`;
        savePath(p);
        console.log('pathsplit', p);
        console.log('path', path);
        if (path === '/') navigation.push('LibraryStack');
        else navigation.push('Folders');
        return true;
      },
    );

    return () => backHandler.remove();
  }, [path]);

  const savePath = async (value: string) => {
    setPath(value);
    await AsyncStorage.setItem('path', value);
  };

  const actionSheetOptions = [
    {
      text: 'Play',
      icon: 'play-arrow',
    },
    {
      text: 'Play Next',
      icon: 'queue-play-next',
      //action: track => dispatch({type: 'ADD_NEXT_IN_QUEUE', payload: track}),
    },
    {
      text: 'Add to queue',
      icon: 'add-to-queue',
      //action: track => dispatch({type: 'ADD_TO_QUEUE', payload: track}),
    },
    {
      text: 'Add to playlist',
      icon: 'playlist-add',
      //action: track => navigation.navigate('AddToPlaylist', {_id: track._id}),
    },
    {
      text: 'Go to artist',
      icon: 'library-music',
    },
    {
      text: 'Delete from library',
      icon: 'delete-forever',
      action: track => {
        Alert.alert(
          'Are you sure?',
          'This will delete the file permanently',
          // [
          //   {
          //     text: 'Cancel',
          //     onPress: () => console.log('Cancel Pressed'),
          //     style: 'cancel',
          //   },
          //   {
          //     text: 'OK',
          //     onPress: () => {
          //       <Animatable.Image
          //         source={{
          //           uri: item.artwork,
          //         }}
          //         animation="rotate"
          //         easing="linear"
          //         useNativeDriver={true}
          //         iterationCount="infinite"
          //         style={styles.isPlaying}
          //         transition={{opacity: 0.9}}
          //       />;

          //       fetch(`${state.NODE_SERVER}deleteTrack`, {
          //     method: 'DELETE',
          //     headers: {'Content-Type': 'application/json'},
          //     body: JSON.stringify(track),
          //   })
          //     .then(res => res.text())
          //     .then(() => {
          //       folders.splice(folders.indexOf(track), 1);
          //       dispatch({
          //         type: 'REMOVE_FROM_QUEUE',
          //         payload: {track, playBackState},
          //       });
          //     });
          //     },
          //   },
          // ],
        );
      },
    },
  ];

  const modalRef = useRef(null);
  const onOpen = props => {
    const modal = modalRef.current;
    setActionSheet(props);

    if (modal) {
      modal.open();
    }
  };

  return (
    <>
      <Modalize
        modalHeight={Dimensions.get('window').height * 0.5}
        handlePosition="inside"
        openAnimationConfig={
          ({spring: {speed: 100, bounciness: 100, mass: 100}},
          {timing: {duration: 500}})
        }
        overlayStyle={{backgroundColor: 'rgba(128, 0, 128, 0.5)'}}
        modalStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        }}
        ref={modalRef}
        flatListProps={{
          data: actionSheetOptions,
          renderItem: ({item}) => (
            <Pressable
              onPress={() => (
                modalRef.current.close(), item.action(actionSheet)
              )}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 15,
                }}>
                <MaterialIcons
                  name={item.icon}
                  size={24}
                  color="white"
                  style={{marginRight: 10}}
                />
                <Text style={{color: 'white', fontSize: 16}}>{item.text}</Text>
              </View>
            </Pressable>
          ),

          keyExtractor: (item, index) => index.toString(),
          showsVerticalScrollIndicator: false,
        }}
        HeaderComponent={
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 20,
              marginBottom: 10,
              marginHorizontal: 20,
            }}>
            {/* <Image
              source={{uri: `${state.NGINX_SERVER}${actionSheet.coverArtURL}`}}
              style={{
                height: 45,
                width: 45,
                marginRight: 10,
                borderRadius: 10,
              }}
            /> */}
            <View style={{justifyContent: 'center', marginLeft: 5}}>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                {actionSheet.title || actionSheet.name}
              </Text>
              <Text>{actionSheet.albumArtist}</Text>
            </View>
          </View>
        }
      />

      <BigList
        data={data}
        numColumns={1}
        keyExtractor={(item, index) => index.toString()}
        //sections={[data]}
        renderItem={({item, index}: {item: Track; index: number}) => (
          <>
            {item.hasOwnProperty('name') ? (
              <Pressable
                onPress={() => {
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
                onPress={async () => {
                  const tracks = data.map(
                    (track: {
                      id: number;
                      path: string;
                      artwork: string;
                      waveform: string;
                      palette: string;
                    }) => {
                      if (track.hasOwnProperty('format')) {
                        return {
                          ...track,
                          url: `${AUDIO_URL}${track.path}`,
                          artwork: `${ARTWORK_URL}${track.artwork}`,
                          waveform: `${WAVEFORM_URL}${track.waveform}`,
                          palette: JSON.parse(track.palette),
                        };
                      }
                    },
                  );

                  // ? Remove undefined items (folders)
                  const queue: any = tracks.filter((track: any) => track);

                  // ? Find index of currently selected track
                  const selectedIndex = queue.findIndex(
                    (track: TTrack) => track.id === item.id,
                  );

                  await TrackPlayer.setQueue(queue);
                  await TrackPlayer.skip(selectedIndex);
                  await TrackPlayer.play();
                  navigation.push('NowPlaying');

                  // const initTrackPlayer = async () => {
                  //   await TrackPlayer.setQueue(queue);
                  //   await TrackPlayer.skip(selectedIndex);
                  //   await TrackPlayer.play();
                  //   navigation.push('NowPlaying');
                  // };

                  // // ? Fetch lrc file from server
                  // try {
                  //   const {data: lyrics} = await axios.get(
                  //     `${SERVER_URL}/Music/${queue[selectedIndex].path.replace(
                  //       '.mp3',
                  //       '.lrc',
                  //     )}`,
                  //   );

                  //   if (lyrics) queue[selectedIndex].lyrics = lyrics;
                  //   initTrackPlayer();
                  // } catch (err) {
                  //   initTrackPlayer();
                  // }

                  // play({
                  //   currentTrack: item,
                  //   nextTracks: data.slice(index + 1, data.length),
                  // });
                }}
                onLongPress={() => onOpen(item)}>
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
                      maxWidth: Dimensions.get('window').width - 190,
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
        renderEmpty={() => (
          <View>
            <Text variant="titleLarge" style={{fontFamily: 'Abel'}}>
              Empty
            </Text>
          </View>
        )}
        renderHeader={() => <View />}
        renderFooter={() => <View />}
        itemHeight={60}
        headerHeight={0}
        footerHeight={0}
      />
    </>
  );
};

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

export default Folders;
