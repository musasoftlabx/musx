// * React
import {memo, useRef, useState} from 'react';

// * React Native
import {Pressable, RefreshControl, Vibration, View} from 'react-native';

// * React Native Libraries
import {FlatList} from 'react-native-gesture-handler';
import {Modalize} from 'react-native-modalize';
import {Text, useTheme} from 'react-native-paper';

// * Components
import Edit from './Edit';
import TextX from '../../components/TextX';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useConfigStore} from '../../store';

import {ISelected} from './';

const Entries = ({setSelected}: ISelected) => {
  const theme = useTheme();
  const axios = useConfigStore(state => state.axios);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const {data, isFetching, isFetched} = useQuery(
    ['kitchen'],
    ({queryKey}) => axios.get(queryKey[0]),
    {select: data => data.data},
  );

  const editRef = useRef<Modalize>();

  return (
    <View>
      <FlatList
        data={data}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => {
                queryClient.refetchQueries(['kitchen']);
                setRefreshing(false);
              }, 1000);
            }}
          />
        }
        renderItem={({item, index}) => (
          <Pressable onPress={() => (Vibration.vibrate(50), setSelected(item))}>
            <View
              style={{
                alignItems: 'center',
                borderRadius: 10,
                flexDirection: 'row',
                marginHorizontal: 10,
                marginVertical: 7,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}>
              <View style={{flex: 0.6, justifyContent: 'center'}}>
                <TextX bold font="Laila-Bold" numberOfLines={1} scale={2.3}>
                  {item.item}
                </TextX>
                <TextX numberOfLines={1} scale={1.9}>
                  {item.stocked.on}
                </TextX>
              </View>

              <View
                style={{
                  flex: 0.4,
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: theme.colors.primary,
                    borderRadius: 10,
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                  }}>
                  <TextX color="#fff" scale={1.3}>
                    opening
                  </TextX>
                  <TextX color="#fff" mt={-7} scale={2.5}>
                    {String(item.opening).padStart(2, '0')}
                  </TextX>
                </View>

                {item.closing && (
                  <View
                    style={{
                      alignItems: 'center',
                      backgroundColor: theme.colors.secondary,
                      borderRadius: 10,
                      marginLeft: 10,
                      paddingHorizontal: 5,
                      paddingVertical: 2,
                    }}>
                    <TextX color="#fff" scale={1.3}>
                      closing
                    </TextX>
                    <TextX color="#fff" mt={-7} scale={2.5}>
                      {String(item.closing).padStart(2, '0')}
                    </TextX>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        )}
        style={{marginVertical: 10}}
      />
    </View>
  );
};

export default memo(Entries);
