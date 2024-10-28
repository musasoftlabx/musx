import React, {useState, useEffect} from 'react';
import {
  Animated,
  Easing,
  Alert,
  Button,
  View,
  Pressable,
  Image,
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import SwipeableRating from 'react-native-swipeable-rating';

const NODE_SERVER = 'http://musasoft.ddns.net:3000/';

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

const Popular = ({navigation}) => {
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [mostPlayed, setMostPlayed] = useState([]);
  const [cp, setCp] = useState(null);

  useEffect(() => {
    fetch(`${NODE_SERVER}GetRecentlyAdded`).then(res =>
      res.json().then(data => setRecentlyAdded(data)),
    );

    fetch(`${NODE_SERVER}GetMostPlayed`).then(res =>
      res.json().then(data => setMostPlayed(data)),
    );
  }, []);

  const handlePlay = i => {
    setCp(i);
  };

  const DATA = [
    {
      id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
      title: 'First Item',
    },
    {
      id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
      title: 'Second Item',
    },
    {
      id: '58694a0f-3da1-471f-bd96-145571e29d72',
      title: 'Third Item',
    },
  ];

  const Item = ({id, title}) => (
    <Pressable onPress={() => handlePlay(id)}>
      <View style={styles.item}>
        <Animated.Image
          source={{
            uri: 'http://musasoft.ddns.net:8080/images/covers/01___Ski_Mask_The_Slump_God_ft_Offset___HipHopTXLcom__i0LNO.jpg',
          }}
          style={cp && cp === id ? styles.isPlaying : styles.image}
        />
        <View style={{justifyContent: 'center', marginTop: -2}}>
          <Text numberOfLines={1} style={styles.title}>
            Song title
          </Text>
          <Text numberOfLines={1} style={styles.artists}>
            Song artists
          </Text>
          <Text numberOfLines={1} style={styles.album}>
            Song album
          </Text>
        </View>
        <View style={{flex: 1}} />
        <View style={{justifyContent: 'center', alignItems: 'flex-end'}}>
          <SwipeableRating
            rating={3}
            size={15}
            allowHalves={true}
            color={'#FFD700'}
            emptyColor={'#FFD700'}
          />
          <Text style={{fontWeight: 'bold', marginRight: 5}}>5 plays</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <FlatList
      data={DATA}
      renderItem={({item}) => {
        return <Item id={item.id} title={item.title} />;
      }}
      keyExtractor={item => item.id}
      scrollEnabled={false}
    />
  );
  {
    /* <SortableList
        style={{flex: 1}}
        contentContainerStyle={{width: Dimensions.get('window').width}}
        data={DATA}
        renderRow={({item}) => {
          return <Item id={item.id} title={item.title} />;
        }}
      /> */
  }
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

export default Popular;
