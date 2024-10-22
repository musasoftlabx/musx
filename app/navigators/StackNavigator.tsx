// * React Navigation
import {
  createStackNavigator,
  //CardStyleInterpolators,
} from '@react-navigation/stack';

// * Navigators
import TabNavigator from './TabNavigator';
import {createSharedElementStackNavigator} from 'react-navigation-shared-element';

// * Screens
import AddSale from '../screens/Tabs/Sales/Add';
import AddPurchase from '../screens/Tabs/Purchases/Add';
import Sales from '../screens/Tabs/Sales/Sales';
import StaffDetails from '../screens/Staff/StaffDetails';
import Signature from '../screens/Signature';
import {useTheme} from 'react-native-paper';
import {Button} from 'react-native';

// * Subcriptions
const Stack = createStackNavigator();
//const Stack = createSharedElementStackNavigator();

export default function StackNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator initialRouteName="Tab Navigator">
      <Stack.Group>
        <Stack.Screen
          name="Tab Navigator"
          component={TabNavigator}
          options={{
            headerShown: false,
            headerStyle: {backgroundColor: theme.colors.primary},
            headerTintColor: 'white',
          }}
        />
        <Stack.Screen
          name="Department Sales"
          component={Sales}
          options={{
            headerStyle: {backgroundColor: theme.colors.primary, height: 0},
            headerTintColor: 'white',
            headerTransparent: false,
            headerLeftContainerStyle: {top: 30},
            /* headerLeft: () => (
              <Button
                onPress={() => alert('This is a button!')}
                title="Info"
                color="#fff"
              />
            ), */
          }}
        />
        <Stack.Screen
          name="Add Sale"
          component={AddSale}
          options={{
            headerShown: true,
            headerStyle: {backgroundColor: theme.colors.primary},
            headerTintColor: 'white',
          }}
        />
        <Stack.Screen
          name="Add Purchase"
          component={AddPurchase}
          options={{
            headerShown: true,
            headerStyle: {backgroundColor: theme.colors.primary},
            headerTintColor: 'white',
          }}
        />
        <Stack.Screen
          name="Staff Details"
          component={StaffDetails}
          options={{
            headerStyle: {backgroundColor: theme.colors.primary},
            headerTintColor: 'white',
          }}
        />
      </Stack.Group>
      <Stack.Group screenOptions={{presentation: 'modal'}}>
        <Stack.Screen
          name="Signature"
          component={Signature}
          options={{headerShown: false}}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}
