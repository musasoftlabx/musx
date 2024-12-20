// * React
import React from 'react';

// * React Native
import {View} from 'react-native';

// * Libraries
import {Text} from 'react-native-paper';
import {CastButton} from 'react-native-google-cast';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// * Components
import {GradientText} from '../components/TextX';
import Footer from '../components/Footer';

// * Screens
import AddToPlaylist from '../screens/Library/AddToPlaylist';
import Album from '../screens/Library/Album';
import Artist from '../screens/Library/Artist';
import Artists from '../screens/Library/Artists';
import Folders from '../screens/Library/Folders';
import History from '../screens/Library/History';
import Home from '../screens/Home/';
import MostPlayed from '../screens/Library/MostPlayed';
import Playlist from '../screens/Library/Playlist';
import Playlists from '../screens/Library/Playlists';
import TrackMetadata from '../screens/Library/TrackMetadata';

// * Store
import {usePlayerStore} from '../store';

// * Types
import {RootStackParamList} from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function HomeStackNavigator() {
  // ? StoreStates
  const palette = usePlayerStore(state => state.palette);

  return (
    <>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            header: () => (
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: palette[1] ?? '#000',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingLeft: 10,
                  paddingRight: 20,
                }}>
                <View style={{paddingTop: 20, paddingBottom: 15}}>
                  <GradientText
                    font="Montez"
                    gradient={['#b038e8', '#fff59d']}
                    numberOfLines={1}
                    scale={6}>
                    MusX Player
                  </GradientText>
                  <Text>Consists of 0 tracks</Text>
                </View>
                <CastButton style={{height: 24, width: 24, marginTop: -20}} />
              </View>
            ),
          }}
        />

        <Stack.Screen name="Playlists" component={Playlists} />

        <Stack.Screen
          name="Folders"
          component={Folders}
          options={{
            headerBlurEffect: 'dark',
            headerTransparent: true,
            headerShadowVisible: false,
          }}
        />

        {/* <Stack.Screen name="Artists" component={Artists} /> */}

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

        <Stack.Group>
          <Stack.Screen
            name="MostPlayed"
            component={MostPlayed}
            options={{title: '', headerBackVisible: true}}
          />

          <Stack.Screen
            name="History"
            component={History}
            options={{
              headerStyle: {backgroundColor: palette?.[1] ?? '#000'},
              headerRight: () => (
                <CastButton style={{height: 24, width: 24, marginRight: 5}} />
              ),
            }}
          />
        </Stack.Group>

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

        <Stack.Screen name="Playlist" component={Playlist} />

        <Stack.Screen name="Artists" component={Artists} />
      </Stack.Navigator>

      <Footer />
    </>
  );
}
