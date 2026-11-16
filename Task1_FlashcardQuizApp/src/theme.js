import { useColorScheme } from 'react-native';

export const lightTheme = {
  dark: false,
  bg: '#F6F4FC',
  card: '#FFFFFF',
  text: '#1D1A2B',
  muted: '#6F6A84',
  border: '#ECE8F7',
  primary: '#6C3CE9',
  primaryDark: '#4F22C9',
  soft: '#EEE8FD',
  accent: '#6C3CE9', // purple for text and icons
  input: '#FFFFFF',
  success: '#16A34A',
  successSoft: '#DCFCE7',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  gradient: ['#7B4DF2', '#5A2DD6'],
  onPrimary: '#FFFFFF',
};

export const darkTheme = {
  dark: true,
  bg: '#110E1A',
  card: '#1C1828',
  text: '#F3F0FF',
  muted: '#A7A1BE',
  border: '#2C2740',
  primary: '#8E6AF7',
  primaryDark: '#6C3CE9',
  soft: '#2A2344',
  accent: '#A88BFA',
  input: '#171322',
  success: '#22C55E',
  successSoft: '#12301F',
  danger: '#F87171',
  dangerSoft: '#3A1719',
  gradient: ['#7B4DF2', '#5A2DD6'],
  onPrimary: '#FFFFFF',
};

export function useTheme() {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}

// Preset deck colors
export const DECK_COLORS = ['#6C3CE9', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export const RADIUS = { card: 20, pill: 999, input: 14 };
export const MAX_WIDTH = 640;
export const MAX_CHARS = 300;
