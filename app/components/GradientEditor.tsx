import React, {useEffect, useState} from 'react';

// * React Native
import {
  View,
  StyleSheet,
  Image,
  Text,
  Pressable,
  BackHandler,
} from 'react-native';

// * Libraries
import {Shadow} from 'react-native-shadow-2';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import TrackPlayer, {State} from 'react-native-track-player';

// * Store
import {usePlayerStore, WIDTH} from '../store';

// * Assets
import imageFiller from '../assets/images/image-filler.png';
import SelectDropdown from 'react-native-select-dropdown';

export default function GradientEditor() {
  // ? Hooks
  const navigation: any = useNavigation();

  // ? StoreStates
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const [palette, setPalette] = useState(activeTrack.palette);
  //const [primaryColor, setPrimaryColor] = useState('');

  function arraymove(fromIndex: number, toIndex: number) {
    var element = palette[fromIndex];
    palette.splice(fromIndex, 1);
    palette.splice(toIndex, 0, element);
  }

  const selections = ['Primary', 'Secondary', 'Tertiary', 'Waveform', 'Icons'];

  const Select = ({label}: {label: string}) => (
    <SelectDropdown
      data={palette}
      onSelect={(selectedItem, index) => {
        console.log('before', palette);
        arraymove(index, 0);
        console.log('after', palette);
      }}
      renderButton={(selectedItem, isOpened) => {
        return (
          <View
            style={{
              width: 200,
              borderRadius: 12,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 12,
            }}>
            {selectedItem && (
              <Icon
                name={selectedItem.icon}
                style={{fontSize: 28, marginRight: 8}}
              />
            )}
            <Text
              style={{
                fontSize: 15,
                fontWeight: '500',
                color: '#fff',
              }}>
              {label}
            </Text>
            <Icon
              name={isOpened ? 'chevron-up' : 'chevron-down'}
              style={{color: '#fff', fontSize: 15}}
            />
          </View>
        );
      }}
      renderItem={(item, index, isSelected) => {
        return (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'auto',
              backgroundColor: item,
              borderRadius: 5,
              height: 30,
              width: 70,
              padding: 5,
              marginVertical: 2,
            }}>
            <Text style={{color: '#000'}}>{item}</Text>
          </View>
        );
      }}
      showsVerticalScrollIndicator={false}
      dropdownStyle={{
        backgroundColor: 'transparent',
        borderRadius: 8,
        width: 'auto',
      }}
    />
  );

  // ? Effects
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack(null);
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View style={{flexDirection: 'row', marginBottom: 20}}>
      {selections.map((selection, key) => (
        <Select key={key} label={selection} />
      ))}
    </View>
  );
}
