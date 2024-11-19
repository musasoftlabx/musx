import React, {useState, useEffect, useLayoutEffect} from 'react';

import {
  Button,
  View,
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  StatusBar,
  SectionListData,
  Image,
} from 'react-native';

import _ from 'lodash';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {GradientText} from '../../components/TextX';
import RecentlyAddedAndPlayed from './components/RecentlyAddedAndPlayed';
import FavouriteArtists from './components/FavouriteArtists';
import MostPlayed from './components/MostPlayed';

import {API_URL, usePlayerStore, WIDTH} from '../../store';

import {TrackProps} from '../../types';
import {CastButton} from 'react-native-google-cast';

export type SectionProps = {
  data?: [number];
  dataset?: (TrackProps | {name?: string; icon?: string})[];
  title: string;
  horizontal?: boolean;
};

const wait = (timeout: number) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

const Home = ({navigation}: any) => {
  // ? StoreStates
  const {state} = usePlayerStore(state => state.playbackState);
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const palette = usePlayerStore(state => state.palette);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{tracks: number}>();
  const [sections, setSections] = useState<
    SectionListData<number, SectionProps>[]
  >([
    {
      title: 'Libraries',
      data: [1],
      dataset: [
        {
          name: 'Playlists',
          icon: require(`../../assets/images/Playlists.png`),
        },
        {
          name: 'Tracks',
          icon: require(`../../assets/images/Folders.png`),
        },
        {
          name: 'Artists',
          icon: require(`../../assets/images/Artists.png`),
        },
        {
          name: 'Plays',
          icon: require(`../../assets/images/Albums.png`),
        },
      ],
    },
    {
      title: 'Favourite Artists',
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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
    wait(2000).then(() => setRefreshing(false));
  }, []);

  return (
    <>
      <StatusBar
        animated
        backgroundColor={palette[1]}
        barStyle="light-content"
        translucent
      />

      <LinearGradient
        colors={[palette[1] ?? '#000', palette[0] ?? '#000']}
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
                }}>
                <GradientText
                  bold
                  font="Laila-Bold"
                  gradient={['#fff59d', '#fff']}
                  numberOfLines={1}
                  scale={5}>
                  MusX Player
                </GradientText>
                <View style={{flex: 1}} />
                <CastButton
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: 'rgba(255, 255, 255, .7)',
                  }}
                />
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
                {section.title === 'Favourite Artists' && (
                  <FavouriteArtists
                    loading={loading}
                    dataset={section.dataset}
                  />
                )}

                {(section.title === 'Recently Added' ||
                  section.title === 'Recently Played') && (
                  <RecentlyAddedAndPlayed section={section} />
                )}

                {/* {section.title === 'Most Played' && (
                  <MostPlayed loading={loading} dataset={section.dataset} />
                )} */}
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

                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                      {section.dataset?.map((item, i) => (
                        <Pressable
                          key={i}
                          //onPress={() => navigation.navigate(item.name)}
                          style={{
                            flexGrow: 1,
                            borderRadius: 10,
                            backgroundColor: 'rgba(10, 10, 20, 0.5)',
                            width: WIDTH / 2.5,
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
                                        k === item.name?.toLowerCase() &&
                                        stats[k].toLocaleString(),
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
        style={{marginTop: 40}}
      />

      {/* <Footer /> */}
    </>
  );
};

export default Home;
