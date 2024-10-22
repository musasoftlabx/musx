// * React
import {useState} from 'react';

// * React Native
import {
  Alert,
  useWindowDimensions,
  Pressable,
  View,
  Vibration,
} from 'react-native';

// * React Native Libraries
import {Motion} from '@legendapp/motion';
import {FlatList, RefreshControl} from 'react-native-gesture-handler';
import {Text, TextInput, useTheme} from 'react-native-paper';
import {RFPercentage as s} from 'react-native-responsive-fontsize';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

// * JS Libraries
import {Formik} from 'formik';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import * as Yup from 'yup';

// * Components
import ButtonX from '../components/ButtonX';
import EmptyRecords from '../components/EmptyRecords';

// * Utilities
import {useConfigStore} from '../store';
import {styles} from '../styles';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function Departments() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);

  // ? useStore
  const axios = useConfigStore(state => state.axios);

  const layout = useWindowDimensions();

  const {mutate} = useMutation(body => axios.post('departments', body));
  const {mutate: remove} = useMutation(id => axios.delete(`departments/${id}`));
  const {data, isFetching} = useQuery(
    ['departments'],
    ({queryKey}) => axios.get(queryKey[0]),
    {select: data => data.data},
  );

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
        Department
      </Motion.Text>

      <Formik
        initialValues={{department: ''}}
        validationSchema={Yup.object({
          department: Yup.string()
            .max(20, 'Max of {max} chars')
            .required('Required'),
        })}
        onSubmit={(values, {setSubmitting, resetForm}) => {
          //@ts-ignore
          mutate(values, {
            onSuccess(data: {data: {_id: String; department: String}}) {
              queryClient.setQueryData(['departments'], (prev: any) => ({
                ...prev,
                data: [data.data, ...prev.data],
              }));
              resetForm();
            },
            onError: error => Alert.alert('Error', 'error', [{text: 'OK'}]),
          });
          setSubmitting(false);
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
              onBlur={() => setFieldTouched('department', true, false)}
              onChangeText={handleChange('department')}
              placeholder="Department"
              right={
                values.department.length > 0 && (
                  <TextInput.Icon
                    icon="close"
                    onPress={() => resetForm()}
                    style={{opacity: 0.5}}
                  />
                )
              }
              style={styles.textInput}
              value={values.department}
            />

            <ButtonX
              attributes={{
                errors,
                isSubmitting,
                label: 'ADD',
                parent: 'dark',
                touched,
                values,
              }}
              onPress={() => handleSubmit()}
            />
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
              context="departments"
              reload={() => queryClient.refetchQueries(['departments'])}
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => {
                queryClient.refetchQueries(['departments']);
                setRefreshing(false);
              }, 1000);
            }}
          />
        }
        renderItem={({item, index}) => (
          <Animated.View
            key={index}
            entering={FadeIn.duration(1000)}
            exiting={FadeOut.duration(1000)}>
            <Pressable onPress={() => Vibration.vibrate(50)}>
              <View
                style={{
                  alignItems: 'center',
                  //backgroundColor: '#fff',
                  borderRadius: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginHorizontal: 10,
                  marginVertical: 7,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}>
                <View style={{justifyContent: 'center'}}>
                  <Text numberOfLines={1} style={{fontSize: s(2.5)}}>
                    {item.department}
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    remove(item._id, {
                      onSuccess: () =>
                        queryClient.setQueryData(
                          ['departments'],
                          (prev: any) => ({
                            ...prev,
                            data: [
                              ...prev.data.filter(
                                (department: {_id: String}) =>
                                  department._id !== item._id && department,
                              ),
                            ],
                          }),
                        ),
                    })
                  }>
                  <Icon name="close" size={20} color="grey" />
                </Pressable>
              </View>
            </Pressable>
          </Animated.View>
        )}
        showsVerticalScrollIndicator={false}
        style={{
          backgroundColor: '#eeeeee',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginVertical: 10,
          paddingVertical: 10,
        }}
      />
    </SafeAreaView>
  );
}
