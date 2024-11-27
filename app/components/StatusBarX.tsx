// * React
import React from 'react';

// * React Native
import {StatusBar} from 'react-native';

// * Store
import {usePlayerStore} from '../store';

export default function StatusBarX() {
  const palette = usePlayerStore(state => state.palette);

  return (
    <StatusBar
      animated
      backgroundColor={palette[1] ?? '#000'}
      barStyle="light-content"
      translucent={false}
    />
  );
}
