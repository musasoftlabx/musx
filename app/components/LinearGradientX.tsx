// * React
import React from 'react';

// * React Native
import LinearGradient from 'react-native-linear-gradient';

// * Store
import {usePlayerStore} from '../store';

export default function LinearGradientX({angle = 180}) {
  const palette = usePlayerStore(state => state.palette);

  return (
    <LinearGradient
      colors={[palette[1] ?? '#000', palette[0] ?? '#000']}
      useAngle={true}
      angle={angle}
      style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}
    />
  );
}
