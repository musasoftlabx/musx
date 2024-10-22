// * React Navigation
import {createStackNavigator} from '@react-navigation/stack';
import {useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// * Screens
import Staff from './StaffList';
import StaffDetails from './StaffDetails';

// * Subcriptions
const Stack = createStackNavigator();
//const Stack = createSharedElementStackNavigator();

export default function StaffNavigator({navigation}: {navigation: any}) {
  const theme = useTheme();

  return (
    <Stack.Navigator screenOptions={{headerShadowVisible: false}}>
      <Stack.Screen
        name="Staff List"
        component={Staff}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.primary,
            height: 80,
          },
          headerTransparent: true,
          headerTintColor: 'white',
          headerTitle: '',
          headerLeft: props => (
            <Icon
              {...props}
              name="menu"
              size={24}
              color="#fff"
              onPress={() => navigation.openDrawer()}
            />
          ),
          headerLeftContainerStyle: {paddingLeft: 20},
        }}
      />
      <Stack.Screen
        name="Staff Details"
        component={StaffDetails}
        options={{
          headerStyle: {backgroundColor: theme.colors.primary},
          headerTintColor: '#fff',
          headerTitle: '',
          headerTransparent: true,
        }}
      />
    </Stack.Navigator>
  );
}
