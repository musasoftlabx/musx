// * React
import React from 'react';

// * React Native
import {Image, Pressable, Text, View} from 'react-native';

// * Libraries
import {Avatar} from 'react-native-paper';
import {Circle, Rect} from 'react-native-svg';
import {FlashList} from '@shopify/flash-list';
import {useNavigation} from '@react-navigation/native';
import SvgAnimatedLinearGradient from 'react-native-svg-animated-linear-gradient';

// * Store
import {ARTWORK_URL, WIDTH} from '../../../store';

// * Types
import {SectionProps} from '..';
import {TrackProps, TracksProps} from '../../../types';

export default function FavouriteArtists({
  loading,
  dataset,
}: {
  loading: boolean;
  dataset: SectionProps['dataset'];
}) {
  const navigation: any = useNavigation();

  return (
    <>
      {loading ? (
        <View style={{flexDirection: 'row', opacity: 0.2, padding: 10}}>
          {new Array(Number((WIDTH / 150).toFixed(0))).fill(0).map((_, i) => (
            //@ts-ignore
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
            data={dataset as TracksProps}
            horizontal
            keyExtractor={(_, index) => index.toString()}
            estimatedItemSize={20}
            renderItem={({item}: {item: TrackProps}) => (
              <Pressable
                onPress={() =>
                  navigation.navigate('Artist', {
                    albumArtist: item.albumArtist,
                    artworks: item.artworks,
                    tracks: item.tracks,
                    url: item.url,
                  })
                }
                style={{alignItems: 'center', margin: 10, width: 100}}>
                {item.hasOwnProperty('artworks') ? (
                  <View
                    style={{
                      borderRadius: 100,
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      marginTop: 0.5,
                      width: 100,
                      height: 100,
                      overflow: 'hidden',
                    }}>
                    {item.artworks.map((artwork: string, i: number) => (
                      <Image
                        key={i}
                        source={{uri: artwork}}
                        style={{width: 50, height: 50}}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                ) : (
                  <Image
                    resizeMode="cover"
                    source={{
                      uri: `${item.url
                        .split('/')
                        .slice(0, -1)
                        .join('/')}/artist.jpg`,
                    }}
                    style={{width: 100, height: 100, borderRadius: 100}}
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
                  {item.albumArtist.includes('Various Artists')
                    ? item.albumArtist.replace('Various Artists', 'V.A.')
                    : item.albumArtist}
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
            ListFooterComponent={
              <Pressable
                onPress={() => {}}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  marginHorizontal: 20,
                  marginTop: -60,
                }}>
                <Avatar.Icon
                  size={60}
                  icon="chevron-right"
                  style={{borderColor: '#ffffff4D', borderWidth: 1}}
                />
              </Pressable>
            }
          />
        )
      )}
    </>
  );
}
