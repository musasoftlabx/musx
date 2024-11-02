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
import LinearGradient from 'react-native-linear-gradient';
import SvgAnimatedLinearGradient from 'react-native-svg-animated-linear-gradient';
import Svg, {Circle, Rect} from 'react-native-svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import _ from 'lodash';
import {GradientText} from '../../components/TextX';
//import {Context} from '../../contexts';
import Footer from '../../components/Footer';
import {usePlayerStore} from '../../store';
import {StarRatingDisplay} from 'react-native-star-rating-widget';

const NODE_SERVER = 'http://musasoft.ddns.net:3000/';
const NGINX_SERVER = 'http://musasoft.ddns.net:8080/';

const wait = timeout => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

const Home = ({navigation}) => {
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
    //fetchDashboard();
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
      <LinearGradient
        colors={['#2e7d32', '#000']}
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
                <GradientText
                  bold
                  font="Laila-Bold"
                  gradient={['#fff59d', '#fff']}
                  mt={-10}
                  numberOfLines={1}
                  scale={6}>
                  40.39%
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
                          {(item.artists && item.artists.join(' / ')) ||
                            'No artist info'}
                        </Text>
                      </Pressable>
                    )}
                    showsHorizontalScrollIndicator={false}
                  />
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
