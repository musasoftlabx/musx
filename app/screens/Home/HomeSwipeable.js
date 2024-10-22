import React, {useState, useEffect, useLayoutEffect} from 'react';
import {
  Alert,
  Button,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import SwipeableFlatList from 'react-native-swipeable-list';

const darkColors = {
  background: '#121212',
  primary: '#BB86FC',
  primary2: '#3700b3',
  secondary: '#03DAC6',
  onBackground: '#FFFFFF',
  error: '#CF6679',
};

const colorEmphasis = {
  high: 0.87,
  medium: 0.6,
  disabled: 0.38,
};

const NODE_SERVER = 'http://musasoft.ddns.net:3000/';

const Home = ({navigation}) => {
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [mostPlayed, setMostPlayed] = useState([]);

  useEffect(() => {
    fetch(`${NODE_SERVER}GetRecentlyAdded`).then(res =>
      res.json().then(data => setRecentlyAdded(data)),
    );

    fetch(`${NODE_SERVER}GetMostPlayed`).then(res =>
      res.json().then(data => setMostPlayed(data)),
    );
  }, []);

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

  function renderItemSeparator() {
    return <View style={styles.itemSeparator} />;
  }

  const Item = ({item, backgroundColor, textColor, deleteItem}) => {
    return (
      <>
        <View style={styles.item}>
          <View style={styles.avatar} />
          <View style={styles.messageContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.subject} numberOfLines={1}>
              {item.artists.join(' / ')}
            </Text>
            <Text style={styles.text} numberOfLines={1}>
              {item.album}
            </Text>
          </View>
        </View>
        <View />
      </>
    );
  };

  const extractItemKey = item => {
    return item._id.toString();
  };

  const dummyData = [
    {
      name: 'Raphael',
      subject: 'amet lorem semper auctor. Mauris vel turpis.',
      date: 'Sun, 17th, 2019',
      text: 'mollis dui, in sodales elit erat vitae risus. Duis a mi fringilla mi lacinia mattis. Integer eu lacus. Quisque imperdiet, erat nonummy ultricies ornare, elit elit fermentum risus, at fringilla purus mauris a nunc. In at pede. Cras vulputate velit eu sem. Pellentesque ut ipsum ac mi eleifend egestas. Sed',
      id: 1,
    },
    {
      name: 'Aquila',
      subject: 'quis, pede. Praesent',
      date: 'Thu, 11th, 2019',
      text: 'Nunc quis arcu vel quam dignissim pharetra. Nam ac nulla. In tincidunt congue turpis. In condimentum. Donec at arcu. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec tincidunt. Donec vitae erat vel pede blandit congue. In scelerisque scelerisque dui. Suspendisse ac',
      id: 11,
    },
    {
      name: 'Geraldine',
      subject: 'purus sapien, gravida non,',
      date: 'Tue, 24th, 2019',
      text: 'pede, nonummy ut, molestie in, tempus eu, ligula. Aenean euismod mauris eu elit. Nulla facilisi. Sed neque. Sed eget lacus. Mauris non dui nec urna suscipit nonummy. Fusce fermentum',
      id: 21,
    },
    {
      name: 'Geraldine',
      subject: 'nec enim. Nunc ut erat. Sed nunc',
      date: 'Thu, 5th, 2020',
      text: 'Ut tincidunt vehicula risus. Nulla eget metus eu erat semper rutrum. Fusce dolor quam, elementum at, egestas a, scelerisque sed, sapien. Nunc pulvinar arcu et pede. Nunc sed orci lobortis augue scelerisque mollis. Phasellus libero mauris, aliquam eu, accumsan sed, facilisis vitae, orci. Phasellus dapibus quam quis diam.',
      id: 31,
    },
    {
      name: 'Mariko',
      subject: 'lobortis mauris. Suspendisse',
      date: 'Sat, 25th, 2019',
      text: 'mauris sit amet lorem semper auctor. Mauris vel turpis. Aliquam adipiscing lobortis risus. In mi pede, nonummy ut, molestie in, tempus eu, ligula. Aenean euismod mauris eu elit. Nulla facilisi. Sed neque. Sed',
      id: 41,
    },
    {
      name: 'Nicole',
      subject: 'egestas.',
      date: 'Tue, 8th, 2020',
      text: 'vitae mauris sit amet lorem semper auctor. Mauris vel turpis. Aliquam adipiscing lobortis risus. In mi pede, nonummy ut, molestie in, tempus eu, ligula. Aenean euismod',
      id: 51,
    },
    {
      name: 'Solomon',
      subject: 'ac mattis ornare, lectus',
      date: 'Fri, 10th, 2019',
      text: 'nulla. In tincidunt congue turpis. In condimentum. Donec at arcu. Vestibulum ante ipsum primis in faucibus orci',
      id: 61,
    },
    {
      name: 'Diana',
      subject: 'Suspendisse',
      date: 'Sun, 16th, 2018',
      text: 'dignissim magna a tortor. Nunc commodo auctor velit. Aliquam nisl. Nulla eu neque pellentesque massa lobortis ultrices. Vivamus rhoncus. Donec est. Nunc ullamcorper,',
      id: 71,
    },
    {
      name: 'Hammett',
      subject: 'eu enim. Etiam imperdiet dictum',
      date: 'Mon, 11th, 2019',
      text: 'molestie sodales. Mauris blandit enim consequat purus. Maecenas libero est, congue a, aliquet vel, vulputate eu, odio.',
      id: 81,
    },
    {
      name: 'Brenna',
      subject: 'neque. Sed eget lacus. Mauris non',
      date: 'Wed, 22nd, 2019',
      text: 'sit amet massa. Quisque porttitor eros nec tellus. Nunc lectus pede, ultrices a, auctor non, feugiat nec, diam.',
      id: 91,
    },
    {
      name: 'Zelda',
      subject: 'enim non nisi.',
      date: 'Sat, 27th, 2020',
      text: 'dignissim pharetra. Nam ac nulla. In tincidunt congue turpis. In condimentum. Donec at arcu. Vestibulum ante ipsum primis in faucibus orci luctus et',
      id: 101,
    },
    {
      name: 'Irene',
      subject: 'aptent taciti sociosqu ad litora torquent per',
      date: 'Wed, 8th, 2020',
      text: 'eget metus eu erat semper rutrum. Fusce dolor quam, elementum at, egestas a, scelerisque sed, sapien. Nunc pulvinar arcu et pede. Nunc sed orci lobortis augue scelerisque mollis. Phasellus libero mauris, aliquam eu, accumsan sed, facilisis vitae, orci. Phasellus dapibus quam quis diam.',
      id: 111,
    },
    {
      name: 'Dennis',
      subject: 'neque venenatis lacus.',
      date: 'Mon, 26th, 2018',
      text: 'Mauris blandit enim consequat purus. Maecenas libero est, congue a, aliquet vel, vulputate eu, odio. Phasellus at augue id ante',
      id: 121,
    },
  ];

  const [data, setData] = useState(dummyData);

  const deleteItem = itemId => {
    // ! Please don't do something like this in production. Use proper state management.
    const newState = [...data];
    const filteredState = newState.filter(item => item.id !== itemId);
    return setRecentlyAdded(filteredState);
  };

  const archiveItem = itemId => {
    Alert.alert(
      'DISHONESTY ALERT',
      "Not gonna Archive it. We're actually are gonna just delete it.",
      [
        {
          text: 'Just delete it?',
          onPress: () => deleteItem(itemId),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ],
    );
  };

  const snoozeItem = itemId => {
    Alert.alert(
      'DISHONESTY ALERT',
      "Not gonna Snooze it. We're actually are gonna just delete it.",
      [
        {
          text: 'Just delete it?',
          onPress: () => deleteItem(itemId),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ],
    );
  };

  const QuickActions = (index, qaItem) => {
    return (
      <View style={styles.qaContainer}>
        <View style={[styles.button, styles.button1]}>
          <Pressable onPress={() => archiveItem(qaItem.id)}>
            <Text style={[styles.buttonText, styles.button1Text]}>Archive</Text>
          </Pressable>
        </View>
        <View style={[styles.button, styles.button2]}>
          <Pressable onPress={() => snoozeItem(qaItem.id)}>
            <Text style={[styles.buttonText, styles.button2Text]}>Snooze</Text>
          </Pressable>
        </View>
        <View style={[styles.button, styles.button3]}>
          <Pressable onPress={() => deleteItem(qaItem.id)}>
            <Text style={[styles.buttonText, styles.button3Text]}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <Text style={{color: 'white'}}>Recent Plays</Text>
      <SwipeableFlatList
        keyExtractor={extractItemKey}
        data={recentlyAdded}
        renderItem={({item}) => (
          <Item item={item} deleteItem={() => deleteItem} />
        )}
        maxSwipeDistance={240}
        renderQuickActions={({index, item}) => QuickActions(index, item)}
        contentContainerStyle={styles.contentContainerStyle}
        shouldBounceOnMount={true}
        ItemSeparatorComponent={renderItemSeparator}
      />
      {/* <Button
        title="Go to RecentlyAdded"
        onPress={() => navigation.navigate('RecentlyAdded')}
      />
      <Button
        title="Go to RecentlyPlayed"
        onPress={() => navigation.navigate('RecentlyPlayed')}
      />
      <Button
        title="Go to History"
        onPress={() => navigation.navigate('History')}
      />
      <Button
        onPress={() => navigation.navigate('NowPlaying')}
        title="Now Playing"
      /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
  },
  headerContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  headerText: {
    fontSize: 30,
    fontWeight: '800',
    color: darkColors.onBackground,
    opacity: colorEmphasis.high,
  },
  item: {
    backgroundColor: '#121212',
    height: 80,
    flexDirection: 'row',
    padding: 10,
  },
  messageContainer: {
    backgroundColor: darkColors.backgroundColor,
    maxWidth: 300,
  },
  name: {
    fontSize: 16,
    color: darkColors.primary,
    opacity: colorEmphasis.high,
    fontWeight: '800',
  },
  subject: {
    fontSize: 14,
    color: darkColors.onBackground,
    opacity: colorEmphasis.high,
    fontWeight: 'bold',
    textShadowColor: darkColors.secondary,
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 4,
  },
  text: {
    fontSize: 10,
    color: darkColors.onBackground,
    opacity: colorEmphasis.medium,
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: darkColors.onBackground,
    opacity: colorEmphasis.high,
    borderColor: darkColors.primary,
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 7,
    alignSelf: 'center',
    shadowColor: darkColors.secondary,
    shadowOffset: {width: 1, height: 1},
    shadowRadius: 2,
    shadowOpacity: colorEmphasis.high,
  },
  itemSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: darkColors.onBackground,
    opacity: colorEmphasis.medium,
  },
  qaContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    opacity: colorEmphasis.high,
  },
  button1Text: {
    color: darkColors.primary,
  },
  button2Text: {
    color: darkColors.secondary,
  },
  button3Text: {
    color: darkColors.error,
  },
  contentContainerStyle: {
    flexGrow: 1,
    backgroundColor: darkColors.backgroundColor,
  },
});

export default Home;
