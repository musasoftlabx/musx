// * React
import React from 'react';

// * React Native
import {Text, View} from 'react-native';

// * Libraries
import TextTicker from 'react-native-text-ticker';

// * Store
import {usePlayerStore} from '../../../store';

export default function TrackInfo() {
  // ? StoreStates
  const activeTrack = usePlayerStore(state => state.activeTrack);

  return (
    <>
      <Text
        numberOfLines={1}
        style={{
          fontSize: 18,
        }}>
        {activeTrack?.artists || 'No Artists'}
      </Text>

      <TextTicker
        style={{
          fontSize: 24,
          fontWeight: '800',
          marginTop: 5,
          marginBottom: 8,
        }}
        duration={20000}
        loop
        bounce
        bounceSpeed={10}
        repeatSpacer={50}
        marqueeDelay={3000}>
        {activeTrack?.title}
      </TextTicker>

      <View style={{flexDirection: 'row', gap: 3}}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 18,
            fontWeight: '500',
          }}>
          {activeTrack?.album
            ? activeTrack?.album === activeTrack?.title
              ? activeTrack?.albumArtist + ' Singles'
              : activeTrack?.album
            : 'No Album'}
        </Text>

        <Text style={{fontSize: 18, fontWeight: '400'}}>
          (
          {activeTrack?.year
            ? `${activeTrack?.year.slice(0, 4)}`
            : activeTrack?.encoder}
          )
        </Text>
      </View>
    </>
  );
}
