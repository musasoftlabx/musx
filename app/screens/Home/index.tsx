// * React
import React, {useState, useEffect, useRef} from 'react';

// * React Native
import {
  View,
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  SectionListData,
  Image,
} from 'react-native';

// * Libraries
import _ from 'lodash';
import BottomSheet from '@gorhom/bottom-sheet';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// * Components
import FavouriteArtists from './components/FavouriteArtists';
import LinearGradientX from '../../components/LinearGradientX';
import MostPlayed from './components/MostPlayed';
import RecentlyAddedAndPlayed from './components/RecentlyAddedAndPlayed';
import StatusBarX from '../../components/StatusBarX';
import TrackDetails from '../../components/TrackDetails';

// * Store
import {API_URL, WIDTH} from '../../store';

// * Types
import {TrackProps} from '../../types';

export type SectionProps = {
  data?: [number];
  dataset?: (TrackProps | {name?: string; icon?: string})[];
  title: string;
  horizontal?: boolean;
};

const wait = (timeout: number) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

export default function Home({navigation}: any) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // ? StoreStates
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>();
  const [track, setTrack] = useState<TrackProps>();
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

  useEffect(() => fetchDashboard(), []);

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
      <StatusBarX />

      <LinearGradientX />

      <SectionList
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        sections={sections}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderSectionHeader={({section}) => (
          <>
            {section.title !== 'Libraries' && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 20,
                  marginBottom: 5,
                  marginHorizontal: 10,
                }}>
                <Text style={{fontSize: 18, fontWeight: '800', color: '#fff'}}>
                  {section.title}
                </Text>

                <FontAwesome
                  name="chevron-right"
                  size={12}
                  style={{marginTop: 7}}
                />
              </View>
            )}
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
                  <RecentlyAddedAndPlayed
                    section={section}
                    bottomSheetRef={bottomSheetRef}
                    setTrack={setTrack}
                    setBottomSheetVisible={setBottomSheetVisible}
                  />
                )}

                {section.title === 'Most Played' && (
                  <MostPlayed
                    loading={loading}
                    dataset={section.dataset}
                    setTrack={setTrack}
                    bottomSheetRef={bottomSheetRef}
                    setBottomSheetVisible={setBottomSheetVisible}
                  />
                )}
              </>
            ) : (
              <>
                {section.title === 'Libraries' && (
                  <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                    {section.dataset?.map((item, i) => (
                      <Pressable
                        key={i}
                        onPress={() => navigation.navigate(item.name)}
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
                            style={{height: 45, marginRight: 5, width: 45}}
                          />
                          <View>
                            <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                              {item.name}
                            </Text>

                            <Text style={{fontSize: 16}}>
                              {stats
                                ? Object.keys(stats).map(stat => {
                                    if (stat === item.name?.toLowerCase())
                                      return stats[stat].toLocaleString();
                                  })
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
                )}
              </>
            )}
          </>
        )}
        style={{marginTop: 100}}
      />

      {track && (
        <TrackDetails
          track={track}
          navigation={navigation}
          bottomSheetRef={bottomSheetRef}
          queriesToRefetch={['']}
        />
      )}
    </>
  );
}
