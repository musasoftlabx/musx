import React, {useLayoutEffect} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {RadioButton, Text} from 'react-native-paper';
import {ScrollView, Switch, View} from 'react-native';

import Footer from '../components/Footer';
import LinearGradientX from '../components/LinearGradientX';
import StatusBarX from '../components/StatusBarX';

import {usePlayerStore} from '../store';

export default function Settings({navigation}: any) {
  const bitrate = usePlayerStore(state => state.bitrate);
  const palette = usePlayerStore(state => state.palette);
  const streamViaHLS = usePlayerStore(state => state.streamViaHLS);

  const setStreamViaHLS = usePlayerStore(state => state.setStreamViaHLS);
  const setBitrate = usePlayerStore(state => state.setBitrate);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: palette[1] ?? '#000'},
    });
  });

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

      {/* <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}> */}
      <View style={{flex: 1, gap: 20, paddingHorizontal: 10, paddingTop: 20}}>
        <View style={{alignItems: 'center', flexDirection: 'row', gap: 10}}>
          <Text style={{fontSize: 18, marginBottom: 5}}>
            HLS streaming enabled?
          </Text>

          <Switch
            value={streamViaHLS}
            onValueChange={value => {
              setStreamViaHLS(value);
              AsyncStorage.setItem('streamViaHLS', value.toString());
            }}
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={streamViaHLS ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            style={{alignSelf: 'flex-start'}}
          />
        </View>

        {streamViaHLS && (
          <View>
            <Text style={{fontSize: 18, marginBottom: 5}}>Bitrate</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <RadioButton.Group
                value={bitrate}
                onValueChange={value => {
                  setBitrate(value);
                  AsyncStorage.setItem('bitrate', value);
                }}>
                <View style={{flexDirection: 'row', gap: 15}}>
                  {['Max', 320, 128, 64, 32].map((bitrate, key) => (
                    <View
                      key={key}
                      style={{alignItems: 'center', flexDirection: 'row'}}>
                      <RadioButton value={bitrate.toString()} />
                      <Text>
                        {bitrate} {typeof bitrate === 'number' ? 'Kbps' : ''}
                      </Text>
                    </View>
                  ))}
                </View>
              </RadioButton.Group>
            </ScrollView>
          </View>
        )}
      </View>

      <Footer />
    </>
  );
}
