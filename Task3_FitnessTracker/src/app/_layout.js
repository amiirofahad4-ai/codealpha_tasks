import { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { supabaseConfigured } from '../lib/supabase';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { FitnessProvider, useFitness } from '../context/FitnessContext';
import AuthScreen from '../components/AuthScreen';
import FocusPicker from '../components/FocusPicker';
import SetupScreen from '../components/SetupScreen';
import WelcomeScreen from '../components/WelcomeScreen';
import { useTheme } from '../theme';

function Loading() {
  const c = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
      <ActivityIndicator color={c.primary} size="large" />
    </View>
  );
}

function AppStack() {
  const c = useTheme();
  const { ready } = useFitness();
  if (!ready) return <Loading />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.bg },
        headerTintColor: c.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: c.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="activity" options={{ presentation: 'modal', title: 'Log activity' }} />
      <Stack.Screen name="session" options={{ title: 'Workout' }} />
      <Stack.Screen name="history" options={{ title: 'All activities' }} />
      <Stack.Screen name="goals" options={{ title: 'My Goals' }} />
      <Stack.Screen name="focus" options={{ title: 'Set Your Goal' }} />
    </Stack>
  );
}

// First-time setup after sign up: pick a name and fitness goal.
function Onboarding() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 16 }}>
      <Text style={[styles.onboardTitle, { color: c.text }]}>Set Your Goal</Text>
      <FocusPicker />
    </View>
  );
}

// Signed out → welcome / login. Signed in → onboarding once, then the app.
function AuthGate() {
  const { session, loading, profile } = useAuth();
  const [screen, setScreen] = useState('welcome'); // 'welcome' | 'signin' | 'signup'

  if (loading) return <Loading />;
  if (!session) {
    if (screen === 'welcome') {
      return <WelcomeScreen onGetStarted={() => setScreen('signup')} onSignIn={() => setScreen('signin')} />;
    }
    return <AuthScreen key={screen} initialMode={screen} onBack={() => setScreen('welcome')} />;
  }
  if (!profile.focus) return <Onboarding />;
  return (
    <FitnessProvider key={session.user.id}>
      <AppStack />
    </FitnessProvider>
  );
}

export default function RootLayout() {
  const c = useTheme();
  const navTheme = c.dark ? DarkTheme : DefaultTheme;
  return (
    <ThemeProvider
      value={{
        ...navTheme,
        colors: { ...navTheme.colors, background: c.bg, card: c.card, text: c.text, border: c.border, primary: c.primary },
      }}
    >
      {supabaseConfigured ? (
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      ) : (
        <SetupScreen />
      )}
      <StatusBar style={c.dark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  onboardTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
});
