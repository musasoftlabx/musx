// * React
import React, { useState, useCallback, useRef, useEffect } from 'react';

// * React Native
import { BackHandler, Image, Pressable, StyleSheet, View } from 'react-native';

// * Libraries
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {
  useBackHandler,
  useDeviceOrientation,
} from '@react-native-community/hooks';
import { useFocusEffect } from '@react-navigation/native';
import { CastButton, MediaPlayerState } from 'react-native-google-cast';
import { Shadow } from 'react-native-shadow-2';
import { Text } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SelectDropdown from 'react-native-select-dropdown';
import TrackPlayer, { RepeatMode, State } from 'react-native-track-player';

// * Components
import Controls from './components/Controls';
import Lyrics from './components/Lyrics';
import Queue from './components/Queue';
import Rating from './components/Rating';
import StatusBarX from '../../components/StatusBarX';
import TrackInfo from './components/TrackInfo';
import WaveformSlider from './components/WaveformSlider';
import WaveformSliderHorizontal from './components/WaveformSliderHorizontal';

// * Store
import { ASPECT_RATIO, HEIGHT, usePlayerStore, WIDTH } from '../../store';

// * Functions
import { arrayMove } from '../../functions';

// * Assets
import imageFiller from '../../assets/images/image-filler.png';
import { fontFamilyBold } from '../../utils';
import QueueHorizontal from './components/QueueHorizontal';

type LyricsButtonProps = {
  palette: string[];
  lyrics: string | null;
  lyricsVisible: boolean;
  setLyricsVisible: (lyricsVisible: boolean) => void;
};

export const LyricsButton = ({
  palette,
  lyrics,
  lyricsVisible,
  setLyricsVisible,
}: LyricsButtonProps) =>
  lyrics && (
    <Pressable
      style={{
        ...styles.chip,
        backgroundColor: `${palette?.[1]}`,
        position: 'absolute',
        right: 1,
      }}
      onPress={() => setLyricsVisible(!lyricsVisible)}
    >
      <MaterialIcons name="lyrics" size={25} color="white" />
    </Pressable>
  );

export default function NowPlaying() {
  // ? Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // ? States
  const [repeatMode, setRepeatMode] = useState<number>();
  const [isNowPlayingVisible, setIsNowPlayingVisible] = useState(true);

  // ? StoreStates
  const { state } = usePlayerStore(state => state.playbackState);
  const bitrate = usePlayerStore(state => state.bitrate);
  const streamViaHLS = usePlayerStore(state => state.streamViaHLS);
  const nowPlayingRef: any = usePlayerStore(state => state.nowPlayingRef);
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

  // ? Hooks
  const orientation = useDeviceOrientation();

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          closeNowPlaying(nowPlayingRef!);

          if (isNowPlayingVisible) {
            setIsNowPlayingVisible(false);
            return false;
          } else {
            setIsNowPlayingVisible(true);
            return true;
          }
        },
      );

      return () => subscription.remove();
    }, [isNowPlayingVisible]),
  );

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
        handleIndicatorStyle={{ backgroundColor: '#fff' }}
        backgroundStyle={{
          backgroundColor: 'rgba(0, 0, 0, .8)',
          borderRadius: 20,
        }}
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
          }}
        >
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
                    .patch('updatePalette', { id: activeTrack.id, palette })
                    .then(({ data }) => console.log(data));
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
                      }}
                    >
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'auto',
                          backgroundColor: palette?.[index],
                          borderRadius: 5,
                          height: 30,
                          width: 30,
                          marginVertical: 5,
                          marginLeft: 4,
                        }}
                      />

                      <Text
                        style={{
                          fontFamily: 'Abel',
                          fontSize: 15,
                          fontWeight: '500',
                          color: '#fff',
                        }}
                      >
                        {selection}
                      </Text>
                      <Ionicons
                        name={isOpened ? 'chevron-up' : 'chevron-down'}
                        style={{ color: '#fff', fontSize: 15 }}
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
                      }}
                    >
                      <Text style={{ color: '#000' }}>{item}</Text>
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

  // ? Constants
  const isPlaying = state === State.Playing;
  const isBuffering = state === State.Buffering;
  const isLoading = state === State.Loading;
  const isEnded = state === State.Ended;
  const isIdle = state === MediaPlayerState.IDLE;
  const activeStates = [
    State.Playing,
    State.Buffering,
    State.Paused,
    State.Loading,
    State.Buffering,
    State.Ready,
  ];

  return (
    //activeStates.includes(state) && (
    <>
      <StatusBarX />

      <BottomSheet
        ref={nowPlayingRef}
        index={-1}
        snapPoints={['100%']}
        enableDynamicSizing={false}
        enablePanDownToClose
        handleStyle={{ display: 'none' }}
        backgroundStyle={{ borderRadius: 0 }}
      >
        <BottomSheetFlatList
          data={[1]}
          keyExtractor={(i: number) => i.toString()}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          renderItem={() => (
            <>
              <LinearGradient
                colors={[palette?.[1] ?? '#000', palette?.[0] ?? '#000']}
                useAngle={true}
                angle={180}
                style={{
                  position: 'absolute',
                  opacity: 1,
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                }}
              />

              {orientation === 'portrait' ? (
                <>
                  <View style={{ alignItems: 'center', height: HEIGHT }}>
                    <MaterialCommunityIcons
                      color="#fff"
                      name="drag-horizontal"
                      size={30}
                    />

                    {lyrics && lyricsVisible ? (
                      <Lyrics
                        lyricsVisible={lyricsVisible}
                        setLyricsVisible={setLyricsVisible}
                      />
                    ) : (
                      <>
                        {/* <CarouselQueue /> */}
                        <View style={{ flex: 1 }}>
                          <Shadow
                            startColor="#00000066"
                            distance={2}
                            style={{ borderRadius: 20, height: WIDTH * 0.95 }}
                          >
                            <Image
                              source={
                                activeTrack?.artwork
                                  ? { uri: activeTrack?.artwork }
                                  : imageFiller
                              }
                              style={{
                                height: WIDTH * 0.95,
                                width: WIDTH * 0.95,
                                borderRadius: 20,
                              }}
                            />
                            <LyricsButton
                              palette={palette}
                              lyrics={lyrics}
                              lyricsVisible={lyricsVisible}
                              setLyricsVisible={setLyricsVisible}
                            />
                          </Shadow>
                        </View>
                      </>
                    )}

                    <View
                      style={{
                        alignItems: 'center',
                        flexDirection: 'row',
                        gap: 10,
                        justifyContent: 'space-between',
                        marginTop: WIDTH,
                        paddingHorizontal: 20,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontFamily: fontFamilyBold,
                            fontSize: 18,
                            textDecorationLine: 'underline',
                          }}
                        >
                          {`${activeTrackIndex! + 1}/${queue.length}`} enQ
                        </Text>
                      </View>

                      <View
                        style={{
                          alignItems: 'center',
                          borderWidth: 1,
                          backgroundColor: 'rgba(255, 255, 255, .3)',
                          borderColor: 'rgba(255, 255, 255, .3)',
                          borderRadius: 7,
                          flex: 2.5,
                          flexDirection: 'row',
                          justifyContent: 'center',
                          opacity: 0.7,
                          paddingVertical: 5,
                          overflow: 'hidden',
                        }}
                      >
                        {!streamViaHLS || bitrate === 'Max' ? (
                          <>
                            <Text style={{ fontFamily: fontFamilyBold }}>
                              {`${activeTrack?.format?.toLocaleUpperCase()} ${
                                activeTrack?.sampleRate! / 1000
                              } Khz`}
                            </Text>

                            <Text style={{ fontFamily: fontFamilyBold }}>
                              &nbsp;&nbsp;◎&nbsp;&nbsp;
                            </Text>

                            <Text style={{ fontFamily: fontFamilyBold }}>
                              {(activeTrack?.bitrate! / 1000).toFixed(2)} Kbps
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text style={{ fontWeight: 'bold' }}>OPUS</Text>

                            <Text style={{ fontWeight: 'bold' }}>
                              &nbsp;&nbsp;/&nbsp;&nbsp;
                            </Text>

                            <Text style={{ fontWeight: 'bold' }}>
                              {bitrate} Kbps
                            </Text>
                          </>
                        )}
                      </View>

                      <View style={{ alignItems: 'flex-end', flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontFamily: fontFamilyBold,
                            fontSize: 18,
                            textDecorationLine: 'underline',
                          }}
                        >
                          {trackPlayCount} play
                          {`${trackPlayCount === 1 ? '' : 's'}`}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        alignItems: 'center',
                        flexDirection: 'row',
                        gap: 10,
                        justifyContent: 'space-between',
                        marginTop: 20,
                      }}
                    >
                      <Pressable
                        style={{
                          ...styles.chip,
                          backgroundColor: `${palette?.[1]}66`,
                        }}
                        onPress={handleRepeatMode}
                      >
                        {repeatMode === RepeatMode.Off ? (
                          <MaterialCommunityIcons
                            color="#fff"
                            name="repeat-off"
                            size={25}
                          />
                        ) : repeatMode === RepeatMode.Track ? (
                          <MaterialCommunityIcons
                            color="#54ff65"
                            name="repeat-once"
                            size={25}
                          />
                        ) : (
                          <MaterialCommunityIcons
                            color="#d7ff54"
                            name="repeat"
                            size={25}
                          />
                        )}
                      </Pressable>

                      <Rating />

                      <View
                        style={{
                          ...styles.chip,
                          backgroundColor: `${palette?.[1]}66`,
                          borderRadius: 10,
                          paddingRight: 17,
                        }}
                      >
                        <CastButton
                          style={{
                            width: 24,
                            height: 24,
                            tintColor: 'rgba(255, 255, 255, .7)',
                          }}
                        />
                      </View>
                    </View>

                    <WaveformSlider />

                    <TrackInfo />

                    <Controls />
                  </View>

                  <Queue />
                </>
              ) : (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingHorizontal: 10,
                      top: -15,
                    }}
                  >
                    {lyrics && lyricsVisible ? (
                      <Lyrics
                        lyricsVisible={lyricsVisible}
                        setLyricsVisible={setLyricsVisible}
                      />
                    ) : (
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Shadow startColor="#00000066" distance={3}>
                          <Image
                            source={
                              activeTrack?.artwork
                                ? { uri: activeTrack?.artwork }
                                : imageFiller
                            }
                            style={{
                              height: HEIGHT * 0.65,
                              width: HEIGHT * 0.65,
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
                      }}
                    >
                      <TrackInfo />

                      <View
                        style={{
                          alignItems: 'center',
                          flexDirection: 'row',
                          gap: 20,
                          justifyContent: 'space-between',
                          marginTop: 5,
                        }}
                      >
                        {/* <Text
                          style={{ fontFamily: fontFamilyBold, fontSize: 18 }}
                        >
                          {trackPlayCount} play
                          {`${trackPlayCount === 1 ? '' : 's'}`}
                        </Text> */}

                        <Pressable
                          style={{
                            ...styles.chip,
                            backgroundColor: `${palette?.[1]}66`,
                          }}
                          onPress={handleRepeatMode}
                        >
                          {repeatMode === RepeatMode.Off ? (
                            <MaterialCommunityIcons
                              color="#fff"
                              name="repeat-off"
                              size={25}
                            />
                          ) : repeatMode === RepeatMode.Track ? (
                            <MaterialCommunityIcons
                              color="#54ff65"
                              name="repeat-once"
                              size={25}
                            />
                          ) : (
                            <MaterialCommunityIcons
                              color="#d7ff54"
                              name="repeat"
                              size={25}
                            />
                          )}
                        </Pressable>

                        <Rating />

                        <View
                          style={{
                            ...styles.chip,
                            backgroundColor: `${palette?.[1]}66`,
                            borderRadius: 10,
                            paddingRight: 17,
                          }}
                        >
                          <CastButton
                            style={{
                              width: 24,
                              height: 24,
                              tintColor: 'rgba(255, 255, 255, .7)',
                            }}
                          />
                        </View>

                        {/* <Text
                          style={{ fontSize: 18, fontFamily: fontFamilyBold }}
                        >
                          {`${activeTrackIndex! + 1}/${queue.length}`} enq
                        </Text> */}
                      </View>

                      <Controls />
                    </View>

                    <View style={{ height: HEIGHT * 0.88, width: WIDTH * 0.2 }}>
                      {ASPECT_RATIO > 2.1 && <QueueHorizontal />}
                    </View>
                  </View>

                  <WaveformSliderHorizontal />
                </>
              )}
            </>
          )}
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
