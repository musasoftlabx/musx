// * React Navigation
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';

// * React Native Libraries
import {Avatar, Button, List} from 'react-native-paper';
import {RFPercentage as s} from 'react-native-responsive-fontsize';

// * JS Libraries
import {Buffer} from 'buffer';

// * Navigators
import StackNavigator from './StackNavigator';

// * Screens
import Kitchen from '../screens/Kitchen';
import StaffNavigator from '../screens/Staff/StaffNavigator';
import AddStaff from '../screens/Staff/Add';
import MenuNavigator from '../screens/Menu/MenuNavigator';
import AddMenuItem from '../screens/Menu/Add';
import Roles from '../screens/roles';
import Departments from '../screens/departments';

// * Utilities
import {useAuthStore, useConfigStore} from '../store';
import {deviceWidth} from '../utils';

import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import {Text, useTheme} from 'react-native-paper';
import {Alert, View} from 'react-native';

// * Subcriptions
const Drawer = createDrawerNavigator();

// * Interfaces
interface IItem {
  props: any;
  name: string;
  child?: boolean | false;
  icon: string[];
}

export default function DrawerNavigator({token}: {token: string}) {
  const logout = useAuthStore(state => state.logout);
  const configUser = useConfigStore(state => state.configUser);
  const user = JSON.parse(
    Buffer.from(token.split('.')[1], 'base64').toString(),
  );
  configUser(user);

  const theme = useTheme();

  const Item = ({props, name, icon, child}: IItem) => (
    <DrawerItem
      {...props.props}
      activeBackgroundColor={
        theme.dark === false ? theme.colors.secondary : theme.colors.background
      }
      activeTintColor={
        theme.dark === false ? theme.colors.background : theme.colors.secondary
      }
      focused={
        props.state.routes[props.state.index].name === name ? true : false
      }
      label={name}
      labelStyle={{fontFamily: 'Laila', fontSize: s(2.2), fontWeight: 'normal'}}
      icon={({focused, color, size}) => (
        <MCI
          color={color}
          size={size}
          name={focused ? icon[0] : icon[0]}
          style={{marginLeft: child ? 20 : 15, marginRight: -10}}
        />
      )}
      onPress={() => props.navigation.navigate(name)}
      style={{borderRadius: 15, marginLeft: child ? 30 : 8}}
    />
  );

  return (
    <Drawer.Navigator
      drawerContent={props => (
        <>
          <View
            style={{
              backgroundColor: theme.colors.secondary,
              marginBottom: 10,
              padding: 10,
              paddingTop: 80,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Avatar.Text
                color="secondary"
                label={user.firstName.charAt(0)}
                labelStyle={{color: '#fff'}}
                size={50}
              />
              <View style={{marginLeft: 10}}>
                <Text style={{color: '#fff', fontSize: s(2), marginBottom: -6}}>
                  Hi {user.firstName}
                </Text>
                <Button
                  labelStyle={{fontSize: s(2)}}
                  style={{marginLeft: -12}}
                  textColor="#fff"
                  onPress={() =>
                    Alert.alert('Logout', 'This will log you out. Proceed?', [
                      {text: 'Cancel'},
                      {onPress: () => logout(), text: 'OK'},
                    ])
                  }>
                  LOGOUT
                </Button>
              </View>
            </View>
          </View>
          <Item props={props} name="Home" icon={['slack']} />
          <Item props={props} name="Kitchen" icon={['silverware-fork-knife']} />
          <Item props={props} name="Roles" icon={['podcast']} />
          <Item
            props={props}
            name="Departments"
            icon={['google-circles-extended']}
          />
          <List.Accordion
            title={<Text style={{fontSize: s(2.2)}}>Staff options</Text>}
            id="1"
            expanded={true}>
            <Item props={props} name="Staff" child icon={['account-box']} />
            <Item props={props} name="Add Staff" child icon={['plus']} />
          </List.Accordion>
          <List.Accordion
            title={<Text style={{fontSize: s(2.2)}}>Menu options</Text>}
            id="1"
            expanded={true}>
            <Item props={props} name="Menu" child icon={['food-outline']} />
            <Item props={props} name="Add Menu Item" child icon={['plus']} />
          </List.Accordion>
        </>
      )}
      screenOptions={{
        drawerType: 'slide',
        drawerActiveTintColor: theme.colors.primary,
        swipeEdgeWidth: deviceWidth * 0.1,
        drawerStyle: {
          backgroundColor: theme.colors.background,
          width: deviceWidth * 0.7,
        },
        headerStyle: {backgroundColor: theme.colors.primary, height: 0},
        headerTintColor: theme.colors.background,
      }}>
      <Drawer.Screen
        name="Home"
        component={StackNavigator}
        options={{
          drawerIcon: ({focused, color, size}) => {
            return <MCI name="earth" size={16} color={theme.colors.primary} />;
          },
          drawerLabel: 'Home',
          headerShown: false,
          //headerStyle: {backgroundColor: theme.colors.primary},
        }}
      />
      <Drawer.Screen name="Kitchen" component={Kitchen} />
      <Drawer.Screen name="Roles" component={Roles} />
      <Drawer.Screen name="Departments" component={Departments} />
      <Drawer.Screen
        name="Add Staff"
        component={AddStaff}
        options={{headerStyle: {backgroundColor: theme.colors.primary}}}
      />
      <Drawer.Screen
        name="Staff"
        component={StaffNavigator}
        options={{headerShown: false}}
      />
      <Drawer.Screen
        name="Add Menu Item"
        component={AddMenuItem}
        options={{headerStyle: {backgroundColor: theme.colors.primary}}}
      />
      <Drawer.Screen
        name="Menu"
        component={MenuNavigator}
        options={{headerShown: false}}
      />
    </Drawer.Navigator>
  );
}
