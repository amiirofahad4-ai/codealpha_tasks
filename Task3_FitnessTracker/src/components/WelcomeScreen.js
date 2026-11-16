// First screen for signed-out users: brand, tagline, Get Started / Sign In.
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { Button } from './ui';

export default function WelcomeScreen({ onGetStarted, onSignIn }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={c.heroGradient} style={styles.fill}>
      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.hero}>
          <View style={styles.glow} />
          <View style={styles.badge}>
            <MaterialCommunityIcons name="run-fast" size={96} color="#B79CFF" />
          </View>
          <View style={styles.stats}>
            <Pill icon="fire" text="320 kcal" />
            <Pill icon="shoe-print" text="6.2 km" />
            <Pill icon="timer-outline" text="45 min" />
          </View>
        </View>

        <View>
          <View style={styles.brandRow}>
            <MaterialCommunityIcons name="run-fast" size={40} color="#A98BFA" />
          </View>
          <Text style={styles.brand}>FitTrack</Text>
          <Text style={styles.tagline}>Track. Improve. Be Healthy.</Text>
          <Button title="Get Started" variant="primary" onPress={onGetStarted} style={{ marginTop: 32 }} />
          <Button title="Sign In" variant="ghost" onPress={onSignIn} style={{ marginTop: 8 }} />
        </View>
      </View>
    </LinearGradient>
  );
}

function Pill({ icon, text }) {
  return (
    <View style={styles.pill}>
      <MaterialCommunityIcons name={icon} size={16} color="#FFFFFF" />
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 28, maxWidth: 480, width: '100%', alignSelf: 'center' },
  hero: { alignItems: 'center', marginTop: 20 },
  glow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: '#7B4DF2', opacity: 0.25, top: -30 },
  badge: {
    width: 190, height: 190, borderRadius: 95, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  stats: { flexDirection: 'row', gap: 8, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)',
  },
  pillText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  brandRow: { alignItems: 'center' },
  brand: { color: '#FFFFFF', fontSize: 44, fontWeight: '900', fontStyle: 'italic', textAlign: 'center', letterSpacing: -1 },
  tagline: { color: '#E4DCFF', fontSize: 17, textAlign: 'center', marginTop: 6 },
});
