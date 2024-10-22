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
} from 'react-native';
import SwipeableRating from 'react-native-swipeable-rating';
import LinearGradient from 'react-native-linear-gradient';
import {LinearTextGradient} from 'react-native-text-gradient';
import SvgAnimatedLinearGradient from 'react-native-svg-animated-linear-gradient';
import Svg, {Circle, Rect} from 'react-native-svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import _ from 'lodash';
import {Context} from '../../contexts';
import Footer from '../../components/Footer';

const NODE_SERVER = 'http://musasoft.ddns.net:3000/';
const NGINX_SERVER = 'http://musasoft.ddns.net:8080/';

const wait = timeout => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

const Home = ({navigation}) => {
  const [gradient, setGradient] = useState(['#000', '#00ffaa']);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const {state, dispatch, playerState} = useContext(Context);
  const [stats, setStats] = useState(null);
  const [sections, setSections] = useState([
    {
      title: 'Libraries',
      data: [1],
      dataset: [
        {
          name: 'Playlists',
          icon: require(`../../assets/icons/Playlists.png`),
        },
        {
          name: 'Folders',
          icon: require(`../../assets/icons/Folders.png`),
        },
        {
          name: 'Artists',
          icon: require(`../../assets/icons/Artists.png`),
        },
        {
          name: 'Albums',
          icon: require(`../../assets/icons/Albums.png`),
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
    let updated = [];

    const setter = (title, data) => {
      const sectionIndex = sections.findIndex(
        section => section.title === title,
      );

      sections.forEach(
        (section, i) =>
          i === sectionIndex && updated.push({...section, dataset: data}),
      );

      return updated;
    };

    fetch(`${NODE_SERVER}dashboard`).then(res =>
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
    fetchDashboard();
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
      <LinearGradient
        colors={state.gradient}
        useAngle={true}
        angle={145}
        style={{
          opacity: 0.4,
          position: 'absolute',
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
                <LinearTextGradient
                  style={{fontWeight: 'bold', fontSize: 30}}
                  locations={[0, 1]}
                  colors={['#4287f5', 'white']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}>
                  <Text>Welcome back,</Text>
                </LinearTextGradient>
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
                    renderItem={({item, index}) => (
                      <Pressable
                        onPress={() =>
                          dispatch({
                            type: 'PLAY',
                            payload: {
                              currentTrack: item,
                              nextTracks: section.dataset.slice(
                                index + 1,
                                section.dataset.length,
                              ),
                            },
                          })
                        }
                        style={{
                          margin: 10,
                          width: 100,
                        }}>
                        <Image
                          source={{
                            uri: `${NGINX_SERVER}${item.coverArtURL}`,
                          }}
                          style={{
                            width: 100,
                            height: 100,
                            borderRadius: 10,
                          }}
                          resizeMode="cover"
                        />
                        <SwipeableRating
                          rating={item.rating || 0}
                          size={15}
                          allowHalves={true}
                          color={'#FFD700'}
                          emptyColor={'#FFD700'}
                          style={{marginLeft: -30, marginTop: 10}}
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
                          {(item.artists && item.artists.join(' / ')) ||
                            'No artist info'}
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
                        renderItem={({item}) => (
                          <ImageBackground
                            source={{
                              uri: `${NGINX_SERVER}${item.coverArtURL}`,
                            }}
                            resizeMode="cover"
                            borderRadius={20}
                            width={10}
                            blurRadius={20}
                            style={{
                              margin: 10,
                              width: 320,
                              tintColor: '#000',
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
                              renderItem={({index, item}) => (
                                <Pressable onPress={() => handlePlay(item)}>
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
                                        uri: `${state.NGINX_SERVER}${item.coverArtURL}`,
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
                                        {(item.artists &&
                                          item.artists.join(' / ')) ||
                                          'Unknown Artist'}
                                      </Text>
                                      <Text
                                        numberOfLines={1}
                                        style={styles.album}>
                                        {item.album || 'Unknown Album'}
                                      </Text>
                                    </View>
                                    <View style={{flex: 1}} />
                                    <View
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'flex-end',
                                      }}>
                                      <SwipeableRating
                                        rating={item.rating || 0}
                                        size={15}
                                        allowHalves={true}
                                        color={'#FFD700'}
                                        emptyColor={'#FFD700'}
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

                {section.title === 'Most Played_' && (
                  <FlatList
                    horizontal
                    data={section.dataset}
                    renderItem={({item}) => (
                      <ImageBackground
                        source={{
                          uri: `${NGINX_SERVER}${item.coverArtURL}`,
                        }}
                        resizeMode="cover"
                        borderRadius={20}
                        width={10}
                        blurRadius={20}
                        style={{
                          margin: 10,
                          width: 300,
                          tintColor: '#000',
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
                            padding: 20,
                            zIndex: 2,
                          }}>
                          <Image
                            source={{
                              uri: `${NGINX_SERVER}${item.coverArtURL}`,
                            }}
                            style={{
                              width: 100,
                              height: 100,
                              borderRadius: 10,
                              marginRight: 15,
                            }}
                            resizeMode="cover"
                          />
                          <View
                            style={{
                              width: '60%',
                              justifyContent: 'space-around',
                            }}>
                            <Text numberOfLines={1} style={{fontSize: 20}}>
                              {item.title}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 18}}>
                              {item.artists && item.artists.join(' / ')}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize: 20}}>
                              {item.plays} plays
                            </Text>
                          </View>
                        </View>
                      </ImageBackground>
                    )}
                    showsHorizontalScrollIndicator={false}
                  />
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
                        renderItem={({item}) => {
                          return (
                            <View
                              style={{
                                margin: 10,
                                alignItems: 'center',
                                width: 100,
                              }}>
                              <Image
                                source={{
                                  uri: `${state.NGINX_SERVER}dir${item.photo}`,
                                }}
                                defaultSource={require('../../assets/icons/musician.png')}
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
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                      }}>
                      {section.dataset.map((item, i) => (
                        <Pressable
                          key={i}
                          onPress={() => navigation.navigate(item.name)}
                          style={{
                            flexGrow: 1,
                            borderRadius: 10,
                            backgroundColor: 'rgba(10, 10, 20, 0.5)',
                            width: Dimensions.get('window').width / 2.5,
                            margin: 5,
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              paddingHorizontal: 6,
                              paddingVertical: 12,
                              overflow: 'hidden',
                            }}>
                            <Image
                              source={item.icon}
                              style={{
                                width: 45,
                                height: 45,
                                marginRight: 5,
                              }}
                            />
                            <View>
                              <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                                {item.name}
                              </Text>
                              <Text style={{fontSize: 16}}>
                                {stats
                                  ? Object.keys(stats).map(
                                      k =>
                                        k === item.name.toLowerCase() &&
                                        stats[k],
                                    )
                                  : 0}
                              </Text>
                            </View>
                            <View style={{flex: 1}} />
                            <Image
                              source={item.icon}
                              style={{
                                width: 75,
                                height: 75,
                                position: 'absolute',
                                right: -20,
                                top: 20,
                                tintColor: 'gray',
                                opacity: 0.5,
                              }}
                            />
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}
              </>
            )}
          </>
        )}
      />
      <Footer />
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
