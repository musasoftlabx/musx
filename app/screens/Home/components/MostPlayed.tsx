// * React
import React from 'react';

// * React Native
import {FlatList, View} from 'react-native';

// * Libraries
import {Rect} from 'react-native-svg';
import SvgAnimatedLinearGradient from 'react-native-svg-animated-linear-gradient';

// * Components
import ListItem from '../../../components/ListItem';

// * Types
import {SectionProps} from '..';
import {TrackProps, TracksProps} from '../../../types';

const ItemPlaceholder = () => {
  return [1, 2, 3].map(i => (
    // @ts-ignore
    <SvgAnimatedLinearGradient
      key={i}
      primaryColor="#e8f7ff"
      secondaryColor="#4dadf7"
      height={80}
      style={{marginTop: -20}}>
      <Rect x="0" y="40" rx="4" ry="4" width="40" height="40" />
      <Rect x="55" y="50" rx="4" ry="4" width="200" height="10" />
      <Rect x="280" y="50" rx="4" ry="4" width="10" height="10" />
      <Rect x="55" y="65" rx="4" ry="4" width="150" height="8" />
    </SvgAnimatedLinearGradient>
  ));
};

export default function MostPlayed({
  loading,
  dataset,
  bottomSheetRef,
  setTrack,
  setBottomSheetVisible,
}: {
  loading: boolean;
  dataset: SectionProps['dataset'];
  bottomSheetRef?: any;
  setTrack: (highlighted: TrackProps) => void;
  setBottomSheetVisible: (visible: boolean) => void;
}) {
  return loading ? (
    <View
      style={{
        backgroundColor: '#fff',
        opacity: 0.2,
        padding: 20,
        margin: 10,
        borderRadius: 10,
      }}>
      <ItemPlaceholder />
    </View>
  ) : (
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
