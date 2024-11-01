import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LibraryStack from './LibraryStack';
import Artists from './LibraryStack';
import Folders from './Folders';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '../../components/Footer';

const Stack = createNativeStackNavigator();

const HomeStack = ({navigation}) => {
  const [initialRoute, setInitialRoute] = useState('');

  useEffect(() => {
    const getPath = async () => {
      const path = await AsyncStorage.getItem('path');
      console.log(path?.split('/').slice(0, -1).length);
      if (path && path?.split('/').slice(0, -1).length > 0)
        setInitialRoute('Folders');
      else setInitialRoute('LibraryStack');
    };
    getPath();
  }, []);

  return (
    <>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="LibraryStack"
          component={LibraryStack}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Artists"
          component={Artists}
          //options={{headerShown: false}}
        />
        <Stack.Screen
          name="Folders"
          component={Folders}
          //options={{headerShown: false}}
        />
      </Stack.Navigator>

      <Footer />
    </>
  );
};

export default HomeStack;
