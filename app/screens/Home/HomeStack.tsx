import React, {useState} from 'react';
import {TextInput, View, Text} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {HeaderBackContext} from '@react-navigation/elements';

import Home from './Home';
import RecentlyAdded from './RecentlyAdded';
import RecentlyPlayed from './RecentlyPlayed';
import Folders from '../Library/Folders';
import Playlists from '../Library/Playlists';
import Playlist from '../Library/Playlist';
import Artists from '../Library/Artists';
import Artist from '../Library/Artist';

const Stack = createNativeStackNavigator();

const HomeStack = ({navigation}) => {
  const [text, onChangeText] = useState('');

  const filter = x => {
    console.log(x);
    /* return text.filter(text => {
      if (text.length > 0) {
        console.log(text);
      }
    }); */
  };

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={Home}
        options={{headerShown: false}}
      />
      {/* <Stack.Screen name="RecentlyAdded" component={RecentlyAdded} />
      <Stack.Screen name="RecentlyPlayed" component={RecentlyPlayed} />
      <Stack.Screen
        name="Folders"
        component={Folders}
        options={{
          headerTransparent: true,
          headerBlurEffect: 'dark',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen name="Playlists" component={Playlists} />
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
      <Stack.Screen
        name="Artist"
        component={Artist}
        options={{headerShown: false}}
      /> */}
    </Stack.Navigator>
  );
};

export default HomeStack;
