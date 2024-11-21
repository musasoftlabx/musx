import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Home from '../screens/Home/';
import RecentlyAdded from '../screens/Home/RecentlyAdded';
import RecentlyPlayed from '../screens/Home/RecentlyPlayed';
import Folders from '../screens/Library/Folders';
import Playlists from '../screens/Library/Playlists';
import Playlist from '../screens/Library/Playlist';
import Artists from '../screens/Library/Artists';
import Artist from '../screens/Library/Artist';
import Footer from '../components/Footer';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={Home}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Playlists" component={Playlists} />
        <Stack.Screen
          name="Folders"
          component={Folders}
          options={{
            headerTransparent: true,
            headerBlurEffect: 'dark',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen name="Artist" component={Artist} />
        {/* <Stack.Screen name="RecentlyAdded" component={RecentlyAdded} />
      <Stack.Screen name="RecentlyPlayed" component={RecentlyPlayed} />
     
      
      <Stack.Screen
        name="Playlist"
        component={Playlist}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Artists"
        component={Artists}
        options={{
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTitle: props => (
            <TextInput
              onChangeText={onChangeText}
              onChange={text => filter(text.nativeEvent.text)}
              value={text}
              placeholder="Search"
              style={{fontSize: 20}}
            />
          ),
        }}
      />
       */}
      </Stack.Navigator>

      <Footer />
    </>
  );
}
