// * React
import React from 'react';

// * React Native
import {FlatList} from 'react-native';

// * Components
import ListItem from '../../../components/ListItem';
import VerticalListItem from '../../../components/Skeletons/VerticalListItem';

// * Types
import {SectionProps} from '..';
import {TrackProps, TracksProps} from '../../../types';

export default function MostPlayed({
  loading,
  dataset,
}: {
  loading: boolean;
  dataset: SectionProps['dataset'];
}) {
  return loading ? (
    <VerticalListItem />
  ) : (
    <FlatList
      data={dataset as TracksProps}
      renderItem={({item}: {item: TrackProps}) => (
        <ListItem data={dataset as TracksProps} item={item} display="bitrate" />
      )}
      keyExtractor={(_, index) => index.toString()}
      scrollEnabled={false}
    />
  );
}

{
  /* <ImageBackground
      source={{uri: dataset?.[0].artwork}}
      resizeMode="cover"
      blurRadius={100}
      borderRadius={15}
      style={{margin: 5, padding: 10}}>
      <View
        style={{
          backgroundColor: '#0000',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 2,
        }}
      />
      <FlatList
        data={dataset as TracksProps}
        renderItem={({item}: {item: TrackProps}) => (
          <ListItem
            data={dataset as TracksProps}
            item={item}
            display="bitrate"
            bottomSheetRef={bottomSheetRef}
            setTrack={setTrack}
            setBottomSheetVisible={setBottomSheetVisible}
          />
        )}
        keyExtractor={(_, index) => index.toString()}
        scrollEnabled={false}
      />
    </ImageBackground> */
}
