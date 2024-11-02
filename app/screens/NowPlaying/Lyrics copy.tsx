import React, {useState, useEffect} from 'react';
import {
  Alert,
  Button,
  View,
  Pressable,
  Image,
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  useWindowDimensions,
} from 'react-native';

// import Lyrics from "../components/Lyrics";
// import PlayButton from "../components/PlayButton";
// import ProgressBar from "../components/ProgressBar";
// import TimeStamps from "../components/TimeStamps";

import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {TQueue} from '../../types';
import {useActiveTrack} from 'react-native-track-player';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const SONG_LENGTH = 191000 as const;
const SONG_BG_COLOR = '#D63A12' as const;
const DARK_LYRICS_COLOR = '#772E0E' as const;
const THRESHOLD = 150 as const;

const LyricsData = {
  lyrics: {
    provider: 'Musixmatch',
    kind: 'LINE',
    trackId: '37BZB0z9T8Xu7U3e65qxFy',
    lines: [
      {time: 1960, words: [{string: 'Ooh (ooh)'}]},
      {time: 5320, words: [{string: 'Nah-nah, yeah'}]},
      {
        time: 8590,
        words: [{string: 'I saw you dancing in a crowded room (uh)'}],
      },
      {
        time: 12730,
        words: [{string: "You look so happy when I'm not with you"}],
      },
      {
        time: 16560,
        words: [{string: 'But then you saw me, caught you by surprise'}],
      },
      {
        time: 20840,
        words: [{string: 'A single teardrop falling from your eye'}],
      },
      {
        time: 25080,
        words: [{string: "I don't know why I run away (oh, oh, oh, oh, oh)"}],
      },
      {
        time: 33430,
        words: [
          {string: "I'll make you cry when I run away (oh, oh, oh, oh, oh)"},
        ],
      },
      {
        time: 41220,
        words: [{string: "Take me back 'cause I wanna stay"}],
      },
      {time: 45340, words: [{string: 'Save your tears for another'}]},
      {
        time: 48300,
        words: [
          {string: 'Save your tears for another day (oh, oh, oh, oh, oh)'},
        ],
      },
      {
        time: 56680,
        words: [{string: 'Save your tears for another day (mm)'}],
      },
      {
        time: 65570,
        words: [{string: 'Met you once under a Pisces moon'}],
      },
      {
        time: 69620,
        words: [{string: "I kept my distance 'cause I know that you"}],
      },
      {
        time: 73730,
        words: [{string: "Don't like when I'm with nobody else"}],
      },
      {
        time: 78020,
        words: [{string: "I couldn't help it, I put you through hell"}],
      },
      {
        time: 82310,
        words: [
          {string: "I don't know why I run away (run away, oh, oh, oh, oh)"},
        ],
      },
      {
        time: 88690,
        words: [
          {
            string:
              "Oh, boy, I'll make you cry when I run away (away, oh, oh, oh, oh)",
          },
        ],
      },
      {time: 95520, words: [{string: '♪'}]},
      {
        time: 98010,
        words: [{string: "Boy, take me back 'cause I wanna stay"}],
      },
      {
        time: 102430,
        words: [{string: 'Save your tears for another'}],
      },
      {
        time: 106070,
        words: [{string: "I realize that it's much too late"}],
      },
      {
        time: 110450,
        words: [{string: 'And you deserve someone better'}],
      },
      {
        time: 113620,
        words: [
          {string: 'Save your tears for another day (oh, oh, oh, oh, oh)'},
        ],
      },
      {
        time: 121920,
        words: [
          {string: 'Save your tears for another day (oh, oh, oh, oh, oh)'},
        ],
      },
      {
        time: 131190,
        words: [
          {string: "I don't know why I run away (bum, bum, bum, bum, bum)"},
        ],
      },
      {
        time: 139290,
        words: [{string: "I'll make you cry when I run away (save)"}],
      },
      {
        time: 146100,
        words: [{string: 'Save your tears for another day (ooh)'}],
      },
      {
        time: 152230,
        words: [{string: 'Ooh, girl (oh, oh, oh, oh, oh, okay)'}],
      },
      {
        time: 153860,
        words: [
          {
            string:
              'I said save your tears for another day (oh, oh, oh, oh, oh)',
          },
        ],
      },
      {
        time: 162560,
        words: [
          {string: 'Save your tears for another day (oh, oh, oh, oh, oh)'},
        ],
      },
      {
        time: 170590,
        words: [
          {string: 'Save your tears for another day (oh, oh, oh, oh, oh)'},
        ],
      },
      {
        time: 178820,
        words: [{string: 'Save your tears for another day'}],
      },
      {time: 182380, words: [{string: '♪'}]},
    ],
    language: 'en',
  },
  has_vocal_removal: false,
  colors: {
    active_color: -1,
    dark_color: -696289,
    bright_color: -8966642,
  },
};

export interface LyricsProps {
  data: {
    time: number;
    words: {
      string: string;
    }[];
  };
  seekTime: Animated.SharedValue<number>;
}

const Lyricx = ({data, seekTime}: LyricsProps) => {
  const lyricsColor = useDerivedValue(() => {
    if (seekTime.value < data.time - 100 || seekTime.value === 0) {
      return DARK_LYRICS_COLOR;
    } else if (seekTime.value < data.time) {
      return withTiming('white', {
        duration: 100,
      });
    } else {
      return 'white';
    }
  });

  const lyricsStyle = useAnimatedStyle(() => {
    return {
      color: lyricsColor.value,
    };
  }, []);

  return (
    <>
      {data.words.map((t, index) => {
        return (
          <Animated.Text
            style={[styles.text, lyricsStyle]}
            key={`${index}_${t}`}>
            {t.string}
          </Animated.Text>
        );
      })}
    </>
  );
};

const Lyrics = ({
  queue,
  artworkQueue,
  trimmedArtworkQueue,
  activeTrackIndex,
  trackRating,
  trackPlayCount,
  upNextCount,
  playRegistered,
}: TQueue) => {
  const activeTrack = useActiveTrack();

  const {height} = useWindowDimensions();
  const seekTime = useSharedValue(0);
  const isPlaying = useSharedValue(false);
  const halfScrollComponentHeight = 0.3 * height;

  const [heights, setHeights] = useState<number[]>(
    new Array(LyricsData.lyrics.lines.length).fill(0),
  );

  const lyricsScrollValue = useDerivedValue(() => {
    const sumOfHeights = (index: number) => {
      let sum = 0;
      for (let i = 0; i < index; ++i) {
        sum += heights[i];
      }
      return sum;
    };
    if (seekTime.value < LyricsData.lyrics.lines[0].time - THRESHOLD) {
      return 0;
    }
    // Don't go till last. or the screen would be left empty
    for (let index = 1; index < LyricsData.lyrics.lines.length - 2; index++) {
      const currTime = LyricsData.lyrics.lines[index].time;
      const lastTime = LyricsData.lyrics.lines[index - 1].time;
      if (seekTime.value > lastTime && seekTime.value < currTime - THRESHOLD) {
        return sumOfHeights(index - 1);
      } else if (seekTime.value < currTime) {
        return withTiming(sumOfHeights(index), {
          duration: THRESHOLD,
          easing: Easing.quad,
        });
      }
    }
    return sumOfHeights(LyricsData.lyrics.lines.length - 2);
  }, [heights]);

  const scrollViewStyle = useAnimatedStyle(() => {
    // In spotify the scroll happens only after half of the screen
    return {
      transform: [
        {
          translateY:
            lyricsScrollValue.value > halfScrollComponentHeight
              ? -lyricsScrollValue.value + halfScrollComponentHeight
              : 0,
        },
      ],
    };
  });

  const topGradientStyle = useAnimatedStyle(() => {
    if (lyricsScrollValue.value > halfScrollComponentHeight) {
      return {
        opacity: withTiming(1, {
          duration: 300,
        }),
      };
    }
    return {
      opacity: 0,
    };
  });

  const startPlaying = () => {
    'worklet';
    isPlaying.value = true;
    seekTime.value = withTiming(SONG_LENGTH, {
      duration: SONG_LENGTH,
      easing: Easing.linear,
    });
  };
  // Function to stop song from playing
  const stopPlaying = () => {
    'worklet';
    // TODO add logic for pausing the animation
    isPlaying.value = false;
    cancelAnimation(seekTime);
  };

  useEffect(() => {
    // Check if all the heights are greater than zero or else quit early;
    for (let i = 0; i < heights.length; ++i) {
      if (heights[i] === 0) {
        return;
      }
    }
    console.log('Ready');
  }, [heights]);

  return (
    <View style={styles.container}>
      <View style={styles.songDetailsContainer}>
        <View
          style={{
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,

            elevation: 10,
          }}>
          <Image
            source={{uri: activeTrack?.artwork}}
            style={{
              height: 0.12 * height,
              width: 0.12 * height,
            }}
          />
        </View>
        <View style={styles.songNameContainer}>
          <Text style={styles.songName}>Save Your Tears (with ...</Text>
          <Text style={styles.songAuthor}>The Weeknd</Text>
        </View>
      </View>
      <AnimatedLinearGradient
        colors={[SONG_BG_COLOR, 'transparent']}
        style={[styles.topGradientStyle, topGradientStyle]}
      />
      <Animated.ScrollView
        style={styles.scrollvView}
        overScrollMode={'never'}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}>
        <Animated.View style={scrollViewStyle}>
          {LyricsData.lyrics.lines.map((line: any, index: number) => {
            return (
              <View
                key={`${line.time}_${line.words.join('_')}`}
                onLayout={event => {
                  const {height: layoutHeight} = event.nativeEvent.layout;
                  setHeights(prevHeights => {
                    if (
                      !prevHeights[index] ||
                      prevHeights[index] !== layoutHeight
                    ) {
                      prevHeights[index] = layoutHeight;
                      return [...prevHeights];
                    } else {
                      return prevHeights;
                    }
                  });
                }}>
                <Lyricx data={line} seekTime={seekTime} />
              </View>
            );
          })}
          <View style={{height: 0.3 * height}} />
        </Animated.View>
      </Animated.ScrollView>
      <LinearGradient
        colors={['transparent', SONG_BG_COLOR]}
        style={styles.bottomGradientStyle}
      />
      {/* <View style={styles.bottomContainer}>
        <ProgressBar seekTime={seekTime} songLength={SONG_LENGTH} />
        <TimeStamps seekTime={seekTime} />
        <View style={styles.buttonContainer}>
          <PlayButton
            isPlaying={isPlaying}
            onPress={() => {
              if (isPlaying.value) {
                stopPlaying();
              } else {
                startPlaying();
              }
            }}
          />
        </View>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 22,
    fontFamily: 'Gotham-Medium',
    paddingBottom: 5,
  },
  container: {
    flex: 1,
    backgroundColor: SONG_BG_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5%',
  },
  scrollvView: {
    backgroundColor: SONG_BG_COLOR,
    width: '100%',
    paddingHorizontal: '5%',
  },
  songDetailsContainer: {
    height: '20%',
    padding: '5%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  bottomContainer: {
    height: '20%',
    padding: '5%',
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flex: 1,
  },
  songNameContainer: {
    marginLeft: '5%',
    display: 'flex',
  },
  songAuthor: {
    color: 'white',
    paddingTop: 10,
    fontFamily: 'Gotham-Book',
  },
  songName: {
    color: 'white',
    fontFamily: 'Gotham-Medium',
    fontSize: 18,
  },
  bottomGradientStyle: {
    height: '7%',
    position: 'absolute',
    left: '5%',
    right: '5%',
    top: '76%',
  },
  topGradientStyle: {
    height: '7%',
    position: 'absolute',
    left: '5%',
    right: '5%',
    top: '22%',
    zIndex: 2,
  },
});

export default Lyrics;
