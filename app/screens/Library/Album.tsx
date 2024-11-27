// * React
import React, {useState, useEffect, useRef} from 'react';

// * React Native
import {View, Text, ActivityIndicator} from 'react-native';

// * Libraries
import {FlashList} from '@shopify/flash-list';
import {useBackHandler} from '@react-native-community/hooks';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import BottomSheet from '@gorhom/bottom-sheet';

// * Components
import LinearGradientX from '../../components/LinearGradientX';
import ListItem from '../../components/ListItem';
import StatusBarX from '../../components/StatusBarX';
import TrackDetails from '../../components/TrackDetails';

// * Store
import {API_URL, usePlayerStore} from '../../store';

// * Types
import {TrackProps} from '../../types';

export default function Album({
  navigation,
  route: {
    params: {albumArtist, album},
  },
}: any) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // ? Hooks
  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  const {
    data: tracks,
    isError,
    isFetching,
  } = useQuery({
    enabled: albumArtist && album ? true : false,
    queryKey: ['album', albumArtist, album],
    queryFn: ({queryKey}) =>
      axios(`${API_URL}artist/${queryKey[1]}/album/${queryKey[2]}`),
    select: ({data}) => data,
  });

  // ? States
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [track, setTrack] = useState<TrackProps>();

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

      <FlashList
        data={tracks}
        keyExtractor={(_, index) => index.toString()}
        estimatedItemSize={10}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 1000);
        }}
        renderItem={({item}: {item: TrackProps}) => (
          <ListItem
            data={tracks}
            item={item}
            display="bitrate"
            bottomSheetRef={bottomSheetRef}
            setTrack={setTrack}
            setBottomSheetVisible={setBottomSheetVisible}
          />
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

      {track && (
        <TrackDetails
          track={track}
          navigation={navigation}
          bottomSheetRef={bottomSheetRef}
          queriesToRefetch={['album', 'artist']}
        />
      )}
    </>
  );
}
