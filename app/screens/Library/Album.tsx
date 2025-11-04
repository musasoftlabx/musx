// * React
import React, { useState, useEffect } from 'react';

// * React Native
import { Vibration, View } from 'react-native';

// * Libraries
import { FlashList } from '@shopify/flash-list';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Text } from 'react-native-paper';
import axios from 'axios';

// * Components
import LinearGradientX from '../../components/LinearGradientX';
import ListItem from '../../components/ListItem';
import StatusBarX from '../../components/StatusBarX';
import VerticalListItem from '../../components/Skeletons/VerticalListItem';

// * Store
import { API_URL, usePlayerStore } from '../../store';

// * Constants
import { queryClient } from '../../../App';

// * Types
import { RootStackParamList, TrackProps } from '../../types';

// * Icons
import PlayIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { CastButton } from 'react-native-google-cast';

export default function Album({
  navigation,
  route: {
    params: { albumArtist, album },
  },
}: NativeStackScreenProps<RootStackParamList, 'Album', ''>) {
  // ? Hooks
  // useBackHandler(() => {
  //   navigation.goBack();
  //   return true;
  // });

  // ? Store Actions
  const play = usePlayerStore(state => state.play);

  const {
    data: tracks,
    isError,
    isFetching,
    isSuccess,
  } = useQuery({
    enabled: albumArtist && album ? true : false,
    queryKey: ['album', albumArtist, album],
    queryFn: ({ queryKey }) =>
      axios(`${API_URL}artist/${queryKey[1]}/album/${queryKey[2]}`),
    select: ({ data }) => data,
  });

  // ? States
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // ? StoreStates
  const palette = usePlayerStore(state => state.palette);

  // ? Effects
  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: palette?.[1] ?? '#000' },
      headerLeft: () => (
        <View style={{ justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20 }}>{album}</Text>
          <Text>{tracks?.length ?? 0} tracks</Text>
        </View>
      ),
      headerRight: () => (
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 40 }}>
          <PlayIcon
            color="#fff"
            name="play-circle-outline"
            size={30}
            onPress={() => {
              Vibration.vibrate(100);
              play(tracks, tracks[0]);
            }}
          />

          <MaterialIcons name="sort" style={{ color: '#fff', fontSize: 24 }} />

          <CastButton style={{ height: 24, width: 24, marginRight: 5 }} />
        </View>
      ),
    });
  });

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

      {isFetching && !tracks && <VerticalListItem />}

      {isSuccess && (
        <FlashList
          data={tracks}
          keyExtractor={(_, index) => index.toString()}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            queryClient
              .refetchQueries({ queryKey: ['album', albumArtist, album] })
              .then(() => setRefreshing(false));
          }}
          renderItem={({ item }: { item: TrackProps }) => (
            <ListItem
              display="bitrate"
              isPressable
              item={item}
              tracks={tracks}
            />
          )}
        />
      )}
    </>
  );
}
