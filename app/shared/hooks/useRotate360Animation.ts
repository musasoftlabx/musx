import {
  Easing,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export default function useRotate360Animation() {
  return useAnimatedStyle(() => ({
    transform: [
      {
        rotateZ: withRepeat(
          withSequence(
            withTiming(0 + 'deg', { duration: 0, easing: Easing.linear }),
            withTiming(360 + 'deg', { duration: 3000, easing: Easing.linear }),
          ),
          -1,
          false,
        ),
      },
    ],
  }));
}
