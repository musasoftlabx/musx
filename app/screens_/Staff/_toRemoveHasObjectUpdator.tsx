// * React
import {useEffect, useState} from 'react';

// * React Native
import {
  Alert,
  useWindowDimensions,
  Pressable,
  View,
  Vibration,
  Image,
  RefreshControlBase,
  StyleSheet,
} from 'react-native';

// * React Native Libraries
import {AnimatePresence, Motion} from '@legendapp/motion';
import NeuInput from '../../components/Neumorphism/NeuInput';
import NeuView from '../../components/Neumorphism/NeuView';
import {
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {
  Avatar,
  Button,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select'; //@react-native-picker/picker
import {RFPercentage as s} from 'react-native-responsive-fontsize';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import MaskInput, {createNumberMask} from 'react-native-mask-input';

// * JS Libraries
import {Formik} from 'formik';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import * as Yup from 'yup';

// * Components
import Add from './Add';
import ButtonX from '../../components/ButtonX';
import EmptyRecords from '../../components/EmptyRecords';

// * Utilities
import {photoURL, useConfigStore} from '../../store';
import {styles} from '../../styles';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

import Icons from 'react-native-vector-icons/Ionicons';
import NeuButton from '../../components/Neumorphism/NeuButton';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Users({navigation}: {navigation: any}) {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);

  // ? useStore
  const axios = useConfigStore(state => state.axios);

  const layout = useWindowDimensions();

  const {mutate} = useMutation(body => axios.post('users', body));
  const {mutate: remove} = useMutation(id => axios.delete(`users/${id}`));
  const {data, isFetching, isFetched} = useQuery(
    ['staff'],
    ({queryKey}) => axios.get(queryKey[0]),
    {
      select: data => data.data.rows,
    },
  );

  const [staff, setStaff] = useState<any>([]);
  const [filtered, setFiltered] = useState<any>([]);
  const [search, setSearch] = useState<string>('');

  useEffect(() => setStaff(data), [data]);

  useEffect(
    () =>
      setFiltered(
        staff.filter((one: any) => {
          const name = `${one.firstName} ${one.lastName}`.toLowerCase();
          return name.indexOf(search.toLowerCase()) > -1 && one;
        }),
      ),
    [search],
  );

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.primary,
        //height: layout.height * 1.1,
        //flex: 1,
      }}>
      <Motion.Text
        animate={{x: 0, y: 0}}
        initial={{y: -50}}
        transition={{type: 'spring', damping: 20, stiffness: 400}}
        style={{
          alignSelf: 'center',
          color: 'white',
          fontFamily: 'Montez',
          fontSize: s(6),
          marginBottom: 30,
        }}>
        Staff
      </Motion.Text>

      <NeuInput
        color="#6d4c41"
        convex
        onChangeText={setSearch}
        placeholder="Search by name"
        prefix={<Ionicons name="ios-search-outline" size={24} color="#fff" />}
        style={{alignSelf: 'center', marginBottom: 30}}
        textStyle={{color: '#fff', fontFamily: 'Laila'}}
        width={layout.width / 1.2}
        height={40}
        value={search}
      />

      {/* <NeuButton
        color="#eef2f9"
        //convex
        width={100}
        height={100}
        borderRadius={16}
        style={{marginRight: 30}}>
        <Text>Normal Btn</Text>
      </NeuButton> */}

      <FlatList
        data={search.length > 0 ? filtered : staff}
        columnWrapperStyle={{justifyContent: 'space-evenly', marginBottom: 20}}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: layout.height / 5,
        }}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          isFetching ? (
            <View style={{marginTop: 10}}>
              {new Array(50).fill(0).map((_, key) => (
                <SkeletonPlaceholder key={key} borderRadius={4}>
                  <SkeletonPlaceholder.Item
                    flexDirection="row"
                    alignItems="center">
                    <SkeletonPlaceholder.Item
                      borderRadius={5}
                      marginBottom={20}
                      marginLeft={15}
                      width={layout.width / 2.3}
                      height={180}
                    />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder>
              ))}
            </View>
          ) : (
            <EmptyRecords
              context="staff"
              reload={() => queryClient.refetchQueries(['staff'])}
            />
          )
        }
        numColumns={2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => {
                queryClient.refetchQueries(['roles']);
                setRefreshing(false);
              }, 1000);
            }}
          />
        }
        renderItem={({item, index}) => (
          <>
            <Animated.View
              key={index}
              entering={FadeIn.duration(1000)}
              exiting={FadeOut.duration(1000)}>
              {/* <Pressable
                onPress={() => {
                  queryClient.setQueryData(['staff'], (prev: any) => ({
                    ...prev,
                    data: {
                      ...prev.data,
                      rows: [
                        ...prev.data.rows.map((obj: any, i: number) => {
                          i === index && (obj.pressed = true);
                          return obj;
                        }),
                      ],
                    },
                  }));
                }}
                onPressIn={() =>
                  setStaff((prev: any) => [
                    ...prev.map((obj: any, i: number) => {
                      i === index && (obj.pressed = true);
                      return obj;
                    }),
                  ])
                }
                onPressOut={() =>
                  setStaff((prev: any) => [
                    ...prev.map((obj: any, i: number) => {
                      i === index && (obj.pressed = false);
                      return obj;
                    }),
                  ])
                }> */}
              <NeuButton
                color="#eef2f9"
                borderRadius={16}
                concave
                //concave={!item.pressed}
                //inset={item.pressed}
                height={180}
                width={layout.width / 2.3}
                containerStyle={{paddingVertical: 20}}>
                <Avatar.Image size={60} source={{uri: photoURL + item.photo}} />
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 10,
                  }}>
                  <Text numberOfLines={1} style={{fontSize: s(2.5)}}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <Text numberOfLines={1} style={{fontSize: s(1.8)}}>
                    {item.username}
                  </Text>
                  <Text numberOfLines={1} style={{fontSize: s(1.8)}}>
                    {item.role}
                  </Text>
                </View>
              </NeuButton>
              {/* <ShadowedView
                style={[
                  shadowStyle({
                    color: '#bdbdbd',
                    opacity: 1,
                    radius: 25,
                    offset: [0, 0],
                  }),
                  {
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginHorizontal: 10,
                    marginVertical: 7,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    // shadowColor: '#bcaaa4',
                    // shadowOffset: {width: 3, height: 3},
                    // shadowOpacity: 0.5,
                    // shadowRadius: 5,
                  },
                ]}>
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                  <Text numberOfLines={1} style={{fontSize: s(2.5)}}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <Text numberOfLines={1} style={{fontSize: s(1.8)}}>
                    {item.username}
                  </Text>
                </View>
              </ShadowedView> */}
              {/* </Pressable> */}
            </Animated.View>
            {data % 2 !== 0 && data.length - 1 === index && (
              <View style={{width: layout.width / 2.3}} />
            )}
          </>
        )}
        showsVerticalScrollIndicator={false}
        style={{
          backgroundColor: '#eef2f9',
          //backgroundColor: theme.colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginVertical: 10,
        }}
      />
    </SafeAreaView>
  );
}
