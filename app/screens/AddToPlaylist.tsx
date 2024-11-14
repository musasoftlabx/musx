// * React
import React, {useEffect, useState} from 'react';

// * React Native
import {Image, FlatList, Pressable, Text, View} from 'react-native';

// * Libraries
import {Button, Snackbar, TextInput} from 'react-native-paper';
import {useBackHandler} from '@react-native-community/hooks';

// * Store
import {API_URL, ARTWORK_URL} from '../store';

// * Types
import {TrackProps} from '../types';
import axios from 'axios';

export default function AddToPlaylist({
  navigation,
  route: {
    params: {id},
  },
}: any) {
  const [playlists, setPlaylists] = useState(null);
  const [name, setName] = useState('');
  const [snackbar, setSnackbar] = useState(false);
  const [displayForm, setDisplayForm] = useState<boolean>(false);

  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  // const {data, isSuccess, isFetching, isFetched} = useQuery({
  //   queryKey: ['playlists'],
  //   queryFn: ({queryKey}) => axios.get(`${API_URL}${queryKey[0]}`),
  //   select: ({data}) => data,
  // });

  useEffect(() => {
    axios(`${API_URL}playlists`).then(({data}) => setPlaylists(data));
  }, []);

  const createPlaylist = async () => {
    const {data} = await axios.post(`${API_URL}createPlaylist`, {
      name,
      trackId: id,
    });
    setPlaylists(data);
    setName('');
    navigation.goBack();
  };

  const addPlaylistTrack = async (playlistId: number) => {
    await axios.post(`${API_URL}addPlaylistTrack`, {
      playlistId,
      trackId: id,
      startsAt: null,
      endsAt: null,
    });
    navigation.goBack();
  };

  return (
    <View style={{marginHorizontal: 15}}>
      <Button
        mode="contained"
        icon="plus"
        onPress={() => setDisplayForm(prev => !prev)}
        style={{
          //fontSize: 22,
          marginTop: 80,
          marginBottom: 40,
          width: 150,
          borderBottomRightRadius: 20,
          borderTopRightRadius: 20,
        }}>
        CREATE NEW
      </Button>
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
        data={playlists && playlists}
        contentContainerStyle={{minHeight: '100%'}}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <Text style={{fontSize: 16, marginBottom: 10}}>Playlists</Text>
        )}
        renderItem={({item, index}: {item: TrackProps; index: number}) => (
          <Pressable onPress={() => addPlaylistTrack(item.id)}>
            <View
              style={{
                flexDirection: 'row',
                marginVertical: 10,
                marginHorizontal: 10,
              }}>
              <View
                style={{
                  flexDirection: 'column',
                  flexBasis: '50%',
                  flexWrap: 'wrap',
                  width: 50,
                  height: 50,
                }}>
                {item.tracks.length < 4 ? (
                  <Image
                    source={{uri: `${ARTWORK_URL}${item.tracks[0].artwork}`}}
                    style={{borderRadius: 10, width: 50, height: 50}}
                    resizeMode="cover"
                  />
                ) : (
                  <>
                    {item.tracks.map((track: TrackProps, i: number) => {
                      return (
                        i < 4 && (
                          <Image
                            key={i}
                            source={{uri: `${ARTWORK_URL}${track.artwork}`}}
                            style={{width: 25, height: 25}}
                            resizeMode="cover"
                          />
                        )
                      );
                    })}
                  </>
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
  );
}
