// * React
import React, {useState, useEffect} from 'react';

// * React Native
import {View, Text} from 'react-native';

// * Libraries
import {FlashList} from '@shopify/flash-list';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useBackHandler} from '@react-native-community/hooks';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';

// * Components
import LinearGradientX from '../../components/LinearGradientX';
import ListItem from '../../components/ListItem';
import StatusBarX from '../../components/StatusBarX';
import VerticalListItem from '../../components/Skeletons/VerticalListItem';

// * Store
import {API_URL, usePlayerStore} from '../../store';

// * Constants
import {queryClient} from '../../../App';

// * Types
import {RootStackParamList, TrackProps} from '../../types';

export default function Album({
  navigation,
  route: {
    params: {albumArtist, album},
  },
}: NativeStackScreenProps<RootStackParamList, 'Album', ''>) {
  // ? Hooks
  // useBackHandler(() => {
  //   navigation.goBack();
  //   return true;
  // });

  const {
    data: tracks,
    isError,
    isFetching,
    isSuccess,
  } = useQuery({
    enabled: albumArtist && album ? true : false,
    queryKey: ['album', albumArtist, album],
    queryFn: ({queryKey}) =>
      axios(`${API_URL}artist/${queryKey[1]}/album/${queryKey[2]}`),
    select: ({data}) => data,
  });

  // ? States
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // ? StoreStates
  const palette = usePlayerStore(state => state.palette);

  // ? Effects
  useEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: palette?.[1] ?? '#000'},
      headerLeft: () => (
        <View style={{justifyContent: 'center'}}>
          <Text style={{color: '#fff', fontSize: 20}}>{album}</Text>
          <Text>{tracks?.length ?? 0} tracks</Text>
        </View>
      ),
    });
  });

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

      {isFetching && <VerticalListItem />}

      {isSuccess && (
        <FlashList
          data={tracks}
          keyExtractor={(_, index) => index.toString()}
          estimatedItemSize={10}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            queryClient
              .refetchQueries({queryKey: ['album', albumArtist, album]})
              .then(() => setRefreshing(false));
          }}
          renderItem={({item}: {item: TrackProps}) => (
            <ListItem data={tracks} item={item} display="bitrate" />
          )}
        />
      )}
    </>
  );
}
