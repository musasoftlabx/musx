// * React
import React, { useState, useRef, useLayoutEffect } from 'react';

// * React Native
import {
  ActivityIndicator,
  View,
  Text,
  Pressable,
  Vibration,
} from 'react-native';

// * Libraries
import { FlashList } from '@shopify/flash-list';
import { useBackHandler } from '@react-native-community/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import BottomSheet from '@gorhom/bottom-sheet';

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
import { TrackProps, TracksProps } from '../../types';

export default function RecentlyPlayed({
  navigation,
  route: {
    params: { queryKey, title },
  },
}: any) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // ? States
  const [limit] = useState(Math.floor(HEIGHT / LIST_ITEM_HEIGHT));

  // ? Hooks
  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  useLayoutEffect(() => {
    navigation.setOptions({ title });
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
    queryFn: ({ pageParam, queryKey }) =>
      axios.get(`${API_URL}${queryKey[0]}?limit=${limit}&offset=${pageParam}`),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const maxPages = Math.ceil(lastPage.data.count / limit);
      return lastPageParam <= maxPages ? lastPageParam + 1 : undefined;
    },
  });

  // ? Store Actions
  const play = usePlayerStore(state => state.play);
  const openTrackDetails = usePlayerStore(state => state.openTrackDetails);
  const setTrackDetails = usePlayerStore(state => state.setTrackDetails);
  const setTrackRating = usePlayerStore(state => state.setTrackRating);

  // ? States
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [track, setTrack] = useState<TrackProps>();

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

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
          <ListItem
            display="bitrate"
            isPressable
            item={item}
            tracks={data?.pages.map(page => page.data.plays).flat()!}
          />
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
