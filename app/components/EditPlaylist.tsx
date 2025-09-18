// * React
import React, { SetStateAction, useState } from 'react';

// * React Native
import { View, Modal, Alert, Vibration } from 'react-native';

// * Libraries
import { useBackHandler } from '@react-native-community/hooks';
import { useMutation } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import {
  Button,
  HelperText,
  useTheme,
  TextInput,
  Text,
} from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { InferType, object } from 'yup';
import axios from 'axios';

// * Store
import { WIDTH, usePlayerStore } from '../store';

// * Constants
import { yupString, yupStringOptional } from '../constants/yup';

// * Styles
import { styles } from '../styles';

// * Components
import ButtonX from './ButtonX';

// * Schema
const schema = object({
  name: yupString.max(20),
  description: yupStringOptional.max(500),
});

// * Types
type Form = InferType<typeof schema>;

export default function EditPlaylist({
  isAddPlaylistVisible,
  setIsAddPlaylistVisible,
}: {
  isAddPlaylistVisible: boolean;
  setIsAddPlaylistVisible: React.Dispatch<SetStateAction<boolean>>;
}) {
  // ? States
  const [isSubmitFormLoading, setIsSubmitFormLoading] = useState(false);

  // ? Store States
  const palette = usePlayerStore(state => state.palette);

  // ? Hooks
  const navigation = useNavigation();
  const theme = useTheme();
  useBackHandler(() => {
    navigation.goBack();
    return true;
  });

  // ? Constants
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting, dirtyFields: dirty },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  // ? Mutations
  const { mutate: createPlaylist } = useMutation({
    mutationFn: (data: Form) => axios.post('createPlaylist', data),
  });

  // ? Functions
  const onCancel = () => {
    if (JSON.stringify(dirty) !== '{}') {
      Vibration.vibrate(500);
      Alert.alert(
        'Unsubmitted entries',
        'Are you sure you want to discard the entry made?',
        [
          { text: 'CANCEL' },
          {
            text: 'YES',
            onPress: () => {
              reset();
              setIsAddPlaylistVisible(false);
            },
          },
        ],
      );
    } else setIsAddPlaylistVisible(false);
  };

  return (
    <Modal
      animationType="slide"
      backdropColor="#ad0cf32b"
      visible={isAddPlaylistVisible}
      onRequestClose={onCancel}
    >
      <View
        style={{
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: palette?.[1] ?? '#000',
            borderColor: '#777777ff',
            borderRadius: 30,
            borderWidth: 1,
            elevation: 5,
            paddingHorizontal: 30,
            paddingVertical: 30,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            width: WIDTH * 0.9,
            overflow: 'scroll',
          }}
        >
          <Text
            style={{
              fontFamily: 'Laila-Bold',
              fontSize: 20,
              marginBottom: 20,
            }}
          >
            Create new playlist
          </Text>

          <View style={{ gap: 5 }}>
            {/* Name */}
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Name *"
                    placeholder=""
                    onBlur={onBlur}
                    onChangeText={onChange}
                    maxLength={20}
                    value={value}
                    style={styles.darkTextInput}
                    activeUnderlineColor={
                      dirty.name && Boolean(errors.name)
                        ? theme.colors.error
                        : theme.colors.primary
                    }
                  />

                  <HelperText
                    type="error"
                    style={styles.helperText}
                    visible={dirty.name && errors.name ? true : false}
                  >
                    {errors.name?.message as string}
                  </HelperText>
                </>
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Description (Optional)"
                    placeholder=""
                    onBlur={onBlur}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={10}
                    maxLength={500}
                    value={value}
                    style={[styles.darkTextInput, { height: 100 }]}
                    activeUnderlineColor={
                      dirty.description && Boolean(errors.description)
                        ? theme.colors.error
                        : theme.colors.primary
                    }
                  />

                  <HelperText
                    type="error"
                    style={styles.helperText}
                    visible={
                      dirty.description && errors.description ? true : false
                    }
                  >
                    {errors.description?.message as string}
                  </HelperText>
                </>
              )}
            />

            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                gap: 40,
                justifyContent: 'flex-end',
              }}
            >
              <Button
                mode="text"
                labelStyle={{ fontFamily: 'Laila-Bold', fontSize: 18 }}
                onPress={onCancel}
              >
                CANCEL
              </Button>

              <ButtonX
                disabled={true}
                loading={isSubmitFormLoading}
                errors={errors}
                isSubmitting={isSubmitting}
                isValid={isValid}
                touched={dirty}
                borderRadius={10}
                onPress={handleSubmit(formData => {
                  setIsSubmitFormLoading(true);
                  createPlaylist(formData, {
                    onSuccess: () => reset(),
                    onError: (error: any) => {
                      Alert.alert(
                        error.response.data.subject,
                        error.response.data.body,
                        [{ text: 'OK' }],
                      );
                    },
                    onSettled: () => isSubmitting,
                  });
                })}
              >
                CREATE
              </ButtonX>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
