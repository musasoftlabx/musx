// * React Native
import {useState} from 'react';
import {Image, View} from 'react-native';

// * React Native Libraries
import {FlatList} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {Surface, Text} from 'react-native-paper';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {deviceWidth} from '../../../utils';

const metadata = [
  {
    title: 'Purchases',
    amount: 300,
  },
  {
    title: 'Sales',
    amount: 500,
  },
];

const SalesOverview = () => {
  const [stats, setStats] = useState([
    {
      color: '#fff',
      colors: ['#8a5bea', '#45e0ff'],
      quantity: 43,
      amount: 2324,
      icon: require(`../../../assets/images/purchases.png`),
      name: 'Purchases',
    },
    {
      color: '#fff',
      colors: ['#3CB371', '#98FB98'],
      quantity: 92,
      amount: 13141,
      icon: require(`../../../assets/images/sales.png`),
      name: 'Sales',
    },
    {
      border: 1,
      color: 'rgba(0, 0, 0, 0.5)',
      colors: ['#fafafa', '#FFF'],
      quantity: 92,
      amount: 13141,
      icon: require(`../../../assets/images/sales.png`),
      name: 'Sales',
    },
  ]);

  return (
    <FlatList
      data={stats}
      horizontal
      renderItem={({item, index}) => (
        <LinearGradient
          key={index}
          useAngle
          angle={45}
          colors={item.colors}
          style={{
            borderColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 10,
            borderWidth: item?.border,
            backgroundColor: 'rgba(10, 10, 20, 0.5)',
            flexGrow: 1,
            marginHorizontal: 5,
            marginTop: 25,
            //overflow: 'hidden',
            width: deviceWidth / 2.25,
          }}>
          <View
            style={{
              flexDirection: 'row',
              //paddingVertical: 12,
            }}>
            <Image
              source={item.icon}
              style={{
                height: 80,
                opacity: 0.8,
                marginTop: -30,
                width: 80,
              }}
            />
            <View style={{marginVertical: 5, alignItems: 'flex-end'}}>
              <Text
                numberOfLines={1}
                style={{
                  color: item.color,
                  fontFamily: 'Abel',
                  fontSize: RFPercentage(2.5),
                }}>
                {item.name}
              </Text>
              <Text
                style={{
                  color: item.color,
                  fontFamily: 'Rubik',
                  fontSize: RFPercentage(4),
                }}>
                {item.amount}
              </Text>
            </View>
            <View style={{flex: 1}} />
          </View>
        </LinearGradient>
      )}
      showsHorizontalScrollIndicator={false}
    />
  );
};

export default SalesOverview;
