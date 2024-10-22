// * React
import {useState} from 'react';

// * React Native
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  View,
} from 'react-native';

// * React Native Paper
import {Button, Text, TextInput, useTheme} from 'react-native-paper';

// * React Native Libraries
import {RFPercentage as s} from 'react-native-responsive-fontsize';

// * JS Libraries
import {Buffer} from 'buffer';
import {Formik} from 'formik';
import {useMutation} from '@tanstack/react-query';
import * as Yup from 'yup';

// * Images
import loginArtwork from '../../assets/images/login_iso.png';

// * Utilities
import {useConfigStore} from '../../store';
import {deviceHeight, deviceWidth} from '../../utils';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import TextX from '../../components/TextX';
import ButtonX from '../../components/ButtonX';

export default function Login() {
  const theme = useTheme();
  const layout = useWindowDimensions();

  // ? useStore
  const axios = useConfigStore(state => state.axios);

  // ? useState
  const [password] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  // ? useMutation
  const {mutate} = useMutation(body => axios.post('login', body));

  return (
    <ScrollView style={{backgroundColor: theme.colors.background}}>
      <StatusBar animated barStyle="dark-content" />
      <Svg
        height="100%"
        width="100%"
        viewBox="-100 -10 100 150"
        style={{position: 'absolute'}}>
        <Path
          fill={theme.colors.secondary}
          d="M40.9,-65.6C48.6,-66.3,47.5,-46.6,51.2,-32.2C54.9,-17.9,63.3,-8.9,66.5,1.8C69.6,12.6,67.6,25.2,60,32.8C52.4,40.3,39.3,42.8,28.4,43.3C17.5,43.8,8.7,42.3,-2.7,46.9C-14.1,51.5,-28.2,62.4,-30.5,56.9C-32.9,51.5,-23.5,29.8,-32.9,17.6C-42.3,5.4,-70.5,2.7,-80.7,-5.9C-90.9,-14.5,-83.1,-29,-74,-41.8C-65,-54.6,-54.7,-65.8,-42.2,-62.4C-29.6,-58.9,-14.8,-40.8,0.9,-42.3C16.6,-43.8,33.1,-65,40.9,-65.6Z"
        />
      </Svg>
      <View>
        <View
          style={{
            alignItems: 'center',
            height: deviceHeight * 0.85,
            justifyContent: 'flex-end',
          }}>
          <Image
            source={loginArtwork}
            style={{width: layout.width, height: layout.height * 0.3}}
          />
          <TextX scale={5} mb={10}>
            Sign In
          </TextX>
          <Formik
            initialValues={{username: '', password: ''}}
            validationSchema={Yup.object({
              username: Yup.string()
                .max(20, 'Max of 20 chars')
                .required('Required'),
              password: Yup.string()
                .max(20, 'Max of 20 chars')
                .required('Required'),
            })}
            onSubmit={(values, {setSubmitting}) => {
              const encoded = new Buffer(values.password).toString('base64');
              mutate(
                //@ts-ignore
                {...values, password: encoded},
                {
                  //onSuccess: () => navigation.navigate("Home"),
                  onError: (error: any) => {
                    setSubmitting(false);
                    Alert.alert(
                      error.response.data.subject,
                      error.response.data.body,
                      [{text: 'OK'}],
                    );
                  },
                  onSettled: () => setSubmitting(false),
                },
              );
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
              <View>
                <TextInput
                  label="Username"
                  left={
                    <TextInput.Icon
                      icon="shield-account"
                      style={{marginTop: 8, opacity: 0.5}}
                    />
                  }
                  mode="outlined"
                  onChangeText={handleChange('username')}
                  onBlur={handleBlur('username')}
                  placeholder="Enter your username"
                  style={{marginBottom: 20, width: deviceWidth * 0.8}}
                  theme={{roundness: 10}}
                  value={values.username}
                />

                <TextInput
                  label="Password"
                  left={
                    <TextInput.Icon
                      icon="lastpass"
                      style={{marginTop: 8, opacity: 0.5}}
                    />
                  }
                  mode="outlined"
                  secureTextEntry={secureText}
                  right={
                    <TextInput.Icon
                      icon={secureText ? 'eye-off' : 'eye'}
                      onPress={() => setSecureText(secureText ? false : true)}
                      style={{marginTop: 8, opacity: 0.5}}
                    />
                  }
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  placeholder="Enter your password"
                  style={{marginBottom: 30, width: deviceWidth * 0.8}}
                  theme={{roundness: 10}}
                  value={values.password}
                />

                <View
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <TextX scale={2}>Forgot Password?</TextX>
                  <ButtonX
                    errors={errors}
                    isSubmitting={isSubmitting}
                    touched={touched}
                    values={values}
                    onPress={() => handleSubmit()}
                    style={{width: 110}}>
                    LOGIN
                  </ButtonX>
                </View>
              </View>
            )}
          </Formik>
        </View>
      </View>
    </ScrollView>
  );
}
