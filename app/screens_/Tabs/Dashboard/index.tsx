// * React Native
import {
  Image,
  SectionList,
  StatusBar,
  useWindowDimensions,
  View,
} from 'react-native';

// * React Native Libraries
import {LineChart, PieChart} from 'react-native-gifted-charts';
//import {LineChart} from 'react-native-chart-kit';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme, Text, DataTable, Avatar, Button} from 'react-native-paper';
import Svg, {Circle, Path} from 'react-native-svg';
import * as Animatable from 'react-native-animatable';
const AnimatedCircle = Animatable.createAnimatableComponent(Circle);

// * Components
import QuickStats from './QuickStats';

// * Utilities
import {useConfigStore} from '../../../store';
import {deviceHeight, deviceWidth} from '../../../utils';

// * Assets
import Chef from '../../../assets/images/chef.png';
import TextX, {GradientText} from '../../../components/TextX';
import {Motion} from '@legendapp/motion';
import LinearGradient from 'react-native-linear-gradient';
import {ShadowedView} from 'react-native-fast-shadow';
import DrawerIcon from '../../../components/DrawerIcon';

//import GradientText from '../../../components/GradientText';

const Dashboard = () => {
  const {firstName, lastName} = useConfigStore(state => state.user);
  const layout = useWindowDimensions();

  const theme = useTheme();

  const customDataPoint = () => {
    return (
      <View
        style={{
          backgroundColor: '#ffeb3b',
          borderColor: '#fff',
          borderRadius: 10,
          borderWidth: 3,
          height: 10,
          width: 3,
        }}
      />
    );
  };

  const customLabel = (val: any) => {
    return (
      <View style={{width: 70, marginLeft: 7}}>
        <Text style={{color: 'black', fontWeight: 'bold'}}>{val}</Text>
      </View>
    );
  };

  const data = [
    {
      value: 500,
      labelComponent: () => customLabel('22 Nov'),
      customDataPoint: customDataPoint,
    },
    {
      value: 140,
      hideDataPoint: true,
    },
    {
      value: 250,
      customDataPoint: customDataPoint,
    },
    {
      value: 290,
      hideDataPoint: true,
    },
    {
      value: 410,
      labelComponent: () => customLabel('24 Nov'),
      customDataPoint: customDataPoint,
      showStrip: true,
      stripHeight: 200,
      stripColor: '#ffeb3b',
      stripWidth: 1,
      dataPointLabelComponent: () => (
        <View
          style={{
            backgroundColor: '#ffeb3b',
            paddingHorizontal: 8,
            paddingVertical: 1,
            borderRadius: 4,
          }}>
          <Text style={{color: '#000'}}>410</Text>
        </View>
      ),
      dataPointLabelShiftY: -40,
      dataPointLabelShiftX: -4,
    },
    {
      value: 440,
      hideDataPoint: true,
    },
    {
      value: 300,
      customDataPoint: customDataPoint,
    },
    {
      value: 280,
      hideDataPoint: true,
    },
    {
      value: 180,
      labelComponent: () => customLabel('26 Nov'),
      customDataPoint: customDataPoint,
    },
    {
      value: 350,
      hideDataPoint: true,
    },
    {
      value: 550,
      customDataPoint: customDataPoint,
    },
  ];

  const pieData = [
    {value: 54, color: '#795548'},
    {value: 40, color: '#ffc107'},
    {value: 30, color: '#cddc39'},
    //{value: 20, color: '#ED6665', shiftX: -18, shiftY: -28},
  ];

  return (
    <SafeAreaView style={{backgroundColor: theme.colors.primary}}>
      <LinearGradient
        colors={[theme.colors.tertiary, theme.colors.primary]}
        angle={0}
        useAngle={true}>
        <SectionList
          sections={[
            //{title: '_', data: [1]},
            {title: 'Header', data: [1]},
            {title: 'Calendar', data: [1]},
            {title: 'Income & Outcome', data: [1]},
            {title: 'Breakdown', data: [1]},
            {title: 'Top Sold Items', data: [1]},
          ]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({section}) => {
            switch (section.title) {
              case 'Header':
                return (
                  <>
                    <DrawerIcon />
                    <View
                      style={{
                        flexDirection: 'row',
                        height: 160,
                        marginBottom: 50,
                        padding: 20,
                      }}>
                      <Svg
                        height="90%"
                        width="100%"
                        viewBox="0 0 1440 320"
                        style={{
                          display: 'none',
                          position: 'absolute',
                          top: 130,
                        }}>
                        <Path
                          fill={theme.colors.primary}
                          d="M0,96L48,112C96,128,192,160,288,186.7C384
                  ,213,480,235,576,213.3C672,192,768,128,864,
                  128C960,128,1056,192,1152,208C1248,224,1344,192,
                  1392,176L1440,160L1440,0L1392,0C1344,0,1248,0,
                  1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,
                  384,0,288,0C192,0,96,0,48,0L0,0Z"
                        />
                      </Svg>
                      <View style={{flex: 0.9, justifyContent: 'center'}}>
                        <TextX color="#fff" scale={3}>
                          Welcome back,
                        </TextX>
                        <TextX
                          color="#fed7aa"
                          font="Rubik"
                          numberOfLines={1}
                          scale={5}>
                          {firstName}
                        </TextX>
                        <TextX
                          color="#fed7aa"
                          font="Rubik"
                          ml={2}
                          mt={-5}
                          numberOfLines={1}
                          scale={2}
                          style={{letterSpacing: 3}}>
                          {lastName}
                        </TextX>
                      </View>

                      <View style={{flex: 1}}>
                        <Image
                          source={Chef}
                          style={{width: 200, height: 200}}
                        />
                      </View>
                    </View>
                  </>
                );

              case 'Calendar':
                return (
                  <FlatList
                    data={Array.from({length: 12}, (e, i) =>
                      new Date(0, i + 1, 0).toLocaleDateString('en', {
                        month: 'short',
                        year: 'numeric',
                      }),
                    )}
                    horizontal
                    renderItem={({item}) => (
                      <View
                        style={{
                          borderColor: '#bcaaa4',
                          borderWidth: 2.5,
                          borderRadius: 15,
                          marginHorizontal: 23,

                          width: layout.width * 0.3,
                        }}>
                        <View
                          style={{
                            alignItems: 'center',
                            //backgroundColor: '#6d4c41',
                            backgroundColor: '#d7ccc8',
                            borderRadius: 10,
                            borderColor: '#d7ccc8',
                            //borderStyle: 'dashed',
                            borderWidth: 1,
                            margin: 3,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            //transform: [{translateY: 2}],
                          }}>
                          <TextX
                            bold
                            color="#795548"
                            font="Laila-Bold"
                            scale={2.2}>
                            {item}
                          </TextX>
                        </View>
                      </View>
                    )}
                    showsHorizontalScrollIndicator={false}
                  />
                );

              case 'Income & Outcome':
                return (
                  <LinearGradient
                    colors={['#bdbdbd80', '#8d6e6340']}
                    angle={0}
                    useAngle={true}
                    style={{
                      alignItems: 'center',
                      borderRadius: 25,
                      borderColor: '#bcaaa4',
                      borderWidth: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-evenly',
                      marginHorizontal: 20,
                      marginTop: 5,
                      paddingVertical: 15,
                    }}>
                    <View style={{height: 120}}>
                      <PieChart
                        donut
                        data={pieData}
                        innerRadius={45}
                        radius={60}
                        centerLabelComponent={() => (
                          <View
                            style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <TextX
                              bold
                              color="black"
                              font="Laila-Bold"
                              scale={2.8}>
                              47%
                            </TextX>
                            <TextX
                              bold
                              color="black"
                              font="Laila-Bold"
                              mt={-7}
                              scale={1.8}>
                              Excellent
                            </TextX>
                          </View>
                        )}
                      />
                    </View>
                    <View>
                      <TextX
                        bold
                        color="#efebe9"
                        font="Laila-Bold"
                        ml={5}
                        scale={2.1}
                        style={{textDecorationLine: 'none'}}>
                        Profit this month
                      </TextX>
                      <GradientText
                        bold
                        font="Laila-Bold"
                        gradient={['#fff59d', '#fff']}
                        mt={-10}
                        numberOfLines={1}
                        scale={6}>
                        40.39%
                      </GradientText>
                      <TextX
                        bold
                        color="#f9fbe7"
                        font="Laila-Bold"
                        ml={5}
                        mt={-20}
                        scale={2}>
                        Restaurant 4.39%
                      </TextX>
                      <TextX
                        bold
                        color="#f9fbe7"
                        font="Laila-Bold"
                        ml={5}
                        scale={2}>
                        Bar 4.39%
                      </TextX>
                    </View>
                  </LinearGradient>
                );

              case 'Breakdown':
                return (
                  <View style={{marginLeft: -38}}>
                    <LineChart
                      areaChart
                      thickness={2}
                      color="#8d6e63"
                      hideDataPoints={false}
                      dataPointsHeight={20}
                      dataPointsWidth={20}
                      hideRules={false}
                      rulesColor="#ffffff80"
                      rulesType="dashed"
                      showVerticalLines={false}
                      hideXAxisText={true}
                      hideYAxisText={true}
                      verticalLinesColor="rgba(14,164,164,0.5)"
                      noOfSections={3}
                      isAnimated
                      animationDuration={1200}
                      animateOnDataChange
                      onDataChangeAnimationDuration={1200}
                      yAxisTextStyle={{color: 'lightgray'}}
                      data={data}
                      curved
                      initialSpacing={10}
                      spacing={deviceWidth * 0.101}
                      adjustToWidth
                      startFillColor="#d7ccc8"
                      endFillColor="#fff"
                      startOpacity={1}
                      endOpacity={0}
                      yAxisColor="transparent"
                      xAxisColor="transparent"
                      withHorizontalLabels={false}
                      propsForBackgroundLines={{stroke: '#ffffff'}}
                      xAxisLabelTextStyle={{color: '#fff'}}
                      showXAxisIndices={false}
                      //width={deviceWidth}
                      height={100}
                    />
                  </View>
                );

              case 'Top Sold Items':
                return (
                  <View style={{marginHorizontal: 20}}>
                    <TextX
                      bold
                      color="#d7ccc8"
                      font="Rubik-Bold"
                      mb={5}
                      scale={3}>
                      Most sold items
                    </TextX>
                    {Array(6)
                      .fill(0)
                      .map((_, key) => (
                        <ShadowedView
                          key={key}
                          style={{
                            shadowOpacity: 0.1,
                            shadowRadius: 20,
                            shadowOffset: {width: 5, height: 3},
                          }}>
                          <LinearGradient
                            colors={['#a1887f', '#e0e0e0']}
                            angle={180}
                            useAngle={true}
                            style={{
                              alignContent: 'center',
                              backgroundColor: '#000',
                              borderColor: '#fff',
                              borderRadius: 20,
                              borderWidth: 0.5,
                              flexDirection: 'row',
                              marginVertical: 10,
                              padding: 10,
                              paddingRight: 20,
                            }}>
                            <View style={{flex: 0.5}}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  paddingRight: 20,
                                }}>
                                <Avatar.Text
                                  label="I"
                                  size={48}
                                  style={{
                                    backgroundColor: theme.colors.secondary,
                                  }}
                                />
                                <View style={{marginLeft: 10}}>
                                  <TextX
                                    color={theme.colors.primary}
                                    numberOfLines={1}
                                    scale={2.5}>
                                    Item name here
                                  </TextX>
                                  <TextX
                                    color={theme.colors.primary}
                                    scale={2.1}>
                                    Department
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
                              <TextX
                                color={theme.colors.primary}
                                currency
                                scale={2.2}>
                                {500}
                              </TextX>
                            </View>
                            <View
                              style={{
                                flex: 0.15,
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                              }}>
                              <TextX
                                bold
                                color={theme.colors.primary}
                                font="Laila-Bold"
                                scale={2.5}>
                                {300}
                              </TextX>
                              <TextX color={theme.colors.primary} mt={-5}>
                                sales
                              </TextX>
                            </View>
                          </LinearGradient>
                        </ShadowedView>
                      ))}
                  </View>
                );

              default:
                return (
                  <Svg
                    height={layout.height}
                    width={layout.width}
                    style={{position: 'absolute'}}>
                    <AnimatedCircle
                      animation="flash"
                      duration={10000}
                      easing="ease-in-out"
                      iterationCount="infinite"
                      cx={layout.width * 0.8}
                      cy={layout.height * 0.35}
                      r="200"
                      fill="#ffffff20"
                    />
                    <Circle
                      cx={layout.width * 0.8}
                      cy={layout.height * 0.35}
                      r="180"
                      fill="#ffffff20"
                    />
                    <Circle
                      cx={layout.width * 0.8}
                      cy={layout.height * 0.35}
                      r="160"
                      fill="#ffffff20"
                    />
                  </Svg>
                );
            }
          }}
          showsVerticalScrollIndicator={false}
          SectionSeparatorComponent={() => <View style={{height: 10}} />}
          //style={{backgroundColor: '#fff'}}
        />
      </LinearGradient>

      {/* <ScrollView style={{zIndex: 0, marginTop: 50}}>
        <View style={{marginTop: 10, marginLeft: 20, marginBottom: -10}}>
          <Text style={{fontSize: s(2)}}>High Sales</Text>
          <Text
            style={{
              color: 'green',
              fontFamily: 'Abel',
              fontSize: s(2.8),
              marginTop: -5,
            }}>
            Kes 12,000.00
          </Text>
        </View>
        

        <QuickStats />
      </ScrollView> */}
    </SafeAreaView>
  );
};

export default Dashboard;
