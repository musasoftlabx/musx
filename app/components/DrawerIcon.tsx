import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

interface IProps {
  top?: number;
  left?: number;
}

export default function DrawerIcon({top, left}: IProps) {
  const navigation = useNavigation();

  return (
    <Icon
      name="md-menu-outline"
      color="white"
      size={28}
      onPress={() => navigation.toggleDrawer()}
      style={{
        top: top || 0,
        left: left || 17,
        position: 'absolute',
      }}
    />
  );
}
