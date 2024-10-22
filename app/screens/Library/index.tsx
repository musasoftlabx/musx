import React from 'react';
import {Button, View, Text} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LibraryStack from './LibraryStack';

const Stack = createNativeStackNavigator();

const HomeStack = ({navigation}) => {
  return (
    <Stack.Navigator initialRouteName="LibraryStack">
      <Stack.Screen
        name="LibraryStack"
        component={LibraryStack}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
