// * React Native
import { Dimensions } from 'react-native';

// * React Native Libraries
import { RFPercentage as s } from 'react-native-responsive-fontsize';

// * React Native Paper
import {
  MD3LightTheme,
  MD3DarkTheme,
  adaptNavigationTheme,
} from 'react-native-paper';

import {
  DefaultTheme as RNLightTheme,
  DarkTheme as RNDarkTheme,
} from '@react-navigation/native';

import merge from 'deepmerge';

// * Exports
export const deviceHeight = Dimensions.get('window').height;
export const deviceWidth = Dimensions.get('window').width;
export const fontFamily = 'Laila';
export const fontFamilyBold = 'Laila-Bold';
export const fontSize = s(1.7);
export const bottomSheetProps = {
  timing: { duration: 600 },
  spring: { stiffness: 500, damping: 50, mass: 1 },
};

const fonts: any = {};

Object.entries(MD3LightTheme.fonts).map(obj => {
  obj[1].fontFamily = fontFamily;
  fonts[obj[0]] = obj[1];
});

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationDark: RNDarkTheme,
  reactNavigationLight: RNLightTheme,
});

const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);

export const ReactNavigationDarkTheme = DarkTheme;

export const lightTheme = {
  ...CombinedDefaultTheme,
  colors: {
    ...CombinedDefaultTheme.colors,
    primary: '#b038e8',
    secondary: '#8d6e63',
    tertiary: '#d7ccc8',
    error: '#f44336',
    outline: '#8d6e63',
    inputs: { background: '#efebe9', border: 'gray' },
    text: '#000',
  },
};

export const darkTheme = {
  ...CombinedDarkTheme,
  colors: {
    ...CombinedDarkTheme.colors,
    primary: '#b038e8',
    secondary: '#8d6e63',
    tertiary: '#d7ccc8',
    error: '#f44336',
    outline: '#8d6e63',
    inputs: { background: 'transparent', border: '#616161' },
    text: '#fff',
  },
  fonts: {
    ...CombinedDarkTheme.fonts,
    bodyLarge: { ...CombinedDarkTheme.fonts.bodyLarge, fontFamily, fontSize },
  },
};
