import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#FF385C',
    secondary: '#00A699',
    tertiary: '#484848',
    background: '#FFFFFF',
    surface: '#F7F7F7',
    surfaceVariant: '#EBEBEB',
    error: '#C13515',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#222222',
    onSurface: '#222222',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FF385C',
    secondary: '#00A699',
    tertiary: '#B0B0B0',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
  },
};
