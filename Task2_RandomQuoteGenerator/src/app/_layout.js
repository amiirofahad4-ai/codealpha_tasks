import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';

import { QuoteProvider } from '../context/QuoteContext';
import { useAppTheme } from '../theme';

export default function RootLayout() {
  const theme = useAppTheme();

  // Map our palette onto the navigation theme so tab bar & screens match.
  const navTheme = useMemo(() => {
    const base = theme.dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.card,
        text: theme.colors.text,
        border: theme.colors.border,
      },
    };
  }, [theme]);

  return (
    <ThemeProvider value={navTheme}>
      <QuoteProvider>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </QuoteProvider>
    </ThemeProvider>
  );
}
