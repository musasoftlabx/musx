// * React
import React, { useState } from 'react';

// * React Native
import {
  Image,
  Pressable,
  RefreshControl,
  SectionList,
  SectionListData,
  View,
} from 'react-native';

// * Libraries
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDeviceOrientation } from '@react-native-community/hooks';
import { useQuery } from '@tanstack/react-query';
import { Divider, Text } from 'react-native-paper';
import _ from 'lodash';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

// * Components
import FavouriteArtists from './components/FavouriteArtists';
import LinearGradientX from '../../components/LinearGradientX';
import MostPlayed from './components/MostPlayed';
import Playlists from './components/Playlists';
import RecentlyAddedAndPlayed from './components/RecentlyAddedAndPlayed';
import StatusBarX from '../../components/StatusBarX';

// * Store
import { API_URL, WIDTH } from '../../store';

// * Types
import { RootStackParamList, TrackProps } from '../../types';

import { queryClient } from '../../../App';
import { fontFamilyBold } from '../../utils';

export type SectionProps = {
  data?: [number];
  dataset?: (TrackProps | { name?: string; icon?: string })[];
  title: string;
  horizontal?: boolean;
};

export default function Home({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Home', ''>) {
  // ? Hooks
  const orientation = useDeviceOrientation();

  // ? States
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>();
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
    {
      title: 'Playlists',
      horizontal: true,
      data: [1],
    },
  ]);

  useQuery({
    queryKey: ['dashboard'],
    queryFn: ({ queryKey }) => {
      let updated: any = [];

      const setter = (title: string, data: any) => {
        const sectionIndex = sections.findIndex(
          section => section.title === title,
        );

        sections.forEach(
          (section, i) =>
            i === sectionIndex && updated.push({ ...section, dataset: data }),
        );

        return updated;
      };

      fetch(`${API_URL}${queryKey[0]}`).then(res =>
        res.json().then(data => {
          Object.keys(data).forEach(key => setter(_.startCase(key), data[key]));
          updated.unshift(sections[0]);
          setSections(updated);
          setStats(data.stats);
          setLoading(false);
          setRefreshing(false);
        }),
      );

      return null;
    },
  });

  const SectionHeader = ({
    section,
    routeTo,
  }: {
    section: SectionProps;
    routeTo: string;
  }) => (
    <Pressable
      onPress={() =>
        navigation.navigate(routeTo as any, {
          queryKey: [_.camelCase(section.title)],
          title: section.title,
        })
      }
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 20,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 3,
      }}
    >
      <Text
        style={{
          color: '#fff',
          fontFamily: fontFamilyBold,
          fontSize: 16,
          textDecorationLine: 'underline',
        }}
      >
        {section.title}
      </Text>

      <Divider style={{ backgroundColor: '#ffffff20', flex: 1 }} />

      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5 }}>
        <Text
          numberOfLines={1}
          style={{
            backgroundColor: '#a7a7a745',
            borderColor: '#ffffff4D',
            borderWidth: 1,
            borderRadius: 5,
            fontSize: 10,
            paddingHorizontal: 5,
            paddingTop: 2,
            paddingLeft: 7,
          }}
        >
          MORE
        </Text>

        <EvilIcons color="#fff" name="chevron-right" size={20} />
      </View>
    </Pressable>
  );

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

      <SectionList
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        sections={sections}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              queryClient.refetchQueries({ queryKey: ['dashboard'] });
            }}
          />
        }
        renderSectionHeader={({ section }) => (
          <>
            {section.title !== 'Libraries' && (
              <>
                {section.title === 'Favourite Artists' ? (
                  <SectionHeader section={section} routeTo="Artists" />
                ) : section.title === 'Recently Added' ? (
                  <SectionHeader section={section} routeTo="History" />
                ) : section.title === 'Recently Played' ? (
                  <SectionHeader section={section} routeTo="History" />
                ) : section.title === 'Playlists' ? (
                  <SectionHeader section={section} routeTo="Playlists" />
                ) : section.title === 'Most Played' ? (
                  <SectionHeader section={section} routeTo="MostPlayed" />
                ) : null}
              </>
            )}
          </>
        )}
        renderItem={({ section }) => (
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
                  <RecentlyAddedAndPlayed loading={loading} section={section} />
                )}

                {section.title === 'Playlists' && (
                  <Playlists
                    loading={loading}
                    dataset={section.dataset as RootStackParamList['Playlists']}
                  />
                )}

                {section.title === 'Most Played' && (
                  <MostPlayed loading={loading} dataset={section.dataset} />
                )}
              </>
            ) : (
              <>
                {section.title === 'Libraries' && (
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: orientation === 'portrait' ? 'wrap' : 'nowrap',
                    }}
                  >
                    {section.dataset?.map((item, i) => (
                      <Pressable
                        key={i}
                        onPress={() => navigation.navigate(item.name as any)}
                        style={{
                          flexGrow: 1,
                          borderRadius: 10,
                          backgroundColor: 'rgba(10, 10, 20, 0.5)',
                          width:
                            orientation === 'portrait' ? WIDTH / 2.5 : 'auto',
                          margin: 5,
                        }}
                      >
                        <View
                          style={{
                            alignItems: 'center',
                            flexDirection: 'row',
                            gap: 10,
                            paddingLeft: 15,
                            paddingRight: 6,
                            paddingBottom: 12,
                            paddingTop: 12,
                            overflow: 'hidden',
                          }}
                        >
                          <Image
                            source={item.icon}
                            style={{ height: 45, width: 45 }}
                          />
                          <View>
                            <Text style={{ fontSize: 17 }}>{item.name}</Text>

                            <Text
                              style={{
                                fontFamily: fontFamilyBold,
                                fontSize: 16,
                                marginTop: -3,
                              }}
                            >
                              {stats
                                ? Object.keys(stats).map(stat => {
                                    if (stat === item.name?.toLowerCase())
                                      return stats[stat].toLocaleString();
                                  })
                                : 0}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }} />
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
      />
    </>
  );
}
