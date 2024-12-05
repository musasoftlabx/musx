// * React
import React from 'react';

// * Libraries
import {CastButton} from 'react-native-google-cast';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// * Components
import Footer from '../components/Footer';

// * Screens
import AddToPlaylist from '../screens/Library/AddToPlaylist';
import Album from '../screens/Library/Album';
import Artist from '../screens/Library/Artist';
import Folders from '../screens/Library/Folders';
import Home from '../screens/Home/';
import Playlists from '../screens/Library/Playlists';
import TrackMetadata from '../screens/Library/TrackMetadata';
import {Text, View} from 'react-native';
import {GradientText} from '../components/TextX';
import LinearGradient from 'react-native-linear-gradient';

import {BlurView, VibrancyView} from '@react-native-community/blur';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            title: '',
            headerTransparent: true,
            headerBlurEffect: 'prominent',
            // headerBackground: () => (
            //   <>
            //     <BlurView
            //       style={{
            //         position: 'absolute',
            //         top: 0,
            //         left: 0,
            //         bottom: 0,
            //         right: 0,
            //       }}
            //       blurType="light"
            //       blurAmount={1}
            //       reducedTransparencyFallbackColor="white"
            //     />
            //   </>
            // ),
            headerShadowVisible: false,
            headerLeft: () => (
              <View style={{paddingVertical: 20}}>
                <GradientText
                  bold
                  font="Laila-Bold"
                  gradient={['#fff59d', '#fff']}
                  numberOfLines={1}
                  scale={5}>
                  MusX Player
                </GradientText>
                <Text>Consists of 0 tracks</Text>
              </View>
            ),
            headerRight: () => (
              <CastButton style={{height: 24, width: 24, marginTop: -15}} />
            ),
          }}
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
