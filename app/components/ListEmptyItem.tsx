// * React
import React from 'react';

// * React Native
import {View, ActivityIndicator} from 'react-native';

import {Rect} from 'react-native-svg';
import SvgAnimatedLinearGradient from 'react-native-svg-animated-linear-gradient';

// * Store
import {HEIGHT, LIST_ITEM_HEIGHT, usePlayerStore} from '../store';

const ItemPlaceholder = () => {
  //return new Array().fill(HEIGHT / LIST_ITEM_HEIGHT).map((i, key) => (
  // return [0, 1, 2, 3, 4, 5].map((i, key) => (
  //   <SvgAnimatedLinearGradient
  //     key={key}
  //     primaryColor="#e8f7ff"
  //     secondaryColor="#4dadf7"
  //     height={LIST_ITEM_HEIGHT}>
  //     <Rect x="0" y="40" rx="4" ry="4" width="40" height="40" />
  //     <Rect x="55" y="50" rx="4" ry="4" width="200" height="10" />
  //     <Rect x="280" y="50" rx="4" ry="4" width="10" height="10" />
  //     <Rect x="55" y="65" rx="4" ry="4" width="150" height="8" />
  //   </SvgAnimatedLinearGradient>
  // ));
};

export default function ListEmptyItem() {
  return (
    <View style={{flex: 1, height: HEIGHT, justifyContent: 'center'}}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}
