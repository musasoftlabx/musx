// * React
import React from 'react';

// * Libraries
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// * Screens
import Downloads from '../screens/Downloads';
import HomeStackNavigator from './HomeStackNavigator';
import Search from '../screens/Search';
import Settings from '../screens/Settings';

// * Navigator
import LibraryStackNavigator from './LibraryStackNavigator';

// * Store
import {usePlayerStore} from '../store';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  // ? StoreStates
  const palette = usePlayerStore(state => state.palette);

  return (
    <Tab.Navigator
      //initialRouteName=""
      initialRouteName="LibraryStackNavigator"
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'HomeStackNavigator') {
            iconName = focused ? 'home-filled' : 'home';
          } else if (route.name === 'LibraryStackNavigator') {
            iconName = focused ? 'library-music' : 'library-music';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-off';
          } else if (route.name === 'Downloads') {
            iconName = focused ? 'cloud-download' : 'cloud-download';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings';
          }

          return <MaterialIcons name={iconName!} size={24} color={color} />;
        },
        tabBarStyle: {backgroundColor: `${palette?.[1]}`},
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, .4)',
      })}>
      <Tab.Screen
        name="HomeStackNavigator"
        component={HomeStackNavigator}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="LibraryStackNavigator"
        component={LibraryStackNavigator}
        options={{headerShown: false}}
      />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="Downloads" component={Downloads} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}
