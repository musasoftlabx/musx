// * React
import {useEffect, useState} from 'react';

// * React Native
import {Alert, useWindowDimensions, Vibration, View} from 'react-native';

// * React Native Libraries
import {FlatList, RefreshControl} from 'react-native-gesture-handler';
import {Avatar, Text, TextInput, useTheme} from 'react-native-paper';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {RFPercentage as s} from 'react-native-responsive-fontsize';
import {SafeAreaView} from 'react-native-safe-area-context';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

// * JS Libraries
import {Motion} from '@legendapp/motion';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

// * Components
import EmptyRecords from '../../components/EmptyRecords';
import {NeuButton, NeuInput, NeuView} from '../../components/Neumorphism';
import TextX from '../../components/TextX';

// * Utilities
import {menuURL, useConfigStore} from '../../store';

// * Assets
import Ionicons from 'react-native-vector-icons/Ionicons';
import {styles} from '../../styles';

export default function Menu({navigation}: {navigation: any; route: any}) {
  // ? useHooks
  const axios = useConfigStore(state => state.axios);
  const theme = useTheme();
  const queryClient = useQueryClient();
  const layout = useWindowDimensions();

  // ? useState
  const [filtered, setFiltered] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [menu, setMenu] = useState<any>([]);

  const {data, isFetching, isFetched} = useQuery(
    ['menu'],
    ({queryKey}) => axios.get(queryKey[0]),
    {select: data => data.data},
  );

  const {mutate: remove} = useMutation(id => axios.delete(`menu/${id}`));

  useEffect(() => setMenu(data), [data]);

  useEffect(
    () =>
      setFiltered(
        menu.filter(
          (one: any) =>
            one.item.toLowerCase().indexOf(search.toLowerCase()) > -1 && one,
        ),
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
        Menu
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
        {menu?.length} items in total
      </Motion.Text>

      <TextInput
        label="Search"
        placeholder="By item"
        activeUnderlineColor={theme.colors.secondary}
        left={<TextInput.Icon icon="magnify" />}
        right={
          search.length > 0 && (
            <TextInput.Icon icon="close" onPress={() => setSearch('')} />
          )
        }
        maxLength={20}
        onChangeText={setSearch}
        style={[styles.textInput, {marginHorizontal: 20}]}
        value={search}
      />

      {/*  <NeuInput
        color="#6d4c41"
        convex
        onChangeText={setSearch}
        placeholder="Search by item"
        prefix={<Ionicons name="ios-search-outline" size={24} color="#fff" />}
        style={{alignSelf: 'center', marginBottom: 30}}
        textStyle={{color: '#fff', fontFamily: 'Laila'}}
        width={layout.width / 1.2}
        height={40}
        value={search}
      /> */}

      <FlatList
        data={search.length > 0 ? filtered : menu}
        contentContainerStyle={{paddingTop: 20, paddingHorizontal: 20}}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          isFetching ? (
            <>
              {new Array(6).fill(0).map((_, key) => (
                <SkeletonPlaceholder key={key}>
                  <SkeletonPlaceholder.Item
                    borderRadius={20}
                    height={110}
                    marginBottom={20}
                    width={layout.width * 0.9}
                  />
                </SkeletonPlaceholder>
              ))}
            </>
          ) : (
            <EmptyRecords
              context="items"
              reload={() => queryClient.refetchQueries(['menu'])}
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => {
                queryClient.refetchQueries(['menu']);
                setRefreshing(false);
              }, 1000);
            }}
          />
        }
        renderItem={({item, index}) => (
          <Animated.View
            key={index}
            entering={FadeIn.duration(1000)}
            exiting={FadeOut.duration(1000)}>
            <NeuButton
              borderRadius={16}
              color="#eef2f9"
              concave
              containerStyle={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                paddingHorizontal: 20,
              }}
              customGradient={item.inStock ? false : ['#ffcdd2', '#ffebee']}
              onPress={() => navigation.navigate('Menu Details', item)}
              onLongPress={() => {
                Vibration.vibrate(50);
                Alert.alert(
                  'Delete item',
                  `This will delete ${item.item}. Proceed?`,
                  [
                    {text: 'CANCEL'},
                    {
                      text: 'OK',
                      onPress: () =>
                        remove(item._id, {
                          onSuccess() {
                            setMenu((prev: any) => [
                              ...prev.filter(
                                (i: any) => i._id !== item._id && i,
                              ),
                            ]);
                          },
                        }),
                    },
                  ],
                );
              }}
              style={{marginBottom: 20}}
              width={layout.width * 0.895}>
              <NeuView borderRadius={10} color="#eef2f9" height={65} width={65}>
                <Avatar.Image
                  size={60}
                  source={{uri: menuURL + item.images[0]}}
                  style={{borderRadius: 10}}
                />
              </NeuView>

              <View style={{paddingLeft: 15}}>
                <TextX
                  bold
                  color="#4e342e90"
                  font="Laila-Bold"
                  numberOfLines={1}
                  scale={2.1}>
                  {item.item}
                </TextX>
                <TextX numberOfLines={1} opacity={0.9} scale={2}>
                  {item.department}
                </TextX>
                {!item.inStock && (
                  <TextX
                    font="Abel"
                    numberOfLines={1}
                    scale={1.8}
                    style={{marginTop: 3, letterSpacing: 1.7}}>
                    OUT OF STOCK
                  </TextX>
                )}
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                }}>
                {item.price.sales ? (
                  <>
                    <TextX
                      currency
                      font="Abel"
                      scale={2.2}
                      style={{textDecorationLine: 'line-through'}}>
                      {item.price.marked}
                    </TextX>
                    <TextX currency font="Abel" scale={2.6}>
                      {item.price.sales}
                    </TextX>
                  </>
                ) : (
                  <TextX currency font="Abel" scale={2.6}>
                    {item.price.marked}
                  </TextX>
                )}
              </View>
            </NeuButton>
          </Animated.View>
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
