import {View} from 'react-native';
import {Button, HelperText, Text, useTheme} from 'react-native-paper';
import {RFPercentage as s} from 'react-native-responsive-fontsize';
import RNPickerSelect from 'react-native-picker-select';
import Icons from 'react-native-vector-icons/Ionicons';
import {styles} from '../styles';

interface IAttributes {
  items: [];
  field: String;
  touched?: Boolean;
  isFetched: Boolean;
  onValueChange: (value: string) => void;
  value: String;
}

const SelectX = ({
  items,
  field,
  touched,
  isFetched,
  onValueChange,
  value,
}: IAttributes) => {
  const theme = useTheme();

  return (
    <>
      <View
        style={{
          backgroundColor: theme.colors.inputs.background,
          borderColor: theme.colors.inputs.border,
          borderRadius: 8,
          borderWidth: 0.3,
          borderBottomWidth: 1.3,
          marginBottom: 20,
          paddingVertical: 1,
          paddingBottom: value ? 3 : 10,
        }}>
        {value ? (
          <Text
            style={{
              fontSize: s(1.8),
              marginTop: 10,
              marginBottom: -18,
              marginLeft: 15,
            }}>
            {field?.replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase())}
          </Text>
        ) : null}
        <RNPickerSelect
          items={
            isFetched
              ? items.map(
                  //@ts-ignore
                  ({_id, [field]: item}: {_id: string; field: string}) => ({
                    key: _id,
                    label: item,
                    value: item,
                  }),
                )
              : []
          }
          value={value}
          onValueChange={v => onValueChange(v)}
          placeholder={{label: `Select ${field} *`, value: null, color: 'grey'}}
          fixAndroidTouchableBug={true}
          useNativeAndroidPickerStyle={false}
          style={{
            inputIOS: {
              color: '#424242',
              fontFamily: 'Laila',
              fontSize: s(2.1),
              padding: 15,
              paddingBottom: 3,
              paddingRight: 30,
            },
            inputAndroid: {
              color: '#757575',
              fontFamily: 'Laila',
              fontSize: s(2.1),
              padding: 14,
              paddingBottom: 3,
              paddingRight: 30,
            },
            iconContainer: {top: value ? 8 : 15, right: 15},
            placeholder: {color: '#616161'},
          }}
          //@ts-ignore
          Icon={() => (
            <Icons name="chevron-down-sharp" size={24} color="#9e9e9e" />
          )}
        />
      </View>
      <HelperText
        type="error"
        style={styles.helperText}
        visible={touched && !value ? true : false}>
        Required
      </HelperText>
    </>
  );
};

export default SelectX;
