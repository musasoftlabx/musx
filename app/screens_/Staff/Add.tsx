// * React Native
import {Alert, useColorScheme, View} from 'react-native';

// * React Native Libraries
import {ScrollView} from 'react-native-gesture-handler';
import MaskInput, {createNumberMask} from 'react-native-mask-input';
import {HelperText, Switch, TextInput, useTheme} from 'react-native-paper';

// * JS Libraries
import {useMutation, useQuery} from '@tanstack/react-query';
import {Formik} from 'formik';
import * as Yup from 'yup';

// * Components
import ButtonX from '../../components/ButtonX';
import FileUploadX from '../../components/FileUploadX';
import SelectX from '../../components/SelectX';
import TextX from '../../components/TextX';

// * Utilities
import {useConfigStore} from '../../store';
import {styles} from '../../styles';

export default function Add({navigation}: {navigation: any}) {
  // ? Hooks
  const axios = useConfigStore(state => state.axios);
  const theme = useTheme();
  const mode: string = useColorScheme() || 'light';
  console.log(mode);
  const {mutate} = useMutation((data: HTMLFormElement) =>
    axios({
      method: 'POST',
      url: 'staff',
      data,
      headers: {
        'Content-Type': 'multipart/form-data;',
      },
    }),
  );
  const {data: roles, isFetched} = useQuery(
    ['roles'],
    ({queryKey}) => axios.get(queryKey[0]),
    {select: data => data.data},
  );

  return (
    <ScrollView>
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          emailAddress: '',
          phoneNumber: '',
          salary: '',
          role: '',
          permanent: false,
          image: {uri: '', type: ''},
        }}
        validationSchema={Yup.object({
          firstName: Yup.string()
            .max(20, 'Max of ${max} chars')
            .required('Required'),
          lastName: Yup.string()
            .max(20, 'Max of ${max} chars')
            .required('Required'),
          emailAddress: Yup.string()
            .email('Invalid Email Address')
            .max(50, 'Max of ${max} chars'),
          phoneNumber: Yup.string()
            .min(10, 'Invalid Phone Number')
            .required('Required'),
          salary: Yup.string(),
          role: Yup.string().required('Required'),
          permanent: Yup.boolean(),
        })}
        onSubmit={(values, {setSubmitting, resetForm}) => {
          let formData = new FormData();
          values.image.uri &&
            formData.append('image', {
              name: `photo.${values.image.type.split('/')[1]}`,
              uri: values.image.uri,
              type: values.image.type,
            });
          formData.append('firstName', values.firstName);
          formData.append('lastName', values.lastName);
          formData.append('emailAddress', values.emailAddress);
          formData.append('phoneNumber', values.phoneNumber);
          formData.append('salary', values.salary);
          formData.append('role', values.role);
          formData.append('permanent', values.permanent);

          mutate(formData, {
            onSuccess: () => {
              resetForm();
              navigation.navigate('Staff');
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
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          setFieldTouched,
        }) => (
          <View style={{padding: 20}}>
            <TextInput
              label="First Name *"
              placeholder="Enter First Name"
              activeUnderlineColor={
                touched.firstName && Boolean(errors.firstName)
                  ? theme.colors.error
                  : theme.colors.secondary
              }
              error={touched.firstName && Boolean(errors.firstName)}
              maxLength={20}
              onBlur={handleBlur('firstName')}
              onChangeText={handleChange('firstName')}
              style={styles[`${mode}TextInput`]}
              value={values.firstName}
            />
            <HelperText
              type="error"
              style={styles.helperText}
              visible={touched.firstName && errors.firstName ? true : false}>
              {errors.firstName}
            </HelperText>

            <TextInput
              label="Last Name *"
              placeholder="Enter Last Name"
              activeUnderlineColor={
                touched.lastName && Boolean(errors.lastName)
                  ? theme.colors.error
                  : theme.colors.secondary
              }
              error={touched.lastName && Boolean(errors.lastName)}
              maxLength={20}
              onBlur={handleBlur('lastName')}
              onChangeText={handleChange('lastName')}
              style={styles[`${mode}TextInput`]}
              value={values.lastName}
            />
            <HelperText
              type="error"
              style={styles.helperText}
              visible={touched.lastName && errors.lastName ? true : false}>
              {errors.lastName}
            </HelperText>

            <TextInput
              label="Email Address (Optional)"
              placeholder="Enter Email Address"
              activeUnderlineColor={
                touched.emailAddress && Boolean(errors.emailAddress)
                  ? theme.colors.error
                  : theme.colors.secondary
              }
              error={touched.emailAddress && Boolean(errors.emailAddress)}
              keyboardType="email-address"
              maxLength={50}
              onBlur={handleBlur('emailAddress')}
              onChangeText={handleChange('emailAddress')}
              style={styles[`${mode}TextInput`]}
              value={values.emailAddress}
            />
            <HelperText
              type="error"
              style={styles.helperText}
              visible={
                touched.emailAddress && errors.emailAddress ? true : false
              }>
              {errors.emailAddress}
            </HelperText>

            <TextInput
              label="Phone Number *"
              placeholder="Enter Phone Number"
              activeUnderlineColor={
                touched.phoneNumber && Boolean(errors.phoneNumber)
                  ? theme.colors.error
                  : theme.colors.secondary
              }
              error={touched.phoneNumber && Boolean(errors.phoneNumber)}
              keyboardType="number-pad"
              onBlur={handleBlur('phoneNumber')}
              onChangeText={handleChange('phoneNumber')}
              style={styles[`${mode}TextInput`]}
              value={values.phoneNumber}
              render={props => (
                <MaskInput
                  {...props}
                  mask={[
                    /\d/,
                    /\d/,
                    /\d/,
                    /\d/,
                    /\d/,
                    /\d/,
                    /\d/,
                    /\d/,
                    /\d/,
                    /\d/,
                  ]}
                />
              )}
            />
            <HelperText
              type="error"
              style={styles.helperText}
              visible={
                touched.phoneNumber && errors.phoneNumber ? true : false
              }>
              {errors.phoneNumber}
            </HelperText>

            <TextInput
              label="Salary (Optional)"
              placeholder="Enter Salary"
              activeUnderlineColor={
                touched.salary && Boolean(errors.salary)
                  ? theme.colors.error
                  : theme.colors.secondary
              }
              keyboardType="number-pad"
              maxLength={15}
              onBlur={handleBlur('salary')}
              style={styles[`${mode}TextInput`]}
              value={values.salary}
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
                    setFieldValue('salary', unmasked)
                  }
                />
              )}
            />

            <SelectX
              items={roles}
              field="role"
              isFetched={isFetched}
              onValueChange={(value: any) => {
                setFieldValue('role', value);
                value && setFieldTouched('role', true);
              }}
              touched={touched.role}
              value={values.role}
            />

            <View style={{alignItems: 'flex-start', marginBottom: 20}}>
              <TextX scale={2.1}>Is this staff member permanent?</TextX>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: -2,
                  marginTop: 8,
                }}>
                <Switch
                  color={theme.colors.secondary}
                  value={values.permanent}
                  onValueChange={() =>
                    setFieldValue('permanent', !values.permanent)
                  }
                  style={{marginRight: 5}}
                />
                <TextX scale={2.3}>{values.permanent ? 'Yes' : 'No'}</TextX>
              </View>
            </View>

            <FileUploadX
              addImage={value => setFieldValue('image', value)}
              removeImage={() => setFieldValue('image', {uri: '', type: ''})}
              value={values.image.uri}
            />

            <ButtonX
              errors={errors}
              isSubmitting={isSubmitting}
              touched={touched}
              values={values}
              onPress={() => handleSubmit()}>
              ADD USER
            </ButtonX>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}
