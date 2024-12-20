import React, {useState} from 'react';
import {Button, View, Text, Switch} from 'react-native';
import {usePlayerStore} from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const streamViaHLS = usePlayerStore(state => state.streamViaHLS);
  const setStreamViaHLS = usePlayerStore(state => state.setStreamViaHLS);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Settings Screen</Text>

      <Switch
        value={streamViaHLS}
        onValueChange={value => {
          setStreamViaHLS(value);
          AsyncStorage.setItem('streamViaHLS', value.toString());
        }}
        trackColor={{false: '#767577', true: '#81b0ff'}}
        thumbColor={streamViaHLS ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
      />
    </View>
  );
}
