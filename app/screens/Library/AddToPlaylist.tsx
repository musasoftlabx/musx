// * React
import React, {useState} from 'react';

// * React Native
import {Image, FlatList, Pressable, Text, View} from 'react-native';

// * Libraries
import {Button, Snackbar, TextInput} from 'react-native-paper';
import {useBackHandler} from '@react-native-community/hooks';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';

import {queryClient} from '../../../App';
import ButtonX from '../../components/ButtonX';
import LinearGradientX from '../../components/LinearGradientX';
import StatusBarX from '../../components/StatusBarX';

// * Store
import {API_URL} from '../../store';

// * Types
import {TrackProps} from '../../types';
import {addPlaylistTrack} from '../../functions';

export default function AddToPlaylist({
  navigation,
  route: {
    params: {id},
  },
}: any) {
  console.log({id});
  // ? States
  const [name, setName] = useState('');
  const [snackbar, setSnackbar] = useState(false);
  const [displayForm, setDisplayForm] = useState<boolean>(false);

  const {
    data: playlists,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ['playlists'],
    queryFn: ({queryKey}) => axios(`${API_URL}${queryKey[0]}`),
    select: ({data}) => data,
  });

  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  const createPlaylist = async () => {
    const {data} = await axios.post(`${API_URL}createPlaylist`, {
      name,
      trackId: id,
    });
    queryClient.refetchQueries({queryKey: ['playlists']});
    setName('');
    navigation.goBack();
  };

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

      <View style={{marginHorizontal: 15}}>
        <ButtonX
          icon={displayForm ? 'chevron-up' : 'plus'}
          style={{marginTop: 70, marginBottom: 20}}
          onPress={() => setDisplayForm(prev => !prev)}>
          CREATE NEW
        </ButtonX>

        <View
          //animation="slideInDown"
          //duration={3000}
          style={{display: displayForm ? 'flex' : 'none'}}>
          <TextInput
            label="Playlist Name"
            value={name}
            dense
            onChangeText={text => setName(text)}
            style={{
              marginBottom: 20,
              // borderRadius: 20,
              // borderTopLeftRadius: 20,
              // borderTopRightRadius: 20,
              fontSize: 18,
            }}
          />

          <Button
            mode="contained"
            loading={false}
            disabled={false}
            onPress={createPlaylist}
            style={{marginBottom: 40}}>
            CREATE
          </Button>
        </View>

        <FlatList
          data={playlists}
          contentContainerStyle={{minHeight: '100%'}}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <Text style={{fontSize: 16, marginBottom: 10}}>Playlists</Text>
          )}
          renderItem={({item}: {item: TrackProps}) => (
            <Pressable
              onPress={
                () =>
                  axios
                    .post(`${API_URL}addPlaylistTrack`, {
                      playlistId: item.id,
                      trackId: id,
                      startsAt: null,
                      endsAt: null,
                    })
                    .then(() => {
                      queryClient.refetchQueries({queryKey: ['dashboard']});
                      queryClient.refetchQueries({queryKey: ['playlists']});
                      navigation.goBack();
                    })
                    .catch(err => console.error(err.message))

                //addPlaylistTrack(item, id)
              }>
              <View
                style={{
                  flexDirection: 'row',
                  marginVertical: 10,
                  marginHorizontal: 10,
                }}>
                <View
                  style={{
                    borderRadius: 10,
                    flexDirection: 'column',
                    flexBasis: '50%',
                    flexWrap: 'wrap',
                    height: 50,
                    width: 50,
                    overflow: 'hidden',
                  }}>
                  {item.artworks.length < 4 ? (
                    <Image
                      source={{uri: item.artworks[0]}}
                      style={{borderRadius: 10, width: 50, height: 50}}
                      resizeMode="cover"
                    />
                  ) : (
                    item.artworks.map(
                      (artwork: string, i: number) =>
                        i < 4 && (
                          <Image
                            key={i}
                            source={{uri: artwork}}
                            style={{width: 25, height: 25}}
                            resizeMode="cover"
                          />
                        ),
                    )
                  )}
                </View>
                <View style={{justifyContent: 'center', marginLeft: -110}}>
                  <Text
                    numberOfLines={1}
                    style={{fontSize: 18, fontWeight: 'bold'}}>
                    {item.name}
                  </Text>
                  <Text numberOfLines={1} style={{opacity: 0.7}}>
                    {item.tracks.length} track
                    {item.tracks.length === 1 ? '' : 's'}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />

        <Snackbar visible={snackbar} duration={3000} onDismiss={() => {}}>
          Added to Playlist successfully!
        </Snackbar>
      </View>
    </>
  );
}
