// * React
import {useEffect} from 'react';

// * React Native
import {Alert, useWindowDimensions, View} from 'react-native';

// * React Native Libraries
import {useNavigation} from '@react-navigation/native';
import MaskInput, {createNumberMask} from 'react-native-mask-input';
import {Chip, FAB, HelperText, TextInput, useTheme} from 'react-native-paper';

// * JS Libraries
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {FieldArray, Formik} from 'formik';
import * as Yup from 'yup';

// * Components
import ButtonX from '../../../components/ButtonX';
import TextX from '../../../components/TextX';

// * Utilities
import {useConfigStore} from '../../../store';
import {styles} from '../../../styles';
import React from 'react';
import {ScrollView} from 'react-native-gesture-handler';

// * Interfaces
interface IForm {
  items: [{item: String; quantity: string; price: String}];
  department: String;
  guests: String;
  bill: String;
  details: String;
}

const Add = ({navigation, route}: any) => {
  // ?  Params
  const department = route.params;

  // ? Hooks
  const axios = useConfigStore(state => state.axios);
  const queryClient = useQueryClient();
  const theme = useTheme();
  const layout = useWindowDimensions();
  const {mutate} = useMutation((data: IForm) => axios.post('sales', data));

  // ? Effects
  useEffect(
    () => navigation.setOptions({headerTitle: `Add ${department} sale`}),
    [],
  );

  return (
    <ScrollView>
      <Formik
        initialValues={{
          items: [{item: '', qty: '', price: ''}],
          department,
          guests: '',
          details: '',
        }}
        validationSchema={Yup.object({
          items: Yup.array().of(
            Yup.object().shape({
              item: Yup.string().required('Required.'),
              qty: Yup.number().min(1, 'Min ${min}').required('Required.'),
              price: Yup.number().min(1, 'Min ${min}').required('Required.'),
            }),
          ),
          department: Yup.string().required('Required'),
          guests: Yup.string()
            .max(3, 'Max of {max} chars')
            .required('Required'),
          details: Yup.string().max(100, 'Max of {max} chars'),
        })}
        onSubmit={(values, {setSubmitting}) => {
          setSubmitting(false);
          Alert.alert('Confirm', 'Is this a paid or invoiced sale?', [
            {text: 'CANCEL'},
            {
              text: 'INVOICED',
              onPress: () =>
                navigation.navigate('Signature', {
                  values,
                  apiRoute: 'sales',
                  from: 'Department Sales',
                  query: 'daily_sales',
                }),
            },
            {
              text: 'PAID',
              onPress: () => {
                setSubmitting(true);
                mutate(values, {
                  onSuccess: () => {
                    queryClient.prefetchInfiniteQuery(['daily_sales']);
                    navigation.navigate('Department Sales', {department});
                  },
                  onError: (error: any) => {
                    setSubmitting(false);
                    Alert.alert(
                      error.response.data.subject,
                      error.response.data.body,
                      [{text: 'OK'}],
                    );
                  },
                  onSettled: () => setSubmitting(false),
                });
              },
            },
          ]);
        }}>
        {({
          errors,
          isSubmitting,
          touched,
          values,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldTouched,
          setFieldValue,
        }) => (
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 20,
              paddingVertical: 20,
            }}>
            <FieldArray name="items">
              {({insert, remove, push}) => (
                <>
                  {values.items.length > 0 &&
                    values.items.map((item, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: '#fff',
                          borderColor: '#9e9e9e',
                          borderStyle: 'dashed',
                          borderWidth: 2,
                          borderRadius: 15,
                          marginBottom: 20,
                          paddingTop: 10,
                          paddingHorizontal: 20,
                        }}>
                        <TextX scale={2} mb={10}>{`Entry for item ${
                          index + 1
                        }`}</TextX>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <View style={{flex: 0.57}}>
                            <TextInput
                              label="Item *"
                              placeholder="Name of the item"
                              activeUnderlineColor={
                                touched.items?.[index]?.item &&
                                Boolean(errors.items?.[index]?.item)
                                  ? theme.colors.error
                                  : theme.colors.secondary
                              }
                              error={
                                touched.items?.[index]?.item &&
                                Boolean(errors.items?.[index]?.item)
                              }
                              maxLength={20}
                              onBlur={handleBlur(`items.${index}.item`)}
                              onChangeText={handleChange(`items.${index}.item`)}
                              style={styles.textInput}
                              value={values.items[index].item}
                            />
                            <HelperText
                              type="error"
                              style={styles.helperText}
                              visible={
                                touched.items?.[index]?.item &&
                                errors.items?.[index]?.item
                                  ? true
                                  : false
                              }>
                              {errors.items?.[index]?.item}
                            </HelperText>
                          </View>
                          <View style={{flex: 0.37}}>
                            <TextInput
                              label="Qty *"
                              placeholder="qty"
                              activeUnderlineColor={
                                touched.items?.[index]?.qty &&
                                Boolean(errors.items?.[index]?.qty)
                                  ? theme.colors.error
                                  : theme.colors.secondary
                              }
                              error={
                                touched.items?.[index]?.qty &&
                                Boolean(errors.items?.[index]?.qty)
                              }
                              keyboardType="numeric"
                              maxLength={20}
                              onBlur={handleBlur(`items.${index}.qty`)}
                              //onChangeText={handleChange(`items.${index}.qty`)}
                              style={styles.textInput}
                              value={values.items[index].qty}
                              render={props => (
                                <MaskInput
                                  {...props}
                                  mask={createNumberMask({
                                    delimiter: ',',
                                    separator: '.',
                                    precision: 0,
                                  })}
                                  onChangeText={(masked, unmasked) =>
                                    setFieldValue(
                                      `items.${index}.qty`,
                                      unmasked,
                                    )
                                  }
                                />
                              )}
                            />
                            <HelperText
                              type="error"
                              style={styles.helperText}
                              visible={
                                touched.items?.[index]?.qty &&
                                errors.items?.[index]?.qty
                                  ? true
                                  : false
                              }>
                              {errors.items?.[index]?.qty}
                            </HelperText>
                          </View>
                        </View>

                        <View
                          style={{
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <View style={{flex: 0.7}}>
                            <TextInput
                              label="Price *"
                              placeholder="Item price"
                              activeUnderlineColor={
                                touched.items?.[index]?.price &&
                                Boolean(errors.items?.[index]?.price)
                                  ? theme.colors.error
                                  : theme.colors.secondary
                              }
                              error={
                                touched.items?.[index]?.price &&
                                Boolean(errors.items?.[index]?.price)
                              }
                              keyboardType="numeric"
                              maxLength={20}
                              onBlur={handleBlur(`items.${index}.price`)}
                              //onChangeText={handleChange(`items.${index}.price`)}
                              style={styles.textInput}
                              value={values.items[index].price}
                              render={props => (
                                <MaskInput
                                  {...props}
                                  mask={createNumberMask({
                                    prefix: ['Kes', ' '],
                                    delimiter: ',',
                                    separator: '.',
                                    precision: 0,
                                  })}
                                  onChangeText={(masked, unmasked) =>
                                    setFieldValue(
                                      `items.${index}.price`,
                                      unmasked,
                                    )
                                  }
                                />
                              )}
                            />
                            <HelperText
                              type="error"
                              style={styles.helperText}
                              visible={
                                touched.items?.[index]?.price &&
                                errors.items?.[index]?.price
                                  ? true
                                  : false
                              }>
                              {errors.items?.[index]?.price}
                            </HelperText>
                          </View>

                          <View style={{marginTop: -18}}>
                            {values.items.length > 1 && (
                              <FAB
                                icon="minus"
                                color="white"
                                customSize={50}
                                style={{
                                  backgroundColor: '#e57373',
                                  borderRadius: 50,
                                }}
                                onPress={() => remove(index)}
                              />
                            )}
                          </View>

                          <View style={{marginTop: -18}}>
                            {index === values.items.length - 1 && (
                              <FAB
                                icon="plus"
                                color="white"
                                disabled={
                                  !Boolean(touched.items?.[index]) ||
                                  Boolean(errors.items?.[index])
                                }
                                customSize={50}
                                style={{
                                  backgroundColor:
                                    !Boolean(touched.items?.[index]) ||
                                    Boolean(errors.items?.[index])
                                      ? '#e0e0e0'
                                      : '#66bb6a',
                                  borderRadius: 50,
                                }}
                                onPress={() =>
                                  push({item: '', qty: '', price: ''})
                                }
                              />
                            )}
                          </View>
                        </View>
                      </View>
                    ))}
                </>
              )}
            </FieldArray>

            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flex: 0.3}}>
                <TextInput
                  label="Guests *"
                  placeholder="present"
                  activeUnderlineColor={
                    touched.guests && Boolean(errors.guests)
                      ? theme.colors.error
                      : theme.colors.secondary
                  }
                  error={touched.guests && Boolean(errors.guests)}
                  keyboardType="numeric"
                  maxLength={3}
                  onBlur={handleBlur('guests')}
                  onChangeText={handleChange('guests')}
                  style={styles.textInput}
                  value={values.guests}
                  render={props => (
                    <MaskInput
                      {...props}
                      mask={createNumberMask({
                        delimiter: ',',
                        separator: '.',
                        precision: 0,
                      })}
                      onChangeText={(masked, unmasked) =>
                        setFieldValue('guests', unmasked)
                      }
                    />
                  )}
                />
                <HelperText
                  type="error"
                  style={styles.helperText}
                  visible={touched.guests && errors.guests ? true : false}>
                  {errors.guests}
                </HelperText>
              </View>

              <View style={{flex: 0.67}}>
                <TextInput
                  label="Extra Details (Optional)"
                  placeholder="Extra info about this purchase"
                  activeUnderlineColor={
                    touched.details && Boolean(errors.details)
                      ? theme.colors.error
                      : theme.colors.secondary
                  }
                  error={touched.details && Boolean(errors.details)}
                  maxLength={100}
                  multiline
                  numberOfLines={3}
                  onBlur={handleBlur('details')}
                  onChangeText={handleChange('details')}
                  style={styles.textInput}
                  value={values.details}
                />
                <HelperText
                  type="info"
                  style={styles.helperText}
                  visible={values.details ? true : false}>
                  Chars {`${values.details.length}/100`}
                </HelperText>
              </View>
            </View>

            <ButtonX
              errors={errors}
              isSubmitting={isSubmitting}
              touched={touched}
              values={values}
              onPress={() => handleSubmit()}>
              PROCEED
            </ButtonX>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

export default Add;
