// Shown when the .env file with the Supabase URL and key is missing.
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme';
import { Card } from './ui';

const STEPS = [
  'Create a free project at supabase.com.',
  'Open SQL Editor, paste the file supabase/schema.sql and press Run.',
  'Create a file named .env in the project folder.',
  'In Supabase open Project Settings → API. Add EXPO_PUBLIC_SUPABASE_URL (Project URL) and EXPO_PUBLIC_SUPABASE_KEY (publishable key) to .env.',
  'Stop the app and start it again with: npx expo start --clear',
];

export default function SetupScreen() {
  const c = useTheme();
  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: c.text }]}>Connect Supabase</Text>
      <Text style={[styles.sub, { color: c.muted }]}>
        FitTrack saves your data in Supabase, but no Supabase URL or key was found.
      </Text>
      <Card>
        {STEPS.map((s, i) => (
          <Text key={i} style={[styles.step, { color: c.text }]}>
            {i + 1}. {s}
          </Text>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 70, maxWidth: 560, width: '100%', alignSelf: 'center' },
  title: { fontSize: 26, fontWeight: '800' },
  sub: { fontSize: 15, marginTop: 6, marginBottom: 18 },
  step: { fontSize: 15, lineHeight: 22, marginBottom: 10 },
});
