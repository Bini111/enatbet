import { Platform } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  web: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as '100',
    },
  },
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as '100',
    },
  },
  android: {
    regular: {
      fontFamily: 'Roboto',
      fontWeight: '400' as '400',
    },
    medium: {
      fontFamily: 'Roboto',
      fontWeight: '500' as '500',
    },
    light: {
      fontFamily: 'Roboto',
      fontWeight: '300' as '300',
    },
    thin: {
      fontFamily: 'Roboto',
      fontWeight: '100' as '100',
    },
  },
};

// EnatBet brand colors (Ethiopian flag inspired)
const colors = {
  primary: '#1B5E20', // Deep Green
  secondary: '#FDD835', // Ethiopian Yellow
  tertiary: '#D32F2F', // Ethiopian Red
  accent: '#FF6F00', // Warm Orange
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceVariant: '#E8F5E9',
  onSurface: '#1A1C1E',
  onSurfaceVariant: '#42474E',
  outline: '#72787E',
  error: '#BA1A1A',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  disabled: '#9E9E9E',
  placeholder: '#BDBDBD',
  backdrop: 'rgba(0, 0, 0, 0.5)',
};

export const lightTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
    primaryContainer: '#C8E6C9',
    secondaryContainer: '#FFF9C4',
    tertiaryContainer: '#FFCDD2',
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    background: colors.background,
    error: colors.error,
    onPrimary: '#FFFFFF',
    onSecondary: '#212121',
    onTertiary: '#FFFFFF',
    onBackground: colors.text,
    onSurface: colors.onSurface,
    onSurfaceVariant: colors.onSurfaceVariant,
    onError: '#FFFFFF',
    outline: colors.outline,
    shadow: '#000000',
    inverseSurface: '#313033',
    inverseOnSurface: '#F1F0F4',
    inversePrimary: '#81C784',
    surfaceDisabled: 'rgba(27, 27, 31, 0.12)',
    onSurfaceDisabled: 'rgba(27, 27, 31, 0.38)',
    backdrop: colors.backdrop,
  },
  roundness: 8,
};

export const darkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#81C784',
    secondary: '#FFF176',
    tertiary: '#EF5350',
    primaryContainer: '#1B5E20',
    secondaryContainer: '#F57C00',
    tertiaryContainer: '#C62828',
    surface: '#1E1E1E',
    surfaceVariant: '#2E2E2E',
    background: '#121212',
    error: '#CF6679',
    onPrimary: '#003A00',
    onSecondary: '#3E2723',
    onTertiary: '#690000',
    onBackground: '#E1E1E1',
    onSurface: '#E1E1E1',
    onSurfaceVariant: '#C4C6D0',
    onError: '#690000',
    outline: '#8E9099',
    shadow: '#000000',
    inverseSurface: '#E3E2E6',
    inverseOnSurface: '#1A1C1E',
    inversePrimary: '#1B5E20',
    surfaceDisabled: 'rgba(227, 226, 230, 0.12)',
    onSurfaceDisabled: 'rgba(227, 226, 230, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.6)',
  },
  roundness: 8,
};

// Export the default theme
export const theme = lightTheme;

// Common styles
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
    borderRadius: 8,
  },
  primaryButton: {
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    marginVertical: 8,
    borderRadius: 8,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as '600',
    color: colors.text,
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row' as 'row',
    alignItems: 'center' as 'center',
  },
  spaceBetween: {
    flexDirection: 'row' as 'row',
    justifyContent: 'space-between' as 'space-between',
    alignItems: 'center' as 'center',
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  successText: {
    color: colors.success,
    fontSize: 14,
    marginTop: 4,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  fab: {
    position: 'absolute' as 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  chip: {
    margin: 4,
  },
  searchBar: {
    margin: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  modalContainer: {
    backgroundColor: colors.background,
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  imageBackground: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end' as 'flex-end',
  },
  overlay: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
};

// Export spacing constants
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Export typography styles
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold' as 'bold',
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold' as 'bold',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as '600',
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as '600',
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as '600',
    lineHeight: 20,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as '400',
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as '400',
    lineHeight: 16,
  },
  button: {
    fontSize: 14,
    fontWeight: '600' as '600',
    lineHeight: 20,
    textTransform: 'uppercase' as 'uppercase',
  },
};
