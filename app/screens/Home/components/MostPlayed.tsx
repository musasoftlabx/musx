// * React
import React from 'react';

// * React Native
import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// * Libraries
import {Circle, Rect} from 'react-native-svg';
import SvgAnimatedLinearGradient from 'react-native-svg-animated-linear-gradient';

// * Store
import {ARTWORK_URL, AUDIO_URL, usePlayerStore, WIDTH} from '../../../store';

// * Types
import {SectionProps} from '..';
import {TrackProps} from '../../../types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {StarRatingDisplay} from 'react-native-star-rating-widget';

const ItemPlaceholder = () => {
  return [1, 2, 3].map(i => (
    <SvgAnimatedLinearGradient
      key={i}
      primaryColor="#e8f7ff"
      secondaryColor="#4dadf7"
      height={80}
      style={{marginTop: -20}}>
      <Rect x="0" y="40" rx="4" ry="4" width="40" height="40" />
      <Rect x="55" y="50" rx="4" ry="4" width="200" height="10" />
      <Rect x="280" y="50" rx="4" ry="4" width="10" height="10" />
      <Rect x="55" y="65" rx="4" ry="4" width="150" height="8" />
    </SvgAnimatedLinearGradient>
  ));
};

export default function MostPlayed({
  loading,
  dataset,
}: {
  loading: boolean;
  dataset: SectionProps['dataset'];
}) {
  // ? StoreActions
  const play = usePlayerStore(state => state.play);

  return (
    <>
      {loading ? (
        <View
          style={{
            backgroundColor: '#fff',
            opacity: 0.2,
            padding: 20,
            margin: 10,
            borderRadius: 10,
          }}>
          <SvgAnimatedLinearGradient
            primaryColor="#e8f7ff"
            secondaryColor="#4dadf7"
            height={25}>
            <Rect x="0" y="5" rx="4" ry="4" width="200" height="15" />
          </SvgAnimatedLinearGradient>
          <ItemPlaceholder />
        </View>
      ) : (
        <FlatList
          horizontal
          data={dataset}
          renderItem={({item}: {item: TrackProps}) => (
            <ImageBackground
              source={{uri: `${ARTWORK_URL}${item.artwork}`}}
              resizeMode="cover"
              borderRadius={20}
              width={10}
              blurRadius={20}
              style={{
                margin: 10,
                width: 320,
                //tintColor: '#000',
                padding: 10,
              }}>
              {/* <View
              style={{
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                position: 'absolute',
                backgroundColor: 'black',
                opacity: 0.6,
                zIndex: 2,
              }}
            /> */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginHorizontal: 10,
                  marginVertical: 10,
                }}>
                <Text
                  style={{
                    fontSize: 20,
                    color: '#fff',
                  }}>
                  Most played this month
                </Text>
                <View style={{flex: 1}} />
                <Pressable>
                  <MaterialIcons
                    style={{marginTop: 3}}
                    name="double-arrow"
                    size={15}
                  />
                </Pressable>
              </View>
              <FlatList
                data={dataset}
                renderItem={({
                  item,
                  index,
                }: {
                  item: TrackProps;
                  index: number;
                }) => (
                  <Pressable onPress={() => play('', item)}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 10,
                        paddingHorizontal: 10,
                      }}>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: 'bold',
                          color: '#fff',
                        }}>
                        {index + 1}.
                      </Text>
                      <Image
                        source={{
                          uri: `${ARTWORK_URL}${item.artwork}`,
                        }}
                        style={{
                          height: 45,
                          width: 45,
                          marginHorizontal: 8,
                          borderRadius: 10,
                        }}
                      />
                      <View
                        style={{
                          justifyContent: 'center',
                          marginTop: -2,
                          maxWidth: WIDTH - 175,
                        }}>
                        <Text numberOfLines={1} style={styles.title}>
                          {item.title}
                        </Text>
                        <Text numberOfLines={1} style={styles.artists}>
                          {item.artists || 'Unknown Artist'}
                        </Text>
                      </View>
                      <View style={{flex: 1}} />
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'flex-end',
                        }}>
                        <StarRatingDisplay
                          rating={item.rating}
                          starSize={16}
                          starStyle={{marginHorizontal: 0}}
                        />
                        <Text
                          style={{
                            fontWeight: 'bold',
                            marginRight: 5,
                          }}>
                          {item.plays || 0} plays
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                )}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
            </ImageBackground>
          )}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  item: {
    margin: 10,
  },
});
