import {useCallback, useMemo, useRef} from 'react';
//import BottomSheet from '@gorhom/bottom-sheet';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';

const Sheet = () => {
  /* const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['10%', '50%', '100%'], []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []); */
  const sheetRef = useRef(null);

  return (
    <View
      style={{
        flex: 1,
        padding: 200,
        backgroundColor: 'grey',
      }}>
      <BottomSheet
        ref={sheetRef}
        snapPoints={[450, 300, 0]}
        borderRadius={10}
        renderContent={() => (
          <View
            style={{
              backgroundColor: 'white',
              padding: 16,
              height: 450,
            }}>
            <Text>Swipe down to close</Text>
          </View>
        )}
      />
      {/* <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}>
        <View style={{flex: 1, alignItems: 'center', height: 800}}>
          <Text>Awesome 🎉</Text>
        </View>
      </BottomSheet> */}
    </View>
  );
};

export default Sheet;
