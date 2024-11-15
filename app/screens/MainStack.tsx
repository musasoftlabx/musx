import React from 'react';

import {BlurView} from '@react-native-community/blur';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
//import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';

import HomeStack from './Home/HomeStack';
import Library from './Library/';
// import Search from './Search';
import Downloads from './Downloads';
import Settings from './Settings';
import Search from './Search';
import {usePlayerStore} from '../store';
import {StyleSheet} from 'react-native';

const Tab = createBottomTabNavigator();
//const Tab = createMaterialBottomTabNavigator();

const MainStack = ({nowPlayingRef}: any) => {
  const palette = usePlayerStore(state => state.palette);

  return (
    <>
      <Tab.Navigator
        initialRouteName="Library"
        //activeColor="#f0edf6"
        inactiveColor="gray"
        labeled={false}
        barStyle={{backgroundColor: 'transparent'}}
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            let iconName;

            if (route.name === 'HomeStack') {
              iconName = focused ? 'home-filled' : 'home';
            } else if (route.name === 'Library') {
              iconName = focused ? 'library-music' : 'library-music';
            } else if (route.name === 'Search') {
              iconName = focused ? 'search' : 'search-off';
            } else if (route.name === 'Downloads') {
              iconName = focused ? 'cloud-download' : 'cloud-download';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings';
            }

            return <MaterialIcons name={iconName} size={24} color={color} />;
          },
          tabBarStyle: {
            backgroundColor: `${palette?.[0]}`,
            //position: 'absolute',
          },
          // tabBarBackground: () => (
          //   <BlurView
          //     blurType="dark"
          //     blurAmount={10}
          //     style={{
          //       position: 'absolute',
          //       top: 0,
          //       left: 0,
          //       bottom: 0,
          //       right: 0,
          //     }}
          //   />
          // ),
          tabBarShowLabel: false,
          tabBarActiveTintColor: palette[1],
          tabBarInactiveTintColor: 'gray',
          //tabBarActiveBackgroundColor: 'transparent',
          //tabBarInactiveBackgroundColor: 'transparent',
        })}>
        <Tab.Screen
          name="HomeStack"
          component={HomeStack}
          options={{
            headerShown: false,
            //tabBarBadge: 3
          }}
        />
        <Tab.Screen
          name="Library"
          component={Library}
          options={{headerShown: false}}
        />
        <Tab.Screen name="Search" component={Search} />
        <Tab.Screen name="Downloads" component={Downloads} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </>
  );
};

export default MainStack;
