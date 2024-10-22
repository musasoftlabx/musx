import React from 'react';
import {Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import TextX from './TextX';

interface Props {
  gradient: string[];
  style: object;
  scale: number;
  children: React.ReactNode;
} & ex

const GradientText = (props: Props) => {
  //console.log(props);
  return (
    <MaskedView
      maskElement={<TextX {...props} />}
      renderToHardwareTextureAndroid
      style={{flexDirection: 'row'}}>
      <LinearGradient
        colors={props.gradient}
        start={{x: 0, y: 1}}
        end={{x: 1, y: 0}}>
        <TextX {...props} opacity={0} style={[props.style]} />
      </LinearGradient>
    </MaskedView>
  );
};

export default GradientText;
