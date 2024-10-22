// * React Native
import {TouchableOpacity} from 'react-native';

// * React Native Libraries
import {
  AnimatedTabBarNavigator,
  DotSize, // optional
  TabElementDisplayOptions, // optional
  TabButtonLayout, // optional
  IAppearanceOptions, // optional
} from 'react-native-animated-nav-tab-bar';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTheme} from 'react-native-paper';
import {RFPercentage as s} from 'react-native-responsive-fontsize';
import Ionicons from 'react-native-vector-icons/Ionicons';

// * Screens
import Dashboard from '../screens/Tabs/Dashboard';
import Purchases from '../screens/Tabs/Purchases';
import Sales from '../screens/Tabs/Sales';
import Equity from '../screens/Tabs/Equity';

//const Tab = createBottomTabNavigator();
const Tab = AnimatedTabBarNavigator();

interface ITabProps {
  focused: boolean;
  color: string;
  size: number;
}

/* const TabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      //activeColor="#f0edf6"
      //inactiveColor="gray"
      //barStyle={{backgroundColor: '#694fad'}}
      screenOptions={({route}) => ({
        headerBackVisible: true,
        headerShown: false,
        headerTransparent: false,
        shifting: true,
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string = '';

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'logo-slack' : 'logo-slack';
              break;
            case 'Purchases':
              iconName = focused ? 'md-wallet' : 'md-wallet-outline';
              break;
            case 'Sales':
              iconName = focused ? 'calculator' : 'calculator';
              break;
            case 'Equity':
              iconName = focused ? 'library' : 'library-outline';
              break;
          }

          return <Ionicons name={iconName} size={26} color={color} />;
        },
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: {
          fontFamily: theme.fonts.bodyLarge.fontFamily,
          fontSize: s(1.6),
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: theme.colors.primary,
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 5,
          paddingHorizontal: 10,
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          borderRadius: 20,
        },
        tabBarItemStyle: {
          borderBottomStartRadius: 20,
          borderBottomEndRadius: 20,
          paddingBottom: 5,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#bcaaa4',
        tabBarActiveBackgroundColor: theme.colors.background,
        tabBarInactiveBackgroundColor: 'transparent',
        tabBarInactiveTopStartRadius: 20,
        tabBarButton: props => (
          <TouchableOpacity {...props} activeOpacity={0.1} />
        ),
      })}>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen
        name="Purchases"
        options={{headerShown: false, headerTransparent: true}}
        component={Purchases}
      />
      <Tab.Screen name="Sales" component={Sales} />
      <Tab.Screen name="Equity" component={Equity} />
    </Tab.Navigator>
  );
}; */
const TabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      appearance={{
        shadow: true,
        tabBarBackground: theme.colors.primary,
        floating: false,
        //topPadding: 0,
        //tabButtonLayout: 'vertical',
        dotCornerRadius: 10,
      }}
      tabBarOptions={{
        activeTintColor: theme.colors.primary,
        inactiveTintColor: '#222222',
        activeBackgroundColor: '#fff',
        labelStyle: {fontFamily: 'Abel', fontSize: s(2.5)},

        //tabStyle: {backgroundColor: 'transparent'},
        /* tabBarIcon: ({focused, color, size}) => {
          let iconName: string = '';

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'logo-slack' : 'logo-slack';
              break;
            case 'Purchases':
              iconName = focused ? 'md-wallet' : 'md-wallet-outline';
              break;
            case 'Sales':
              iconName = focused ? 'calculator' : 'calculator';
              break;
            case 'Equity':
              iconName = focused ? 'library' : 'library-outline';
              break;
          }

          return <Ionicons name={iconName} size={26} color={color} />;
        }, */
      }}>
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarIcon: ({focused, color, size}: ITabProps) => (
            <Ionicons
              name={focused ? 'logo-slack' : 'logo-slack'}
              size={size ? size : 24}
              color={focused ? color : '#fff'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Purchases"
        options={{
          headerShown: false,
          headerTransparent: true,
          tabBarIcon: ({focused, color, size}: ITabProps) => (
            <Ionicons
              name={focused ? 'md-wallet' : 'md-wallet-outline'}
              size={size ? size : 24}
              color={focused ? color : '#fff'}
            />
          ),
        }}
        component={Purchases}
      />
      <Tab.Screen
        name="Sales"
        component={Sales}
        options={{
          tabBarIcon: ({focused, color, size}: ITabProps) => (
            <Ionicons
              name={focused ? 'calculator' : 'calculator'}
              size={size ? size : 24}
              color={focused ? color : '#fff'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Equity"
        component={Equity}
        options={{
          tabBarIcon: ({focused, color, size}: ITabProps) => (
            <Ionicons
              name={focused ? 'library' : 'library-outline'}
              size={size ? size : 24}
              color={focused ? color : '#fff'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
