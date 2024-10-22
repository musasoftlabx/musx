import React, {useContext, useState, useEffect, useFocusEffect} from 'react';
import {
  Animated,
  Easing,
  BackHandler,
  Button,
  Image,
  Dimensions,
  View,
  Pressable,
  Text,
  ScrollView,
  FlatList,
  SectionList,
  StyleSheet,
} from 'react-native';
import SwipeableRating from 'react-native-swipeable-rating';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';

import {Context} from '../../contexts';

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

const lyt = AsyncStorage.getItem('artistsScreenLayout');

const Artists = ({navigation}) => {
  const [layout, setLayout] = useState('grid');
  const [artists, setArtists] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cp, setCp] = useState(null);
  const {state, dispatch} = useContext(Context);

  useEffect(() => {
    fetch(`${state.NODE_SERVER}artists`).then(res =>
      res.json().then(data => {
        setArtists(data);
        setLoading(false);
      }),
    );
  }, []);

  const handleBackAction = async () => {
    const currentPath = await AsyncStorage.getItem('currentPath');
    const lastDir = currentPath.split('/').pop();
    const newPath = currentPath.replace(`/${lastDir}`, '');
    console.log('newPath:', newPath);
    await AsyncStorage.setItem('currentPath', newPath);
    getFolders(newPath);
    /* setTimeout(() => {
      navigation.pop();
    }, 5000); */
  };

  return (
    <FlatList
      data={artists}
      keyExtractor={(item, index) => index.toString()}
      numColumns={3}
      contentContainerStyle={{minHeight: '100%'}}
      renderItem={({item, index}) => {
        const path = item.path.split('/');
        const photo = `${_.initial(path).join('/')}/artist.jpg`;

        return (
          <>
            {layout === 'grid' ? (
              <Pressable
                onPress={() =>
                  navigation.navigate('Artist', {
                    artist: item.artist,
                    plays: item.plays,
                  })
                }
                style={{flexBasis: '33%'}}>
                <View style={{paddingVertical: 12, alignItems: 'center'}}>
                  <Image
                    source={{
                      uri: `${state.NGINX_SERVER}dir${photo}`,
                    }}
                    defaultSource={require('../../assets/icons/musician.png')}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 100,
                    }}
                    resizeMode="cover"
                    onError={e => {
                      /* console.log(e.target.onerror);
                      e.target.onerror = null; */
                      e.target.src =
                        'http://192.168.100.2:8080/images/covers/01___2_Chainz_ft_Lil_Wayne___Twerk_Season__DatPiff_Exclusive__df890946f56dcd8bedb58bf7df139f0a.jpg';
                    }}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 16,
                      color: 'white',
                      marginTop: 5,
                      marginBottom: 1,
                    }}>
                    {item.artist}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      opacity: 0.5,
                    }}>
                    {item.plays} plays
                  </Text>
                </View>
              </Pressable>
            ) : (
              <Pressable onPress={() => navigation.navigate('NowPlaying')}>
                <View style={styles.item}>
                  <Image
                    source={{
                      uri: `${state.NGINX_SERVER}${item.coverArtURL}`,
                    }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 100,
                    }}
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = require('../../assets/icons/musician.png');
                    }}
                  />
                  <View
                    style={{
                      justifyContent: 'center',
                      marginTop: -2,
                      maxWidth: Dimensions.get('window').width - 180,
                    }}>
                    <Text numberOfLines={1} style={styles.title}>
                      {item.artist}
                    </Text>
                    <Text numberOfLines={1} style={styles.album}>
                      {item.plays}
                    </Text>
                  </View>
                  <View style={{flex: 1}} />
                  <View
                    style={{justifyContent: 'center', alignItems: 'flex-end'}}>
                    <Text style={{fontWeight: 'bold', marginRight: 5}}>
                      {item.tracks}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          </>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  imageShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 12,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
    justifyContent: 'center',
  },
  isPlaying: {
    height: 45,
    width: 45,
    marginRight: 8,
    borderRadius: 100,
    transform: [{rotate: spin}],
  },
  image: {
    height: 45,
    width: 45,
    marginRight: 8,
    borderRadius: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  artists: {
    fontSize: 14,
    fontWeight: '300',
    fontStyle: 'italic',
  },
  album: {
    fontSize: 12,
    fontWeight: '300',
  },
  plays: {
    backgroundColor: 'grey',
    borderRadius: 10,
    height: 35,
    margin: 10,
    opacity: 0.6,
    padding: 5,
    paddingHorizontal: 15,
    backgroundColor: '#000',
  },
});

export default Artists;
