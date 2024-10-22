import React from 'react';
import {Button, View, Text} from 'react-native';

const History = ({navigation}) => {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Button title="History" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default History;
