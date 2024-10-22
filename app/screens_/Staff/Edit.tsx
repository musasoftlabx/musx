// * React Native
import {Alert, View} from 'react-native';

// * React Native Libraries
import {Button, Text, TextInput, useTheme} from 'react-native-paper';
import {RFPercentage as s} from 'react-native-responsive-fontsize';

// * JS Libraries
import {useMutation} from '@tanstack/react-query';
import {Formik} from 'formik';
import * as Yup from 'yup';

// * Utilities
import {useConfigStore} from '../../store';
import {styles} from '../../styles';

const Edit = (props: {item: {name: any}}) => {
  const {name} = props.item;

  const theme = useTheme();
  // ? useStore
  const axios = useConfigStore(state => state.axios);

  // ? useMutation
  const {mutate} = useMutation(body => axios.post('login', body));

  return (
    <Formik
      initialValues={{closing: ''}}
      validationSchema={Yup.object({
        closing: Yup.number()
          .test(
            'len',
            'Max of 3 chars',
            (v: any) => v && v.toString().length <= 3,
          )
          .required('Required'),
      })}
      onSubmit={(values, {setSubmitting}) => {
        console.log('dggerheb');
        Alert.alert('sub', 'error.response.data.body', [{text: 'OK'}]);
      }}>
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
      }) => (
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}>
          <Text style={{fontSize: s(2)}}>Edit entry for</Text>
          <Text style={{fontSize: s(3), marginTop: -5, marginBottom: 10}}>
            {name}
          </Text>
          <TextInput
            label="Closing"
            onChangeText={handleChange('closing')}
            onBlur={handleBlur('closing')}
            placeholder="amount"
            keyboardType="numeric"
            maxLength={3}
            style={styles.textInput}
            theme={{roundness: 0}}
            value={values.closing}
          />

          <View
            style={{
              backgroundColor:
                JSON.stringify(touched) === '{}' ||
                JSON.stringify(errors) !== '{}' ||
                isSubmitting
                  ? 'transparent'
                  : theme.colors.primary,
              borderRadius: 40,
              marginHorizontal: 50,
            }}>
            <Button
              contentStyle={{
                borderColor: theme.colors.background,
                borderRadius: 40,
                borderWidth: 2,
                margin: 2,
              }}
              disabled={
                JSON.stringify(touched) === '{}' ||
                JSON.stringify(errors) !== '{}' ||
                isSubmitting
              }
              labelStyle={{fontSize: s(2)}}
              loading={isSubmitting}
              mode="contained"
              onPress={() => handleSubmit()}
              style={{
                elevation:
                  JSON.stringify(touched) !== '{}' || isSubmitting ? 0 : 20,
              }}
              textColor="white"
              theme={{roundness: 6}}>
              UPDATE
            </Button>
          </View>
        </View>
      )}
    </Formik>
  );
};

export default Edit;
