/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import TrackPlayer from 'react-native-track-player';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerPlaybackService(() => require('./service'));

LogBox.ignoreLogs([
  'Warning: BigListItem: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead',
  'Warning: A props object containing a "key" prop is being spread into JSX',
  '*[Reanimated] Tried to modify key `current` of an object which has been already passed to a worklet. See https://docs.swmansion.com/react-native-reanimated/docs/guides/troubleshooting#tried-to-modify-key-of-an-object-which-has-been-converted-to-a-shareable for more details.',
]);

//LogBox.ignoreAllLogs();

configureReanimatedLogger({
  level: ReanimatedLogLevel.error,
  strict: false, // Reanimated runs in strict mode by default
});
