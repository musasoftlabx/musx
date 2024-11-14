import React, {useEffect, useRef, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LibraryStack from './LibraryStack';
import Artists from './Artists';
import Folders from './Folders';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '../../components/Footer';
import NowPlaying from '../NowPlaying';
import BottomSheet from '@gorhom/bottom-sheet';
import Playlists from './Playlists';
import Playlist from './Playlist';

const Stack = createNativeStackNavigator();

const HomeStack = ({nowPlayingRef}: any) => {
  const [initialRoute, setInitialRoute] = useState('');

  useEffect(() => {
    const getPath = async () => {
      const path = await AsyncStorage.getItem('path');
      console.log('library: ', path?.split('/').slice(0, -1).length);
      if (path && path?.split('/').slice(0, -1).length > 0)
        setInitialRoute('Folders');
      else setInitialRoute('LibraryStack');
    };
    getPath();
  }, []);

  return (
    <>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="LibraryStack"
          component={LibraryStack}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Artists" component={Artists} />
        <Stack.Screen name="Playlists" component={Playlists} />
        <Stack.Screen name="Playlist" component={Playlist} />
        <Stack.Screen
          name="Folders"
          component={Folders}
          //options={{headerShown: false}}
        />
      </Stack.Navigator>
      <Footer />
    </>
  );
};

export default HomeStack;
