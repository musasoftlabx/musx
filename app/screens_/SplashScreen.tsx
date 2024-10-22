// ? Import React Native Libraries
import {
  ActivityIndicator,
  Image,
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import logo from '../assets/images/logo.png';
import TextX from '../components/TextX';

const SplashScreen = () => {
  return (
    <LinearGradient colors={['#3e2723', '#bcaaa4']} style={styles.container}>
      <StatusBar backgroundColor="#3e2723" barStyle="light-content" />
      <Image
        resizeMode="contain"
        source={logo}
        style={{height: 200, marginBottom: 20, width: 200}}
      />
      <TextX color="#fff" font="Montez" scale={5} mb={5}>
        River Isiukhu Tented Camp
      </TextX>
      <TextX bold color="#ffffff90" font="Laila-Bold" scale={2}>
        Enterprise Resource Planning System
      </TextX>
      <ActivityIndicator
        color="#fff"
        size="large"
        style={{marginVertical: 20}}
      />
      <TextX
        bold
        color="#ffeb3b"
        font="Laila-Bold"
        scale={1.5}
        ph={10}
        pv={2}
        style={{borderColor: '#fff', borderRadius: 10, borderWidth: 1}}>
        Version 1.0.0
      </TextX>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default SplashScreen;
