// * React
import {useState} from 'react';

// * React Native
import {Alert, useWindowDimensions, View} from 'react-native';

// * React Native Libraries
import {useNavigation} from '@react-navigation/native';
import MaskInput, {createNumberMask} from 'react-native-mask-input';
import {Chip, HelperText, TextInput, useTheme} from 'react-native-paper';

// * JS Libraries
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Formik} from 'formik';
import * as Yup from 'yup';

// * Components
import ButtonX from '../../../components/ButtonX';
import SelectX from '../../../components/SelectX';
import TextX from '../../../components/TextX';

// * Utilities
import {useConfigStore} from '../../../store';
import {styles} from '../../../styles';

// * Interfaces
interface IForm {
  item: String;
  department: String;
  qty: String;
  price: String;
  seller: String;
  details: String;
}

const Add = ({navigation, route}: any) => {
  // ? Hooks
  const axios = useConfigStore(state => state.axios);
  const queryClient = useQueryClient();
  const theme = useTheme();
  const layout = useWindowDimensions();
  const {data: departments, isFetched} = useQuery(
    ['departments'],
    ({queryKey}) => axios.get(queryKey[0]),
    {select: data => data.data},
  );
  const {data: frequents, isFetched: hasFetched} = useQuery(
    ['frequents'],
    () => axios.get(`purchases/frequents`),
    {select: data => data.data},
  );
  const {mutate} = useMutation((data: IForm) => axios.post('purchases', data));

  // ? States
  const [showFrequents, setShowFrequents] = useState(false);

  return (
    <Formik
      initialValues={{
        item: '',
        department: '',
        qty: '',
        price: '',
        seller: '',
        details: '',
      }}
      validationSchema={Yup.object({
        item: Yup.string().max(20, 'Max of {max} chars').required('Required'),
        department: Yup.string().required('Required'),
        qty: Yup.string().max(4, 'Max of {max} chars').required('Required'),
        price: Yup.string().max(13, 'Max of {max} chars').required('Required'),
        seller: Yup.string().max(30, 'Max of {max} chars').required('Required'),
        details: Yup.string().max(100, 'Max of {max} chars'),
      })}
      onSubmit={(values, {setSubmitting}) => {
        setSubmitting(false);
        Alert.alert('Confirm', 'Is this a paid or invoiced purchase?', [
          {text: 'CANCEL'},
          {
            text: 'INVOICED',
            onPress: () =>
              navigation.navigate('Signature', {
                values,
                apiRoute: 'purchases',
                from: 'Purchases',
                query: 'purchases',
              }),
          },
          {
            text: 'PAID',
            onPress: () => {
              setSubmitting(true);
              mutate(values, {
                onSuccess: () => {
                  queryClient.prefetchInfiniteQuery(['purchases']);
                  navigation.goBack();
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
          <TextInput
            label="Item *"
            placeholder="Name of the item"
            activeUnderlineColor={
              touched.item && Boolean(errors.item)
                ? theme.colors.error
                : theme.colors.secondary
            }
            error={touched.item && Boolean(errors.item)}
            maxLength={20}
            onBlur={handleBlur('item')}
            onChangeText={handleChange('item')}
            right={
              <TextInput.Icon
                icon={showFrequents ? 'collapse-all' : 'animation-outline'}
                onPress={() => setShowFrequents(prev => !prev)}
              />
            }
            style={styles.textInput}
            value={values.item}
          />
          <HelperText
            type="error"
            style={styles.helperText}
            visible={touched.item && errors.item ? true : false}>
            {errors.item}
          </HelperText>

          {showFrequents && (
            <>
              <TextX scale={1.7} style={{marginLeft: 5}}>
                Pick from frequents
              </TextX>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginBottom: 15,
                  marginRight: 20,
                  width: layout.width,
                }}>
                {frequents.map(({item}: {item: string}, key: number) => (
                  <Chip
                    key={key}
                    selected={values.item === item ? true : false}
                    selectedColor="#000"
                    showSelectedOverlay
                    style={{backgroundColor: '#e0e0e0', margin: 5}}
                    onPress={() => setFieldValue('item', item)}>
                    {item}
                  </Chip>
                ))}
              </View>
            </>
          )}

          <SelectX
            departments={departments}
            field="department"
            isFetched={isFetched}
            onValueChange={value => {
              setFieldValue('department', value);
              value && setFieldTouched('department', true);
            }}
            touched={touched.department}
            value={values.department}
          />

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flex: 0.37}}>
              <TextInput
                label="Quantity *"
                placeholder="purchased"
                activeUnderlineColor={
                  touched.qty && Boolean(errors.qty)
                    ? theme.colors.error
                    : theme.colors.secondary
                }
                error={touched.qty && Boolean(errors.qty)}
                keyboardType="numeric"
                maxLength={4}
                onBlur={handleBlur('qty')}
                onChangeText={handleChange('qty')}
                style={styles.textInput}
                value={values.qty}
                render={props => (
                  <MaskInput
                    {...props}
                    mask={createNumberMask({
                      delimiter: ',',
                      separator: '.',
                      precision: 0,
                    })}
                    onChangeText={(masked, unmasked) =>
                      setFieldValue('qty', unmasked)
                    }
                  />
                )}
              />
              <HelperText
                type="error"
                style={styles.helperText}
                visible={touched.qty && errors.qty ? true : false}>
                {errors.qty}
              </HelperText>
            </View>

            <View style={{flex: 0.57}}>
              <TextInput
                label="Unit Price *"
                placeholder="of the item"
                activeUnderlineColor={
                  touched.price && Boolean(errors.price)
                    ? theme.colors.error
                    : theme.colors.secondary
                }
                error={touched.price && Boolean(errors.price)}
                keyboardType="numeric"
                maxLength={12}
                onBlur={handleBlur('price')}
                style={styles.textInput}
                value={values.price}
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
                      setFieldValue('price', unmasked)
                    }
                  />
                )}
              />
              <HelperText
                type="error"
                style={styles.helperText}
                visible={touched.price && errors.price ? true : false}>
                {errors.price}
              </HelperText>
            </View>
          </View>

          <TextInput
            label="Seller *"
            placeholder="Individual or company"
            activeUnderlineColor={
              touched.seller && Boolean(errors.seller)
                ? theme.colors.error
                : theme.colors.secondary
            }
            error={touched.seller && Boolean(errors.seller)}
            maxLength={30}
            onBlur={handleBlur('seller')}
            onChangeText={handleChange('seller')}
            style={styles.textInput}
            value={values.seller}
          />
          <HelperText
            type="error"
            style={styles.helperText}
            visible={touched.seller && errors.seller ? true : false}>
            {errors.seller}
          </HelperText>

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
  );
};

export default Add;
