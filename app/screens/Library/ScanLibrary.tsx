// * React
import React from 'react';

// * React Native
import {View, Text, ActivityIndicator} from 'react-native';

// * Libraries
import {useBackHandler} from '@react-native-community/hooks';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';

// * Components
import LinearGradientX from '../../components/LinearGradientX';
import StatusBarX from '../../components/StatusBarX';

// * Store
import {API_URL, HEIGHT, WIDTH} from '../../store';

export default function Scan({navigation}: any) {
  // ? Hooks
  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  const {data} = useQuery({
    queryKey: ['scan'],
    queryFn: ({queryKey}) => axios(`${API_URL}${queryKey[0]}`),
    select: ({data}) => data,
  });

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

      <View
        style={{
          backgroundColor: '#0005',
          height: HEIGHT * 0.9,
          width: WIDTH * 0.9,
        }}>
        <Text>{data}</Text>
      </View>
    </>
  );
}
