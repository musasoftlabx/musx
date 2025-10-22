// * React Native
import { Image, ImageSourcePropType, Vibration, View } from 'react-native';

// * NPM
import { Button, Text } from 'react-native-paper';

// * Store
import { HEIGHT, WIDTH } from '../store';

// * Types
type Attributes = {
  image: ImageSourcePropType;
  context?: String | 'records';
  reload: () => void;
};

const EmptyRecords = ({ image, context, reload }: Attributes) => {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: HEIGHT * 0.7,
        width: WIDTH,
        transform: [{ scale: 0.9 }],
      }}
    >
      <Image
        resizeMode="contain"
        source={image}
        style={{ height: HEIGHT * 0.08 }}
      />
      <Text style={{ fontSize: 22 }}>No {context} were found.</Text>
      <Button
        mode="elevated"
        onPress={() => (Vibration.vibrate(100), reload())}
        style={{ marginTop: 30 }}
      >
        RELOAD
      </Button>
    </View>
  );
};

export default EmptyRecords;
