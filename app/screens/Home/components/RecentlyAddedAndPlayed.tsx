// * React
import React from 'react';

// * React Native
import {Image, Pressable, Text, Vibration, View} from 'react-native';

// * Libraries
import {FlashList} from '@shopify/flash-list';
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// * Store
import {usePlayerStore} from '../../../store';

// * Types
import {SectionProps} from '..';
import {TrackProps, TracksProps} from '../../../types';

dayjs.extend(relativeTime);

export default function RecentlyAddedAndPlayed({
  section: {dataset, title},
  bottomSheetRef,
  setTrack,
  setBottomSheetVisible,
}: {
  section: SectionProps;
  bottomSheetRef?: any;
  setTrack: (highlighted: TrackProps) => void;
  setBottomSheetVisible: (visible: boolean) => void;
}) {
  // ? StoreActions
  const play = usePlayerStore(state => state.play);

  return (
    dataset && (
      <FlashList
        data={dataset as TracksProps}
        horizontal
        keyExtractor={(_, index) => index.toString()}
        estimatedItemSize={20}
        renderItem={({item}: {item: TrackProps}) => (
          <Pressable
            onPress={() => play([item], item)}
            onLongPress={() => {
              Vibration.vibrate(100);
              setTrack(item);
              setBottomSheetVisible(true);
              bottomSheetRef.current?.snapToIndex(0);
            }}
            style={{margin: 10, width: 100}}>
            <Image
              source={{uri: item.artwork}}
              style={{width: 100, height: 100, borderRadius: 10}}
              resizeMode="cover"
            />

            <StarRatingDisplay
              rating={item.rating}
              starSize={16}
              starStyle={{marginHorizontal: 2}}
              style={{marginTop: 5, marginLeft: -4}}
            />

            <Text
              numberOfLines={1}
              style={{
                fontSize: 16,
                color: 'white',
                marginTop: 5,
                marginBottom: 2,
              }}>
              {item.title}
            </Text>

            <Text numberOfLines={1} style={{fontSize: 14, opacity: 0.7}}>
              {item.artists || 'No artist info'}
            </Text>

            {title === 'Recently Added' ? (
              <Text numberOfLines={1} style={{fontSize: 13}}>
                {`${dayjs().to(dayjs(item.syncDate))}`}
              </Text>
            ) : title === 'Recently Played' ? (
              <Text numberOfLines={1} style={{fontSize: 13}}>
                {`${dayjs().to(dayjs(item.playedOn))}`}
              </Text>
            ) : (
              <View />
            )}

            <Text
              numberOfLines={1}
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#ffffff1A',
                borderColor: '#fff',
                borderWidth: 0.5,
                borderRadius: 3,
                marginTop: 5,
                maxWidth: 'auto',
                paddingVertical: 1,
                paddingHorizontal: 5,
                fontWeight: 'bold',
                fontSize: 13,
              }}>
              {`${item.format.toLocaleUpperCase()} ${(
                item.bitrate! / 1000
              ).toFixed(0)} Kbps`}
            </Text>
          </Pressable>
        )}
      />
    )
  );
}
