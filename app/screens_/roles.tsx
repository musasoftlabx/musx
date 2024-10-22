// * React
import {useState} from 'react';

// * React Native
import {
  Alert,
  useWindowDimensions,
  Pressable,
  View,
  Vibration,
  Image,
} from 'react-native';

// * React Native Libraries
import {AnimatePresence, Motion} from '@legendapp/motion';
import {ShadowedView, shadowStyle} from 'react-native-fast-shadow';
import {
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {Button, Text, TextInput, useTheme} from 'react-native-paper';
import {RFPercentage as s} from 'react-native-responsive-fontsize';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

// * JS Libraries
import {Formik} from 'formik';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import * as Yup from 'yup';

// * Components
import Add from './Add';
import ButtonX from '../components/ButtonX';
import EmptyRecords from '../components/EmptyRecords';

// * Utilities
import {useConfigStore} from '../store';
import {styles} from '../styles';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function Kitchen() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);

  // ? useStore
  const axios = useConfigStore(state => state.axios);

  const layout = useWindowDimensions();

  const {mutate} = useMutation(body => axios.post('roles', body));
  const {mutate: remove} = useMutation(id => axios.delete(`roles/${id}`));
  const {data, isFetching} = useQuery(
    ['roles'],
    ({queryKey}) => axios.get(queryKey[0]),
    {select: data => data.data},
  );

  let row: Array<any> = [];
  let prevOpenedRow: any;

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.primary,
        height: layout.height * 1.1,
      }}>
      <Motion.Text
        animate={{x: 0, y: 0}}
        initial={{y: -50}}
        transition={{type: 'spring', damping: 20, stiffness: 400}}
        style={{
          alignSelf: 'center',
          color: 'white',
          fontFamily: 'Montez',
          fontSize: s(6),
        }}>
        Roles
      </Motion.Text>

      <Formik
        initialValues={{role: ''}}
        validationSchema={Yup.object({
          role: Yup.string().max(20, 'Max of 20 chars').required('Required'),
        })}
        onSubmit={(values, {setSubmitting, resetForm}) => {
          //@ts-ignore
          mutate(values, {
            onSuccess(data: {data: {_id: String; role: String}}) {
              queryClient.setQueryData(['roles'], (prev: any) => ({
                ...prev,
                data: [data.data, ...prev.data],
              }));
              resetForm();
            },
            onError: error => Alert.alert('Error', 'error', [{text: 'OK'}]),
            onSettled: () => setSubmitting(false),
          });
        }}>
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          resetForm,
          setFieldTouched,
        }) => (
          <View style={{padding: 20}}>
            <TextInput
              label="Add"
              onBlur={() => setFieldTouched('role', true, false)}
              onChangeText={handleChange('role')}
              placeholder="Role"
              right={
                values.role.length > 0 && (
                  <TextInput.Icon
                    icon="close"
                    onPress={() => resetForm()}
                    style={{opacity: 0.5}}
                  />
                )
              }
              style={styles.textInput}
              value={values.role}
            />

            <ButtonX
              errors={errors}
              isSubmitting={isSubmitting}
              touched={touched}
              values={values}
              onPress={() => handleSubmit()}>
              ADD
            </ButtonX>
          </View>
        )}
      </Formik>

      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          isFetching ? (
            <View style={{marginTop: 10}}>
              {new Array(8).fill(0).map((_, key) => (
                <SkeletonPlaceholder key={key} borderRadius={4}>
                  <SkeletonPlaceholder.Item
                    flexDirection="row"
                    alignItems="center">
                    <SkeletonPlaceholder.Item
                      borderRadius={5}
                      marginBottom={20}
                      marginLeft={15}
                      width={layout.width * 0.9}
                      height={30}
                    />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder>
              ))}
            </View>
          ) : (
            <EmptyRecords
              context="roles"
              reload={() => queryClient.refetchQueries(['roles'])}
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => {
                queryClient.refetchQueries(['roles']);
                setRefreshing(false);
              }, 1000);
            }}
          />
        }
        renderItem={({item, index}) => (
          <Swipeable
            renderRightActions={(progress, dragX) => (
              <View
                style={{
                  margin: 0,
                  alignContent: 'center',
                  justifyContent: 'center',
                  width: '10%',
                }}>
                <Text>ok</Text>
              </View>
            )}
            onSwipeableOpen={() => {
              if (prevOpenedRow && prevOpenedRow !== row[index]) {
                prevOpenedRow.close();
              }
              prevOpenedRow = row[index];
            }}
            ref={ref => (row[index] = ref)}>
            {/* <AnimatePresence>
              <Motion.View
                key={index}
                initial={{opacity: 0.1, y: -50}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0.1, y: -200}}
                transition={{default: {type: 'tween', duration: 500}}}> */}
            <Animated.View
              key={index}
              entering={FadeIn.duration(1000)}
              exiting={FadeOut.duration(1000)}>
              <Pressable onPress={() => Vibration.vibrate(50)}>
                <View
                  style={[
                    /* shadowStyle({
                      color: '#424242',
                      opacity: 0.9,
                      radius: 5,
                      offset: [0, 0],
                    }), */
                    {
                      alignItems: 'center',
                      //backgroundColor: '#fff',
                      borderRadius: 10,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginHorizontal: 10,
                      marginVertical: 7,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      /* shadowColor: '#bcaaa4',
                      shadowOffset: {width: 3, height: 3},
                      shadowOpacity: 0.5,
                      shadowRadius: 5, */
                    },
                  ]}>
                  <View style={{justifyContent: 'center'}}>
                    <Text numberOfLines={1} style={{fontSize: s(2.5)}}>
                      {item.role}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() =>
                      remove(item._id, {
                        onSuccess: () =>
                          queryClient.setQueryData(['roles'], (prev: any) => ({
                            ...prev,
                            data: [
                              ...prev.data.filter(
                                (role: {_id: String}) =>
                                  role._id !== item._id && role,
                              ),
                            ],
                          })),
                      })
                    }>
                    <Icon name="close" size={20} color="grey" />
                  </Pressable>
                </View>
              </Pressable>
            </Animated.View>
            {/* </Motion.View>
            </AnimatePresence> */}
          </Swipeable>
        )}
        showsVerticalScrollIndicator={false}
        style={{
          backgroundColor: '#eeeeee',
          //backgroundColor: theme.colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginVertical: 10,
          paddingVertical: 10,
        }}
      />
    </SafeAreaView>
  );
}
