// * React Native imports
import {Image, Pressable, Text, View} from 'react-native';

// * React Native Libraries imports
import {Avatar, Button, Surface, TextInput} from 'react-native-paper';
import {RFPercentage as s} from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import BigList from 'react-native-big-list';

import GradientText from './GradientText';

interface ITicket {
  category: string;
  subcategory: string;
  stage: string;
  createdAt: string;
}

export default function ListCard(props) {
  const {
    navigation,
    tickets,
    isSuccess,
    isFetched,
    gradient,
    icon,
    route: {name},
  } = props;

  return (
    tickets && (
      <BigList
        data={tickets.filter(
          (ticket: ITicket) => ticket.stage === name && ticket,
        )}
        style={{marginTop: 10}}
        renderItem={({item: ticket, index}) => (
          <Surface
            key={index}
            elevation={4}
            style={{borderRadius: 20, marginHorizontal: 10}}>
            <LinearGradient
              useAngle
              angle={0}
              colors={gradient}
              style={{
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 15,
              }}>
              <Pressable onPress={() => navigation.navigate('Ticket', ticket)}>
                <View style={{alignItems: 'center', flexDirection: 'row'}}>
                  <Avatar.Icon
                    size={48}
                    icon={icon}
                    style={{borderRadius: 15, backgroundColor: gradient[1]}}
                  />
                  <View
                    style={{flex: 1, marginLeft: 10, justifyContent: 'center'}}>
                    <Text style={{fontWeight: 'bold', fontSize: s(2)}}>
                      {ticket.category}
                    </Text>
                    <Text style={{marginTop: 1.5, marginBottom: 2}}>
                      {ticket.subcategory}
                    </Text>
                    <Text style={{fontStyle: 'italic', fontSize: s(1.5)}}>
                      {ticket.createdAt}
                    </Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    {ticket.photos?.map((photo: string, key: number) => (
                      <Avatar.Image
                        key={key}
                        size={28}
                        source={{
                          uri: photo.replace(
                            'https://localhost',
                            'http://10.0.2.2',
                          ),
                        }}
                        style={{
                          borderWidth: 2,
                          marginLeft: -9,
                          borderColor: 'green',
                        }}
                        onError={() => console.log('ile')}
                      />
                    ))}
                  </View>
                </View>
              </Pressable>
            </LinearGradient>
          </Surface>
        )}
        renderEmpty={() => (
          <View>
            <Text>Empty</Text>
          </View>
        )}
        renderHeader={() => (
          <GradientText
            gradient={['#442fb2', '#39b54a']}
            style={{
              fontFamily: 'Abel',
              fontSize: s(3.5),
              marginLeft: 12,
            }}>
            {name}
          </GradientText>
        )}
        itemHeight={105}
        headerHeight={45}
        onEndReached={() => console.log('the end')}
      />
    )
  );
}
