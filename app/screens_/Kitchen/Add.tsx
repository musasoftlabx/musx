// * React
import {memo, useEffect, useState} from 'react';

// * React Native imports
import {Alert, useWindowDimensions, View} from 'react-native';

// * React Native Libraries
import {
  Button,
  Chip,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import {RFPercentage as s} from 'react-native-responsive-fontsize';

// * JS Libraries
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Formik} from 'formik';
import * as Yup from 'yup';

// * Utilities
import ButtonX from '../../components/ButtonX';
import TextX from '../../components/TextX';
import {styles} from '../../styles';
import {useConfigStore} from '../../store';
import MaskInput, {createNumberMask} from 'react-native-mask-input';

const Add = ({jumpTo}: {jumpTo: (index: string) => void}) => {
  // ? Hooks
  const axios = useConfigStore(state => state.axios);
  const queryClient = useQueryClient();
  const theme = useTheme();
  const layout = useWindowDimensions();

  const {data: frequents, isFetched: hasFetched} = useQuery(
    ['frequents'],
    () => axios.get(`purchases/frequents`),
    {select: data => data.data},
  );
  const {mutate} = useMutation((data: IForm) => axios.post('kitchen', data));

  const primary = theme.colors.primary;

  // ? States
  const [showFrequents, setShowFrequents] = useState(false);

  // * Interfaces
  interface IForm {
    item: string;
    opening: string;
    closing: string;
  }

  return (
    <Formik
      initialValues={{item: '', opening: '', closing: ''}}
      validationSchema={Yup.object({
        item: Yup.string().max(50, 'Max of 50 chars').required('Required'),
        opening: Yup.number()
          .test(
            'len',
            'Max of 3 chars',
            (v: any) => v && v.toString().length <= 3,
          )
          .required('Required'),
      })}
      onSubmit={(values, {resetForm, setSubmitting}) => {
        setSubmitting(false);
        mutate(values, {
          onSuccess: () => {
            queryClient.prefetchQuery(['kitchen']);
            jumpTo('first');
            resetForm();
          },
          onError: (error: any) => {
            setSubmitting(false);
            Alert.alert(error.response.data.subject, error.response.data.body, [
              {text: 'OK'},
            ]);
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
        setFieldValue,
      }) => (
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
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
                onPress={() => setShowFrequents((prev: any) => !prev)}
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

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flex: 0.45}}>
              <TextInput
                label="Opening *"
                placeholder="items"
                activeUnderlineColor={
                  touched.opening && Boolean(errors.opening)
                    ? theme.colors.error
                    : theme.colors.secondary
                }
                error={touched.opening && Boolean(errors.opening)}
                keyboardType="numeric"
                maxLength={3}
                onBlur={handleBlur('opening')}
                onChangeText={handleChange('opening')}
                style={styles.textInput}
                value={values.opening}
                render={props => (
                  <MaskInput
                    {...props}
                    mask={createNumberMask({
                      delimiter: ',',
                      separator: '.',
                      precision: 0,
                    })}
                    onChangeText={(masked, unmasked) =>
                      setFieldValue('opening', unmasked)
                    }
                  />
                )}
              />
              <HelperText
                type="error"
                style={styles.helperText}
                visible={touched.opening && errors.opening ? true : false}>
                {errors.opening}
              </HelperText>
            </View>

            <View style={{flex: 0.45}}>
              <TextInput
                label="Closing (optional)"
                placeholder="of the item"
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
            </View>
          </View>

          <ButtonX
            errors={errors}
            isSubmitting={isSubmitting}
            touched={touched}
            values={values}
            onPress={() => handleSubmit()}
            style={{width: 150}}>
            ADD
          </ButtonX>
        </View>
      )}
    </Formik>
  );
};

export default memo(Add);
