// * React
import React from 'react';

// * React Native
import { FlatList, Image, Pressable, View } from 'react-native';

// * Libraries
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { Text } from 'react-native-paper';

// * Store
import { WIDTH } from '../../../store';

// * Types
import { RootStackParamList } from '../../../types';

dayjs.extend(relativeTime);

export default function Playlist({
  loading,
  dataset,
}: {
  loading: boolean;
  dataset: RootStackParamList['Playlists'];
}) {
  // ? Hooks
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
                    <Text
                      style={{ fontSize: 14, lineHeight: 16, width: 100 }}
                    />
                    <Text style={{ fontSize: 14, lineHeight: 10, width: 80 }} />
                    <Text style={{ fontSize: 14, lineHeight: 8, width: 50 }} />
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
                        borderRadius: 10,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        marginTop: 0.5,
                        width: 150,
                        height: 150,
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
                    style={{ color: '#fff', fontSize: 16, marginTop: 5 }}
                  >
                    {item.name}
                  </Text>

                  <View
                    style={{
                      alignItems: 'center',
                      flexDirection: 'row',
                      gap: 3,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        alignSelf: 'flex-start',
                        borderColor: '#ffffff4D',
                        borderWidth: 1,
                        borderRadius: 5,
                        fontSize: 14,
                        marginTop: 1,
                        paddingLeft: 5,
                        paddingRight: 3,
                      }}
                    >
                      {item.size}
                    </Text>

                    <Text style={{ fontSize: 14, opacity: 0.5 }}>
                      {item.tracks} tracks
                    </Text>
                  </View>

                  <Text style={{ fontSize: 14, opacity: 0.5 }}>
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
