// * React
import React, {useEffect, useState} from 'react';

// * React Native
import {Text, View, Alert, Image} from 'react-native';

// * Libraries
import * as Yup from 'yup';
import {FlashList} from '@shopify/flash-list';
import {Formik} from 'formik';
import {HelperText, Snackbar, TextInput, useTheme} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useBackHandler} from '@react-native-community/hooks';
import {useMutation} from '@tanstack/react-query';
import axios from 'axios';

// * Components
import ButtonX from '../../components/ButtonX';
import LinearGradientX from '../../components/LinearGradientX';

// * Store
import {usePlayerStore, WIDTH} from '../../store';

// * Types
import {RootStackParamList} from '../../types';

// * Functions
import {formatTrackTime} from '../../functions';

import {styles} from '../../styles';
import Slider from '@react-native-community/slider';

export default function TrackMetadata({
  navigation,
  route: {params: _params},
}: NativeStackScreenProps<RootStackParamList, 'TrackMetadata', ''>) {
  const theme = useTheme();

  // ? StoreStates
  const palette = usePlayerStore(state => state.palette);

  const [snackbar, setSnackbar] = useState(false);
  const [trackGainDisabled, setTrackGainDisabled] = useState(false);
  const [refreshMetadataLoading, setRefreshMetadataLoading] = useState(false);
  const [params, setParams] = useState(_params);
  const [trackGain, setTrackGain] = useState(0);

  const {mutate: updateMetadata} = useMutation({
    mutationFn: (data: HTMLFormElement) => axios.post('updateMetadata', data),
  });

  const {mutate: updateTrackGain} = useMutation({
    mutationFn: (data: HTMLFormElement) => axios.put('updateTrackGain', data),
  });

  const {mutate: refreshMetadata} = useMutation({
    mutationFn: () => axios.post(`refreshMetadata`, {path: params?.path}),
    onSuccess: () => {
      axios.get(`trackMetadata/${params?.id}`).then(({data}) => {
        setParams(data);
        setRefreshMetadataLoading(false);
      });
    },
  });

  // ? Effects
  useEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: palette?.[1] ?? '#000'},
    });
  });

  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  return (
    <>
      <LinearGradientX />

      <FlashList
        data={[
          {label: 'Id', value: params?.id.toString()},
          {
            label: 'Bitrate',
            value: `${(params?.bitrate / 1000).toFixed(3)} Kbps`,
          },
          {
            label: 'Sample Rate',
            value: `${(params?.sampleRate / 1000).toFixed(3)} Khz`,
          },
          {label: 'Channel Layout', value: params?.channelLayout},
          {label: 'Channels', value: params?.channels.toString()},
          {
            label: 'Size',
            value: `${Number(
              (params?.size / 1000).toFixed(2),
            ).toLocaleString()} MB`,
          },
          {
            label: 'Duration',
            value: `${formatTrackTime(params?.duration)} mins`,
          },
          {label: 'Format', value: params?.format.toLocaleUpperCase()},
          {label: 'Encoder', value: params?.encoder},
        ]}
        numColumns={3}
        keyExtractor={(_, index) => index.toString()}
        estimatedItemSize={10}
        renderItem={({item}: {item: {label: string; value: string}}) => (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              backgroundColor: '#fff5',
              borderColor: '#fff8',
              borderRadius: 30,
              borderWidth: 1,
              margin: 10,
              paddingVertical: 20,
            }}>
            <Text style={{fontWeight: 'bold'}}>{item.label}</Text>
            <Text>{item.value}</Text>
          </View>
        )}
        ListFooterComponent={
          <>
            <ButtonX
              loading={refreshMetadataLoading}
              style={{marginTop: 10}}
              onPress={() => {
                setRefreshMetadataLoading(true);
                refreshMetadata();
              }}>
              REFRESH METADATA
            </ButtonX>

            <Slider
              value={trackGain}
              step={3}
              style={{paddingVertical: 30, width: WIDTH}}
              disabled={trackGainDisabled}
              onValueChange={value => {
                setTrackGain(value);
                setTrackGainDisabled(true);
              }}
              onSlidingComplete={value =>
                updateTrackGain(
                  {
                    decibels: value,
                    trackId: _params?.id,
                    path: _params?.path,
                  },
                  {
                    onSuccess: ({data}) => {
                      console.log(data);
                      setTrackGainDisabled(false);
                    },
                    onError: err => {
                      console.log(err.message);
                      setTrackGainDisabled(false);
                    },
                  },
                )
              }
              minimumValue={-3}
              maximumValue={3}
              thumbTintColor="rgb(124, 25, 185)"
              minimumTrackTintColor="rgb(135, 255, 151)"
              maximumTrackTintColor="rgb(255, 108, 108)"
              renderStepNumber
              StepMarker={(stepMarked, currentValue) => (
                <Text style={{fontSize: 10}}>
                  {stepMarked ? currentValue : ''}
                </Text>
              )}
            />

            <Formik
              initialValues={{
                title: params?.title,
                album: params?.album,
                albumArtist: params?.albumArtist,
                artists: params?.artists,
                genre: params?.genre,
                year: params?.year,
              }}
              validationSchema={Yup.object({
                title: Yup.string()
                  .max(20, 'Max of ${max} chars')
                  .required('Required'),
                album: Yup.string()
                  .max(20, 'Max of ${max} chars')
                  .required('Required'),
                albumArtist: Yup.string()
                  .max(100, 'Max of ${max} chars')
                  .required('Required'),
                artists: Yup.string()
                  .max(20, 'Max of ${max} chars')
                  .required('Required'),
                genre: Yup.string()
                  .max(20, 'Max of ${max} chars')
                  .required('Required'),
                year: Yup.string()
                  .max(20, 'Max of ${max} chars')
                  .required('Required'),
              })}
              onSubmit={(values, {setSubmitting, resetForm}) => {
                let formData: any = new FormData();
                formData.append('title', values.title);
                formData.append('album', values.album);
                formData.append('albumArtist', values.albumArtist);
                formData.append('artists', values.artists);
                formData.append('genre', values.genre);
                formData.append('year', values.year);

                updateMetadata(formData, {
                  onSuccess: () => {
                    resetForm();
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
                  <Text style={{marginBottom: 10}}>Update track metadata</Text>

                  {/* Title */}
                  <TextInput
                    label="Title *"
                    placeholder=""
                    activeUnderlineColor={
                      touched.title && Boolean(errors.title)
                        ? theme.colors.error
                        : theme.colors.secondary
                    }
                    error={touched.title && Boolean(errors.title)}
                    maxLength={50}
                    onBlur={handleBlur('title')}
                    onChangeText={handleChange('title')}
                    style={styles.darkTextInput}
                    value={values.title}
                  />
                  <HelperText
                    type="error"
                    style={styles.helperText}
                    visible={touched.title && errors.title ? true : false}>
                    {errors.title}
                  </HelperText>

                  {/* Album */}
                  <TextInput
                    label="Album *"
                    placeholder=""
                    activeUnderlineColor={
                      touched.album && Boolean(errors.album)
                        ? theme.colors.error
                        : theme.colors.secondary
                    }
                    error={touched.album && Boolean(errors.album)}
                    maxLength={50}
                    onBlur={handleBlur('album')}
                    onChangeText={handleChange('album')}
                    style={styles.darkTextInput}
                    value={values.album}
                  />
                  <HelperText
                    type="error"
                    style={styles.helperText}
                    visible={touched.album && errors.album ? true : false}>
                    {errors.album}
                  </HelperText>

                  {/* Album Artist */}
                  <TextInput
                    label="Album Artist *"
                    placeholder=""
                    activeUnderlineColor={
                      touched.albumArtist && Boolean(errors.albumArtist)
                        ? theme.colors.error
                        : theme.colors.secondary
                    }
                    error={touched.albumArtist && Boolean(errors.albumArtist)}
                    maxLength={100}
                    onBlur={handleBlur('albumArtist')}
                    onChangeText={handleChange('albumArtist')}
                    style={styles.darkTextInput}
                    value={values.albumArtist}
                  />
                  <HelperText
                    type="error"
                    style={styles.helperText}
                    visible={
                      touched.albumArtist && errors.albumArtist ? true : false
                    }>
                    {errors.albumArtist}
                  </HelperText>

                  {/* Artists */}
                  <TextInput
                    label="Artists *"
                    placeholder=""
                    activeUnderlineColor={
                      touched.artists && Boolean(errors.artists)
                        ? theme.colors.error
                        : theme.colors.secondary
                    }
                    error={touched.artists && Boolean(errors.artists)}
                    maxLength={100}
                    onBlur={handleBlur('artists')}
                    onChangeText={handleChange('artists')}
                    style={styles.darkTextInput}
                    value={values.artists}
                  />
                  <HelperText
                    type="error"
                    style={styles.helperText}
                    visible={touched.artists && errors.artists ? true : false}>
                    {errors.artists}
                  </HelperText>

                  {/* Genre */}
                  <TextInput
                    label="Genre *"
                    placeholder=""
                    activeUnderlineColor={
                      touched.genre && Boolean(errors.genre)
                        ? theme.colors.error
                        : theme.colors.secondary
                    }
                    error={touched.genre && Boolean(errors.genre)}
                    maxLength={50}
                    onBlur={handleBlur('genre')}
                    onChangeText={handleChange('genre')}
                    style={styles.darkTextInput}
                    value={values.genre}
                  />
                  <HelperText
                    type="error"
                    style={styles.helperText}
                    visible={touched.genre && errors.genre ? true : false}>
                    {errors.genre}
                  </HelperText>

                  {/* Year */}
                  <TextInput
                    label="Year *"
                    placeholder=""
                    activeUnderlineColor={
                      touched.year && Boolean(errors.year)
                        ? theme.colors.error
                        : theme.colors.secondary
                    }
                    error={touched.year && Boolean(errors.year)}
                    maxLength={10}
                    onBlur={handleBlur('year')}
                    onChangeText={handleChange('year')}
                    style={styles.darkTextInput}
                    value={values.year}
                  />
                  <HelperText
                    type="error"
                    style={styles.helperText}
                    visible={touched.year && errors.year ? true : false}>
                    {errors.year}
                  </HelperText>

                  <ButtonX
                    errors={errors}
                    isSubmitting={isSubmitting}
                    touched={touched}
                    values={values}
                    onPress={() => handleSubmit()}>
                    UPDATE
                  </ButtonX>
                </View>
              )}
            </Formik>
          </>
        }
      />

      <Snackbar visible={snackbar} duration={3000} onDismiss={() => {}}>
        Updated metadata successfully!
      </Snackbar>
    </>
  );
}
