// * React Native
import {Alert, View} from 'react-native';

// * React Native Libraries
import {ScrollView} from 'react-native-gesture-handler';
import MaskInput, {createNumberMask} from 'react-native-mask-input';
import {HelperText, TextInput, useTheme} from 'react-native-paper';

// * JS Libraries
import {useMutation, useQuery} from '@tanstack/react-query';
import {Formik} from 'formik';
import * as Yup from 'yup';

// * Components
import ButtonX from '../../components/ButtonX';
import FileUploadX from '../../components/FileUploadX';
import SelectX from '../../components/SelectX';

// * Utilities
import {useConfigStore} from '../../store';
import {styles} from '../../styles';

export default function Add({navigation}: {navigation: any}) {
  // ? Hooks
  const axios = useConfigStore(state => state.axios);
  const theme = useTheme();

  const {data: departments, isFetched} = useQuery(
    ['departments'],
    ({queryKey}) => axios.get(queryKey[0]),
    {select: data => data.data},
  );

  const {mutate} = useMutation((data: FormData) =>
    axios({
      headers: {'Content-Type': 'multipart/form-data;'},
      method: 'POST',
      url: 'menu',
      data,
    }),
  );

  return (
    <ScrollView>
      <Formik
        initialValues={{
          item: '',
          department: '',
          price: {marked: '', sales: '', similar: false},
          description: '',
          inStock: true,
          image: {uri: '', type: ''},
        }}
        validationSchema={Yup.object({
          item: Yup.string().max(20, 'Max of {max} chars').required('Required'),
          department: Yup.string().required('Required'),
          price: Yup.object({
            marked: Yup.string().required('Required'),
            sales: Yup.string(),
          }),
          description: Yup.string().max(100, 'Max of {max} chars'),
          inStock: Yup.boolean(),
        })}
        onSubmit={(values, {setSubmitting, resetForm}) => {
          let formData = new FormData();

          formData.append('item', values.item);
          formData.append('department', values.department);
          formData.append('price', JSON.stringify(values.price));
          formData.append('description', values.description);
          formData.append('inStock', values.inStock);

          const name = `${values.department}-${values.item.replace(
            /[\W_]+/g,
            '',
          )}`.toLowerCase();

          values.image.uri &&
            formData.append('image', {
              name: `${name}.${values.image.type.split('/')[1]}`,
              uri: values.image.uri,
              type: values.image.type,
            });

          mutate(formData, {
            onSuccess(data: any) {
              resetForm();
              navigation.navigate('Menu', data.data);
            },
            onError: (error: any) => {
              Alert.alert(
                error.response.data.subject,
                error.response.data.body,
                [{text: 'OK'}],
              );
            },
            onSettled: () => setSubmitting(false),
          });
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
          <View style={{padding: 20}}>
            <TextInput
              label="Item *"
              placeholder="Enter Item"
              activeUnderlineColor={
                touched.item && Boolean(errors.item)
                  ? theme.colors.error
                  : theme.colors.secondary
              }
              error={touched.item && Boolean(errors.item)}
              maxLength={20}
              onBlur={handleBlur('item')}
              onChangeText={handleChange('item')}
              style={styles.textInput}
              value={values.item}
            />
            <HelperText
              type="error"
              style={styles.helperText}
              visible={touched.item && errors.item ? true : false}>
              {errors.item}
            </HelperText>

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

            <TextInput
              label="Marked Price *"
              placeholder="Enter Marked Price"
              activeUnderlineColor={
                touched.price?.marked && Boolean(errors.price?.marked)
                  ? theme.colors.error
                  : theme.colors.secondary
              }
              error={touched.price?.marked && Boolean(errors.price?.marked)}
              keyboardType="number-pad"
              maxLength={10}
              onBlur={handleBlur('price.marked')}
              style={styles.textInput}
              value={values.price.marked}
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
                    setFieldValue('price.marked', unmasked)
                  }
                />
              )}
            />
            <HelperText
              type="error"
              style={styles.helperText}
              visible={
                touched.price?.marked && errors.price?.marked ? true : false
              }>
              {errors.price?.marked}
            </HelperText>

            <TextInput
              label="Sales Price (Optional)"
              placeholder="Enter Sales Price"
              activeUnderlineColor={theme.colors.secondary}
              keyboardType="number-pad"
              maxLength={10}
              onBlur={handleBlur('price.sales')}
              style={styles.textInput}
              value={values.price.sales}
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
                    setFieldValue('price.sales', unmasked)
                  }
                />
              )}
            />
            <HelperText type="info" style={styles.helperText}>
              This can be left blank
            </HelperText>

            <TextInput
              label="Description (Optional)"
              placeholder="Enter Description"
              activeUnderlineColor={
                touched.description && Boolean(errors.description)
                  ? theme.colors.error
                  : theme.colors.secondary
              }
              error={touched.description && Boolean(errors.description)}
              maxLength={100}
              multiline
              numberOfLines={3}
              onBlur={handleBlur('description')}
              onChangeText={handleChange('description')}
              style={styles.textInput}
              value={values.description}
            />
            <HelperText
              type="info"
              style={styles.helperText}
              visible={values.description ? true : false}>
              Chars {`${values.description.length}/100`}
            </HelperText>

            <FileUploadX
              addImage={value => setFieldValue('image', value)}
              removeImage={() => setFieldValue('image', {uri: '', type: ''})}
              value={values.image.uri}
            />

            <ButtonX
              attributes={{
                errors,
                isSubmitting,
                label: 'ADD MENU ITEM',
                touched,
                values,
              }}
              onPress={() => handleSubmit()}
            />
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}
