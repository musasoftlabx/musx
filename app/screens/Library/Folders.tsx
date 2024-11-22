// * React
import React, {useEffect, useRef, useState} from 'react';

// * React Native
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Pressable,
  Vibration,
  View,
} from 'react-native';

// * Libraries
import {useMutation} from '@tanstack/react-query';
import {useDeviceOrientation} from '@react-native-community/hooks';
import {Text} from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BigList from 'react-native-big-list';
import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// * Store
import {API_URL, HEIGHT, LIST_ITEM_HEIGHT, usePlayerStore} from '../../store';

// * Types
import {TrackProps, TracksProps} from '../../types';
import {Rect} from 'react-native-svg';
import SvgAnimatedLinearGradient from 'react-native-svg-animated-linear-gradient';
import ListItem from '../../components/ListItem';
import TrackDetails from '../../components/TrackDetails';

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

  // ? Mutations
  const {
    mutate: list,
    isError,
    isPending,
  } = useMutation({
    mutationFn: (path: string) => {
      savePath(path);
      return axios(`${API_URL}${path}`);
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

  const ItemPlaceholder = () => {
    return new Array().fill(HEIGHT / LIST_ITEM_HEIGHT).map(i => (
      <SvgAnimatedLinearGradient
        key={i}
        primaryColor="#e8f7ff"
        secondaryColor="#4dadf7"
        height={LIST_ITEM_HEIGHT}>
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
          renderItem={({item}: {item: TrackProps}) => (
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
                      paddingHorizontal: 5,
                    }}>
                    <Image
                      source={require('../../assets/images/folder.png')}
                      style={{marginRight: 20, height: 45, width: 45}}
                    />
                    <Text variant="bodyMedium">{item.name}</Text>
                  </View>
                </Pressable>
              ) : (
                <ListItem
                  data={data!}
                  item={item}
                  display="size"
                  bottomSheetRef={bottomSheetRef}
                  setHighlighted={setHighlighted}
                  setBottomSheetVisible={setBottomSheetVisible}
                />
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
            length: LIST_ITEM_HEIGHT,
            offset: LIST_ITEM_HEIGHT * index,
            index,
          })}
          renderHeader={() => (
            <View style={{marginVertical: 60}}>
              <Text>{data?.length}</Text>
            </View>
          )}
          renderFooter={() => <View style={{flex: 1}} />}
          itemHeight={LIST_ITEM_HEIGHT}
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
                <ListItem
                  data={data!}
                  item={item}
                  bottomSheetRef={bottomSheetRef}
                  setHighlighted={setHighlighted}
                  setBottomSheetVisible={setBottomSheetVisible}
                />
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

      <TrackDetails
        navigation={navigation}
        highlighted={highlighted}
        bottomSheetRef={bottomSheetRef}
      />
    </>
  );
}
