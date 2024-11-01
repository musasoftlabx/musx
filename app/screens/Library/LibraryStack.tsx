import {useQuery, useQueryClient} from '@tanstack/react-query';
import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {
  Button,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import BigList from 'react-native-big-list';
import {Avatar, Icon, MD3Colors, Text} from 'react-native-paper';
import {NavigationProp, ParamListBase} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useConfigStore} from '../../store';

const Home = ({navigation, route}: NavigationProp) => {
  //const axios = useConfigStore(state => state.axios);
  //console.log(navigation);
  const queryClient = useQueryClient();
  const [path, setPath] = useState('');
  const [data, setData] = useState([]);

  // const {data, isFetching, isFetched} = useQuery({
  //   queryKey: ['directory'],
  //   queryFn: ({queryKey}) => axios.get(`http://75.119.137.255:3000/${path}`),
  //   select: data => data.data,
  // });

  return (
    <FlatList
      data={[
        {
          id: 'Artists',
          title: 'Artists',
          icon: 'account-music-outline',
          count: 20,
        },
        {
          id: 'Tracks',
          title: 'Tracks',
          icon: 'disc',
          count: 20,
        },
        {
          id: 'Folders',
          title: 'Folders',
          icon: 'folder-music',
          count: 20,
        },
      ]}
      renderItem={({item}) => (
        <Pressable
          onPress={async () => {
            navigation.navigate('Folders');
            //await AsyncStorage.setItem('path', '');
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 15,
            marginVertical: 10,
          }}>
          <Avatar.Icon icon={item.icon} color={MD3Colors.error50} size={50} />
          <View>
            <Text variant="titleLarge">{item.title}</Text>
            <Text variant="titleMedium">{`${
              item.count
            } ${item.title.toLowerCase()}`}</Text>
          </View>
        </Pressable>
      )}
      keyExtractor={item => item.id}
      ListHeaderComponent={() => (
        <Text variant="headlineLarge" style={{marginBottom: 10}}>
          Library
        </Text>
      )}
      style={{margin: 20}}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 12,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
    justifyContent: 'center',
  },
  isPlaying: {
    height: 45,
    width: 45,
    marginRight: 8,
    borderRadius: 100,
    //transform: [{rotate: spin}],
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: 20,
  },
  artists: {
    fontSize: 14,
    fontWeight: '300',
    fontStyle: 'italic',
  },
  album: {
    fontSize: 12,
    fontWeight: '300',
  },
  plays: {
    backgroundColor: 'grey',
    borderRadius: 10,
    height: 35,
    margin: 10,
    opacity: 0.6,
    padding: 5,
    paddingHorizontal: 15,
  },
});

export default Home;
