import { useColorScheme } from 'react-native';

const light = {
  dark: false,
  bg: '#F6F4FC',
  card: '#FFFFFF',
  text: '#1B1530',
  muted: '#6E6A80',
  border: '#E7E3F3',
  track: '#ECE8F8',
  primary: '#6C3CE9',
  primaryDark: '#4F22C9',
  primarySoft: '#EEE8FD',
  primaryText: '#FFFFFF',
  steps: '#3E7BFA',
  calories: '#F2662F',
  minutes: '#6C3CE9',
  distance: '#3E7BFA',
  success: '#16A34A',
  danger: '#DC2626',
  gradient: ['#7B4DF2', '#5A2DD6'],
  heroGradient: ['#2A1758', '#3D1F86', '#14092E'],
};

const dark = {
  dark: true,
  bg: '#110E1A',
  card: '#1C1828',
  text: '#F0EDF8',
  muted: '#A49FB8',
  border: '#2D2840',
  track: '#2A2540',
  primary: '#8E6AF7',
  primaryDark: '#6C3CE9',
  primarySoft: '#2B2250',
  primaryText: '#FFFFFF',
  steps: '#6E9BFF',
  calories: '#FF8A5B',
  minutes: '#A98BFA',
  distance: '#6E9BFF',
  success: '#22C55E',
  danger: '#F87171',
  gradient: ['#7B4DF2', '#4F22C9'],
  heroGradient: ['#2A1758', '#3D1F86', '#0B0616'],
};

export function useTheme() {
  return useColorScheme() === 'dark' ? dark : light;
}

export const METRICS = [
  { key: 'steps', label: 'Steps', unit: 'steps', icon: 'shoe-print' },
  { key: 'calories', label: 'Calories', unit: 'kcal', icon: 'fire' },
  { key: 'minutes', label: 'Active time', unit: 'min', icon: 'timer-outline' },
];
