import { useColorScheme } from 'react-native';

const shared = {
  radius: { sm: 12, md: 20, lg: 24, pill: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  maxWidth: 640,
};

export const lightTheme = {
  ...shared,
  dark: false,
  colors: {
    primary: '#6C3CE9',
    primaryDark: '#4F22C9',
    primarySoft: '#EEE8FD',
    background: '#F6F4FC',
    card: '#FFFFFF',
    text: '#1D1530',
    textMuted: '#6B6480',
    border: '#E6E0F5',
    onPrimary: '#FFFFFF',
    heart: '#F0436A',
    toast: '#1D1530',
    onToast: '#FFFFFF',
    gradient: ['#7B4DF2', '#5A2DD6'],
  },
};

export const darkTheme = {
  ...shared,
  dark: true,
  colors: {
    primary: '#8E6AF7',
    primaryDark: '#6C3CE9',
    primarySoft: '#2A2340',
    background: '#110E1A',
    card: '#1C1828',
    text: '#F3F0FA',
    textMuted: '#A39DB5',
    border: '#2E2840',
    onPrimary: '#FFFFFF',
    heart: '#FF6B8B',
    toast: '#F3F0FA',
    onToast: '#1D1530',
    gradient: ['#7B4DF2', '#4A22B8'],
  },
};

/** Returns the light or dark theme, following the device setting. */
export function useAppTheme() {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}
