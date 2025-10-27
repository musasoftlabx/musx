// * React
import React, { useEffect, useRef, useState } from 'react';

// * React Native
import { BackHandler, Image, Pressable, Vibration, View } from 'react-native';

// * Libraries
import { useMutation } from '@tanstack/react-query';
import {
  useBackHandler,
  useDeviceOrientation,
} from '@react-native-community/hooks';
import { FlashList } from '@shopify/flash-list';
import { Text } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet from '@gorhom/bottom-sheet';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// * Components
import LinearGradientX from '../../components/LinearGradientX';
import ListItem from '../../components/ListItem';
import StatusBarX from '../../components/StatusBarX';
import VerticalListItem from '../../components/Skeletons/VerticalListItem';

// * Store
import { API_URL, usePlayerStore } from '../../store';

// * Types
import { TrackProps, TracksProps } from '../../types';

export default function Folders({ navigation }: any) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // ? Hooks
  const orientation = useDeviceOrientation();

  const [path, setPath] = useState('');
  const [data, setData] = useState<TracksProps>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);

  // ? StoreStates
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const palette = usePlayerStore(state => state.palette);

  // ? Store Actions
  const play = usePlayerStore(state => state.play);
  const openTrackDetails = usePlayerStore(state => state.openTrackDetails);
  const setTrackDetails = usePlayerStore(state => state.setTrackDetails);
  const setTrackRating = usePlayerStore(state => state.setTrackRating);

  // useBackHandler(() => {
  //   if (bottomSheetRef.current) {
  //     closeTrackDetails();
  //     navigation.goBack();
  //     return true;
  //   } else {
  //     openTrackDetails();
  //     return false;
  //   }
  // });

  // ? Mutations
  const {
    mutate: list,
    isError,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: (path: string) => {
      savePath(path);
      return axios(`${API_URL}${path}`);
    },
    onSuccess: ({ data }) => setData(data),
  });

  // ? Effects
  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: palette?.[0] ?? '#000' },
      headerRight: () =>
        path && path !== '/' ? (
          <MaterialCommunityIcons
            name="folder-home"
            size={24}
            color="white"
            style={{ marginRight: 10 }}
            onPress={() => (savePath('/'), list('/'))}
          />
        ) : (
          false
        ),
    });
  }, [path, activeTrackIndex]);

  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     () => {
  //       if (bottomSheetVisible) {
  //         closeTrackDetails();
  //         return true;
  //       } else {
  //         openTrackDetails();
  //         return false;
  //       }
  //     },
  //   );

  //   return () => backHandler.remove();
  // }, [bottomSheetVisible]);

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
    navigation.setOptions({ title: heading === '' ? 'Folders' : heading });

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

  return (
    <>
      <StatusBarX />

      <LinearGradientX angle={290} />

      {isPending && <VerticalListItem />}

      {isError && (
        <View>
          <Text style={{ fontFamily: 'Abel' }}>Empty</Text>
        </View>
      )}

      {isSuccess && (
        <FlashList
          data={data}
          keyExtractor={(_, index) => index.toString()}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 1000);
          }}
          renderItem={({ item }: { item: TrackProps }) => (
            <>
              {item.hasOwnProperty('name') ? (
                <Pressable
                  onPress={() => {
                    Vibration.vibrate(50);
                    const stripedSlash = item.path === '/' ? '' : item.path;
                    savePath(`${stripedSlash}${item.name}/`);
                    navigation.setOptions({ title: item.name });
                    navigation.push('Folders');
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                    }}
                  >
                    <Image
                      source={require('../../assets/images/folder.png')}
                      style={{ marginRight: 20, height: 45, width: 45 }}
                    />

                    <View style={{ marginTop: 5 }}>
                      <Text variant="bodyMedium">
                        {item.name} ({item.details.totalFiles})
                      </Text>
                      <Text variant="bodyMedium">{item.details.totalSize}</Text>
                    </View>
                  </View>
                </Pressable>
              ) : (
                <ListItem display="size" item={item} tracks={data!} />
              )}
            </>
          )}
        />
      )}
    </>
  );
}
