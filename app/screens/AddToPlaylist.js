import React, {useContext, useEffect, useState} from 'react';
import {Alert, Image, FlatList, Pressable, Text, View} from 'react-native';
import {Button, Snackbar, TextInput} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';

import {Context} from '../contexts';

const AddToPlaylist = ({navigation, route}) => {
  const {state} = useContext(Context);
  const [playlists, setPlaylists] = useState(null);
  const [__name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [snackbar, setSnackbar] = useState(false);
  const [formHeight, setFormHeight] = useState(0);

  useEffect(() => {
    fetch(`${state.NODE_SERVER}playlists`).then(res =>
      res.json().then(data => {
        setPlaylists(data);
      }),
    );
  }, []);

  const createPlaylist = () => {
    fetch(`${state.NODE_SERVER}playlists/create`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: __name,
        description,
        tracks: route.params._id,
      }),
    }).then(res =>
      res.json().then(data => {
        navigation.goBack();
        setName('');
        setDescription('');
      }),
    );
  };

  const addToPlaylist = playlistId => {
    fetch(`${state.NODE_SERVER}playlists/add`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({playlistId, trackId: route.params._id}),
    }).then(res =>
      res.text().then(data => {
        if (res.status === 201) {
          //setSnackbar(true);
          navigation.goBack();
        } else {
          Alert.alert('Error', data);
        }
      }),
    );
  };

  return (
    <View style={{marginHorizontal: 15}}>
      <Button
        mode="contained"
        icon="plus"
        onPress={() =>
          formHeight === 0 ? setFormHeight('auto') : setFormHeight(0)
        }
        style={{
          fontSize: 22,
          marginTop: 80,
          marginBottom: 40,
          width: 150,
          borderBottomRightRadius: 20,
          borderTopRightRadius: 20,
        }}>
        CREATE NEW
      </Button>
      <Animatable.View
        animation="slideInDown"
        duration={3000}
        style={{height: formHeight, opacity: 0.7}}>
        <TextInput
          label="Playlist Name"
          value={__name}
          dense
          onChangeText={text => setName(text)}
          style={{
            marginBottom: 20,
            paddingBottom: formHeight === 0 ? 0 : 5,
            // borderRadius: 20,
            // borderTopLeftRadius: 20,
            // borderTopRightRadius: 20,
            fontSize: 18,
          }}
        />
        <TextInput
          label="Playlist Description (Optional)"
          value={description}
          multiline={true}
          numberOfLines={4}
          onChangeText={text => setDescription(text)}
          style={{
            marginBottom: 20,
            paddingBottom: formHeight === 0 ? 0 : 5,
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
      </Animatable.View>
      <FlatList
        data={playlists && playlists}
        contentContainerStyle={{minHeight: '100%'}}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <Text style={{fontSize: 16, marginBottom: 10}}>Playlists</Text>
        )}
        renderItem={({item, index}) => (
          <Pressable onPress={() => addToPlaylist(item._id)}>
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
                    source={{
                      uri: `${state.NGINX_SERVER}${item.tracks[0].coverArtURL}`,
                    }}
                    style={{width: 50, height: 50}}
                    resizeMode="cover"
                  />
                ) : (
                  <>
                    {item.tracks.map((track, i) => {
                      return (
                        i < 4 && (
                          <Image
                            key={i}
                            source={{
                              uri: `${state.NGINX_SERVER}${track.coverArtURL}`,
                            }}
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
                  {item.description}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />

      <Snackbar visible={snackbar} duration={3000}>
        Added to Playlist successfully!
      </Snackbar>
    </View>
  );
};

export default AddToPlaylist;
