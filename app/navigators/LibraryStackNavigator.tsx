// * React
import React, {useEffect, useState} from 'react';

// * Libraries
import {CastButton} from 'react-native-google-cast';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// * Components
import Footer from '../components/Footer';

// * Screens
import AddToPlaylist from '../screens/Library/AddToPlaylist';
import Album from '../screens/Library/Album';
import Artist from '../screens/Library/Artist';
import Artists from '../screens/Library/Artists';
import Folders from '../screens/Library/Folders';
import History from '../screens/Library/History';
import Library from '../screens/Library';
import Playlists from '../screens/Library/Playlists';
import Playlist from '../screens/Library/Playlist';
import TrackMetadata from '../screens/Library/TrackMetadata';

const Stack = createNativeStackNavigator();

export default function LibraryStackNavigator() {
  // ? States
  const [initialRoute, setInitialRoute] = useState('');

  // ? Effects
  useEffect(() => {
    (async () => {
      const screen = await AsyncStorage.getItem('libraryScreen');
      if (screen) setInitialRoute(screen);
    })();
  }, []);

  return (
    <>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Library"
          component={Library}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="Album"
          component={Album}
          options={{
            title: '',
            headerBackVisible: true,
            headerRight: () => (
              <CastButton style={{height: 24, width: 24, marginRight: 5}} />
            ),
          }}
        />

        <Stack.Screen name="Artists" component={Artists} />

        <Stack.Screen
          name="Artist"
          component={Artist}
          options={{
            title: 'Artist',
            headerBackVisible: true,
            headerTransparent: true,
            headerRight: () => (
              <CastButton style={{height: 24, width: 24, marginRight: 5}} />
            ),
          }}
        />

        <Stack.Screen
          name="Folders"
          component={Folders}
          options={{title: '...'}}
        />
        <Stack.Screen name="History" component={History} />
        <Stack.Screen name="Playlists" component={Playlists} />
        <Stack.Screen name="Playlist" component={Playlist} />

        <Stack.Group>
          <Stack.Screen
            name="AddToPlaylist"
            component={AddToPlaylist}
            options={{title: 'Add to playlist', headerTransparent: true}}
          />
          <Stack.Screen
            name="TrackMetadata"
            component={TrackMetadata}
            options={{title: 'Metadata'}}
          />
        </Stack.Group>
      </Stack.Navigator>

      <Footer />
    </>
  );
}
