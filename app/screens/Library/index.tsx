// * React
import React, {useEffect, useState} from 'react';

// * Libraries
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// * Components
import Album from './Album';
import Artist from './Artist';
import Artists from './Artists';
import Folders from './Folders';
import Footer from '../../components/Footer';
import History from './History';
import LibraryStack from './LibraryStack';
import Playlists from './Playlists';
import Playlist from './Playlist';

const Stack = createNativeStackNavigator();

export default function Library() {
  const [initialRoute, setInitialRoute] = useState('');

  useEffect(() => {
    (async () => {
      const path = await AsyncStorage.getItem('path');
      if (path && path?.split('/').slice(0, -1).length > 0)
        setInitialRoute('Folders');
      else setInitialRoute(path ?? 'LibraryStack');
    })();
  }, []);

  return (
    <>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="LibraryStack"
          component={LibraryStack}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Album" component={Album} />
        <Stack.Screen name="Artists" component={Artists} />
        <Stack.Screen name="Artist" component={Artist} />
        <Stack.Screen name="Playlists" component={Playlists} />
        <Stack.Screen name="Playlist" component={Playlist} />
        <Stack.Screen name="Folders" component={Folders} />
        <Stack.Screen name="History" component={History} />
      </Stack.Navigator>
      <Footer />
    </>
  );
}
