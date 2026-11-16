import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Header, ScoreRing, Screen } from '../../components/ui';
import { useFlash } from '../../context/FlashContext';
import { useTheme } from '../../theme';

function messageFor(pct) {
  if (pct >= 80) return { title: 'Great job! 🏆', hint: 'You really know this deck.' };
  if (pct >= 50) return { title: 'Good effort! 💪', hint: 'A little more practice and you’ve got it.' };
  return { title: 'Keep practicing! 🌱', hint: 'Study the cards you missed and try again.' };
}

// Quiz result. The score was saved for the deck by the quiz screen just before opening this one.
export default function ResultScreen() {
  const t = useTheme();
  const params = useLocalSearchParams();
  const { decks } = useFlash();
  const deck = decks.find((d) => d.id === params.id);

  const correct = Number(params.correct) || 0;
  const total = Number(params.total) || 0;
  const missed = typeof params.missed === 'string' && params.missed ? params.missed : '';
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const msg = messageFor(pct);
  const ringColor = pct >= 80 ? t.success : pct >= 50 ? t.primary : '#F59E0B';

  return (
    <Screen edges={['top', 'bottom']}>
      <Header onBack={() => router.dismissTo('/')} backIcon="close" title={deck?.name ?? 'Result'} subtitle="Quiz result" />

      <View style={styles.middle}>
        <ScoreRing value={pct} color={ringColor}>
          <Text style={[styles.pct, { color: t.text }]}>{pct}%</Text>
          <Text style={[styles.ringLabel, { color: t.muted }]}>score</Text>
        </ScoreRing>
        <Text style={[styles.score, { color: t.text }]} accessibilityRole="header">
          {correct} / {total} – {pct}%
        </Text>
        <Text style={[styles.title, { color: t.accent }]}>{msg.title}</Text>
        <Text style={[styles.hint, { color: t.muted }]}>{msg.hint}</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Try again" icon="restart" onPress={() => router.replace(`/quiz/${params.id}`)} />
        {missed ? (
          <Button
            title={`Study wrong cards (${missed.split(',').length})`}
            icon="cards-playing-outline"
            variant="secondary"
            onPress={() => router.replace({ pathname: '/study/[id]', params: { id: params.id, ids: missed } })}
          />
        ) : null}
        <Button title="Back to decks" icon="home-outline" variant="outline" onPress={() => router.dismissTo('/')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pct: { fontSize: 40, fontWeight: '800' },
  ringLabel: { fontSize: 13, fontWeight: '700' },
  score: { fontSize: 26, fontWeight: '800', marginTop: 26 },
  title: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  hint: { fontSize: 15, fontWeight: '500', marginTop: 6, textAlign: 'center' },
  actions: { gap: 12, marginBottom: 12 },
});
