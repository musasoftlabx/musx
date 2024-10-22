// * React
import {useRef, useState} from 'react';
import {View} from 'react-native';

// * React Native Libraries
import SignatureScreen from 'react-native-signature-canvas';

const Signature = () => {
  const ref = useRef<any>();
  const [signature, setSign] = useState(null);
  const style = `.m-signature-pad--footer {display: none; margin: 0px;}`;

  return (
    <View style={{flex: 1}}>
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

export default Signature;
