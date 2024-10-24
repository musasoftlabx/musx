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
import {useConfigStore} from '../../store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import SwipeableRating from 'react-native-swipeable-rating';
import {Modalize} from 'react-native-modalize';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Folders = ({navigation, route}: NavigationProp) => {
  //const axios = useConfigStore(state => state.axios);
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

      const res = await axios.get(`http://75.119.137.255:3000/${x}`);
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
        keyExtractor={item => item.path}
        sections={[data]}
        renderItem={({
          item,
          index,
        }: {
          item: {
            name: string;
            path: string;
            artwork: string;
            title: string;
            artists: string;
            plays: number;
          };
          index: number;
        }) => (
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
                onPress={() =>
                  // dispatch({
                  //   type: 'PLAY',
                  //   payload: {
                  //     currentTrack: item,
                  //     nextTracks: folders.slice(index + 1, folders.length),
                  //   },
                  // }),
                  navigation.navigate('NowPlaying')
                }
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
                    source={{
                      uri: `http://75.119.137.255/Artwork/${item.artwork}`,
                    }}
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
                    <Text numberOfLines={1} style={styles.title}>
                      {item.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.artists}>
                      {item.artists ?? 'Unknown Artist'}
                    </Text>
                    {/*<Text numberOfLines={1} style={styles.album}>
                        {item.album || 'Unknown Album'}
                      </Text> */}
                  </View>
                  <View style={{flex: 1}} />
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'flex-end',
                    }}>
                    {/* <SwipeableRating
                        rating={item.rating || 0}
                        size={15}
                        allowHalves={true}
                        color={'#FFD700'}
                        emptyColor={'#FFD700'}
                      /> */}
                    <Text
                      style={{
                        fontWeight: 'bold',
                        marginRight: 5,
                        marginTop: 5,
                      }}>
                      {item.plays || 0} plays
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
        itemHeight={50}
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
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  artists: {
    fontSize: 14,
    fontWeight: '300',
    fontStyle: 'italic',
  },
  album: {
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
