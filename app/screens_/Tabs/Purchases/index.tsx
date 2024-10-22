// * React
import {useRef, useState} from 'react';

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
import {Avatar, Badge, useTheme} from 'react-native-paper';
import {RFPercentage as s} from 'react-native-responsive-fontsize';
import {SafeAreaView} from 'react-native-safe-area-context';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

// * JS Libraries
import {useInfiniteQuery, useQueryClient} from '@tanstack/react-query';
import dayjs from 'dayjs';

// * Components
import Add from './Add';
import DrawerIcon from '../../../components/DrawerIcon';
import EmptyRecords from '../../../components/EmptyRecords';
import Filter from '../../../components/Filter';
import TextX from '../../../components/TextX';

// * Utilities
import {signaturesURL, useConfigStore, useFilterStore} from '../../../store';
import {bottomSheetProps} from '../../../utils';

export default function Purchases({navigation}: {navigation: any}) {
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
      ['purchases'],
      ({pageParam = 0}) =>
        axios.get(
          `purchases/?page=${pageParam}&limit=${limit}&from=${from}&to=${to}`,
        ),
      {
        getNextPageParam: (lastPage, allPages) => {
          const maxPages = Math.floor(lastPage.data.grossCount / limit);
          const nextPage = allPages.length;
          return nextPage <= maxPages ? nextPage : undefined;
        },
      },
    );

  // ? Refs
  const filterRef = useRef<Modalize>();

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={{backgroundColor: theme.colors.primary, flex: 1}}>
      <BigList
        data={data?.pages.map(page => page.data.purchases).flat()}
        footerHeight={isFetchingNextPage ? 80 : 0}
        headerHeight={layout.height * 0.455}
        itemHeight={85}
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
              context="purchases"
              reload={() => queryClient.refetchQueries(['purchases'])}
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
              <DrawerIcon top={40} />
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
                Purchases
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
                {data?.pages[0].data.grossCount || 0} Purchase
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
                    navigation.navigate('Add Purchase');
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
                <View style={{flex: 0.6}}>
                  <TextX
                    bold
                    color={theme.colors.primary}
                    font="Laila-Bold"
                    scale={2.2}>
                    Item
                  </TextX>
                </View>
                <View style={{flex: 0.1, alignItems: 'flex-end'}}>
                  <TextX
                    bold
                    color={theme.colors.primary}
                    font="Laila-Bold"
                    scale={2.2}>
                    Qty
                  </TextX>
                </View>
                <View style={{flex: 0.3, alignItems: 'flex-end'}}>
                  <TextX
                    bold
                    color={theme.colors.primary}
                    font="Laila-Bold"
                    scale={2.2}>
                    Amount
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
        renderItem={({item}) => (
          <View
            style={{
              borderRadius: 20,
              flexDirection: 'row',
              paddingHorizontal: 10,
              paddingVertical: 10,
              width: layout.width,
            }}>
            <View style={{flex: 0.5, justifyContent: 'center'}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Avatar.Text
                  label={item.item.charAt(0)}
                  size={48}
                  style={{backgroundColor: theme.colors.secondary}}
                />
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
                          textDecorationLine: !item.paid ? 'underline' : 'none',
                        }}>
                        {item.item}
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
                    {`${item.purchased?.on} by ${item.purchased?.by}`}
                  </TextX>
                </View>
              </View>
            </View>
            <View
              style={{
                flex: 0.2,
                alignItems: 'flex-start',
                justifyContent: 'center',
              }}>
              <Badge
                size={30}
                style={{backgroundColor: theme.colors.secondary}}>
                {item.qty}
              </Badge>
            </View>
            <View
              style={{
                flex: 0.3,
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}>
              <TextX currency numberOfLines={1} scale={2.5}>
                {item.price}
              </TextX>
              <TextX bold currency font="Laila-Bold" scale={1.9}>
                {item.qty * item.price}
              </TextX>
            </View>
          </View>
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
          apiRoute="purchases"
        />
      </Modalize>
    </SafeAreaView>
  );
}
