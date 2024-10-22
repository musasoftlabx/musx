// * React Native
import {Image, useWindowDimensions, View} from 'react-native';

// * React Native Libraries
import {Button, useTheme} from 'react-native-paper';

// * Components
import TextX from './TextX';

// * Assets
import _404 from '../assets/images/404.png';

// * Interfaces
interface IAttributes {
  context?: String | 'records';
  reload: () => void;
}

const EmptyRecords = ({context, reload}: IAttributes) => {
  // ? Hooks
  const layout = useWindowDimensions();

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: layout.height * 0.44,
        width: layout.width,
        transform: [{scale: 0.9}],
      }}>
      <Image
        resizeMode="contain"
        source={_404}
        style={{
          height: layout.height * 0.25,
          marginLeft: 50,
          opacity: 0.7,
        }}
      />
      <TextX font="Montez" scale={4.5} opacity={0.5}>
        No {context} were found.
      </TextX>
      <Button mode="elevated" onPress={reload} style={{marginTop: 10}}>
        RELOAD
      </Button>
    </View>
  );
};

export default EmptyRecords;
