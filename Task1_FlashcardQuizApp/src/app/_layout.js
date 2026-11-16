import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { FlashProvider, useFlash } from '../context/FlashContext';
import { useTheme } from '../theme';

export default function RootLayout() {
  return (
    <FlashProvider>
      <AppStack />
    </FlashProvider>
  );
}

function AppStack() {
  const t = useTheme();
  const { ready } = useFlash();
  const base = t.dark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, primary: t.primary, background: t.bg, card: t.card, text: t.text, border: t.border },
  };

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
        <ActivityIndicator size="large" color={t.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={t.dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="deck/[id]" />
        <Stack.Screen name="card" options={{ presentation: 'modal' }} />
        <Stack.Screen name="study/[id]" />
        <Stack.Screen name="quiz/[id]" />
        <Stack.Screen name="result/[id]" options={{ gestureEnabled: false }} />
      </Stack>
    </ThemeProvider>
  );
}
