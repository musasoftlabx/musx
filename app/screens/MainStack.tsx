import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
//import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';

import Library from './Library/';
// import HomeStack from './Home/HomeStack';
// import Search from './Search';
import Downloads from './Downloads';
import Settings from './Settings';

const Tab = createBottomTabNavigator();
//const Tab = createMaterialBottomTabNavigator();

const MainStack = ({navigation}) => {
  return (
    <>
      <Tab.Navigator
        initialRouteName="Library"
        activeColor="#f0edf6"
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
          tabBarOptions: {
            showLabel: false,
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}>
        {/* <Tab.Screen
          name="HomeStack"
          component={HomeStack}
          //options={{tabBarBadge: 3}}
        /> */}
        <Tab.Screen name="Library" component={Library} />
        <Tab.Screen name="Downloads" component={Downloads} />
        <Tab.Screen name="Settings" component={Settings} />
        {/*  <Tab.Screen name="Search" component={Search} />*/}
      </Tab.Navigator>
    </>
  );
};

export default MainStack;
