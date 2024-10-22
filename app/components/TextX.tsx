// * React Native
import {Platform, StyleSheet} from 'react-native';

// * React Native Libraries
import {Text, TextProps, useTheme} from 'react-native-paper';
import {RFPercentage as s} from 'react-native-responsive-fontsize';
import {fontFamily} from '../utils';

import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

// * Types
export type TAttributes = {
  bold?: boolean;
  color?: string;
  currency?: boolean;
  font?: string;
  scale?: any;
  children: React.ReactNode;
  opacity?: number;
  mt?: number;
  mr?: number;
  mb?: number;
  ml?: number;
  mh?: number;
  mv?: number;
  m?: number;
  pt?: number;
  pr?: number;
  pb?: number;
  pl?: number;
  ph?: number;
  pv?: number;
  p?: number;
} & TextProps;

const TextX = (props: TAttributes) => {
  const theme = useTheme();
  return (
    <Text
      {...props}
      style={[
        props.bold && styles.text,
        {
          //@ts-ignore
          ...props.style,
          color: props.color || theme.colors.text,
          fontFamily: `${props.font || fontFamily}`,
          fontSize: s(props.scale) || s(1.8),
          opacity: props.opacity || 1,
          marginTop: props.mt,
          marginRight: props.mr,
          marginBottom: props.mb,
          marginLeft: props.ml,
          marginHorizontal: props.mh,
          marginVertical: props.mv,
          margin: props.m,
          paddingRight: props.pr,
          paddingBottom: props.pb,
          paddingLeft: props.pl,
          paddingHorizontal: props.ph,
          paddingVertical: props.pv,
          padding: props.p,
        },
      ]}>
      {props.currency
        ? props?.children
            ?.toLocaleString('en-US', {
              style: 'currency',
              currency: 'KES',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
            .toLowerCase()
            .replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase())
        : props.children}
    </Text>
  );
};

export const GradientText = (props: TAttributes & {gradient: string[]}) => {
  return (
    <MaskedView
      maskElement={<TextX {...props} />}
      renderToHardwareTextureAndroid
      style={{flexDirection: 'row'}}>
      <LinearGradient
        colors={props.gradient}
        start={{x: 0, y: 1}}
        end={{x: 1, y: 0}}>
        <Text {...props} style={{fontSize: s(props.scale * 1.1), opacity: 0}} />
      </LinearGradient>
    </MaskedView>
  );
};

const styles = StyleSheet.create({
  text: {fontWeight: Platform.OS === 'ios' ? 'bold' : '500'},
});

export default TextX;
