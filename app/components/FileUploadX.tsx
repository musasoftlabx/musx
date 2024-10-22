import {Image, useColorScheme, View} from 'react-native';
import {Button, Text, useTheme} from 'react-native-paper';
import {RFPercentage as s} from 'react-native-responsive-fontsize';
import RNPickerSelect from 'react-native-picker-select';
import Icons from 'react-native-vector-icons/Ionicons';

// * React Native Libraries
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

// * Assets
import Icon from 'react-native-vector-icons/Ionicons';

interface IAttributes {
  addImage: (value: object) => void;
  removeImage: () => void;
  value?: String;
}

const FileUploadX = ({addImage, removeImage, value}: IAttributes) => {
  const theme = useTheme();
  const mode = useColorScheme();

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: theme.colors.inputs.background,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderColor: theme.colors.inputs.border,
        borderRadius: 10,
        borderWidth: 0.3,
        marginBottom: 30,
        paddingHorizontal: 15,
        paddingVertical: 10,
      }}>
      <View>
        <Button
          buttonColor={mode === 'dark' ? '#9e9e9e' : ''}
          icon="camera"
          mode="elevated"
          style={{borderRadius: 10}}
          onPress={() =>
            launchCamera(
              {mediaType: 'photo'},
              ({assets}) => assets && addImage(assets?.[0]),
            )
          }>
          Camera
        </Button>
        <Button
          buttonColor={mode === 'dark' ? '#9e9e9e' : ''}
          icon="folder-image"
          mode="elevated"
          style={{borderRadius: 10, marginVertical: 10}}
          onPress={() =>
            launchImageLibrary(
              {mediaType: 'photo'},
              ({assets}) => assets && addImage(assets?.[0]),
            )
          }>
          Gallery
        </Button>
        <Button
          buttonColor="#ef5350"
          disabled={!value}
          icon="delete"
          mode="contained"
          style={{borderRadius: 10}}
          onPress={removeImage}>
          Delete
        </Button>
      </View>
      <View
        style={{
          alignItems: 'center',
          alignSelf: 'flex-end',
          justifyContent: 'center',
          borderRadius: 10,
          borderColor: '#9e9e9e',
          borderWidth: 1,
          height: 150,
          padding: 5,
          width: 150,
        }}>
        {value && (
          <Image
            source={{uri: value}}
            style={{
              borderRadius: 10,
              height: 140,
              width: 140,
              zIndex: 1,
            }}
          />
        )}
        <View style={{alignItems: 'center', position: 'absolute'}}>
          <Icon name="md-image-outline" color="#757575" size={30} />
          <Text style={{fontSize: s(2.2)}}>Upload photo</Text>
          <Text style={{fontSize: s(1.4)}}>Maximum of 10Mb</Text>
        </View>
      </View>
    </View>
  );
};

export default FileUploadX;
