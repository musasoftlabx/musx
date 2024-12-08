// * React
import React, {useState, useEffect} from 'react';

// * React-Native
import {Image, View, Pressable, Text, ActivityIndicator} from 'react-native';

// * Libraries
import {FlashList} from '@shopify/flash-list';
import {useBackHandler} from '@react-native-community/hooks';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';

// * Components
import LinearGradientX from '../../components/LinearGradientX';

// * Store
import {API_URL, usePlayerStore} from '../../store';

// * Types
import {TrackProps} from '../../types';

export default function Artists({navigation}: any) {
  // ? States
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // ? StoreStates
  const palette = usePlayerStore(state => state.palette);

  // ? Hooks
  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  const {data, isError, isFetching} = useQuery({
    queryKey: ['artists'],
    queryFn: ({queryKey}) => axios(`${API_URL}${queryKey[0]}`),
    select: ({data}) => data,
  });

  // ? Effects
  useEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: palette?.[1] ?? '#000'},
    });
  });

  return (
    <>
      <LinearGradientX />

      <FlashList
        data={data}
        numColumns={3}
        keyExtractor={(_, index) => index.toString()}
        estimatedItemSize={300}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 1000);
        }}
        renderItem={({item}: {item: TrackProps}) => (
          <Pressable
            onPress={() =>
              navigation.navigate('Artist', {
                albumArtist: item.albumArtist,
                tracks: item.tracks,
                path: item.path,
              })
            }
            style={{flex: 1}}>
            <View style={{paddingVertical: 12, alignItems: 'center'}}>
              <Image
                source={{
                  uri: `${item?.url
                    .split('/')
                    .slice(0, -1)
                    .join('/')}/artist.jpg`,
                }}
                //defaultSource={require('../../assets/images/musician.png')}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 100,
                }}
                resizeMode="cover"
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = require('../../assets/images/musician.png');
                }}
              />
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 16,
                  color: 'white',
                  marginTop: 5,
                  marginBottom: 1,
                }}>
                {item.albumArtist}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  opacity: 0.5,
                }}>
                {item.tracks} tracks
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={() =>
          isFetching ? (
            <ActivityIndicator
              size="large"
              color="#fff"
              style={{marginTop: '50%'}}
            />
          ) : isError ? (
            <View>
              <Text style={{fontFamily: 'Abel'}}>Empty</Text>
            </View>
          ) : (
            <View />
          )
        }
      />
    </>
  );
}
