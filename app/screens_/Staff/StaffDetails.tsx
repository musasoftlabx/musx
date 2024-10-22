// * React
import {useEffect, useState} from 'react';

// * React Native
import {Image, Platform, useWindowDimensions, View} from 'react-native';

// * React Native Libraries
import {FlatList, RefreshControl} from 'react-native-gesture-handler';
import {Avatar, Button, Chip, Menu, Text, useTheme} from 'react-native-paper';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {RFPercentage as s} from 'react-native-responsive-fontsize';
import {SafeAreaView} from 'react-native-safe-area-context';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

// * JS Libraries
import {Motion} from '@legendapp/motion';
import {useQuery, useQueryClient} from '@tanstack/react-query';

// * Components
import EmptyRecords from '../../components/EmptyRecords';
import {NeuButton, NeuInput} from '../../components/Neumorphism';

// * Utilities
import {photoURL, useConfigStore} from '../../store';

// * Assets
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function StaffDetails({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const {
    _id,
    firstName,
    lastName,
    username,
    emailAddress,
    phoneNumber,
    role,
    permanent,
    photo,
  } = route.params;

  // ? useHooks
  const axios = useConfigStore(state => state.axios);
  const theme = useTheme();
  const queryClient = useQueryClient();
  const layout = useWindowDimensions();

  const {data, isFetching, isFetched} = useQuery(
    ['staff', 1],
    ({queryKey}) => axios.get(`${queryKey[0]}/${route.params._id}`),
    {select: data => data.data},
  );

  /* useEffect(
    () =>
      navigation.setOptions({
        headerTitle: `${firstName} ${lastName}`,
      }),
    [],
  ); */

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.primary,
        flex: 1,
        //height: layout.height * 1.1,
      }}>
      {/* <Image
        source={{uri: photoURL + photo}}
        style={{height: layout.height / 5, width: layout.width}}
      /> */}
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primary,
          height: layout.height / 7,
          width: layout.width,
        }}>
        <Text
          style={{
            color: '#efebe9',
            fontFamily: 'Laila',
            fontSize: s(3.8),
            marginTop: -10,
          }}>
          {`${firstName} ${lastName}`}
        </Text>
        <Text style={{color: '#bcaaa4', fontSize: s(2.1)}}> {role}</Text>
      </View>
      <View
        style={{
          backgroundColor: theme.colors.background,
          borderTopStartRadius: 20,
          borderTopEndRadius: 20,
          flex: 1,
          paddingHorizontal: 20,
        }}>
        <View
          style={{
            borderColor: '#fff',
            borderRadius: 50,
            borderWidth: 5,
            height: 90,
            width: 90,
            marginTop: -50,
          }}>
          <Avatar.Image size={80} source={{uri: photoURL + photo}} />
        </View>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 10,
            padding: 5,
            paddingLeft: 10,
            paddingRight: 12,
            position: 'absolute',
            top: -20,
            right: 30,
          }}>
          <Text
            style={{
              fontSize: s(2.1),
              fontFamily: 'Laila-Bold',
              fontWeight: Platform.OS === 'ios' ? 'bold' : '500',
            }}>
            {permanent ? 'Permanent' : 'Casual'}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 20,
            marginLeft: 20,
          }}>
          <View>
            <View style={{flexDirection: 'row', marginBottom: 20}}>
              <Icon name="account-circle" size={26} style={{marginRight: 10}} />
              <View>
                <Text style={{fontSize: s(2.1)}}>Username</Text>
                <Text style={{fontSize: s(2.1)}}>{username}</Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', marginBottom: 20}}>
              <Icon name="email-variant" size={26} style={{marginRight: 10}} />
              <View>
                <Text style={{fontSize: s(2.1)}}>Email Address</Text>
                <Text style={{fontSize: s(2.1)}}>{emailAddress}</Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', marginBottom: 20}}>
              <Icon name="deskphone" size={26} style={{marginRight: 10}} />
              <View>
                <Text style={{fontSize: s(2.1)}}>Phone Number</Text>
                <Text style={{fontSize: s(2.1)}}>{phoneNumber}</Text>
              </View>
            </View>
          </View>
        </View>
        <Text
          style={{
            fontFamily: 'Abel',
            fontSize: s(5),
            justifyContent: 'flex-end',
            opacity: 0.5,
            position: 'absolute',
            right: -60,
            top: 120,
            transform: [{rotate: '90deg'}],
          }}>
          {data?.salary.current
            .toLocaleString('en-US', {
              style: 'currency',
              currency: 'KES',
            })
            .toLowerCase()
            .replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase())}
        </Text>

        <View
          style={{
            backgroundColor: '#d7ccc860',
            borderRadius: 20,
            borderTopStartRadius: 20,
            padding: 20,
          }}>
          <Text style={{fontSize: s(2.1)}}>
            Added on {data?.added.on} by {data?.added.by}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
