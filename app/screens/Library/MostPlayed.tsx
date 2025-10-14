// * React
import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';

// * React Native
import {
  ActivityIndicator,
  Text,
  View,
  Vibration,
  Pressable,
} from 'react-native';

// * Libraries
import { FlashList } from '@shopify/flash-list';
import { useBackHandler } from '@react-native-community/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import BottomSheet from '@gorhom/bottom-sheet';
import MonthPicker from 'react-native-month-year-picker';

// * Components
import LinearGradientX from '../../components/LinearGradientX';
import ListItem from '../../components/ListItem';
import StatusBarX from '../../components/StatusBarX';
import TrackDetails from '../../components/TrackDetails';

// * Store
import { API_URL, HEIGHT, LIST_ITEM_HEIGHT, usePlayerStore } from '../../store';

// * Constants
import { queryClient } from '../../../App';

// * Types
import { CastButton } from 'react-native-google-cast';
import { TrackProps, TracksProps } from '../../types';
import dayjs from 'dayjs';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function MostPlayed({
  navigation,
  route: {
    params: { queryKey, title },
  },
}: any) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // ? StoreStates
  const palette = usePlayerStore(state => state.palette);

  // ? States
  const [limit] = useState(Math.floor(HEIGHT / LIST_ITEM_HEIGHT));

  // ? Store Actions
  const play = usePlayerStore(state => state.play);
  const openTrackDetails = usePlayerStore(state => state.openTrackDetails);
  const setTrackDetails = usePlayerStore(state => state.setTrackDetails);
  const setTrackRating = usePlayerStore(state => state.setTrackRating);

  // ? Hooks
  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  // ? States
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [track, setTrack] = useState<TrackProps>();
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const {
    data,
    isError,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, queryKey }) =>
      axios.get(
        `${API_URL}${queryKey[0]}?limit=${limit}&offset=${pageParam}&date=${date}`,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const maxPages = Math.ceil(lastPage.data.count / limit);
      return lastPageParam <= maxPages ? lastPageParam + 1 : undefined;
    },
  });

  const onValueChange = useCallback(
    (event: any, newDate: Date) => {
      const selectedDate = newDate || date;
      setShow(false);
      setDate(selectedDate);
      queryClient.refetchQueries({ queryKey });
    },
    [date, show],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: palette?.[1] ?? '#000' },
      headerLeft: () => (
        <View style={{ justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20 }}>{title}</Text>
          <Text>In {dayjs(date).format('MMMM, YYYY').toLocaleString()}</Text>
        </View>
      ),
      headerRight: () => (
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 40 }}>
          <Ionicons
            name="calendar-outline"
            size={22}
            color="white"
            style={{ marginRight: 10, opacity: 0.8 }}
            onPress={() => (Vibration.vibrate(50), setShow(true))}
          />
          <CastButton style={{ height: 24, width: 24, marginRight: 5 }} />
        </View>
      ),
    });
  }, [navigation]);

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

      {show && (
        <MonthPicker
          value={date}
          onChange={onValueChange}
          maximumDate={new Date(2025, 1)}
        />
      )}

      <FlashList
        data={data?.pages.map(page => page.data.plays).flat()}
        keyExtractor={(_, index) => index.toString()}
        //estimatedItemSize={limit}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          queryClient
            .refetchQueries({ queryKey })
            .then(() => setRefreshing(false));
        }}
        onEndReached={() =>
          hasNextPage && !isFetchingNextPage && fetchNextPage()
        }
        onEndReachedThreshold={0.1}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <View style={{ alignItems: 'center', marginTop: 10 }}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <View />
          )
        }
        ListFooterComponentStyle={{ height: isFetchingNextPage ? 80 : 0 }}
        renderItem={({ item }: { item: TrackProps }) => (
          <Pressable
            onPress={() =>
              play(data?.pages.map(page => page.data.plays).flat(), item)
            }
            onLongPress={() => {
              Vibration.vibrate(100);
              setTrackDetails(item);
              openTrackDetails();
              setTrackRating(item.rating);
            }}
          >
            <ListItem
              item={item}
              display="bitrate"
              // bottomSheetRef={bottomSheetRef}
              // setTrack={setTrack}
              // setBottomSheetVisible={setBottomSheetVisible}
            />
          </Pressable>
        )}
        ListEmptyComponent={() =>
          isFetching ? (
            <ActivityIndicator
              size="large"
              color="#fff"
              style={{ marginTop: '50%' }}
            />
          ) : isError ? (
            <View>
              <Text style={{ fontFamily: 'Abel' }}>Empty</Text>
            </View>
          ) : (
            <View />
          )
        }
      />
    </>
  );
}
