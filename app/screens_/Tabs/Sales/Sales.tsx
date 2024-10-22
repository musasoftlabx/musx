// * React
import {useEffect, useRef, useState} from 'react';

// * React Native
import {
  ActivityIndicator,
  Platform,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
  Vibration,
  View,
} from 'react-native';

// * React Native Libraries
import {Motion} from '@legendapp/motion';
import BigList from 'react-native-big-list';
import FileViewer from 'react-native-file-viewer';
import * as RNFS from 'react-native-fs';
import {RefreshControl} from 'react-native-gesture-handler';
import {Modalize} from 'react-native-modalize';
import {Avatar, useTheme} from 'react-native-paper';
import RNPrint from 'react-native-print';
import {RFPercentage as s} from 'react-native-responsive-fontsize';
import {SafeAreaView} from 'react-native-safe-area-context';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

// * JS Libraries
import {useInfiniteQuery, useQueryClient} from '@tanstack/react-query';
import dayjs from 'dayjs';

// * Components
import EmptyRecords from '../../../components/EmptyRecords';
import Filter from '../../../components/Filter';
import TextX from '../../../components/TextX';

// * Utilities
import {signaturesURL, useConfigStore, useFilterStore} from '../../../store';
import {bottomSheetProps} from '../../../utils';

const Sales = ({navigation, route}: {navigation: any; route: any}) => {
  // ? Params
  const {department} = route.params;

  // ? States
  const [limit] = useState(6);
  const [operation, setOperation] = useState('FILTER');
  const [refreshing, setRefreshing] = useState(false);

  // ? Hooks
  const from = useFilterStore(state => state.from);
  const to = useFilterStore(state => state.to);
  const axios = useConfigStore(state => state.axios);
  const queryClient = useQueryClient();
  const theme = useTheme();
  const layout = useWindowDimensions();
  const {data, status, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteQuery(
      ['daily_sales'],
      ({pageParam = 0}) =>
        axios.get(
          `sales/filter/?page=${pageParam}&limit=${limit}&from=${from}&to=${to}&department=${department}`,
          //`sales/filter/?page=${pageParam}&limit=${limit}&from=${'2023-01-29'}&to=${'2023-01-29'}&department=${department}`,
        ),
      {
        getNextPageParam: (lastPage, allPages) => {
          const maxPages = Math.floor(lastPage.data.grossCount / limit);
          const nextPage = allPages.length;
          return nextPage <= maxPages ? nextPage : undefined;
        },
      },
    );

  useEffect(() => {
    navigation.setOptions({
      // headerShown: true,
      // headerStyle: {backgroundColor: theme.colors.primary, height: 80},
    });
  }, []);

  // ? Refs
  const filterRef = useRef<Modalize>();

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={{backgroundColor: theme.colors.primary, flex: 1}}>
      <BigList
        data={data?.pages.map(page => page.data.sales).flat()}
        footerHeight={isFetchingNextPage ? 80 : 0}
        headerHeight={layout.height * 0.455}
        itemHeight={(section, index) => {
          const itemsInSale =
            index !== undefined &&
            data?.pages.map(page => page.data.sales).flat()[index].items.length;
          return 138 + 33 * itemsInSale;
          //return 166 + 20 * itemsInSale;
        }}
        hideFooterOnEmpty={false}
        keyExtractor={item => item._id}
        onEndReached={() => hasNextPage && fetchNextPage()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => {
                queryClient.invalidateQueries(['purchases']);
                setRefreshing(false);
              }, 1000);
            }}
            colors={[theme.colors.primary]}
            title="Refresh..."
            tintColor={theme.colors.primary}
            titleColor={theme.colors.primary}
          />
        }
        renderEmpty={() => {
          if (status === 'loading') {
            const count = Math.ceil(layout.height / 2.5 / 70);
            return new Array(count).fill(0).map((_, key) => (
              <SkeletonPlaceholder
                backgroundColor={theme.colors.tertiary}
                highlightColor="#fff"
                key={key}>
                <View
                  style={{
                    alignItems: 'center',
                    marginHorizontal: 10,
                    paddingVertical: 10,
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <View style={{borderRadius: 50, height: 60, width: 60}} />
                    <View style={{justifyContent: 'center', marginLeft: 10}}>
                      {[15, 10, 7].map((e, i) => (
                        <View
                          key={e}
                          style={{
                            borderRadius: 10,
                            height: e,
                            marginVertical: i === 1 ? 5 : 0,
                            width: layout.width * 0.75,
                          }}
                        />
                      ))}
                    </View>
                  </View>
                </View>
              </SkeletonPlaceholder>
            ));
          }
          return (
            <EmptyRecords
              context="sales"
              reload={() => queryClient.refetchQueries(['sales'])}
            />
          );
        }}
        renderHeader={() => (
          <View style={{backgroundColor: theme.colors.background}}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: theme.colors.primary,
                borderBottomEndRadius: 40,
                height: layout.height * 0.25,
                justifyContent: 'center',
              }}>
              <Motion.Text
                initial={{y: -50}}
                animate={{x: 0, y: 0}}
                transition={{type: 'spring', damping: 17}}
                style={{
                  color: 'white',
                  fontFamily: 'Montez',
                  fontSize: s(6),
                  marginTop: -20,
                }}>
                {department}
              </Motion.Text>
            </View>

            <Motion.View
              initial={{y: -50}}
              animate={{x: 0, y: 0}}
              transition={{type: 'spring', damping: 17}}
              style={{
                alignSelf: 'center',
                backgroundColor: 'white',
                borderRadius: 5,
                marginTop: -60,
                opacity: 0.25,
                paddingVertical: 20,
                width: layout.width * 0.7,
              }}
            />

            <Motion.View
              initial={{y: -50}}
              animate={{x: 0, y: 0}}
              transition={{type: 'spring', damping: 17}}
              style={{
                alignSelf: 'center',
                backgroundColor: 'white',
                borderRadius: 5,
                marginTop: -30,
                opacity: 0.5,
                paddingVertical: 20,
                width: layout.width * 0.75,
              }}
            />

            <Motion.View
              initial={{y: -50}}
              animate={{x: 0, y: 0}}
              transition={{type: 'spring', damping: 10}}
              style={{
                alignSelf: 'center',
                backgroundColor: theme.colors.background,
                borderRadius: 5,
                marginTop: -30,
                paddingHorizontal: 20,
                paddingTop: 20,
                width: layout.width * 0.8,
              }}>
              <TextX scale={2} numberOfLines={1}>
                {data?.pages[0].data.grossCount || 0} Sale
                {data?.pages[0].data.grossCount > 1 && 's'}{' '}
                {to !== from ? 'from' : 'on'} {dayjs(from).format('DD.MM.YY')}
                {to !== from && ` to ${dayjs(to).format('DD.MM.YY')}`}
              </TextX>
              <TextX
                color={theme.colors.secondary}
                currency
                scale={4}
                style={{marginTop: -2}}>
                {data?.pages[0].data.grossTotal || 0}
              </TextX>
            </Motion.View>

            <Motion.FlatList
              initial={{x: layout.width / 2}}
              animate={{x: 0, y: 0}}
              transition={{type: 'spring', damping: 10}}
              data={[
                {
                  icon: 'plus',
                  onPress: () => {
                    Vibration.vibrate(50);
                    navigation.navigate('Add Sale', department);
                  },
                },
                {
                  icon: 'filter',
                  onPress: () => (
                    setOperation('FILTER'),
                    Vibration.vibrate(50),
                    filterRef.current?.open()
                  ),
                },
                {
                  icon: 'microsoft-excel',
                  onPress: () => (
                    setOperation('EXPORT'),
                    Vibration.vibrate(50),
                    filterRef.current?.open()
                  ),
                },
              ]}
              horizontal
              renderItem={({item}: {item: any}) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => item.onPress(item)}>
                  <View
                    style={{
                      borderColor: theme.colors.secondary,
                      borderRadius: 50,
                      borderWidth: 2,
                      marginHorizontal: 16,
                      padding: 2,
                    }}>
                    <Avatar.Icon
                      size={50}
                      icon={item.icon}
                      style={{
                        backgroundColor: theme.colors.secondary,
                      }}
                    />
                  </View>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              style={{marginTop: 15, marginBottom: 20}}
            />

            {data?.pages[0].data.grossCount > 0 && (
              <View
                style={{
                  borderBottomWidth: Platform.OS !== 'ios' ? 2 : 0.5,
                  borderBottomColor: '#d0d0d0',
                  borderStyle: Platform.OS !== 'ios' ? 'dashed' : 'solid',
                  flexDirection: 'row',
                  marginHorizontal: 10,
                  paddingHorizontal: 5,
                  paddingBottom: 3,
                }}>
                <View style={{flex: 0.7}}>
                  <TextX
                    bold
                    color={theme.colors.primary}
                    font="Laila-Bold"
                    scale={2.2}>
                    Sale
                  </TextX>
                </View>
                <View style={{flex: 0.3, alignItems: 'flex-end'}}>
                  <TextX
                    bold
                    color={theme.colors.primary}
                    font="Laila-Bold"
                    scale={2.2}>
                    Gross
                  </TextX>
                </View>
              </View>
            )}
          </View>
        )}
        renderFooter={() =>
          isFetchingNextPage ? (
            <View style={{alignItems: 'center', marginTop: 10}}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <View />
          )
        }
        renderItem={({item, index}) => (
          <Pressable
            onLongPress={async () =>
              await RNPrint.print({
                filePath: 'https://graduateland.com/api/v2/users/jesper/cv',
              })
            }>
            <View
              style={{
                borderBottomWidth: 5,
                borderColor: '#e0e0e0',
                paddingHorizontal: 10,
                width: layout.width,
              }}>
              <View style={{flexDirection: 'row'}}>
                <View style={{flex: 0.7, justifyContent: 'center'}}>
                  <View
                    style={{
                      alignItems: 'center',
                      flexDirection: 'row',
                      paddingTop: 8,
                    }}>
                    <View
                      style={{
                        alignItems: 'center',
                        backgroundColor: theme.colors.secondary,
                        borderRadius: 60,
                        height: 60,
                        justifyContent: 'center',
                        width: 60,
                      }}>
                      <TextX
                        bold
                        color="#fff"
                        font="Laila-Bold"
                        mt={-5}
                        scale={3}>
                        {item.guests}
                      </TextX>
                      <TextX bold color="#fff" mt={-10} scale={1.5}>
                        guest{item.guests === 1 ? '' : 's'}
                      </TextX>
                    </View>
                    <View style={{marginLeft: 10}}>
                      <View style={{flexDirection: 'row'}}>
                        {!item.paid && (
                          <View
                            style={{
                              backgroundColor: '#fff9c4',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 10,
                              borderWidth: 0.3,
                              marginRight: 5,
                              paddingHorizontal: 5,
                            }}>
                            <TextX color="#000" scale={1.2}>
                              INVOICED
                            </TextX>
                          </View>
                        )}
                        <Pressable
                          onPress={() => {
                            const path =
                              RNFS.DocumentDirectoryPath + '/signature.png';
                            item.signature &&
                              RNFS.downloadFile({
                                fromUrl: signaturesURL + item.signature,
                                toFile: path,
                              }).promise.then(() => {
                                Vibration.vibrate(50);
                                FileViewer.open(path);
                              });
                          }}>
                          <TextX
                            numberOfLines={3}
                            scale={2.5}
                            style={{
                              textDecorationLine: !item.paid
                                ? 'underline'
                                : 'none',
                            }}>
                            Sale ID: {item._id.substr(-6)}
                          </TextX>
                        </Pressable>
                      </View>
                      <TextX
                        bold
                        color={theme.colors.primary}
                        font="Laila-Bold"
                        numberOfLines={3}
                        opacity={0.6}
                        scale={2}>
                        {item.department}
                      </TextX>
                      <TextX
                        numberOfLines={1}
                        opacity={0.7}
                        scale={1.8}
                        style={{marginBottom: 2}}>
                        {`${item.billed?.on}`}
                      </TextX>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flex: 0.35,
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}>
                  <TextX currency numberOfLines={1} scale={2.5}>
                    {item.bill}
                  </TextX>
                </View>
              </View>
              <View style={{marginTop: 15}}>
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#e0e0e0',
                    flexDirection: 'row',
                    marginHorizontal: 30,
                  }}>
                  <View style={{flex: 0.3}}>
                    <TextX bold font="Laila-Bold" numberOfLines={1} scale={1.9}>
                      Item
                    </TextX>
                  </View>
                  <View style={{alignItems: 'center', flex: 0.1}}>
                    <TextX bold font="Laila-Bold" scale={1.9}>
                      Qty
                    </TextX>
                  </View>
                  <View style={{alignItems: 'flex-end', flex: 0.3}}>
                    <TextX bold font="Laila-Bold" scale={1.9}>
                      Price
                    </TextX>
                  </View>
                  <View style={{alignItems: 'flex-end', flex: 0.3}}>
                    <TextX bold font="Laila-Bold" scale={1.9}>
                      Unit
                    </TextX>
                  </View>
                </View>
                <View style={{marginBottom: 5}}>
                  {item.items.map(
                    (
                      {
                        item,
                        qty,
                        price,
                      }: {item: string; qty: number; price: number},
                      key: number,
                    ) => (
                      <View
                        key={key}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginHorizontal: 30,
                          marginVertical: 5,
                        }}>
                        <View style={{flex: 0.3}}>
                          <TextX numberOfLines={1} scale={1.9}>
                            {item || 'Unknown'}
                          </TextX>
                        </View>
                        <View style={{alignItems: 'center', flex: 0.1}}>
                          <TextX scale={1.9}>{qty}</TextX>
                        </View>
                        <View style={{alignItems: 'flex-end', flex: 0.3}}>
                          <TextX currency numberOfLines={1} scale={1.9}>
                            {price}
                          </TextX>
                        </View>
                        <View style={{alignItems: 'flex-end', flex: 0.3}}>
                          <TextX
                            bold
                            color="#3e2723"
                            currency
                            font="Laila-Bold"
                            numberOfLines={1}
                            scale={1.9}
                            style={{color: '#827717'}}>
                            {qty * price}
                          </TextX>
                        </View>
                      </View>
                    ),
                  )}
                </View>
              </View>
            </View>
          </Pressable>
        )}
        stickyHeaderIndices={[0]}
        style={{backgroundColor: theme.colors.background}}
      />

      <Modalize
        ref={filterRef}
        adjustToContentHeight
        openAnimationConfig={bottomSheetProps}
        closeAnimationConfig={bottomSheetProps}>
        <Filter
          filterRef={filterRef}
          operation={operation}
          apiRoute="daily_sales"
        />
      </Modalize>
    </SafeAreaView>
  );
};

export default Sales;
