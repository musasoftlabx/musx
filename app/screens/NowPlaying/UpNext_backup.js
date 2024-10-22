import React, {useState, useEffect} from 'react';
import {
  Alert,
  Button,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist';

const NODE_SERVER = 'http://musasoft.ddns.net:3000/';

const NUM_ITEMS = 10;
function getColor(i) {
  const multiplier = 255 / (NUM_ITEMS - 1);
  const colorVal = i * multiplier;
  return `rgb(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal})`;
}

const initialData = [...Array(NUM_ITEMS)].map((d, index) => {
  const backgroundColor = getColor(index);
  return {
    key: `item-${index}`,
    label: String(index) + '',
    height: 100,
    width: 60 + Math.random() * 40,
    backgroundColor,
  };
});

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

  const [data, setData] = useState(initialData);

  const renderItem = ({item, drag, isActive}) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.rowItem,
            {backgroundColor: isActive ? 'red' : item.backgroundColor},
          ]}>
          <Text style={styles.text}>{item.label}</Text>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <>
      {/*  <DraggableFlatList
        data={data}
        onDragEnd={({data}) => setData(data)}
        keyExtractor={item => item.key}
        renderItem={renderItem}
      /> */}
    </>
  );
};

const styles = StyleSheet.create({
  rowItem: {
    height: 100,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Home;
