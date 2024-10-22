// * React Native
import {Alert, Platform, Pressable, Vibration, View} from 'react-native';

// * React Native Libraries
import FileViewer from 'react-native-file-viewer';
import * as RNFS from 'react-native-fs';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import {Button, Chip, TextInput, useTheme} from 'react-native-paper';

// * JS Libraries
import {useMutation, useQueryClient} from '@tanstack/react-query';
import dayjs, {ManipulateType} from 'dayjs';
import capitalize from 'lodash/capitalize';
import {Formik} from 'formik';
import * as Yup from 'yup';

// * Utilities
import {useConfigStore, useFilterStore, purchasesURL} from '../store';
import {styles} from '../styles';
import {useState} from 'react';
import TextX from './TextX';
import ButtonX from './ButtonX';

// * Interface
interface IProps {
  filterRef: any;
  operation: string;
  apiRoute: string;
}

const Filter = ({filterRef, operation, apiRoute}: IProps) => {
  // ? Hooks
  const setRange = useFilterStore(state => state.setRange);
  const axios = useConfigStore(state => state.axios);
  const queryClient = useQueryClient();
  const theme = useTheme();
  const {mutate} = useMutation((props: {from: string; to: string}) =>
    axios.get(`${apiRoute}/export/?from=${props.from}&to=${props.to}`),
  );

  // ? States
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  return (
    <Formik
      initialValues={{from: '', to: '', temp: new Date(), option: ''}}
      validationSchema={Yup.object({
        from: Yup.string().required('Required'),
        to: Yup.string().required('Required'),
      })}
      onSubmit={(values, {setSubmitting}) => {
        setRange(values);

        if (operation === 'FILTER') {
          queryClient.prefetchInfiniteQuery([apiRoute]);
          setSubmitting(false);
          filterRef.current.close();
        } else if (operation === 'EXPORT') {
          mutate(values, {
            async onSuccess({data: {fileName}}: any) {
              let dirExists: boolean;

              try {
                await RNFS.readDir('/storage/emulated/0/Download');
                dirExists = true;
              } catch (err) {
                dirExists = false;
              }

              const dir =
                Platform.OS === 'ios'
                  ? RNFS.DocumentDirectoryPath
                  : dirExists
                  ? '/storage/emulated/0/Download'
                  : RNFS.ExternalDirectoryPath;

              const path = `${dir}/${fileName}`;

              RNFS.downloadFile({
                fromUrl: purchasesURL + fileName,
                toFile: path,
              }).promise.then(() => {
                setSubmitting(false);
                Vibration.vibrate(100);
                FileViewer.open(path, {
                  showAppsSuggestions: true,
                  showOpenWithDialog: true,
                });
              });
            },
            onError: (error: any) => {
              setSubmitting(false);
              Alert.alert(
                error.response.data.subject,
                error.response.data.body,
                [{text: 'OK'}],
              );
            },
          });
        }
      }}>
      {({
        values,
        errors,
        touched,
        isSubmitting,
        handleSubmit,
        setFieldValue,
        setFieldTouched,
      }) => (
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}>
          <TextX bold color={theme.colors.primary} font="Laila-Bold" scale={3}>
            {capitalize(operation)} options
          </TextX>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: 20,
              marginTop: 10,
            }}>
            {['Today', 'Yesterday', 'Last Week', 'Last Month', 'Last Year'].map(
              (item, key) => (
                <Chip
                  key={key}
                  mode="outlined"
                  selected={values.option === item ? true : false}
                  selectedColor="#000"
                  showSelectedOverlay
                  style={{backgroundColor: '#e0e0e0', margin: 5}}
                  textStyle={{paddingVertical: 6}}
                  onPress={() => {
                    setFieldValue('option', item);
                    setFieldTouched('from', true);
                    setFieldTouched('to', true);

                    const start = (period: ManipulateType) => {
                      setFieldValue(
                        'from',
                        dayjs()
                          .subtract(1, period)
                          .startOf(period)
                          .format('YYYY-MM-DD'),
                      );
                    };
                    const end = (period: ManipulateType) => {
                      setFieldValue(
                        'to',
                        dayjs()
                          .subtract(1, period)
                          .endOf(period)
                          .format('YYYY-MM-DD'),
                      );
                    };

                    switch (item) {
                      case 'Today':
                        setFieldValue('from', dayjs().format('YYYY-MM-DD'));
                        setFieldValue('to', dayjs().format('YYYY-MM-DD'));
                        break;
                      case 'Yesterday':
                        start('day');
                        end('day');
                        break;
                      case 'Last Week':
                        start('week');
                        end('week');
                        break;
                      case 'Last Month':
                        start('month');
                        end('month');
                        break;
                      case 'Last Year':
                        start('year');
                        end('year');
                        break;
                    }
                  }}>
                  {item}
                </Chip>
              ),
            )}
          </View>

          <TextX scale={2.2} style={{marginBottom: 10}}>
            Refined {operation.toLowerCase()}
          </TextX>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flex: 0.47}}>
              <Pressable
                onPress={() => {
                  setFieldValue('to', '');
                  setFieldValue('option', '');
                  Platform.OS === 'ios'
                    ? setShowFrom(true)
                    : DateTimePickerAndroid.open({
                        value: dayjs().toDate(),
                        onChange: (e: any, d: any) => {
                          if (e.type === 'set') {
                            setFieldTouched('from', true);
                            setFieldValue(
                              'from',
                              dayjs(d).format('YYYY-MM-DD'),
                            );
                          }
                        },
                        mode: 'date',
                        is24Hour: false,
                      });
                }}
                style={{height: 55, marginBottom: -55, zIndex: 1}}
              />
              <TextInput
                label="From *"
                style={styles.textInput}
                value={values.from}
              />
            </View>

            <View style={{flex: 0.49}}>
              <Pressable
                disabled={!values.from || values.option.length > 0}
                onPress={() =>
                  Platform.OS === 'ios'
                    ? setShowTo(true)
                    : values.from &&
                      DateTimePickerAndroid.open({
                        value: dayjs().toDate(),
                        onChange: (e: any, d: any) => {
                          if (e.type === 'set') {
                            setFieldTouched('to', true);
                            setFieldValue('to', dayjs(d).format('YYYY-MM-DD'));
                          }
                        },
                        mode: 'date',
                        is24Hour: false,
                        minimumDate: (() => dayjs(values.from).toDate())(),
                      })
                }
                style={{height: 55, marginBottom: -55, zIndex: 1}}
              />
              <TextInput
                label="To *"
                disabled={!values.from}
                style={styles.textInput}
                value={values.to}
              />
            </View>
          </View>

          <ButtonX
            errors={values.option ? {} : errors}
            isSubmitting={isSubmitting}
            touched={touched}
            values={values}
            onPress={() => handleSubmit()}>
            {operation === 'FILTER' ? operation : 'EXPORT'}
          </ButtonX>

          {Platform.OS === 'ios' && showFrom && (
            <View>
              <DateTimePicker
                value={values.temp}
                mode="date"
                display="spinner"
                is24Hour={false}
                onChange={(event, d) => {
                  setFieldTouched('from', true);
                  setFieldValue('from', dayjs(d).format('YYYY-MM-DD'));
                  setFieldValue('to', '');
                }}
              />
              <Button mode="text" onPress={() => setShowFrom(false)}>
                CLOSE START DATE
              </Button>
            </View>
          )}

          {Platform.OS === 'ios' && showTo && (
            <View>
              <DateTimePicker
                value={values.temp}
                mode="date"
                display="spinner"
                is24Hour={false}
                onChange={(event, d) => {
                  setFieldTouched('to', true);
                  setFieldValue('to', dayjs(d).format('YYYY-MM-DD'));
                }}
              />
              <Button mode="text" onPress={() => setShowTo(false)}>
                CLOSE END DATE
              </Button>
            </View>
          )}
        </View>
      )}
    </Formik>
  );
};

export default Filter;
