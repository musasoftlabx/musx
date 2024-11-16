// * React
import React from 'react';

// * React Native
import {View} from 'react-native';

// * Libraries
import TextTicker from 'react-native-text-ticker';

// * Store
import {usePlayerStore} from '../../../store';

export default function TrackInfo() {
  // ? StoreStates
  const activeTrack = usePlayerStore(state => state.activeTrack);

  const extraInfo = ` (${
    activeTrack?.year ? activeTrack?.year.slice(0, 4) : activeTrack?.encoder
  })`;

  return (
    <View
      style={{marginHorizontal: 10, marginVertical: 5, alignItems: 'center'}}>
      <TextTicker
        style={{fontSize: 18}}
        duration={15000}
        loop
        bounce
        bounceSpeed={50}
        repeatSpacer={30}
        marqueeDelay={3000}>
        {activeTrack?.artists || 'No Artists'}
      </TextTicker>

      <TextTicker
        style={{fontSize: 24, fontWeight: '800', marginVertical: 10}}
        duration={20000}
        loop
        bounce
        bounceSpeed={10}
        repeatSpacer={30}
        marqueeDelay={3000}>
        {activeTrack?.title}
      </TextTicker>

      <TextTicker
        style={{fontSize: 18, fontWeight: '500'}}
        duration={25000}
        loop
        bounce
        bounceSpeed={10}
        repeatSpacer={30}
        marqueeDelay={3000}>
        {activeTrack?.album
          ? activeTrack?.album === activeTrack?.title
            ? activeTrack?.albumArtist + ' Singles' + extraInfo
            : activeTrack?.album + extraInfo
          : 'No Album'}
      </TextTicker>
    </View>
  );
}
