// * React
import {useRef, useState} from 'react';

// * React Native
import {Alert, Image, View} from 'react-native';

// * React Native Libraries
import {SafeAreaView} from 'react-native-safe-area-context';
import SignatureScreen from 'react-native-signature-canvas';

// * JS Libraries
import {useMutation, useQueryClient} from '@tanstack/react-query';

// * Components
import ButtonX from '../components/ButtonX';

import {deviceHeight} from '../utils';

// * Utilities
import {useConfigStore} from '../store';
import {IAxiosError} from '../types';

export default function Signature({navigation, route}: any) {
  const axios = useConfigStore(state => state.axios);
  const [isSubmitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const ref = useRef<any>();
  const [signature, setSign] = useState(null);
  const style = `.m-signature-pad--footer {background-color: red; display: none;}`;

  const {mutate} = useMutation((data: JSON) =>
    axios.post(route.params.apiRoute, data),
  );

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          height: deviceHeight * 0.25,
          backgroundColor: '#F8F8F8',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {signature ? (
          <Image
            resizeMode="contain"
            style={{width: 335, height: 114}}
            source={{uri: signature}}
          />
        ) : null}
      </View>
      <SignatureScreen
        ref={ref}
        onEnd={() => ref.current.readSignature()}
        onOK={(signature: any) => setSign(signature)}
        onEmpty={() => console.log('Empty')}
        onClear={() => console.log('clear success!')}
        onGetData={(data: any) => console.log(data)}
        autoClear={false}
        descriptionText={'text'}
        trimWhitespace={true}
        style={{backgroundColor: 'red'}}
        penColor="green"
        backgroundColor="transparent"
        webStyle={style}
      />
      <ButtonX
        isSubmitting={isSubmitting}
        values={{signature: true}}
        onPress={() => {
          setSubmitting(true);
          mutate(
            {...route.params.values, signature},
            {
              onSuccess: () => {
                queryClient.prefetchInfiniteQuery([route.params.query]);
                navigation.navigate(route.params.from, {
                  department: route.params.values.department.toLowerCase(),
                });
              },
              onError: (error: any) =>
                Alert.alert(
                  error.response.data.subject,
                  error.response.data.body,
                  [{text: 'OK'}],
                ),
              onSettled: () => setSubmitting(false),
            },
          );
        }}>
        SUBMIT
      </ButtonX>
      <ButtonX onPress={() => ref.current.clearSignature()}>CLEAR</ButtonX>
      <ButtonX onPress={() => navigation.goBack()}>CANCEL</ButtonX>
    </SafeAreaView>
  );
}
