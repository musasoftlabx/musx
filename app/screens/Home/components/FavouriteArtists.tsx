// * React
import React from 'react';

// * React Native
import {Image, Pressable, Text, View} from 'react-native';

// * Libraries
import {Circle, Rect} from 'react-native-svg';
import {FlashList} from '@shopify/flash-list';
import {useNavigation} from '@react-navigation/native';
import SvgAnimatedLinearGradient from 'react-native-svg-animated-linear-gradient';

// * Store
import {ARTWORK_URL, AUDIO_URL} from '../../../store';

// * Types
import {SectionProps} from '..';
import {TrackProps} from '../../../types';

export default function FavouriteArtists({
  loading,
  dataset,
}: {
  loading: boolean;
  dataset: SectionProps['dataset'];
}) {
  const navigation = useNavigation();

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
        dataset && (
          <FlashList
            data={dataset}
            horizontal
            keyExtractor={(_, index) => index.toString()}
            estimatedItemSize={20}
            renderItem={({item}: {item: TrackProps}) => (
              <Pressable
                onPress={() =>
                  navigation.navigate('Artist', {
                    albumArtist: item.albumArtist,
                    tracks: item.tracks,
                    path: item.path,
                  })
                }
                style={{alignItems: 'center', margin: 10, width: 100}}>
                {item.hasOwnProperty('artworks') ? (
                  <View
                    style={{
                      borderRadius: 200,
                      overflow: 'hidden',
                      flexDirection: 'row',
                      flexBasis: '50%',
                      flexWrap: 'wrap',
                      width: 100,
                      height: 100,
                    }}>
                    {item.artworks.map((artwork: string, i: number) => (
                      <Image
                        key={i}
                        source={{uri: `${ARTWORK_URL}${artwork}`}}
                        style={{width: 50, height: 50}}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                ) : (
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
                )}

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

                <Text
                  numberOfLines={1}
                  style={{
                    borderColor: '#ffffff4D',
                    borderWidth: 1,
                    borderRadius: 5,
                    fontSize: 14,
                    marginTop: 1,
                    paddingHorizontal: 5,
                  }}>
                  {item.tracks} tracks
                </Text>
              </Pressable>
            )}
          />
        )
      )}
    </>
  );
}
