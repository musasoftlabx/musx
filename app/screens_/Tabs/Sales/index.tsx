import {
  Alert,
  Animated,
  Image,
  Platform,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
  Vibration,
  View,
} from 'react-native';

// * React Native Libraries
import {BarChart, LineChart} from 'react-native-gifted-charts';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {Avatar, Badge, Chip, Text, useTheme} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RFPercentage as s} from 'react-native-responsive-fontsize';
import {bottomSheetProps, deviceHeight, deviceWidth} from '../../../utils';
//import * as Animatable from 'react-native-animatable';
import {Motion} from '@legendapp/motion';
import {SharedElement} from 'react-navigation-shared-element';
import GradientText from '../../../components/GradientText';
//import {Shadow} from 'react-native-shadow-2';
import DropShadow from 'react-native-drop-shadow';
import BigList from 'react-native-big-list';
//import BottomSheet from 'reanimated-bottom-sheet';
import {Modalize} from 'react-native-modalize';

import Sheet from '../../../components/BottomSheet';
import {useEffect, useRef, useState} from 'react';

// * Components
import Add from './Add';
import DrawerIcon from '../../../components/DrawerIcon';
import EmptyRecords from '../../../components/EmptyRecords';
import TextX from '../../../components/TextX';
import Icon from 'react-native-vector-icons/Ionicons';

import _404 from '../../../assets/images/404.png';
import restaurant from '../../../assets/images/restaurant0.png';

import LinearGradient from 'react-native-linear-gradient';
import {maxBy} from 'lodash';

import {AnimatedCircularProgress} from 'react-native-circular-progress';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useQuery} from '@tanstack/react-query';

// * Utilities
import {signaturesURL, useConfigStore, useFilterStore} from '../../../store';
import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
dayjs.extend(tz);
dayjs.tz.setDefault('Africa/Nairobi');

const Sales = ({navigation}: {navigation: any}) => {
  const theme = useTheme();
  const [operation, setOperation] = useState('FILTER');
  const layout = useWindowDimensions();
  const axios = useConfigStore(state => state.axios);
  const {data, isFetching, isFetched} = useQuery(
    ['sales'],
    ({queryKey}) => axios.get(queryKey[0]),
    {select: data => data.data},
  );

  const departments = [
    {
      department: 'Restaurant',
      gradient: ['#795548', '#827717'],
      barColor: '#827717',
      data: data?.daily.map((item: any) => ({value: item.restaurant.bill})),
      onPress: (data: any) => navigation.navigate('Department Sales', data),
    },
    {
      department: 'Bar',
      gradient: ['#795548', '#7e57c2'],
      barColor: '#ba68c8',
      data: data?.daily.map(({bar: {bill}}: any) => ({value: bill})),
      onPress: (data: any) => navigation.navigate('Department Sales', data),
    },
    {
      department: 'Accomodation',
      gradient: ['#795548', '#009688'],
      barColor: '#009688',
      data: data?.daily.map((item: any) => ({value: item.accomodation.bill})),
      onPress: (data: any) => navigation.navigate('Department Sales', data),
    },
    {
      department: 'Delivery',
      gradient: ['#795548', '#9e9e9e'],
      barColor: '#9e9e9e',
      data: data?.daily.map((item: any) => ({value: item.delivery.bill})),
      onPress: (data: any) => navigation.navigate('Department Sales', data),
    },
  ];

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTintColor: 'red',
    });
  }, []);

  return (
    <ScrollView
      scrollEventThrottle={46}
      style={{flex: 1, backgroundColor: theme.colors.primary}}>
      <View
        style={{
          alignItems: 'center',
          borderBottomEndRadius: 40,
          justifyContent: 'center',
          marginTop: 50,
          paddingHorizontal: 20,
        }}>
        <DrawerIcon />
        <Motion.Text
          initial={{y: -50}}
          animate={{x: 0, y: 0}}
          transition={{type: 'spring', damping: 17}}
          style={{
            color: theme.colors.background,
            fontFamily: 'Montez',
            fontSize: s(6),
          }}>
          Sales
        </Motion.Text>
      </View>

      <View style={{marginTop: -10, marginBottom: 20}}>
        <FlatList
          data={departments}
          horizontal
          renderItem={({item}) => (
            <LinearGradient
              colors={item.gradient}
              angle={45}
              useAngle={true}
              style={{
                borderRadius: 20,
                flexDirection: 'row',
                marginHorizontal: 10,
                paddingLeft: 20,
                paddingVertical: 10,
                width: deviceWidth * 0.8,
                overflow: 'hidden',
              }}>
              <TouchableOpacity onPress={() => item.onPress(item)}>
                <View
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    marginLeft: 10,
                  }}>
                  <View style={{flex: 0.26, marginTop: 10}}>
                    <View style={{alignItems: 'center', flexDirection: 'row'}}>
                      <TextX color="white" scale={2.2}>
                        {item.department} sales
                      </TextX>
                      <View
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, .2)',
                          borderRadius: 5,
                          paddingHorizontal: 5,
                          marginLeft: 10,
                        }}>
                        <TextX
                          bold
                          color="yellow"
                          font="Laila-Bold"
                          scale={1.6}>
                          {dayjs().isSame(data?.daily[0]._id, 'day')
                            ? 'today'
                            : `on ${dayjs(data?.daily[0]._id).format(
                                'DD.MMM.YY',
                              )}`}
                        </TextX>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 3,
                        justifyContent: 'space-between',
                      }}>
                      <TextX color="#fff" currency font="Rubik" scale={4}>
                        {data?.daily[0][item.department.toLowerCase()].bill}
                      </TextX>
                      <View
                        style={{alignItems: 'center', flexDirection: 'row'}}>
                        <Icon
                          color={
                            data?.daily[0][item.department.toLowerCase()].bill >
                            data?.daily[1][item.department.toLowerCase()].bill
                              ? '#76ff03'
                              : '#f48fb1'
                          }
                          name={
                            data?.daily[0][item.department.toLowerCase()].bill >
                            data?.daily[1][item.department.toLowerCase()].bill
                              ? 'caret-up'
                              : 'caret-down'
                          }
                          size={24}
                        />
                        <TextX currency color="#fff" font="Rubik">
                          {Math.abs(
                            data?.daily[0][item.department.toLowerCase()].bill -
                              data?.daily[1][item.department.toLowerCase()]
                                .bill,
                          )}
                        </TextX>
                      </View>
                    </View>
                    <View style={{marginTop: 4, marginBottom: -3}}>
                      <TextX bold color="#c6ff00" font="Laila-Bold">
                        {data?.daily[0][item.department.toLowerCase()].guests}{' '}
                        guest
                        {data?.daily[0][item.department.toLowerCase()]
                          .guests === 1
                          ? ''
                          : 's'}
                      </TextX>
                    </View>
                  </View>
                </View>

                <View style={{marginLeft: -56, marginBottom: -48}}>
                  <LineChart
                    /* animateOnDataChange
                    onDataChangeAnimationDuration={1200} */
                    thickness={0}
                    color="transparent"
                    hideDataPoints={true}
                    hideRules={true}
                    hideXAxisText={true}
                    hideYAxisText={false}
                    showVerticalLines={false}
                    verticalLinesColor="rgba(14,164,164,0.5)"
                    //maxValue={1500}
                    //noOfSections={3}
                    areaChart={true}
                    /* isAnimated
                    animationDuration={1200} */
                    yAxisTextStyle={{color: 'lightgray'}}
                    //@ts-ignore
                    data={item.data}
                    curved
                    gradientDirection="horizontal"
                    startFillColor="#dfe9f3"
                    endFillColor="#ffffff"
                    startOpacity={0.4}
                    endOpacity={0.8}
                    initialSpacing={10}
                    //spacing={deviceWidth * 0.101}
                    spacing={deviceWidth * 0.0802}
                    adjustToWidth
                    rulesColor="gray"
                    rulesType="solid"
                    xAxisColor="lightgray"
                    yAxisColor="lightgray"
                    xAxisThickness={0}
                    yAxisThickness={0}
                    dataPointsHeight={20}
                    dataPointsWidth={20}
                    showXAxisIndices={false}
                    showYAxisIndices={false}
                    rotateLabel={false}
                    hideOrigin={true}
                    pressEnabled={true}
                    showDataPointOnPress={true}
                    showStripOnPress={true}
                    showTextOnPress={true}
                    height={50}
                  />
                </View>
              </TouchableOpacity>
            </LinearGradient>
          )}
          contentContainerStyle={{paddingTop: 20}}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View
        style={{
          backgroundColor: theme.colors.background,
          borderTopStartRadius: 30,
          borderTopEndRadius: 30,
          paddingBottom: 50,
          paddingLeft: 10,
          paddingTop: 5,
        }}>
        <TextX
          color="#827717"
          mr={10}
          mt={5}
          //opacity={0.4}
          scale={2.2}
          style={{alignSelf: 'center', textDecorationLine: 'underline'}}>
          Cumulative monthly sales
        </TextX>
        <Motion.FlatList
          initial={{x: deviceWidth / 2}}
          animate={{x: 0, y: 0}}
          transition={{type: 'spring', damping: 10}}
          data={data?.monthly}
          horizontal
          renderItem={({item, index}: any) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => item.onPress(item)}>
              <View
                style={{
                  backgroundColor: index === 0 ? '#d7ccc8' : '#f5f5f5',
                  borderColor: '#d7ccc8',
                  borderRadius: 10,
                  borderStyle: 'dashed',
                  borderWidth: 1,
                  marginHorizontal: 12,
                  paddingHorizontal: 15,
                  paddingVertical: 5,
                }}>
                <TextX font="Abel" scale={2}>
                  {item.month}
                </TextX>
                <TextX
                  bold
                  color="#8d6e63"
                  currency
                  font="Laila-Bold"
                  scale={2.5}>
                  {item.total}
                </TextX>
              </View>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          style={{height: 85, marginTop: 10}}
        />
        {/* <Motion.FlatList
          initial={{x: layout.width / 2}}
          animate={{x: 0, y: 0}}
          transition={{type: 'spring', damping: 10}}
          data={[
            {
              icon: 'plus',
              onPress: () => (
                Vibration.vibrate(50), modalizeRef.current?.open()
              ),
            },
            {
              icon: 'filter',
              onPress: () => (
                setOperation('FILTER'),
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
        /> */}
        <View>
          <TextX
            color={theme.colors.primary}
            font="Abel"
            opacity={0.7}
            scale={3.1}
            style={{textAlign: 'center'}}>
            Monthly departmental sales
          </TextX>

          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              marginTop: 14,
            }}>
            {departments.map((item, key) => (
              <View
                key={key}
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  marginBottom: 10,
                  paddingHorizontal: 20,
                }}>
                <View
                  style={{
                    height: 12,
                    width: 12,
                    borderRadius: 6,
                    backgroundColor: item.barColor,
                    marginRight: 8,
                  }}
                />
                <TextX>{item.department}</TextX>
              </View>
            ))}
          </View>
        </View>

        <BarChart
          data={data?.barGraphData}
          barWidth={12}
          spacing={24}
          roundedTop
          roundedBottom
          isThreeD={false}
          //hideRules
          isAnimated
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{color: 'gray', fontFamily: 'Abel', marginRight: -15}}
          noOfSections={3}
          height={deviceHeight / 5}
          //maxValue={Number(maxBy(data?.barGraphData, 'value'))}
          renderTooltip={(item: {value: number}, key: number) => {
            return (
              <View
                key={key}
                style={{
                  marginBottom: 20,
                  marginLeft: -6,
                  backgroundColor: '#ffcefe',
                  paddingHorizontal: 6,
                  paddingVertical: 4,
                  borderRadius: 4,
                }}>
                <Text>{item.value}</Text>
              </View>
            );
          }}
        />
      </View>
    </ScrollView>
  );
};

export default Sales;
