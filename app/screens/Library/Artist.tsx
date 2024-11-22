// * React
import React, {useState, useEffect, useRef} from 'react';

// * React Native
import {
  Image,
  ImageBackground,
  View,
  Pressable,
  Text,
  FlatList,
  SectionList,
  ActivityIndicator,
  StatusBar,
} from 'react-native';

// * Libraries
import {CastButton} from 'react-native-google-cast';
import {useBackHandler} from '@react-native-community/hooks';
import {useMutation} from '@tanstack/react-query';
import axios from 'axios';
import BigList from 'react-native-big-list';
import BottomSheet from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';

// * Components
import ListItem from '../../components/ListItem';
import TrackDetails from '../../components/TrackDetails';

// * Assets
import imageFiller from '../../assets/images/image-filler.png';

// * Store
import {
  API_URL,
  ARTWORK_URL,
  AUDIO_URL,
  LIST_ITEM_HEIGHT,
  usePlayerStore,
} from '../../store';

// * Types
import {TrackProps, TracksProps} from '../../types';

export type ArtistProps = {
  albums: {
    album: string;
    artwork: string;
    tracks: number;
    size: string;
  }[];
  singles: TracksProps;
};

export default function Artist({
  navigation,
  route: {
    params: {albumArtist, path, tracks},
  },
}: any) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // ? Hooks
  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  // ? Mutations
  const {
    mutate: list,
    isError,
    isPending,
  } = useMutation({
    mutationFn: () => axios(`${API_URL}artist/${albumArtist}`),
    onSuccess: ({data}) => setArtist(data),
  });

  // ? States
  const [artist, setArtist] = useState<ArtistProps>({albums: [], singles: []});
  const [highlighted, setHighlighted] = useState<TrackProps | null>();
  const [_, setBottomSheetVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [sections] = useState([
    {title: 'Albums', horizontal: true, data: [1]},
    {title: 'Singles', data: [1]},
  ]);

  // ? StoreStates
  const palette = usePlayerStore(state => state.palette);

  // ? Effects
  useEffect(list, []);
  useEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: 'transparent'},
      headerRight: () => (
        <CastButton
          style={{
            height: 24,
            width: 24,
            marginRight: 5,
            tintColor: 'rgba(255, 255, 255, .7)',
          }}
        />
      ),
    });
  });

  return (
    <>
      <StatusBar
        animated
        backgroundColor={palette[0] ?? '#000'}
        barStyle="light-content"
        translucent={false}
      />

      <LinearGradient
        colors={[palette[0] ?? '#000', palette[1] ?? '#000']}
        useAngle={true}
        angle={180}
        style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}
      />

      <ImageBackground source={imageFiller} resizeMode="cover" blurRadius={20}>
        <View
          style={{
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            position: 'absolute',
            backgroundColor: 'black',
            opacity: 0,
            zIndex: 2,
          }}
        />
        <View
          style={{
            alignItems: 'center',
            paddingTop: 50,
            paddingBottom: 10,
            justifyContent: 'center',
          }}>
          <Image
            source={{
              uri: `${AUDIO_URL}${path
                .split('/')
                .slice(0, -1)
                .join('/')}/artist.jpg`,
            }}
            defaultSource={require('../../assets/images/musician.png')}
            style={{borderRadius: 100, height: 100, width: 100}}
            resizeMode="cover"
          />

          <Text style={{fontSize: 30}}>{albumArtist}</Text>
          <Text style={{fontSize: 15}}>{tracks} tracks</Text>
        </View>
      </ImageBackground>

      <SectionList
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        sections={sections}
        keyExtractor={(_, index) => index.toString()}
        renderSectionHeader={({section: {title}}) =>
          artist.albums.length > 0 ? (
            <Text
              numberOfLines={1}
              style={{
                color: '#fff',
                fontWeight: '800',
                fontSize: 18,
                marginTop: 10,
                marginBottom: 5,
                marginLeft: 10,
              }}>
              {artist && artist.albums.length > 0
                ? `${title} (${
                    title === 'Albums'
                      ? artist.albums.length
                      : artist.singles.length
                  })`
                : `No ${title}`}
            </Text>
          ) : (
            <View />
          )
        }
        renderItem={({section}) => (
          <>
            {section.horizontal ? (
              <FlatList
                horizontal
                data={artist.albums}
                renderItem={({item}: {item: Omit<TrackProps, ''>}) => (
                  <Pressable
                    onPress={() =>
                      navigation.navigate('Album', {
                        albumArtist,
                        album: item.album,
                      })
                    }
                    style={{margin: 10, width: 100}}>
                    <Image
                      source={{uri: `${ARTWORK_URL}${item.artwork}`}}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 10,
                      }}
                      resizeMode="cover"
                    />
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 16,
                        color: 'rgba(255, 255, 255, .8)',
                        marginTop: 5,
                        marginBottom: 1,
                        marginLeft: 3,
                      }}>
                      {item.album}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 13,
                        color: 'rgba(255, 255, 255, .5)',
                        marginBottom: 1,
                        marginLeft: 3,
                      }}>
                      {item.tracks} tracks
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        alignSelf: 'flex-start',
                        borderColor: '#ffffff4D',
                        borderWidth: 1,
                        borderRadius: 5,
                        fontSize: 14,
                        marginTop: 1,
                        paddingHorizontal: 5,
                      }}>
                      {item.size}
                    </Text>
                  </Pressable>
                )}
                showsHorizontalScrollIndicator={false}
              />
            ) : (
              <BigList
                data={artist.singles}
                keyExtractor={(_, index) => index.toString()}
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  setTimeout(() => setRefreshing(false), 1000);
                }}
                renderItem={({item}: {item: TrackProps}) => (
                  <ListItem
                    data={artist.singles}
                    item={item}
                    display="bitrate"
                    bottomSheetRef={bottomSheetRef}
                    setHighlighted={setHighlighted}
                    setBottomSheetVisible={setBottomSheetVisible}
                  />
                )}
                renderEmpty={() =>
                  isPending ? (
                    <ActivityIndicator
                      size="large"
                      color="#fff"
                      style={{marginTop: '50%'}}
                    />
                  ) : isError ? (
                    <View>
                      <Text style={{fontFamily: 'Abel'}}>Empty</Text>
                    </View>
                  ) : (
                    <View />
                  )
                }
                getItemLayout={(_, index) => ({
                  length: LIST_ITEM_HEIGHT,
                  offset: LIST_ITEM_HEIGHT * index,
                  index,
                })}
                renderHeader={() => (
                  <View style={{marginVertical: 60}}>
                    <Text>{artist?.singles.length}</Text>
                  </View>
                )}
                renderFooter={() => <View style={{flex: 1}} />}
                itemHeight={LIST_ITEM_HEIGHT}
                headerHeight={0}
                footerHeight={10}
              />
            )}
          </>
        )}
      />

      <TrackDetails
        navigation={navigation}
        highlighted={highlighted}
        bottomSheetRef={bottomSheetRef}
      />
    </>
  );
}
