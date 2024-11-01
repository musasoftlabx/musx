import React, {useContext, useState, useEffect, useRef, useMemo} from 'react';
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
import TrackPlayer, {
  RepeatMode,
  useActiveTrack,
  usePlaybackState,
  usePlayWhenReady,
  useProgress,
} from 'react-native-track-player';
import {usePlayerStore} from '../../store';
import {Track} from '../../types';
import BigList from 'react-native-big-list';
import {StarRatingDisplay} from 'react-native-star-rating-widget';

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

const Queue = () => {
  const {state} = usePlaybackState();
  const _activeTrack = useActiveTrack();
  const playwhenready = usePlayWhenReady();

  const currentTrack = usePlayerStore(state => state.currentTrack);
  const nextTracks = usePlayerStore(state => state.nextTracks);
  const pauseplay = usePlayerStore(state => state.pauseplay);
  const next = usePlayerStore(state => state.next);
  const previous = usePlayerStore(state => state.previous);
  const seekTo = usePlayerStore(state => state.seekTo);
  const skipTo = usePlayerStore(state => state.skipTo);
  const rate = usePlayerStore(state => state.rate);

  const playerState = usePlaybackState();
  //const isPlaying = playerState === State.Playing;

  const {position, buffered, duration} = useProgress();
  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);

  const carousel = useRef(null);

  const [selectedTab, setSelectedTab] = useState(1);
  const [queue, setQueue] = useState<any>([]);
  const [activeArtwork, setActiveArtwork] = useState(0);
  const [activeTrack, setActiveTrack] = useState<Track>();
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>();
  const [trackRating, setTrackRating] = useState<number>(0);
  const [trackPlayCount, setTrackPlayCount] = useState<number>(0);
  const [playRegistered, setPlayRegistered] = useState<boolean>(false);
  const [trackMetadata, setTrackMetadata] = useState({});

  useMemo(() => {
    //if (playwhenready) console.log('ok', playwhenready);
    //else console.log('no', playwhenready);
    //TrackPlayer.getQueue().then(tracks => setNextTracks(tracks));
    //getRepeatMode();
    //populate();
    //const a = async () => {
    // const url = `http://75.119.137.255/Artwork/Botswana_Vee_Mampeezy_U_Kondelela.jpg`;
    // getColors(url, {fallback: '#228B22', cache: true, key: url}).then(
    //   (colors: any) => setColors(colors),
    // );
    //setState((prev) =>{...prev, gradient})
    //};
    setPlayRegistered(false);

    TrackPlayer.getQueue().then((queue: any) => setQueue(queue));

    TrackPlayer.getActiveTrackIndex().then((index: any) => {
      setActiveArtwork(index);
      setActiveTrackIndex(index);
    });

    TrackPlayer.getActiveTrack().then((metadata: any) => {
      setActiveTrack(metadata);
      setTrackRating(metadata.rating);
    });
  }, [_activeTrack]);

  // return (
  //   <FlatList
  //     data={queue}
  //     renderItem={({item, index}) => (
  //       <Pressable onPress={() => skipTo(index)}>
  //         <View style={styles.item}>
  //           <Animated.Image
  //             source={{uri: item.artwork}}
  //             style={
  //               activeTrack?.id === item.id ? styles.isPlaying : styles.image
  //             }
  //           />
  //           <View
  //             style={{
  //               justifyContent: 'center',
  //               marginTop: -2,
  //               maxWidth: Dimensions.get('window').width - 175,
  //             }}>
  //             <Text numberOfLines={1} style={styles.title}>
  //               {item.title || item.name}
  //             </Text>
  //             <Text numberOfLines={1} style={styles.artists}>
  //               {item.artists || 'Unknown Artist'}
  //             </Text>
  //             <Text numberOfLines={1} style={styles.album}>
  //               {item.album || 'Unknown Album'}
  //             </Text>
  //           </View>
  //           <View style={{flex: 1}} />
  //           <View style={{justifyContent: 'center', alignItems: 'flex-end'}}>
  //             <SwipeableRating
  //               rating={item.rating || 0}
  //               size={15}
  //               allowHalves={true}
  //               color={'#FFD700'}
  //               emptyColor={'#FFD700'}
  //             />
  //             <Text style={{fontWeight: 'bold', marginRight: 5}}>
  //               {item.plays || 0} play{item.plays === 1 ? '' : 's'}
  //             </Text>
  //           </View>
  //         </View>
  //       </Pressable>
  //     )}
  //     keyExtractor={(item, index) => index.toString()}
  //     scrollEnabled={false}
  //   />
  // );

  return (
    <BigList
      data={queue.slice(0, activeTrackIndex).reverse()}
      numColumns={1}
      keyExtractor={(item, index) => index.toString()}
      //sections={[data]}
      renderItem={({item, index}) => (
        <Pressable onPress={() => TrackPlayer.skip(index)}>
          <View style={styles.item}>
            <Animated.Image
              source={{uri: item.artwork}}
              style={
                activeTrack?.id === item.id ? styles.isPlaying : styles.image
              }
            />
            <View
              style={{
                justifyContent: 'center',
                marginTop: -2,
                maxWidth: Dimensions.get('window').width - 175,
              }}>
              <Text numberOfLines={1} style={styles.title}>
                {item.title || item.name}
              </Text>
              <Text numberOfLines={1} style={styles.artists}>
                {item.artists || 'Unknown Artist'}
              </Text>
              <Text numberOfLines={1} style={styles.album}>
                {item.album || 'Unknown Album'}
              </Text>
            </View>
            <View style={{flex: 1}} />
            <View style={{justifyContent: 'center', alignItems: 'flex-end'}}>
              <StarRatingDisplay
                rating={item.rating}
                starSize={16}
                starStyle={{marginHorizontal: 0}}
              />

              <Text style={{fontWeight: 'bold', marginRight: 5}}>
                {item.plays || 0} play{item.plays === 1 ? '' : 's'}
              </Text>
            </View>
          </View>
        </Pressable>
      )}
      renderEmpty={() => (
        <View>
          <Text style={{fontFamily: 'Abel'}}>Empty</Text>
        </View>
      )}
      renderHeader={() => <View />}
      renderFooter={() => <View />}
      itemHeight={60}
      headerHeight={0}
      footerHeight={0}
    />
  );
};

/* <SortableList
        style={{flex: 1}}
        contentContainerStyle={{width: Dimensions.get('window').width}}
        data={DATA}
        renderRow={({item}) => {
          return <Item id={item.id} title={item.title} />;
        }}
      /> */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
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
  },
});

export default Queue;
