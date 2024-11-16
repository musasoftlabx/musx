// * React
import React, {useState, useCallback, useRef, useEffect} from 'react';

// * React Native
import {
  BackHandler,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// * Libraries
import BottomSheet, {
  BottomSheetSectionList,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {useDeviceOrientation} from '@react-native-community/hooks';
import {Shadow} from 'react-native-shadow-2';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CastButton} from 'react-native-google-cast';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SelectDropdown from 'react-native-select-dropdown';
import TrackPlayer, {RepeatMode} from 'react-native-track-player';

// * Store
import {ASPECT_RATIO, HEIGHT, usePlayerStore, WIDTH} from '../../store';

// * Components
import CarouselQueue from './components/CarouselQueue';
import Controls from './components/Controls';
import Lyrics from './components/Lyrics';
import Queue from './components/Queue';
import Rating from './components/Rating';
import TrackInfo from './components/TrackInfo';
import WaveformSlider from './components/WaveformSlider';

// * Functions
const arrayMove = (fromIndex: number, toIndex: number, palette: string[]) => {
  let element = palette[fromIndex];
  palette.splice(fromIndex, 1);
  palette.splice(toIndex, 0, element);
};

// * Assets
import imageFiller from '../../assets/images/image-filler.png';
import WaveformSliderHorizontal from './components/WaveformSliderHorizontal';

export default function NowPlaying({nowPlayingRef}: {nowPlayingRef: any}) {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // ? Hooks
  const orientation = useDeviceOrientation();

  // ? States
  const [repeatMode, setRepeatMode] = useState<number>();

  // ? StoreStates
  const {state} = usePlayerStore(state => state.playbackState);
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
  const closeNowPlaying = usePlayerStore(state => state.closeNowPlaying);

  // ? Functions
  const handleRepeatMode = async () => {
    if (repeatMode === RepeatMode.Off) {
      await TrackPlayer.setRepeatMode(RepeatMode.Track);
      setRepeatMode(RepeatMode.Track);
      AsyncStorage.setItem('repeatMode', RepeatMode.Track.toString());
    } else if (repeatMode === RepeatMode.Track) {
      await TrackPlayer.setRepeatMode(RepeatMode.Queue);
      setRepeatMode(RepeatMode.Queue);
      AsyncStorage.setItem('repeatMode', RepeatMode.Queue.toString());
    } else if (repeatMode === RepeatMode.Queue) {
      await TrackPlayer.setRepeatMode(RepeatMode.Off);
      setRepeatMode(RepeatMode.Off);
      AsyncStorage.setItem('repeatMode', RepeatMode.Off.toString());
    }
  };

  // ? Effects
  useEffect(() => {
    (async () => {
      const repeatMode = await AsyncStorage.getItem('repeatMode');
      if (repeatMode) setRepeatMode(Number(repeatMode));
      else setRepeatMode(RepeatMode.Off);
    })();

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        closeNowPlaying(nowPlayingRef);
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
        }}>
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
          {['Primary', 'Secondary', 'Waveform', 'Icons'].map(
            (selection, index) => (
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
                        {selection}
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
            ),
          )}
        </BottomSheetView>
      </BottomSheet>
    ),
    [],
  );

  return (
    <>
      <StatusBar
        animated
        backgroundColor={activeTrack?.palette?.[1] ?? '#000'}
        barStyle="light-content"
        translucent={false}
      />

      <BottomSheet
        ref={nowPlayingRef}
        index={-1}
        snapPoints={['100%']}
        enableDynamicSizing={false}
        enablePanDownToClose
        handleStyle={{display: 'none'}}
        backgroundStyle={{borderRadius: 0}}>
        <BottomSheetSectionList
          sections={[{title: '', data: [{key: '1'}]}]}
          keyExtractor={i => i.toString()}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={() => (
            <>
              <LinearGradient
                colors={[palette[1] ?? '#000', palette[0] ?? '#000']}
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

              {orientation === 'landscape' ? (
                <>
                  <View
                    style={{
                      alignItems: 'center',
                      flexDirection: 'row',
                      gap: 40,
                      justifyContent: 'flex-end',
                      paddingVertical: 5,
                      paddingHorizontal: 25,
                    }}>
                    <MaterialIcons
                      name="gradient"
                      size={26}
                      onPress={() => bottomSheetRef.current?.snapToIndex(0)}
                    />
                    <MaterialIcons name="cast" size={25} />
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      height: HEIGHT * 0.91,
                      paddingHorizontal: 10,
                    }}>
                    {lyrics && lyricsVisible ? (
                      <Lyrics />
                    ) : (
                      <View
                        style={{
                          //flexGrow: 0.4,
                          justifyContent: 'center',
                        }}>
                        <Shadow startColor="#00000066" distance={3}>
                          <Image
                            source={
                              activeTrack?.artwork
                                ? {uri: activeTrack?.artwork}
                                : imageFiller
                            }
                            style={{
                              height: HEIGHT * 0.8,
                              width: HEIGHT * 0.8,
                              borderRadius: 20,
                            }}
                          />
                        </Shadow>
                      </View>
                    )}

                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexGrow: 1,
                        paddingTop: 30,
                      }}>
                      <TrackInfo />

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 15,
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

                      <WaveformSliderHorizontal />

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 30,
                          marginBottom: -5,
                        }}>
                        <Pressable
                          style={{
                            ...styles.chip,
                            backgroundColor: `${palette[1]}66`,
                          }}
                          onPress={handleRepeatMode}>
                          {repeatMode === RepeatMode.Off ? (
                            <MaterialCommunityIcons
                              name="repeat-off"
                              size={25}
                            />
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

                      <Controls />
                    </View>

                    {ASPECT_RATIO > 2.1 && <View />}
                  </View>
                </>
              ) : (
                <>
                  <View
                    style={{
                      alignItems: 'center',
                      flexDirection: 'row',
                      gap: 40,
                      justifyContent: 'flex-end',
                      paddingVertical: 5,
                      paddingHorizontal: 25,
                    }}>
                    <MaterialIcons
                      name="gradient"
                      size={26}
                      onPress={() => bottomSheetRef.current?.snapToIndex(0)}
                    />
                    <CastButton
                      style={{width: 24, height: 24, tintColor: '#fff'}}
                      //onTouchEnd={()=>console.log()}
                    />
                    {/* <MaterialIcons name="cast" size={25} /> */}
                  </View>

                  <View style={{alignItems: 'center', height: HEIGHT}}>
                    {/* {lyrics && lyricsVisible ? <Lyrics /> : <CarouselQueue />} */}
                    {lyrics && lyricsVisible ? (
                      <Lyrics />
                    ) : (
                      <View style={{flex: 1}}>
                        <Shadow startColor="#00000066" distance={3}>
                          <Image
                            source={
                              activeTrack?.artwork
                                ? {uri: activeTrack?.artwork}
                                : imageFiller
                            }
                            style={{
                              height: WIDTH * 0.95,
                              width: WIDTH * 0.95,
                              borderRadius: 20,
                            }}
                          />
                        </Shadow>
                      </View>
                    )}

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
                          backgroundColor: 'rgba(255, 255, 255, .3)',
                          borderColor: 'rgba(255, 255, 255, .3)',
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

                    {/* <Queue /> */}
                  </View>
                </>
              )}

              <Queue />
            </>
          )}
          renderItem={() => <View />}
        />
      </BottomSheet>

      <BottomSheetCallback />
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 10,
    height: 35,
    margin: 10,
    padding: 5,
    paddingHorizontal: 15,
  },
});
