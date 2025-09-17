import { View, ViewProps } from 'react-native';
import { Button, ButtonProps, useTheme } from 'react-native-paper';
import { RFPercentage as s } from 'react-native-responsive-fontsize';

type TAttributes = {
  parent?: String | 'light';
  errors?: Object;
  label?: String;
  isSubmitting?: boolean;
  loading?: boolean;
  touched?: Object;
  values?: Object;
  borderRadius?: number;
} & ButtonProps;

const ButtonX = (props: TAttributes) => {
  const { parent, errors, isSubmitting, loading, touched, values } = props;

  const theme = useTheme();

  const validator = () => {
    if (values) {
      if (Object.keys(values).length > 1) {
        return JSON.stringify(touched) === '{}';
      } else if (Object.keys(values).length === 1) {
        //@ts-ignore
        return values[Object.keys(values)[0]].length === 0;
      }
    } else {
      return false;
    }
  };

  const inactive = errors
    ? JSON.stringify(errors) !== '{}' || validator() || isSubmitting
    : false;

  return (
    <View
      style={{
        ...(props.style as ViewProps),
        alignSelf: 'center',
        backgroundColor: inactive ? 'transparent' : theme.colors.primary,
        borderColor: theme.colors.background,
        borderStyle: parent === 'light' || !parent ? 'solid' : 'dashed',
        borderRadius: props.borderRadius,
        borderWidth: 1,
        opacity: inactive ? 0.5 : 1,
      }}
    >
      <Button
        {...props}
        contentStyle={{
          borderColor: theme.colors.background,
          borderRadius: props.borderRadius,
          borderStyle: parent === 'light' || !parent ? 'solid' : 'dotted',
          paddingVertical: 0,
          margin: 2,
        }}
        disabled={inactive}
        labelStyle={{
          color: inactive ? 'grey' : 'white',
          fontSize: s(2),
        }}
        loading={isSubmitting || loading}
        mode="contained"
        onPress={props.onPress}
        style={{ elevation: inactive ? 0 : 20 }}
        textColor="white"
        theme={{ roundness: 6 }}
      >
        {props.children}
      </Button>
    </View>
  );
};

export default ButtonX;
