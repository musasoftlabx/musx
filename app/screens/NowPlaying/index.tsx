// * React
import React, {useState, useCallback, useRef, useEffect} from 'react';

// * React Native
import {
  BackHandler,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// * Libraries
import axios from 'axios';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SelectDropdown from 'react-native-select-dropdown';
import TrackPlayer, {RepeatMode, useProgress} from 'react-native-track-player';

// * Store
import {HEIGHT, usePlayerStore, WIDTH} from '../../store';

// * Assets
import {SegmentedButtons} from 'react-native-paper';

// * Components
import UpNext from './UpNext';
import History from './History';
import Lyrics from './components/Lyrics';
import CarouselQueue from './components/CarouselQueue';
import Rating from './components/Rating';
import WaveformSlider from './components/WaveformSlider';
import Controls from './components/Controls';
import TrackInfo from './components/TrackInfo';

// * Functions
const arrayMove = (fromIndex: number, toIndex: number, palette: string[]) => {
  let element = palette[fromIndex];
  palette.splice(fromIndex, 1);
  palette.splice(toIndex, 0, element);
};

export default function NowPlaying({navigation}: any) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);
  //const {position, buffered, duration} = useProgress();

  // ? States
  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);
  const [value, setValue] = useState<'queue' | 'history'>('queue');

  // ? StoreStates
  const activeTrack = usePlayerStore(state => state.activeTrack);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const queue = usePlayerStore(state => state.queue);
  const trackPlayCount = usePlayerStore(state => state.trackPlayCount);
  const lyricsVisible = usePlayerStore(state => state.lyricsVisible);
  const lyrics = usePlayerStore(state => state.lyrics);
  const palette = usePlayerStore(state => state.palette);

  // ? StoreActions
  const setLyricsVisible = usePlayerStore(state => state.setLyricsVisible);
  const setPalette = usePlayerStore(state => state.setPalette);

  // ? Functions
  const handleRepeatMode = async () => {
    if (repeatMode === RepeatMode.Off) {
      await TrackPlayer.setRepeatMode(RepeatMode.Track);
      setRepeatMode(RepeatMode.Track);
    } else if (repeatMode === RepeatMode.Track) {
      await TrackPlayer.setRepeatMode(RepeatMode.Queue);
      setRepeatMode(RepeatMode.Queue);
    } else if (repeatMode === RepeatMode.Queue) {
      await TrackPlayer.setRepeatMode(RepeatMode.Off);
      setRepeatMode(RepeatMode.Off);
    }
  };

  const selections = ['Primary', 'Secondary', 'Waveform', 'Icons'];

  const Select = ({index, label}: {index: number; label: string}) => (
    <SelectDropdown
      key={index}
      data={palette}
      onFocus={() => {}}
      onSelect={(selectedItem, index) => {
        arrayMove(index, 0, palette);
        setPalette(palette);
        axios
          .patch('updatePalette', {id: activeTrack.id, palette})
          .then(({data}) => console.log(data));
      }}
      renderButton={(selectedItem, isOpened) => {
        return (
          <View
            style={{
              borderColor: '#fff',
              borderWidth: 1,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              height: 50,
              gap: 10,
              width: 'auto',
              justifyContent: 'space-between',
              paddingHorizontal: 12,
            }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'auto',
                backgroundColor: palette[index],
                borderRadius: 5,
                height: 30,
                width: 30,
                marginVertical: 5,
                marginLeft: 4,
              }}
            />

            <Text
              style={{
                fontSize: 15,
                fontWeight: '500',
                color: '#fff',
              }}>
              {label}
            </Text>
            <Ionicons
              name={isOpened ? 'chevron-up' : 'chevron-down'}
              style={{color: '#fff', fontSize: 15}}
            />
          </View>
        );
      }}
      renderItem={(item, index, isSelected) => {
        return (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'auto',
              backgroundColor: item,
              borderRadius: 5,
              height: 30,
              width: 70,
              padding: 5,
              marginVertical: 5,
            }}>
            <Text style={{color: '#000'}}>{item}</Text>
          </View>
        );
      }}
      showsVerticalScrollIndicator={false}
      dropdownStyle={{
        backgroundColor: 'transparent',
        borderRadius: 8,
        width: 'auto',
      }}
    />
  );

  // ? Effects
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack(null);
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  // ? Callbacks
  const BottomSheetCallback = useCallback(
    () => (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['25%', '50%']}
        enableDynamicSizing={false}
        enablePanDownToClose
        handleIndicatorStyle={{backgroundColor: '#fff'}}
        backgroundStyle={{
          backgroundColor: 'rgba(0, 0, 0, .8)',
          borderRadius: 20,
        }}
        //onChange={handleSheetChange}
      >
        <BottomSheetView
          style={{
            alignItems: 'flex-start',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 10,
            paddingHorizontal: 20,
            marginTop: 10,
          }}>
          {selections.map((selection, index) => (
            <Select index={index} label={selection} />
          ))}
        </BottomSheetView>
      </BottomSheet>
    ),
    [],
  );

  const QueueCallback = useCallback(
    () => (
      <>
        <SegmentedButtons
          value={value}
          onValueChange={(x: any) => setValue(x)}
          buttons={[
            {value: 'history', label: 'History'},
            {value: 'queue', label: 'Queue'},
          ]}
        />

        {value === 'queue' ? (
          <UpNext
            queue={queue}
            activeTrack={activeTrack}
            activeTrackIndex={activeTrackIndex}
          />
        ) : (
          <History
            queue={queue}
            activeTrack={activeTrack}
            activeTrackIndex={activeTrackIndex}
          />
        )}
      </>
    ),
    [activeTrackIndex],
  );

  return (
    <>
      <LinearGradient
        colors={[palette[1] ?? '#000', palette[0] ?? '#fff']}
        useAngle={true}
        angle={200}
        style={{
          position: 'absolute',
          opacity: 1,
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      />

      <SectionList
        contentContainerStyle={{paddingHorizontal: 10}}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        sections={[{title: '', data: [{key: '1'}]}]}
        renderSectionHeader={() => (
          <View style={{marginTop: 40}}>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                gap: 40,
                justifyContent: 'flex-end',
                paddingTop: 10,
                paddingRight: 5,
              }}>
              <MaterialIcons
                name="gradient"
                size={26}
                onPress={() => {
                  bottomSheetRef.current?.snapToIndex(0);
                  //TrackPlayer.pause();
                }}
              />
              <MaterialIcons name="cast" size={25} />
            </View>

            <View style={{alignItems: 'center', height: HEIGHT}}>
              {lyrics && lyricsVisible ? <Lyrics /> : <CarouselQueue />}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: WIDTH * 0.95,
                  gap: 20,
                }}>
                <View style={{flexDirection: 'row', gap: 5}}>
                  <Ionicons name="musical-notes-sharp" size={21} />

                  <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                    {trackPlayCount} play
                    {`${trackPlayCount === 1 ? '' : 's'}`}
                  </Text>
                </View>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: palette[1],
                    borderRadius: 7,
                    flexDirection: 'row',
                    opacity: 0.7,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}>
                  <Text style={{fontWeight: 'bold'}}>
                    {`${activeTrack?.format?.toLocaleUpperCase()} ${
                      activeTrack?.sampleRate! / 1000
                    } Khz`}
                  </Text>

                  <Text style={{fontWeight: 'bold'}}>
                    &nbsp;&nbsp;/&nbsp;&nbsp;
                  </Text>

                  <Text style={{fontWeight: 'bold'}}>
                    {(activeTrack?.bitrate! / 1000).toFixed(2)} Kbps
                  </Text>
                </View>

                <View style={{flexDirection: 'row', gap: 5}}>
                  <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                    {`${activeTrackIndex! + 1} / ${queue.length}`}
                  </Text>

                  <Ionicons name="disc" size={21} />
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 20,
                  gap: 10,
                }}>
                <Pressable
                  style={{
                    ...styles.chip,
                    backgroundColor: `${palette[1]}66`,
                  }}
                  onPress={handleRepeatMode}>
                  {repeatMode === RepeatMode.Off ? (
                    <MaterialCommunityIcons name="repeat-off" size={25} />
                  ) : repeatMode === RepeatMode.Track ? (
                    <MaterialCommunityIcons
                      name="repeat-once"
                      size={25}
                      color="#54ff65"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="repeat"
                      size={25}
                      color="#d7ff54"
                    />
                  )}
                </Pressable>

                <Rating />

                <Pressable
                  style={{
                    ...styles.chip,
                    backgroundColor: `${palette[1]}66`,
                  }}
                  onPress={() => setLyricsVisible(!lyricsVisible)}>
                  <MaterialIcons
                    name="lyrics"
                    size={25}
                    style={{
                      color: lyrics ? 'yellow' : 'rgba(255,255,255,.5)',
                    }}
                  />
                </Pressable>
              </View>

              <WaveformSlider />

              <TrackInfo />

              <Controls />

              <View style={{flex: 1}} />
            </View>
          </View>
        )}
        renderItem={() => {
          return <View />;
          //return <QueueCallback />;
        }}
      />

      <BottomSheetCallback />
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 10,
    height: 35,
    margin: 10,
    //opacity: 0.6,
    padding: 5,
    paddingHorizontal: 15,
  },
});
