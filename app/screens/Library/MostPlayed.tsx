// * React
import React, {useState, useRef, useLayoutEffect, useCallback} from 'react';

// * React Native
import {ActivityIndicator, View, Text} from 'react-native';

// * Libraries
import {FlashList} from '@shopify/flash-list';
import {useBackHandler} from '@react-native-community/hooks';
import {useInfiniteQuery} from '@tanstack/react-query';
import axios from 'axios';
import BottomSheet from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import MonthPicker from 'react-native-month-year-picker';

// * Components
import LinearGradientX from '../../components/LinearGradientX';
import ListItem from '../../components/ListItem';
import StatusBarX from '../../components/StatusBarX';
import TrackDetails from '../../components/TrackDetails';

// * Store
import {API_URL, HEIGHT, LIST_ITEM_HEIGHT, usePlayerStore} from '../../store';

// * Constants
import {queryClient} from '../../../App';

// * Types
import {TrackProps, TracksProps} from '../../types';
import dayjs from 'dayjs';
import {CastButton} from 'react-native-google-cast';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function MostPlayed({
  navigation,
  route: {
    params: {queryKey, title},
  },
}: any) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // ? StoreStates
  const palette = usePlayerStore(state => state.palette);

  // ? States
  const [limit] = useState(Math.floor(HEIGHT / LIST_ITEM_HEIGHT));

  // ? Hooks
  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  const {
    data,
    isError,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({pageParam, queryKey}) =>
      axios.get(`${API_URL}${queryKey[0]}?limit=${limit}&offset=${pageParam}`),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const maxPages = Math.ceil(lastPage.data.count / limit);
      return lastPageParam <= maxPages ? lastPageParam + 1 : undefined;
    },
  });

  // ? States
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [track, setTrack] = useState<TrackProps>();
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const onValueChange = useCallback(
    (event, newDate) => {
      const selectedDate = newDate || date;

      setShow(false);
      setDate(selectedDate);
    },
    [date, show],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: palette?.[1] ?? '#000'},
      headerLeft: () => (
        <View style={{justifyContent: 'center'}}>
          <Text style={{color: '#fff', fontSize: 20}}>{title}</Text>
          <Text>{date.toLocaleString()}</Text>
        </View>
      ),
      headerRight: () => (
        <View style={{alignItems: 'center', flexDirection: 'row', gap: 40}}>
          <Ionicons
            name="calendar-outline"
            size={24}
            color="white"
            style={{marginRight: 10}}
            onPress={() => setShow(true)}
          />
          <CastButton style={{height: 24, width: 24, marginRight: 5}} />
        </View>
      ),
    });
  });

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

      {show && (
        <MonthPicker
          value={date}
          onChange={onValueChange}
          //minimumDate={new Date()}
          maximumDate={new Date(2025, 1)}
        />
      )}

      <FlashList
        data={data?.pages.map(page => page.data.plays).flat()}
        keyExtractor={(_, index) => index.toString()}
        estimatedItemSize={limit}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          queryClient
            .refetchQueries({queryKey})
            .then(() => setRefreshing(false));
        }}
        onEndReached={() =>
          hasNextPage && !isFetchingNextPage && fetchNextPage()
        }
        onEndReachedThreshold={0.1}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <View style={{alignItems: 'center', marginTop: 10}}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <View />
          )
        }
        ListFooterComponentStyle={{height: isFetchingNextPage ? 80 : 0}}
        renderItem={({item}: {item: TrackProps}) => (
          <ListItem
            data={
              data?.pages.map(page => page.data.plays).flat() as TracksProps
            }
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
          queriesToRefetch={queryKey}
        />
      )}
    </>
  );
}
