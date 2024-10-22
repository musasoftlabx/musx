// * React
import {useEffect, useState} from 'react';

// * React Native
import {Platform, useWindowDimensions, View} from 'react-native';

// * React Native Libraries
import {FlatList, RefreshControl} from 'react-native-gesture-handler';
import {Avatar, Text, useTheme} from 'react-native-paper';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {RFPercentage as s} from 'react-native-responsive-fontsize';
import {SafeAreaView} from 'react-native-safe-area-context';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

// * JS Libraries
import {Motion} from '@legendapp/motion';
import {useQuery, useQueryClient} from '@tanstack/react-query';

// * Components
import EmptyRecords from '../../components/EmptyRecords';
import {NeuButton, NeuInput} from '../../components/Neumorphism';

// * Utilities
import {photoURL, useConfigStore} from '../../store';

// * Assets
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Staff({navigation}: {navigation: any}) {
  // ? useHooks
  const axios = useConfigStore(state => state.axios);
  const theme = useTheme();
  const queryClient = useQueryClient();
  const layout = useWindowDimensions();

  // ? useState
  const [filtered, setFiltered] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [staff, setStaff] = useState<any>([]);

  const {data, isFetching, isFetched} = useQuery(
    ['staff'],
    ({queryKey}) => axios.get(queryKey[0]),
    {select: data => data.data.rows},
  );

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
        height: layout.height * 1.1,
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
          marginBottom: 5,
        }}>
        Staff
      </Motion.Text>

      <Motion.Text
        animate={{x: 0, y: 0}}
        initial={{y: -50}}
        transition={{type: 'spring', damping: 20, stiffness: 400}}
        style={{
          alignSelf: 'center',
          color: '#fff9c4',
          fontFamily: 'Laila',
          fontSize: s(2.3),
          marginBottom: 30,
        }}>
        {staff?.length} staff in total
      </Motion.Text>

      <NeuInput
        color="#6d4c41"
        convex
        onChangeText={setSearch}
        placeholder="Search by staff's name"
        prefix={<Ionicons name="ios-search-outline" size={24} color="#fff" />}
        style={{alignSelf: 'center', marginBottom: 30}}
        textStyle={{color: '#fff', fontFamily: 'Laila'}}
        width={layout.width / 1.2}
        height={40}
        value={search}
      />

      <FlatList
        data={search.length > 0 ? filtered : staff}
        columnWrapperStyle={{
          justifyContent: 'space-evenly',
          marginBottom: 20,
        }}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: layout.height / 5,
        }}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          isFetching ? (
            <>
              {new Array(8).fill(0).map((_, key) => (
                <SkeletonPlaceholder key={key}>
                  <SkeletonPlaceholder.Item
                    key={key}
                    marginBottom={20}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-evenly',
                    }}
                    width={layout.width}
                    height={180}>
                    <SkeletonPlaceholder.Item
                      borderRadius={20}
                      width={layout.width * 0.42}
                    />
                    <SkeletonPlaceholder.Item
                      borderRadius={20}
                      width={layout.width * 0.42}
                    />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder>
              ))}
            </>
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
              <NeuButton
                borderRadius={16}
                color="#eef2f9"
                concave
                containerStyle={{paddingVertical: 20}}
                onPress={() =>
                  navigation.navigate('Staff Details', {
                    _id: item._id,
                    firstName: item.firstName,
                    lastName: item.lastName,
                    username: item.username,
                    emailAddress: item.emailAddress,
                    phoneNumber: item.phoneNumber,
                    role: item.role,
                    permanent: item.permanent,
                    photo: item.photo,
                  })
                }
                height={180}
                width={layout.width / 2.3}>
                <Avatar.Image size={60} source={{uri: photoURL + item.photo}} />
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 10,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: '#4e342e90',
                      fontFamily: 'Laila-Bold',
                      fontSize: s(2.5),
                      fontWeight: Platform.OS === 'ios' ? 'bold' : '500',
                    }}>
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
            </Animated.View>
            {data % 2 !== 0 && data.length - 1 === index && (
              <View style={{width: layout.width / 2.3}} />
            )}
          </>
        )}
        showsVerticalScrollIndicator={false}
        style={{
          backgroundColor: '#eef2f9',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginVertical: 10,
        }}
      />
    </SafeAreaView>
  );
}
