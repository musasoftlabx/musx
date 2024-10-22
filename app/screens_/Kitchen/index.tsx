// * React
import {useQuery} from '@tanstack/react-query';
import {useEffect, useRef, useState} from 'react';

// * React Native
import {useWindowDimensions} from 'react-native';
import {Modalize} from 'react-native-modalize';

// * React Native Libraries
import {useTheme} from 'react-native-paper';
import {RFPercentage as s} from 'react-native-responsive-fontsize';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {bottomSheetProps} from '../../utils';

// * Components
import Add from './Add';
import Edit from './Edit';
import Entries from './Entries';
import Header from './Header';

interface IRenderScene {
  route: {key: string};
  jumpTo: (index: string) => void;
}

export interface ISelected {
  _id: string;
  item: string;
  opening: number;
  closing: number;
}

export default function Kitchen() {
  const theme = useTheme();

  const [selected, setSelected] = useState<ISelected>();

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'first', title: 'Entries'},
    {key: 'second', title: 'Add Entry'},
  ]);

  const editRef = useRef<Modalize>();

  useEffect(() => {
    selected && editRef.current?.open();
  }, [selected]);

  const renderScene = ({route, jumpTo}: IRenderScene) => {
    switch (route.key) {
      case 'first':
        return <Entries setSelected={setSelected} />;
      case 'second':
        return <Add jumpTo={jumpTo} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Header />

      <TabView
        navigationState={{index, routes}}
        onIndexChange={setIndex}
        initialLayout={{height: 0, width: layout.width}}
        renderTabBar={props => (
          <TabBar
            {...props}
            activeColor="yellow"
            indicatorStyle={{backgroundColor: 'yellow'}}
            labelStyle={{
              fontFamily: 'Abel',
              fontSize: s(3),
              textTransform: 'none',
              margin: 0,
            }}
            style={{backgroundColor: theme.colors.secondary}}
          />
        )}
        //renderScene={SceneMap({first: Entries, second: Add})}
        renderScene={renderScene}
        tabBarPosition="top"
      />

      <Modalize
        ref={editRef}
        adjustToContentHeight
        openAnimationConfig={bottomSheetProps}
        closeAnimationConfig={bottomSheetProps}>
        <Edit editRef={editRef} item={selected} />
      </Modalize>
    </>
  );
}
