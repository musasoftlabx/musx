// * React
import {useRef, useState} from 'react';

// * React Native Libraries
import SignatureScreen from 'react-native-signature-canvas';

import {Button, Image, View} from 'react-native';
import {deviceHeight} from '../../utils';

const Equity = () => {
  const ref = useRef<any>();
  const [signature, setSign] = useState(null);
  const style = `.m-signature-pad--footer {background-color: red; display: none;}`;

  return (
    <View style={{flex: 1}}>
      <View
        style={{
          height: deviceHeight * 0.25,
          backgroundColor: '#F8F8F8',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {signature ? (
          <Image
            resizeMode="contain"
            style={{width: 335, height: 114}}
            source={{uri: signature}}
          />
        ) : null}
      </View>
      <SignatureScreen
        ref={ref}
        onEnd={() => ref.current.readSignature()}
        onOK={(signature: any) => (
          console.log('signature'), setSign(signature)
        )}
        onEmpty={() => console.log('Empty')}
        onClear={() => console.log('clear success!')}
        onGetData={(data: any) => console.log(data)}
        autoClear={false}
        descriptionText={'text'}
        trimWhitespace={true}
        style={{backgroundColor: 'red'}}
        penColor="green"
        backgroundColor="transparent"
        webStyle={style}
      />
    </View>
  );
};

export default Equity;
