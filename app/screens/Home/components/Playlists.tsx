// * React
import React from 'react';

// * React Native
import { FlatList, Image, Pressable, View } from 'react-native';

// * Libraries
import { FlashList } from '@shopify/flash-list';
import { Text } from 'react-native-paper';
import { useDeviceOrientation } from '@react-native-community/hooks';
import { useNavigation } from '@react-navigation/native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

// * Store
import { WIDTH } from '../../../store';

// * Types
import { RootStackParamList } from '../../../types';

export default function Playlist({
  loading,
  dataset,
}: {
  loading: boolean;
  dataset: RootStackParamList['Playlists'];
}) {
  // ? Hooks
  const orientation = useDeviceOrientation();
  const navigation = useNavigation();

  return (
    <>
      {loading ? (
        <FlatList
          data={new Array(Number((WIDTH / 150).toFixed(0))).fill(0)}
          horizontal
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ alignItems: 'center' }}
          renderItem={() => (
            <View style={{ paddingHorizontal: 10 }}>
              <SkeletonPlaceholder
                highlightColor="#fff5"
                backgroundColor="#fff5"
              >
                <View style={{ alignItems: 'center', paddingTop: 20 }}>
                  <View
                    style={{
                      borderRadius: 10,
                      marginBottom: 10,
                      height: 150,
                      width: 150,
                    }}
                  />
                  <View
                    style={{ alignItems: 'center', borderRadius: 5, gap: 8 }}
                  >
                    <Text style={{ fontSize: 14, lineHeight: 16, width: 100 }}>
                      {''}
                    </Text>
                    <Text style={{ fontSize: 14, lineHeight: 10, width: 80 }}>
                      {''}
                    </Text>
                    <Text style={{ fontSize: 14, lineHeight: 8, width: 50 }}>
                      {''}
                    </Text>
                  </View>
                </View>
              </SkeletonPlaceholder>
            </View>
          )}
        />
      ) : (
        dataset && (
          <FlashList
            data={dataset}
            horizontal
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => navigation.navigate('Playlist', item)}
                style={{ marginHorizontal: 15 }}
              >
                <View
                  style={{ paddingVertical: 12, alignItems: 'center', gap: 3 }}
                >
                  {item.tracks >= 4 ? (
                    <View
                      style={{
                        borderColor: '#f0ecd9ff',
                        borderRadius: 10,
                        borderWidth: 2,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        width: 154,
                        height: 154,
                        overflow: 'hidden',
                      }}
                    >
                      {item.artworks.map(
                        (artwork: string, i: number) =>
                          i <= 4 && (
                            <Image
                              key={i}
                              source={{ uri: artwork }}
                              style={{ width: 75, height: 75 }}
                              resizeMode="cover"
                            />
                          ),
                      )}
                    </View>
                  ) : (
                    <Image
                      source={{ uri: item.artworks[0] }}
                      style={{ width: 150, height: 150, borderRadius: 10 }}
                    />
                  )}

                  <Text
                    numberOfLines={1}
                    style={{
                      color: '#fff',
                      fontFamily: 'Pacifico',
                      fontSize: orientation === 'portrait' ? 17 : 13,
                      marginTop: 2,
                    }}
                  >
                    {item.name}
                  </Text>

                  <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        backgroundColor: '#a7a7a745',
                        borderColor: '#ffffff4D',
                        borderWidth: 1,
                        borderTopLeftRadius: 5,
                        borderBottomLeftRadius: 5,
                        fontSize: 13,
                        paddingLeft: 7,
                        paddingHorizontal: 5,
                        paddingTop: 2,
                      }}
                    >
                      {item.size}
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: '#ffffff4D',
                        borderWidth: 1,
                        borderTopRightRadius: 5,
                        borderBottomRightRadius: 5,
                        fontSize: 13,
                        paddingLeft: 7,
                        paddingHorizontal: 5,
                        paddingTop: 2,
                      }}
                    >
                      {item.tracks} tracks
                    </Text>
                  </View>

                  <Text style={{ fontSize: 14, marginTop: 2, opacity: 0.5 }}>
                    {item.duration} mins
                  </Text>
                </View>
              </Pressable>
            )}
          />
        )
      )}
    </>
  );
}
