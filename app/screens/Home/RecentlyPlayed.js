import React from 'react';
import {Button, View, Text} from 'react-native';

const RecentlyPlayed = ({navigation}) => {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Button title="Recently Played" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default RecentlyPlayed;
