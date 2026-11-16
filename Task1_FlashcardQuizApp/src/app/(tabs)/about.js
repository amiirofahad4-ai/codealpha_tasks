import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen, confirm, notify } from '../../components/ui';
import { useFlash } from '../../context/FlashContext';
import { useTheme } from '../../theme';

const FEATURES = [
  ['cards-outline', 'Create decks and flashcards'],
  ['rotate-3d-variant', 'Flip cards to check the answer'],
  ['help-circle-outline', 'Quiz yourself and track your score'],
  ['cellphone-check', 'Everything is saved on your device'],
];

export default function AboutScreen() {
  const t = useTheme();
  const { resetSamples } = useFlash();

  const onReset = async () => {
    const ok = await confirm(
      'Reset sample data?',
      'All your decks, cards and quiz scores will be replaced with the 3 sample decks. This cannot be undone.',
      { confirmText: 'Reset', destructive: true }
    );
    if (ok) {
      await resetSamples();
      notify('Done', 'The sample decks have been restored.');
    }
  };

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: t.text }]} accessibilityRole="header">
        About
      </Text>

      <LinearGradient colors={t.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.logo}>
          <MaterialCommunityIcons name="lightning-bolt" size={34} color="#6C3CE9" />
        </View>
        <Text style={styles.appName}>FlashMind</Text>
        <Text style={styles.version}>Version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
        <Text style={styles.desc}>A simple flashcard quiz app to learn anything, one card at a time.</Text>
      </LinearGradient>

      <Card style={styles.features}>
        {FEATURES.map(([icon, text]) => (
          <View key={text} style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: t.soft }]}>
              <MaterialCommunityIcons name={icon} size={20} color={t.accent} />
            </View>
            <Text style={[styles.featureText, { color: t.text }]}>{text}</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.made}>
        <MaterialCommunityIcons name="school-outline" size={22} color={t.accent} />
        <Text style={[styles.madeText, { color: t.text }]}>Made for the CodeAlpha App Development Internship</Text>
      </Card>

      <Text style={[styles.label, { color: t.muted }]}>DATA</Text>
      <Card>
        <Text style={[styles.resetTitle, { color: t.text }]}>Reset sample data</Text>
        <Text style={[styles.resetHint, { color: t.muted }]}>
          Brings back the 3 sample decks and removes your own decks, cards and scores.
        </Text>
        <Button title="Reset sample data" icon="restore" variant="danger" onPress={onReset} style={styles.resetBtn} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', marginTop: 16, marginBottom: 18 },
  hero: { borderRadius: 24, padding: 24, alignItems: 'center', overflow: 'hidden' },
  logo: { width: 68, height: 68, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  appName: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 12 },
  version: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600', marginTop: 2 },
  desc: { color: 'rgba(255,255,255,0.92)', fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  features: { marginTop: 16, gap: 14 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, fontSize: 15, fontWeight: '600' },
  made: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  madeText: { flex: 1, fontSize: 15, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginTop: 24, marginBottom: 10, marginLeft: 6 },
  resetTitle: { fontSize: 16, fontWeight: '800' },
  resetHint: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  resetBtn: { marginTop: 14 },
});
