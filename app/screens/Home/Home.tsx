import React, {useState, useEffect, useLayoutEffect, useContext} from 'react';
import {
  Alert,
  Button,
  FlatList,
  View,
  Pressable,
  ScrollView,
  Dimensions,
  Image,
  ImageBackground,
  RefreshControl,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SvgAnimatedLinearGradient from 'react-native-svg-animated-linear-gradient';
import Svg, {Circle, Rect} from 'react-native-svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import _ from 'lodash';
import {GradientText} from '../../components/TextX';
//import {Context} from '../../contexts';
import Footer from '../../components/Footer';
import {API_URL, ARTWORK_URL, SERVER_URL, usePlayerStore} from '../../store';
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import {TrackProps} from '../../types';

const wait = (timeout: number) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

const Home = ({navigation}: any) => {
  // ? StoreStates
  const {position, buffered, duration} = usePlayerStore(
    state => state.progress,
  );
  const {state} = usePlayerStore(state => state.playbackState);
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const queue = usePlayerStore(state => state.queue);
  const trackRating = usePlayerStore(state => state.trackRating);
  const trackPlayCount = usePlayerStore(state => state.trackPlayCount);
  const lyricsVisible = usePlayerStore(state => state.lyricsVisible);
  const lyrics = usePlayerStore(state => state.lyrics);
  const palette = usePlayerStore(state => state.palette);

  // ? StoreActions
  const play = usePlayerStore(state => state.play);
  const playPause = usePlayerStore(state => state.playPause);
  const setTrackRating = usePlayerStore(state => state.setTrackRating);
  const setLyricsVisible = usePlayerStore(state => state.setLyricsVisible);
  const setCarouselQueue = usePlayerStore(state => state.setCarouselQueue);
  const setPalette = usePlayerStore(state => state.setPalette);

  const [gradient, setGradient] = useState(['#000', '#00ffaa']);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  //const {state, dispatch, playerState} = useContext(Context);
  const [stats, setStats] = useState(null);
  const [sections, setSections] = useState([
    {
      title: 'Libraries',
      data: [1],
      dataset: [
        {
          name: 'Playlists',
          icon: require(`../../assets/images/Playlists.png`),
        },
        {
          name: 'Folders',
          icon: require(`../../assets/images/Folders.png`),
        },
        {
          name: 'Artists',
          icon: require(`../../assets/images/Artists.png`),
        },
        {
          name: 'Albums',
          icon: require(`../../assets/images/Albums.png`),
        },
      ],
    },
    {
      title: 'Favorite Artists',
      horizontal: true,
      data: [1],
    },
    {
      title: 'Most Played',
      horizontal: true,
      data: [1],
    },
    {
      title: 'Recently Added',
      horizontal: true,
      data: [1],
    },
    {
      title: 'Recently Played',
      horizontal: true,
      data: [1],
    },
  ]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = () => {
    let updated: any = [];

    const setter = (title: string, data: any) => {
      const sectionIndex = sections.findIndex(
        section => section.title === title,
      );

      sections.forEach(
        (section, i) =>
          i === sectionIndex && updated.push({...section, dataset: data}),
      );

      return updated;
    };

    fetch(`${API_URL}dashboard`).then(res =>
      res.json().then(data => {
        Object.keys(data).forEach(key => setter(_.startCase(key), data[key]));
        updated.unshift(sections[0]);
        setSections(updated);
        setStats(data.stats);
        setLoading(false);
      }),
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() => console.log('You are now casting')}
          title="CAST"
        />
      ),
    });
  }, [navigation]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    //fetchDashboard();
    wait(2000).then(() => setRefreshing(false));
  }, []);

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

  return (
    <>
      <StatusBar
        animated
        backgroundColor={palette[1]}
        barStyle="light-content"
        translucent
      />

      <LinearGradient
        colors={[palette[1] ?? '#000', palette[0] ?? '#fff']}
        useAngle={true}
        angle={200}
        style={{
          position: 'absolute',
          opacity: 1,
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      />

      <SectionList
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        sections={sections}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderSectionHeader={({section}) => (
          <>
            {section.title === 'Libraries' && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingLeft: 12,
                  paddingRight: 20,
                  paddingTop: 20,
                }}>
                <GradientText
                  bold
                  font="Laila-Bold"
                  gradient={['#fff59d', '#fff']}
                  mt={-10}
                  numberOfLines={1}
                  scale={6}>
                  Welcome back,
                </GradientText>
                <View style={{flex: 1}} />
                <Pressable>
                  <MaterialIcons style={{marginTop: 3}} name="cast" size={24} />
                </Pressable>
              </View>
            )}

            <Text
              style={{
                fontWeight: '800',
                fontSize: 18,
                color: '#fff',
                marginTop: 20,
                marginBottom: 5,
                marginLeft: 10,
              }}>
              {section.title}
            </Text>
          </>
        )}
        renderItem={({section}) => (
          <>
            {section.horizontal ? (
              <>
                {(section.title === 'Recently Added' ||
                  section.title === 'Recently Played') && (
                  <FlatList
                    horizontal
                    data={section.dataset}
                    renderItem={({
                      item,
                      index,
                    }: {
                      item: TrackProps;
                      index: number;
                    }) => (
                      <Pressable
                        onPress={() => play('data', item)}
                        style={{
                          margin: 10,
                          width: 100,
                        }}>
                        <Image
                          source={{uri: `${ARTWORK_URL}${item.artwork}`}}
                          style={{width: 100, height: 100, borderRadius: 10}}
                          resizeMode="cover"
                        />
                        <StarRatingDisplay
                          rating={item.rating}
                          starSize={16}
                          starStyle={{marginHorizontal: 0}}
                        />
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 16,
                            color: 'white',
                            marginTop: 5,
                            marginBottom: 1,
                          }}>
                          {item.title || item.name}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 14,
                            opacity: 0.7,
                          }}>
                          {item.artists || 'No artist info'}
                        </Text>
                      </Pressable>
                    )}
                    showsHorizontalScrollIndicator={false}
                  />
                )}

                {section.title === 'Most Played' && (
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
                          <Rect
                            x="0"
                            y="5"
                            rx="4"
                            ry="4"
                            width="200"
                            height="15"
                          />
                        </SvgAnimatedLinearGradient>
                        <ItemPlaceholder />
                      </View>
                    ) : (
                      <FlatList
                        horizontal
                        data={section.dataset}
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
                              data={section.dataset}
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
                                        maxWidth:
                                          Dimensions.get('window').width - 175,
                                      }}>
                                      <Text
                                        numberOfLines={1}
                                        style={styles.title}>
                                        {item.title || item.name}
                                      </Text>
                                      <Text
                                        numberOfLines={1}
                                        style={styles.artists}>
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
                )}

                {section.title === 'Favorite Artists' && (
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
                            <Rect
                              x="0"
                              y="120"
                              rx="4"
                              ry="4"
                              width="100"
                              height="10"
                            />
                            <Rect
                              x="10"
                              y="140"
                              rx="4"
                              ry="4"
                              width="80"
                              height="8"
                            />
                          </SvgAnimatedLinearGradient>
                        ))}
                      </View>
                    ) : (
                      <FlatList
                        horizontal
                        data={section.dataset}
                        renderItem={({item}: {item: TrackProps}) => {
                          return (
                            <View
                              style={{
                                margin: 10,
                                alignItems: 'center',
                                width: 100,
                              }}>
                              <Image
                                //source={{uri: `${SERVER_URL}${item?.path.split('/').slice(-1)}/artist.jpg`,}}
                                source={require('../../assets/images/musician.png')}
                                defaultSource={require('../../assets/images/musician.png')}
                                style={{
                                  width: 100,
                                  height: 100,
                                  borderRadius: 100,
                                }}
                                resizeMode="cover"
                              />
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
                              <Text
                                style={{
                                  fontSize: 14,
                                  opacity: 0.5,
                                }}>
                                {item.cumulativeRating} rating
                              </Text>
                            </View>
                          );
                        }}
                        showsHorizontalScrollIndicator={false}
                      />
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {section.title === 'Libraries' && (
                  <>
                    <Text
                      style={{fontSize: 15, marginLeft: 10, marginBottom: 10}}>
                      Consists of{' '}
                      <Text style={{fontWeight: '900'}}>
                        {(stats &&
                          stats.tracks
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')) ||
                          0}
                      </Text>{' '}
                      tracks
                    </Text>
                  </>
                )}
              </>
            )}
          </>
        )}
        style={{marginTop: 40}}
      />

      {/* <Footer /> */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  item: {
    margin: 10,
  },
});

export default Home;
