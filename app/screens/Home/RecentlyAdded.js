import React from 'react';
import {Button, View, Text} from 'react-native';

const RecentlyAdded = ({navigation}) => {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Button title="Recently Added" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default RecentlyAdded;
