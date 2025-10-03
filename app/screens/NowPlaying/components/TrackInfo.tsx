// * React
import React from 'react';

// * React Native
import { Pressable, Vibration } from 'react-native';

// * Libraries
import TextTicker from 'react-native-text-ticker';

// * Store
import { usePlayerStore } from '../../../store';
import { fontFamily, fontFamilyBold } from '../../../utils';
import { useDeviceOrientation } from '@react-native-community/hooks';

export default function TrackInfo({ bottomSheetRef }: any) {
  // ? Store States
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const orientation = useDeviceOrientation();

  const extraInfo = ` (${
    activeTrack?.year ? activeTrack?.year.slice(0, 4) : activeTrack?.encoder
  })`;

  return (
    <Pressable
      style={{ marginHorizontal: 10, marginBottom: 5, alignItems: 'center' }}
      onPress={() => {
        Vibration.vibrate(100);
        bottomSheetRef.current?.snapToIndex(0);
      }}
    >
      <TextTicker
        style={{
          color: '#fff',
          fontSize: orientation === 'portrait' ? 24 : 30,
          fontFamily: 'LilyScriptOne',
          marginBottom: 10,
        }}
        duration={20000}
        loop
        bounce
        bounceSpeed={10}
        repeatSpacer={30}
        marqueeDelay={3000}
      >
        {activeTrack?.title}
      </TextTicker>

      <TextTicker
        style={{
          color: '#ffffffa2',
          fontFamily: fontFamily,
          fontSize: 16,
          marginBottom: 10,
        }}
        duration={15000}
        loop
        bounce
        bounceSpeed={50}
        repeatSpacer={30}
        marqueeDelay={3000}
      >
        {activeTrack?.artists || 'No Artists'}
      </TextTicker>

      <TextTicker
        style={{ color: '#fff', fontFamily: fontFamilyBold, fontSize: 18 }}
        duration={25000}
        loop
        bounce
        bounceSpeed={10}
        repeatSpacer={30}
        marqueeDelay={3000}
      >
        {activeTrack?.album
          ? activeTrack?.album === activeTrack?.title
            ? activeTrack?.albumArtist + ' Singles' + extraInfo
            : activeTrack?.album + extraInfo
          : 'No Album'}
      </TextTicker>
    </Pressable>
  );
}
