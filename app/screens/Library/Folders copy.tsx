import React, {useContext, useState, useEffect, useRef} from 'react';
import {
  Alert,
  Animated,
  Easing,
  BackHandler,
  Button,
  Image,
  Dimensions,
  View,
  Pressable,
  Text,
  SafeAreaView,
  FlatList,
  SectionList,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import SwipeableRating from 'react-native-swipeable-rating';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ActionSheet, {SheetManager} from 'react-native-actions-sheet';
import {Modalize} from 'react-native-modalize';
import SvgAnimatedLinearGradient from 'react-native-svg-animated-linear-gradient';
import Svg, {Circle, Rect} from 'react-native-svg';
import {useHeaderHeight} from '@react-navigation/elements';
import LinearGradient from 'react-native-linear-gradient';
import {usePlaybackState} from 'react-native-track-player';
import * as Animatable from 'react-native-animatable';

import {Context} from '../../contexts';
import Footer from '../../components/Footer';

const Folders = ({navigation, route}) => {
  const [folders, setFolders] = useState(null);
  const {state, dispatch} = useContext(Context);
  const [actionSheet, setActionSheet] = useState({});
  const [loading, setLoading] = useState(false);
  const headerHeight = useHeaderHeight();
  const playBackState = usePlaybackState();

  /* useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    if (
      event.type === Event.PlaybackTrackChanged &&
      event.nextTrack !== undefined
    ) {
      console.log('Track changed to: ', event.nextTrack);
      navigation.setOptions({
        headerStyle: {backgroundColor: state.gradient[1]},
      });
    }
  }); */

  useEffect(() => {
    //AsyncStorage.setItem('currentPath', ' ');
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
              getData();
            }}
          />
        </View>
      ),
    });

    const getData = async () => {
      try {
        const path = await AsyncStorage.getItem('currentPath');
        if (path !== null) {
          getFolders(path);
          navigation.setOptions({
            title:
              path.split('/').pop() === ' ' ? 'Folders' : path.split('/').pop(),
          });
        } else {
          await AsyncStorage.setItem('currentPath', ' ');
          getFolders('');
          navigation.setOptions({title: 'Folders'});
        }
      } catch (e) {
        // error reading value
      }
    };
    getData();

    BackHandler.addEventListener('hardwareBackPress', async function () {
      if (!loading) {
        const path = await AsyncStorage.getItem('currentPath');

        if (navigation.isFocused()) {
          if (path === ' ') {
            navigation.navigate('Home');
            return true;
          } else {
            handleBackAction();
            return false;
          }
        } else {
          navigation.navigate('Folders');
          return true;
        }
      } else {
        console.log('back pressed');
        return false;
      }
    });
  }, []);

  /* useFocusEffect(
    React.useCallback(() => {
      const onBackPress = async () => {
        const path = await AsyncStorage.getItem('currentPath');
        console.log(path);
        if (path === '') {
          return true;
        } else {
          handleBackAction();
          return false;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  ); */

  const getFolders = dir => {
    setLoading(true);

    fetch(`${state.NODE_SERVER}GetFolders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activeDirectory: dir.trim() ? dir.trim() : '',
      }),
    })
      .then(res => res.json())
      .then(data => {
        setFolders(data);
        setLoading(false);
      });
  };

  const handleDirectoryChange = async dir => {
    try {
      const currentPath = await AsyncStorage.getItem('currentPath');
      const newPath = currentPath + dir;
      console.log('newPath:', newPath);
      await AsyncStorage.setItem('currentPath', newPath);
      getFolders(newPath);
      navigation.push('Folders');
    } catch (e) {
      // saving error
    }
  };

  const handleBackAction = async () => {
    const currentPath = await AsyncStorage.getItem('currentPath');
    const lastDir = currentPath.split('/').pop();
    const newPath = currentPath.replace(`/${lastDir}`, '');
    console.log('newPath:', newPath);
    await AsyncStorage.setItem('currentPath', newPath);
    getFolders(newPath);
    navigation.setOptions({
      title:
        newPath.split('/').pop() === ' ' ? 'Folders' : newPath.split('/').pop(),
    });
    /* setTimeout(() => {
      navigation.pop();
    }, 5000); */
  };

  const actionSheetOptions = [
    {
      text: 'Play',
      icon: 'play-arrow',
    },
    {
      text: 'Play Next',
      icon: 'queue-play-next',
      action: track => dispatch({type: 'ADD_NEXT_IN_QUEUE', payload: track}),
    },
    {
      text: 'Add to queue',
      icon: 'add-to-queue',
      action: track => dispatch({type: 'ADD_TO_QUEUE', payload: track}),
    },
    {
      text: 'Add to playlist',
      icon: 'playlist-add',
      action: track => navigation.navigate('AddToPlaylist', {_id: track._id}),
    },
    {
      text: 'Go to artist',
      icon: 'library-music',
    },
    {
      text: 'Delete from library',
      icon: 'delete-forever',
      action: track => {
        Alert.alert('Are you sure?', 'This will delete the file permanently', [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => {
              <Animatable.Image
                source={{
                  uri: item.artwork,
                }}
                animation="rotate"
                easing="linear"
                useNativeDriver={true}
                iterationCount="infinite"
                style={styles.isPlaying}
                transition={{opacity: 0.9}}
              />;

              /* fetch(`${state.NODE_SERVER}deleteTrack`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(track),
              })
                .then(res => res.text())
                .then(() => {
                  folders.splice(folders.indexOf(track), 1);
                  dispatch({
                    type: 'REMOVE_FROM_QUEUE',
                    payload: {track, playBackState},
                  });
                }); */
            },
          },
        ]);
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

  const ItemPlaceholder = () => {
    return Array(10)
      .fill(0)
      .map((i, k) => (
        <SvgAnimatedLinearGradient
          key={k}
          primaryColor="#e8f7ff"
          secondaryColor="#4dadf7"
          height={80}>
          <Rect x="0" y="40" rx="4" ry="4" width="40" height="40" />
          <Rect x="55" y="50" rx="4" ry="4" width="150" height="10" />
          <Rect x="55" y="65" rx="4" ry="4" width="100" height="8" />
        </SvgAnimatedLinearGradient>
      ));
  };

  return (
    <>
      {/* <Image
        source={{
          uri: imageQueue[imageIndex],
        }}
        blurRadius={8}
        style={styles.absolute}
      /> */}
      <LinearGradient
        colors={state.gradient}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          opacity: 0.8,
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      />

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
        HeaderComponent={() => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 20,
              marginBottom: 10,
              marginHorizontal: 20,
            }}>
            <Image
              source={{uri: `${state.NGINX_SERVER}${actionSheet.coverArtURL}`}}
              style={{
                height: 45,
                width: 45,
                marginRight: 10,
                borderRadius: 10,
              }}
            />
            <View style={{justifyContent: 'center', marginLeft: 5}}>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                {actionSheet.title || actionSheet.name}
              </Text>
              <Text>{actionSheet.albumArtist}</Text>
            </View>
          </View>
        )}
      />

      {loading ? (
        <View
          style={{
            opacity: 0.3,
            marginHorizontal: 20,
            marginTop: headerHeight,
            zIndex: 100,
          }}>
          <ItemPlaceholder />
        </View>
      ) : (
        <FlatList
          data={folders}
          contentContainerStyle={{
            minHeight: '100%',
            marginTop: headerHeight,
            paddingBottom: 60,
          }}
          keyExtractor={(item, index) => index.toString()}
          initialNumToRender={10}
          renderItem={({item, index}) => (
            <>
              {item.type === 'folder' ? (
                <Pressable
                  onPress={() => handleDirectoryChange(`/${item.name}`)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 15,
                      paddingHorizontal: 15,
                    }}>
                    <Image
                      style={{
                        position: 'absolute',
                        left: 30,
                        top: 10,
                        zIndex: 0,
                        borderRadius: 100,
                        height: 30,
                        width: 30,
                      }}
                      source={{
                        uri: `${state.NGINX_SERVER}${item.image}`,
                      }}
                    />
                    <Image
                      source={require('../../icons/icons8-folder-48.png')}
                      style={{
                        marginRight: 20,
                        height: 40,
                        width: 40,
                      }}
                    />
                    <View
                      style={{
                        justifyContent: 'center',
                        marginTop: -2,
                        maxWidth: Dimensions.get('window').width - 150,
                      }}>
                      <Text numberOfLines={1} style={styles.title}>
                        {item.name}
                      </Text>
                      <Text numberOfLines={1} style={styles.artists}>
                        {item.folders > 0 &&
                          (item.folders === 1
                            ? `${item.folders} folder`
                            : `${item.folders} folders`)}
                        {item.folders > 0 && item.files > 0 && ' / '}
                        {item.files > 0 &&
                          (item.files === 1
                            ? `${item.files} file`
                            : `${item.files} files`)}
                      </Text>
                    </View>
                    <View style={{flex: 1}} />
                  </View>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => (
                    dispatch({
                      type: 'PLAY',
                      payload: {
                        currentTrack: item,
                        nextTracks: folders.slice(index + 1, folders.length),
                      },
                    }),
                    navigation.navigate('NowPlaying')
                  )}
                  onLongPress={() => onOpen(item)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 15,
                      paddingHorizontal: 10,
                    }}>
                    <MaterialIcons
                      name="more-vert"
                      size={25}
                      style={{marginRight: 10}}
                      onPress={() => onOpen(item)}
                    />
                    <Image
                      source={{
                        uri: `${state.NGINX_SERVER}${item.coverArtURL}`,
                      }}
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
                        maxWidth: Dimensions.get('window').width - 190,
                      }}>
                      <Text numberOfLines={1} style={styles.title}>
                        {item.title || item.name}
                      </Text>
                      <Text numberOfLines={1} style={styles.artists}>
                        {(item.artists && item.artists.join(' / ')) ||
                          'Unknown Artist'}
                      </Text>
                      <Text numberOfLines={1} style={styles.album}>
                        {item.album || 'Unknown Album'}
                      </Text>
                    </View>
                    <View style={{flex: 1}} />
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                      }}>
                      <SwipeableRating
                        rating={item.rating || 0}
                        size={15}
                        allowHalves={true}
                        color={'#FFD700'}
                        emptyColor={'#FFD700'}
                      />
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
        />
      )}

      <Footer />
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
    backgroundColor: '#000',
  },
});

export default Folders;
