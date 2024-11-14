import React, {useContext, useState, useEffect, useFocusEffect} from 'react';
import {
  Animated,
  Easing,
  BackHandler,
  Button,
  Image,
  ImageBackground,
  Dimensions,
  View,
  Pressable,
  Text,
  ScrollView,
  FlatList,
  SectionList,
  SafeAreaView,
  StyleSheet,
} from 'react-native';

import Discography from './Artist/Discography';
import Favourites from './Artist/Favourites';
import Related from './Artist/Related';
import {API_URL} from '../../store';
import axios from 'axios';

const spinValue = new Animated.Value(0);

// First set up animation
Animated.loop(
  Animated.timing(spinValue, {
    toValue: 1,
    duration: 3000,
    easing: Easing.linear, // Easing is an additional import from react-native
    useNativeDriver: true, // To make use of native driver for performance
  }),
).start();

// Next, interpolate beginning and end values (in this case 0 and 1)
const spin = spinValue.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '360deg'],
});

const Tab = createMaterialTopTabNavigator();

export default function Artist({
  navigation,
  route: {
    params: {artist: albumArtist, tracks},
  },
}: any) {
  const [layout, setLayout] = useState('grid');
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios(`${API_URL}artist/${albumArtist}`)
      .then(({data}) => setArtist(data))
      .catch(err => console.log(err.message));
  }, []);

  return (
    <>
      <ImageBackground
        source={{
          uri: `${state.NGINX_SERVER}${
            artist && artist.singles[0].coverArtURL
          }`,
        }}
        resizeMode="cover"
        blurRadius={20}>
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
            padding: 20,
            zIndex: 2,
          }}>
          {/* <Image
            source={{
              uri: `${state.NGINX_SERVER}dir${
                artist && artist.artistDirectory
              }/artist.jpg`,
            }}
            defaultSource={require('../../assets/images/musician.png')}
            style={{
              width: 100,
              height: 100,
              borderRadius: 10,
              marginRight: 15,
            }}
            resizeMode="cover"
          /> */}
          <View
            style={{
              width: '60%',
              justifyContent: 'space-around',
            }}>
            <Text numberOfLines={1} style={{fontSize: 24, fontWeight: '700'}}>
              {albumArtist}
            </Text>
            <Text numberOfLines={1} style={{fontSize: 18}}>
              {tracks} tracks
            </Text>
          </View>
        </View>
      </ImageBackground>

      <Tab.Navigator>
        <Tab.Screen
          name="Discography"
          children={(props: any) => (
            <Discography artist={artist && artist} {...props} />
          )}
        />
        <Tab.Screen name="Favourites" component={Favourites} />
        <Tab.Screen name="Related" component={Related} />
      </Tab.Navigator>
    </>
  );
}
