// * React
import React, { useCallback, useEffect, useState } from 'react';

// * React Native
import { View, Alert } from 'react-native';

// * Libraries
import { FlashList } from '@shopify/flash-list';
import {
  HelperText,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBackHandler } from '@react-native-community/hooks';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { InferType, object } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import Animated from 'react-native-reanimated';
import Slider, { MarkerProps } from '@react-native-community/slider';

// * Components
import ButtonX from '../../components/ButtonX';
import LinearGradientX from '../../components/LinearGradientX';

// * Store
import { usePlayerStore } from '../../store';

// * Types
import { RootStackParamList } from '../../types';

// * Functions
import { formatTrackTime, refreshScreens } from '../../functions';

// * Styles
import { styles } from '../../styles';

// * Constants
import { yupString } from '../../constants/yup';

// * Icons
import Ionicons from 'react-native-vector-icons/Ionicons';
import useRotate360Animation from '../../shared/hooks/useRotate360Animation';

const schema = object({
  title: yupString,
  album: yupString,
  albumArtist: yupString,
  artists: yupString,
  genre: yupString,
  year: yupString,
});

type Form = InferType<typeof schema>;

export default function TrackMetadata({
  navigation,
  route: { params: _params },
}: NativeStackScreenProps<RootStackParamList, 'TrackMetadata', ''>) {
  // ? Store States
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const closeTrackDetails = usePlayerStore(state => state.closeTrackDetails);
  const palette = usePlayerStore(state => state.palette);

  // ? States
  const [snackbar, setSnackbar] = useState(false);
  const [trackGainDisabled, setTrackGainDisabled] = useState(false);
  const [isRefreshMetadataLoading, setRefreshMetadataLoading] = useState(false);
  const [params, setParams] = useState(_params);
  const [trackGain, setTrackGain] = useState(0);

  // ? Hooks
  const theme = useTheme();
  const rotate = useRotate360Animation();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, dirtyFields: dirty },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      title: params?.title,
      album: params?.album,
      albumArtist: params?.albumArtist,
      artists: params?.artists,
      genre: params?.genre,
      year: params?.year,
    },
  });

  // ? Mutations
  const { mutate: updateTrackGain } = useMutation({
    mutationFn: (data: HTMLFormElement) => axios.put('updateTrackGain', data),
  });

  const { mutate: refreshMetadata } = useMutation({
    mutationFn: () => axios.post(`refreshMetadata`, { path: params?.path }),
    onSuccess: () => {
      axios.get(`trackMetadata/${params?.id}`).then(({ data }) => {
        setParams(data);
        setRefreshMetadataLoading(false);
        refreshScreens(activeTrack);
      });
    },
  });

  // ? Effects
  useEffect(() => closeTrackDetails(), []);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: palette?.[1] ?? '#000' },
    });
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        isRefreshMetadataLoading ? (
          <Animated.View style={[{ marginRight: 10 }, rotate]}>
            <Ionicons color="#fff" name="refresh-circle-outline" size={24} />
          </Animated.View>
        ) : (
          <Ionicons
            color="#fff"
            name="refresh-sharp"
            size={24}
            style={{ marginRight: 10 }}
            onPress={() => {
              setRefreshMetadataLoading(true);
              refreshMetadata();
            }}
          />
        ),
    });
  }, [isRefreshMetadataLoading]);

  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  // ? Callbacks
  const StepMarker = useCallback(
    ({ stepMarked, currentValue }: MarkerProps) => (
      <Text style={{ color: '#fff', fontSize: 10 }}>
        {stepMarked ? currentValue : ''}
      </Text>
    ),
    [],
  );

  return (
    <>
      <LinearGradientX />

      <FlashList
        data={[
          { label: 'Id', value: params?.id.toString() },
          {
            label: 'Bitrate',
            value: `${(params?.bitrate / 1000).toFixed(3)} Kbps`,
          },
          {
            label: 'Sample Rate',
            value: `${(params?.sampleRate / 1000).toFixed(3)} Khz`,
          },
          { label: 'Channel Layout', value: params?.channelLayout },
          { label: 'Channels', value: params?.channels.toString() },
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
          { label: 'Format', value: params?.format.toLocaleUpperCase() },
          { label: 'Encoder', value: params?.encoder },
        ]}
        numColumns={3}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: { item: { label: string; value: string } }) => (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: '#fff5',
              borderColor: '#fff8',
              borderRadius: 30,
              borderWidth: 1,
              flex: 1,
              margin: 10,
              paddingVertical: 20,
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>{item.label}</Text>
            <Text>{item.value}</Text>
          </View>
        )}
        ListFooterComponent={
          <View style={{ padding: 20 }}>
            {/* Title */}
            <Controller
              name="title"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Title *"
                    placeholder=""
                    onBlur={onBlur}
                    onChangeText={onChange}
                    maxLength={50}
                    value={value}
                    style={styles.darkTextInput}
                    activeUnderlineColor={
                      dirty.title && Boolean(errors.title)
                        ? theme.colors.error
                        : theme.colors.primary
                    }
                  />

                  <HelperText
                    type="error"
                    style={styles.helperText}
                    visible={dirty.title && errors.title ? true : false}
                  >
                    {errors.title?.message as string}
                  </HelperText>
                </>
              )}
            />

            {/* Album */}
            <Controller
              name="album"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Album *"
                    placeholder=""
                    onBlur={onBlur}
                    onChangeText={onChange}
                    maxLength={50}
                    value={value}
                    style={styles.darkTextInput}
                    activeUnderlineColor={
                      dirty.album && Boolean(errors.album)
                        ? theme.colors.error
                        : theme.colors.primary
                    }
                  />

                  <HelperText
                    type="error"
                    style={styles.helperText}
                    visible={dirty.album && errors.album ? true : false}
                  >
                    {errors.album?.message as string}
                  </HelperText>
                </>
              )}
            />

            {/* Album Artist */}
            <Controller
              name="albumArtist"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Album Artist *"
                    placeholder=""
                    onBlur={onBlur}
                    onChangeText={onChange}
                    maxLength={100}
                    value={value}
                    style={styles.darkTextInput}
                    activeUnderlineColor={
                      dirty.albumArtist && Boolean(errors.albumArtist)
                        ? theme.colors.error
                        : theme.colors.primary
                    }
                  />

                  <HelperText
                    type="error"
                    style={styles.helperText}
                    visible={
                      dirty.albumArtist && errors.albumArtist ? true : false
                    }
                  >
                    {errors.albumArtist?.message as string}
                  </HelperText>
                </>
              )}
            />

            {/* Artists */}
            <Controller
              name="artists"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Artists *"
                    placeholder=""
                    onBlur={onBlur}
                    onChangeText={onChange}
                    maxLength={100}
                    value={value}
                    style={styles.darkTextInput}
                    activeUnderlineColor={
                      dirty.artists && Boolean(errors.artists)
                        ? theme.colors.error
                        : theme.colors.primary
                    }
                  />

                  <HelperText
                    type="error"
                    style={styles.helperText}
                    visible={dirty.artists && errors.artists ? true : false}
                  >
                    {errors.artists?.message as string}
                  </HelperText>
                </>
              )}
            />

            {/* Genre */}
            <Controller
              name="genre"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Genre *"
                    placeholder=""
                    onBlur={onBlur}
                    onChangeText={onChange}
                    maxLength={50}
                    value={value}
                    style={styles.darkTextInput}
                    activeUnderlineColor={
                      dirty.genre && Boolean(errors.genre)
                        ? theme.colors.error
                        : theme.colors.primary
                    }
                  />

                  <HelperText
                    type="error"
                    style={styles.helperText}
                    visible={dirty.genre && errors.genre ? true : false}
                  >
                    {errors.genre?.message as string}
                  </HelperText>
                </>
              )}
            />

            {/* Year */}
            <Controller
              name="year"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Year *"
                    placeholder=""
                    onBlur={onBlur}
                    onChangeText={onChange}
                    maxLength={5}
                    value={value}
                    style={styles.darkTextInput}
                    activeUnderlineColor={
                      dirty.year && Boolean(errors.year)
                        ? theme.colors.error
                        : theme.colors.primary
                    }
                  />

                  <HelperText
                    type="error"
                    style={styles.helperText}
                    visible={dirty.year && errors.year ? true : false}
                  >
                    {errors.year?.message as string}
                  </HelperText>
                </>
              )}
            />

            <Text style={{ marginTop: 10, textAlign: 'center' }}>
              Adjust volume (gain) for this track by +3dB or -3dB
            </Text>

            <Slider
              value={trackGain}
              step={3}
              style={{ paddingVertical: 10 }}
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
                    onSuccess: ({ data }) => {
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
              StepMarker={StepMarker}
            />

            {/*<View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <ButtonX
                loading={isRefreshMetadataLoading}
                borderRadius={10}
                onPress={() => {
                  setRefreshMetadataLoading(true);
                  refreshMetadata();
                }}
              >
                Refresh Metadata
              </ButtonX>

              <ButtonX
                errors={errors}
                isSubmitting={isSubmitting}
                touched={dirty}
                borderRadius={10}
                onPress={handleSubmit(formData =>
                  updateMetadata(formData, {
                    onSuccess: () => reset(),
                    onError: (error: any) => {
                      Alert.alert(
                        error.response.data.subject,
                        error.response.data.body,
                        [{ text: 'OK' }],
                      );
                    },
                    onSettled: () => isSubmitting,
                  }),
                )}
              >
                UPDATE
              </ButtonX> 
            </View>*/}
          </View>
        }
      />

      <Snackbar visible={snackbar} duration={3000} onDismiss={() => {}}>
        Updated metadata successfully!
      </Snackbar>
    </>
  );
}
