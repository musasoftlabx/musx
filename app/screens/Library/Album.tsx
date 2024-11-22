// * React
import React, {useState, useEffect, useRef} from 'react';

// * React Native
import {View, Text, ActivityIndicator, StatusBar} from 'react-native';

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

// * Store
import {API_URL, LIST_ITEM_HEIGHT, usePlayerStore} from '../../store';

// * Types
import {TrackProps, TracksProps} from '../../types';
import {ArtistProps} from './Artist';

export default function Album({
  navigation,
  route: {
    params: {albumArtist, album},
  },
}: any) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // ? Hooks
  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  // ? States
  const [tracks, setTracks] = useState<TracksProps>([]);
  const [artist, setArtist] = useState<ArtistProps>({albums: [], singles: []});
  const [highlighted, setHighlighted] = useState<TrackProps | null>();
  const [_, setBottomSheetVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // ? Mutations
  const {
    mutate: list,
    isError,
    isPending,
  } = useMutation({
    mutationFn: () => axios(`${API_URL}artist/${albumArtist}/album/${album}`),
    onSuccess: ({data}) => setTracks(data),
  });

  // ? StoreStates
  const palette = usePlayerStore(state => state.palette);

  // ? Effects
  useEffect(list, []);
  useEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: palette?.[1] ?? '#000'},
      headerLeft: () => (
        <View style={{justifyContent: 'center'}}>
          <Text style={{color: '#fff', fontSize: 20}}>{album}</Text>
          <Text>{tracks.length} tracks</Text>
        </View>
      ),
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

      <BigList
        data={tracks}
        keyExtractor={(item, index) => index.toString()}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 1000);
        }}
        renderItem={({item}: {item: TrackProps}) => (
          <ListItem
            data={tracks}
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
        renderHeader={() => <View />}
        renderFooter={() => <View style={{flex: 1}} />}
        itemHeight={LIST_ITEM_HEIGHT}
        headerHeight={10}
        footerHeight={10}
      />

      <TrackDetails
        navigation={navigation}
        highlighted={highlighted}
        bottomSheetRef={bottomSheetRef}
      />
    </>
  );
}
