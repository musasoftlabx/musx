// * React Navigation
import {createStackNavigator} from '@react-navigation/stack';
import {useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// * Screens
import MenuList from './MenuList';
import MenuDetails from './MenuDetails';

// * Subcriptions
const Stack = createStackNavigator();
//const Stack = createSharedElementStackNavigator();

export default function MenuNavigator({navigation}: {navigation: any}) {
  const theme = useTheme();

  return (
    <Stack.Navigator screenOptions={{headerShadowVisible: false}}>
      <Stack.Screen
        name="Menu List"
        component={MenuList}
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
        name="Menu Details"
        component={MenuDetails}
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
