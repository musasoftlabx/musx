// * React Native
import {Alert, View} from 'react-native';

// * React Native Libraries
import {HelperText, TextInput, useTheme} from 'react-native-paper';

// * JS Libraries
import {useMutation} from '@tanstack/react-query';
import {Formik} from 'formik';
import * as Yup from 'yup';

// * Utilities
import {useConfigStore} from '../../store';
import {styles} from '../../styles';
import ButtonX from '../../components/ButtonX';
import {queryClient} from '../../../App';
import MaskInput, {createNumberMask} from 'react-native-mask-input';
import TextX from '../../components/TextX';

// * Interfaces
import {ISelected} from './';
interface IForm {
  closing: string;
}

const Edit = ({
  editRef,
  item: {_id, item, opening, closing},
}: {
  editRef: any;
  item: ISelected;
}) => {
  const theme = useTheme();
  // ? useStore
  const axios = useConfigStore(state => state.axios);

  // ? useMutation
  const {mutate} = useMutation((data: IForm) => axios.put('kitchen', data));

  return (
    <Formik
      initialValues={{_id, closing: closing.toString() || ''}}
      validationSchema={Yup.object({
        closing: Yup.number()
          .test(
            'len',
            'Max of 3 chars',
            (v: any) => v && v.toString().length <= 3,
          )
          .required('Required'),
      })}
      onSubmit={(values, {resetForm, setSubmitting}) => {
        if (Number(values.closing) > opening) {
          setSubmitting(false);
          Alert.alert(
            'Not allowed',
            'Closing value cannot be greater than opening value',
            [{text: 'OK'}],
          );
        } else {
          mutate(values, {
            onSuccess: () => {
              queryClient.prefetchQuery(['kitchen']);
              resetForm();
              editRef.current?.close();
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
        }
      }}>
      {({
        errors,
        isSubmitting,
        touched,
        values,
        handleBlur,
        handleChange,
        handleSubmit,
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
          <TextX scale={2}>Edit entry for</TextX>
          <TextX mt={-5} mb={10} scale={3}>
            {item}
          </TextX>
          <TextInput
            label="Closing"
            placeholder="quantity"
            activeUnderlineColor={
              touched.closing && Boolean(errors.closing)
                ? theme.colors.error
                : theme.colors.secondary
            }
            error={touched.closing && Boolean(errors.closing)}
            keyboardType="numeric"
            maxLength={3}
            onBlur={handleBlur('closing')}
            style={styles.textInput}
            value={values.closing}
            render={props => (
              <MaskInput
                {...props}
                mask={createNumberMask({
                  delimiter: ',',
                  separator: '.',
                  precision: 0,
                })}
                onChangeText={(masked, unmasked) =>
                  setFieldValue('closing', unmasked)
                }
              />
            )}
          />
          <HelperText
            type="error"
            style={styles.helperText}
            visible={touched.closing && errors.closing ? true : false}>
            {errors.closing}
          </HelperText>

          <ButtonX
            errors={errors}
            isSubmitting={isSubmitting}
            values={values}
            onPress={() => handleSubmit()}
            style={{width: 150}}>
            UPDATE
          </ButtonX>
        </View>
      )}
    </Formik>
  );
};

export default Edit;
