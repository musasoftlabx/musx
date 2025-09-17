// * React
import React from 'react';

// * React Native
import { Pressable, Vibration } from 'react-native';

// * Libraries
import TextTicker from 'react-native-text-ticker';

// * Store
import { usePlayerStore } from '../../../store';

export default function TrackInfo({ bottomSheetRef }: any) {
  // ? StoreStates
  const activeTrack = usePlayerStore(state => state.activeTrack);

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
        style={{ color: '#fff', fontSize: 18 }}
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
        style={{
          color: '#fff',
          fontSize: 24,
          fontWeight: '800',
          marginTop: 9,
          marginBottom: 12,
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
        style={{ color: '#fff', fontSize: 18, fontWeight: '500' }}
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
