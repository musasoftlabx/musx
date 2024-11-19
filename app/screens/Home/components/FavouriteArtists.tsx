// * React
import React from 'react';

// * React Native
import {FlatList, Image, Pressable, Text, View} from 'react-native';

// * Libraries
import {Circle, Rect} from 'react-native-svg';
import SvgAnimatedLinearGradient from 'react-native-svg-animated-linear-gradient';

// * Store
import {AUDIO_URL} from '../../../store';

// * Types
import {SectionProps} from '../Home';
import {TrackProps} from '../../../types';

export default function FavouriteArtists({
  loading,
  dataset,
}: {
  loading: boolean;
  dataset: SectionProps['dataset'];
}) {
  return (
    <>
      {loading ? (
        <View
          style={{
            opacity: 0.2,
            padding: 10,
            flexDirection: 'row',
          }}>
          {[1, 2, 3].map(i => (
            <SvgAnimatedLinearGradient
              key={i}
              primaryColor="#e8f7ff"
              secondaryColor="#4dadf7"
              height={150}
              width={150}>
              <Circle cx="50" cy="50" r="50" />
              <Rect x="0" y="120" rx="4" ry="4" width="100" height="10" />
              <Rect x="10" y="140" rx="4" ry="4" width="80" height="8" />
            </SvgAnimatedLinearGradient>
          ))}
        </View>
      ) : (
        <FlatList
          horizontal
          data={dataset}
          renderItem={({item}: {item: TrackProps}) => {
            return (
              <View style={{alignItems: 'center', margin: 10, width: 100}}>
                <Image
                  source={{
                    uri: `${AUDIO_URL}${item.path
                      .split('/')
                      .slice(0, -1)
                      .join('/')}/artist.jpg`,
                  }}
                  style={{width: 100, height: 100, borderRadius: 100}}
                  resizeMode="cover"
                />
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 16,
                    color: 'white',
                    marginTop: 5,
                    marginBottom: 1,
                  }}>
                  {item.albumArtist}
                </Text>
                <Text style={{fontSize: 14, opacity: 0.5}}>
                  {item.rating.toFixed(2)} rating
                </Text>
              </View>
            );
          }}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </>
  );
}
