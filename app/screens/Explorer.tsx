import React, {useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Image, View} from 'react-native';
import {Link} from 'react-router-native';
import {
  Avatar,
  List,
  Text,
  ActivityIndicator,
  Subheading,
  Caption,
  Button,
} from 'react-native-paper';
import {Rating} from 'react-native-ratings';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Footer from '../components/Footer';

const Explorer = ({handlePlay, backgroundStyle}) => {
  const [explorer, setExplorer] = useState(null);
  const [currentPath, setCurrentPath] = useState('/Tanzania');
  const NGINX_SERVER = 'http://musasoft.ddns.net:8080/';
  const NODE_SERVER = 'http://musasoft.ddns.net:3000/';

  //const path = realm.objects('currentPath');
  //const path = '';

  useEffect(() => {
    const getData = async () => {
      try {
        const path = await AsyncStorage.getItem('currentPath');
        if (path !== null) {
          console.log('path1: ', path);
          FetchExplorer(path);
        } else {
          console.log('path2: ', path);
          await AsyncStorage.setItem('currentPath', ' ');
          FetchExplorer('');
          /* const storeData = async value => {
            try {
              await AsyncStorage.setItem('currentPath', value);
              const path = await AsyncStorage.getItem('currentPath');
              console.log('path2: ', path);
              FetchExplorer(path);
            } catch (e) {
              // saving error
            }
          };
          storeData(''); */
        }
      } catch (e) {
        // error reading value
      }
    };

    //AsyncStorage.removeItem('currentPath');
    getData();

    //FetchExplorer('');

    /* realm.write(() => {
      realmTask1 = realm.create('currentPath', {
        _id: 2,
        path: '',
      });
    }); */
    /* realm.write(() => {
      //path = '';
      //realm.delete(task1);
    }); */
    //console.log(path);
    /* if (path) {
      setCurrentPath(path);
    } else {
      setCurrentPath('');
    } */
  }, []);

  const FetchExplorer = dir => {
    fetch(`${NODE_SERVER}Explorer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activeDirectory: dir.trim() ? dir.trim() : '',
      }),
    })
      .then(res => res.json())
      .then(data => setExplorer(data));
  };

  const handleDirectoryChange = async dir => {
    console.log('dir:', dir);
    try {
      const currentPath = await AsyncStorage.getItem('currentPath');
      const newPath = currentPath + dir;
      console.log('newPath:', newPath);
      await AsyncStorage.setItem('currentPath', newPath);
      FetchExplorer(newPath);
    } catch (e) {
      // saving error
    }

    //localStorage.ActiveDirectory = (localStorage.ActiveDirectory || '') + dir;
    /* setCurrentPath(realm.objects('currentPath')[1].path);
    console.log(realm.objects('currentPath')[1].path);
    FetchExplorer(realm.objects('currentPath')[1].path); */
  };

  /* const handleDirectoryChange = async dir => {
    realm.write(() => {
      realm.objects('currentPath')[1].path =
        realm.objects('currentPath')[1].path + dir;
    });

    //localStorage.ActiveDirectory = (localStorage.ActiveDirectory || '') + dir;
    setCurrentPath(realm.objects('currentPath')[1].path);
    console.log(realm.objects('currentPath')[1].path);
    FetchExplorer(realm.objects('currentPath')[1].path);
  }; */

  const handleRoot = async () => {
    await AsyncStorage.setItem('currentPath', ' ');
    FetchExplorer('');
  };

  const handleBackAction = async () => {
    const currentPath = await AsyncStorage.getItem('currentPath');
    const lastDir = currentPath.split('/').pop();
    const newPath = currentPath.replace(`/${lastDir}`, '');
    console.log('newPath:', newPath);
    await AsyncStorage.setItem('currentPath', newPath);
    FetchExplorer(newPath);
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <Link to="/">
        <Subheading>Go Back</Subheading>
      </Link>
      <Button onPress={handleBackAction}>Back</Button>
      {explorer ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <List.Section>
            <List.Subheader>
              <Text onPress={handleRoot}>Explorer</Text>
            </List.Subheader>
            {explorer.map((item, i) => (
              <View key={i}>
                {item.type === 'folder' ? (
                  <List.Item
                    onPress={() => handleDirectoryChange(`/${item.name}`)}
                    left={() => (
                      <View>
                        <Avatar.Image
                          style={{
                            position: 'absolute',
                            left: 15,
                            zIndex: 0,
                            top: -5,
                          }}
                          source={{
                            uri: `${NGINX_SERVER}${item.image}`,
                          }}
                          size={30}
                        />
                        <Image
                          source={require('../icons/icons8-folder-48.png')}
                          style={{
                            marginRight: 10,
                            height: 40,
                            width: 40,
                          }}
                        />
                      </View>
                    )}
                    right={props => <List.Icon {...props} icon="share" />}
                    title={item.title || item.name}
                    description={({
                      ellipsizeMode,
                      color: descriptionColor,
                      fontSize,
                    }) => (
                      <View style={[styles.container, styles.column]}>
                        <Caption
                          numberOfLines={2}
                          ellipsizeMode={ellipsizeMode}
                          style={{color: descriptionColor, fontSize}}>
                          {item.folders > 0 &&
                            (item.folders === 1
                              ? `${item.folders} folder`
                              : `${item.folders} folders`)}
                          {item.folders > 0 && item.files > 0 && ' / '}
                          {item.files > 0 &&
                            (item.files === 1
                              ? `${item.files} file`
                              : `${item.files} files`)}
                        </Caption>
                      </View>
                    )}
                  />
                ) : (
                  <List.Item
                    onPress={() => handlePlay(i, item, explorer)}
                    left={() => (
                      <Image
                        source={{
                          uri: `${NGINX_SERVER}${item.coverArtURL}`,
                        }}
                        style={styles.image}
                      />
                    )}
                    right={props => (
                      <Rating
                        showRating={false}
                        imageSize={15}
                        onFinishRating={rating => console.log(rating)}
                      />
                    )}
                    title={item.title || item.name}
                    description={({
                      ellipsizeMode,
                      color: descriptionColor,
                      fontSize,
                    }) => (
                      <View style={[styles.container, styles.column]}>
                        <Text
                          numberOfLines={2}
                          ellipsizeMode={ellipsizeMode}
                          style={{color: descriptionColor, fontSize}}>
                          {(item.artists && item.artists.join(' / ')) || ''}
                        </Text>
                      </View>
                    )}
                  />
                )}
              </View>
            ))}
          </List.Section>
        </ScrollView>
      ) : (
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}>
          <ActivityIndicator animating={true} size="large" />
        </View>
      )}
      {/* <Footer /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    height: 40,
    width: 40,
    margin: 8,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
});

export default Explorer;
