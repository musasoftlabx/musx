import {useEffect} from 'react';
import {Alert, View} from 'react-native';

import {useAuthStore} from '../store';

const Logout = () => {
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    Alert.alert('Logout', 'This will log you out. Proceed?', [
      {text: 'Cancel'},
      {onPress: () => logout(), text: 'OK'},
    ]);
  }, []);

  return <View />;
};

export default Logout;
