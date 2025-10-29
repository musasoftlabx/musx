// * React
import React from 'react';

// * React Native
import { Pressable, Vibration, View } from 'react-native';

// * NPM
import { useDeviceOrientation } from '@react-native-community/hooks';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import TextTicker from 'react-native-text-ticker';

// * Store
import { API_URL, usePlayerStore } from '../../../store';

// * Functions
import { handleAxiosError, formatTrackTime } from '../../../functions';

// * Utils
import { fontFamily, fontFamilyBold } from '../../../utils';

export default function TrackInfo() {
  // ? Store States
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const orientation = useDeviceOrientation();

  // ? Store Actions
  const openTrackDetails = usePlayerStore(state => state.openTrackDetails);
  const setTrackDetails = usePlayerStore(state => state.setTrackDetails);
  const setTrackRating = usePlayerStore(state => state.setTrackRating);

  const extraInfo = ` (${
    activeTrack?.year ? activeTrack?.year.slice(0, 4) : activeTrack?.encoder
  })`;

  // ? Mutations
  const { mutate: retrieveLastModifiedPlaylist } = useMutation({
    mutationFn: (body: unknown) => axios(`${API_URL}lastModifiedPlaylist`),
  });

  return (
    <Pressable
      onPress={() => {
        Vibration.vibrate(100);
        openTrackDetails();
        setTrackRating(activeTrack.rating);
        retrieveLastModifiedPlaylist(
          {},
          {
            onSuccess: ({ data }) =>
              setTrackDetails({ ...activeTrack, lastModifiedPlaylist: data }),
            onError: handleAxiosError,
          },
        );
        //bottomSheetRef.current?.snapToIndex(0);
      }}
      style={{ alignItems: 'center', marginBottom: 5 }}
    >
      <View style={{ maxWidth: orientation === 'portrait' ? 'auto' : '50%' }}>
        <TextTicker
          style={{
            color: '#fff',
            fontFamily: 'LilyScriptOne',
            fontSize: orientation === 'portrait' ? 24 : 30,
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
      </View>

      <View style={{ maxWidth: orientation === 'portrait' ? 'auto' : '50%' }}>
        <TextTicker
          style={{
            color: '#ffffffa2',
            fontFamily: fontFamily,
            fontSize: 16,
            marginBottom: 10,
            // maxWidth: '50%',
            // textAlign: 'center',
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
      </View>

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
