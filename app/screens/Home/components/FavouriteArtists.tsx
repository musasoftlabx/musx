// * React
import React from 'react';

// * React Native
import { Image, Pressable, View } from 'react-native';

// * Libraries
import { Avatar } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native-paper';

// * Components
import HorizontalListItem from '../../../components/Skeletons/HorizontalListItem';

// * Types
import { SectionProps } from '..';
import { RootStackParamList, TrackProps, TracksProps } from '../../../types';

export default function FavouriteArtists({
  loading,
  dataset,
}: {
  loading: boolean;
  dataset: SectionProps['dataset'];
}) {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'Artist', ''>
    >();

  return (
    <>
      {loading ? (
        <HorizontalListItem borderRadius={100} />
      ) : (
        dataset && (
          <FlashList
            data={dataset as TracksProps}
            horizontal
            keyExtractor={(_, index) => index.toString()}
            estimatedItemSize={20}
            renderItem={({ item }: { item: TrackProps }) => (
              <Pressable
                onPress={() =>
                  navigation.navigate('Artist', {
                    albumArtist: item.albumArtist,
                    artworks: item.artworks,
                    path: item.path,
                    tracks: item.tracks,
                    url: item.url,
                  })
                }
                style={{ alignItems: 'center', margin: 10, width: 100 }}
              >
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
                    }}
                  >
                    {item.artworks.map(
                      (artwork: string, i: number) =>
                        i <= 4 && (
                          <Image
                            key={i}
                            source={{ uri: artwork }}
                            style={{ width: 50, height: 50 }}
                            resizeMode="cover"
                          />
                        ),
                    )}
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
                    style={{ width: 100, height: 100, borderRadius: 100 }}
                  />
                )}

                <Text
                  numberOfLines={1}
                  style={{
                    color: 'white',
                    fontSize: 16,
                    marginTop: 5,
                    marginBottom: 1,
                  }}
                >
                  {item.albumArtist.includes('Various Artists')
                    ? item.albumArtist.replace('Various Artists', 'V.A.')
                    : item.albumArtist}
                </Text>

                <Text style={{ fontSize: 14, opacity: 0.5 }}>
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
                  }}
                >
                  {item.tracks} tracks
                </Text>
              </Pressable>
            )}
            ListFooterComponent={
              <Pressable
                onPress={() => navigation.navigate('Artists')}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  marginHorizontal: 20,
                  marginTop: -60,
                }}
              >
                <Avatar.Icon
                  size={60}
                  icon="chevron-right"
                  style={{ borderColor: '#ffffff4D', borderWidth: 1 }}
                />
              </Pressable>
            }
          />
        )
      )}
    </>
  );
}
