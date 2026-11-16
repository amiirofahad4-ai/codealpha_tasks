import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import FlipCard from '../../components/FlipCard';
import { Button, Chip, EmptyState, Header, ProgressBar, Screen, goBack } from '../../components/ui';
import { useDeckCards, useFlash } from '../../context/FlashContext';
import { useTheme } from '../../theme';

// Self-check quiz: flip the card, then say whether you knew it.
export default function QuizScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams();
  const { decks, recordScore } = useFlash();
  const deck = decks.find((d) => d.id === id);
  const deckCards = useDeckCards(id);

  // Snapshot of the questions for this run
  const [order] = useState(() => deckCards.map((c) => c.id));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState([]);

  const list = order.map((cid) => deckCards.find((c) => c.id === cid)).filter(Boolean);
  const total = list.length;
  const i = Math.min(index, Math.max(0, total - 1));
  const card = list[i];

  const answer = (knewIt) => {
    const nextCorrect = correct + (knewIt ? 1 : 0);
    const nextMissed = knewIt ? missed : [...missed, card.id];
    if (i === total - 1) {
      // Last card: save the result for this deck and show the result screen
      recordScore(deck.id, nextCorrect, total);
      router.replace({
        pathname: '/result/[id]',
        params: { id: deck.id, correct: String(nextCorrect), total: String(total), missed: nextMissed.join(',') },
      });
      return;
    }
    setCorrect(nextCorrect);
    setMissed(nextMissed);
    setIndex(i + 1);
    setFlipped(false);
  };

  if (!deck || total === 0) {
    return (
      <Screen>
        <Header onBack={() => goBack()} title={deck?.name ?? 'Quiz'} />
        <EmptyState icon="help-circle-outline" title="No cards to quiz" hint="Add some cards to this deck first." />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Header onBack={() => goBack()} backIcon="close" title={deck.name} subtitle="Quiz" />

      <View style={styles.statusRow}>
        <Text style={[styles.cardOf, { color: t.text }]}>
          Card {i + 1} of {total}
        </Text>
        <Chip icon="star-circle" label={`Score: ${correct}`} />
      </View>
      <ProgressBar value={(i + 1) / total} />

      <View style={styles.cardArea}>
        <FlipCard key={card.id} question={card.question} answer={card.answer} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
      </View>

      {flipped ? (
        <>
          <Text style={[styles.ask, { color: t.muted }]}>Did you know the answer?</Text>
          <View style={styles.answerRow}>
            <Button title="I didn't ❌" variant="danger" style={styles.flex} onPress={() => answer(false)} accessibilityLabel="I didn't know it" />
            <Button title="I knew it ✅" variant="success" style={styles.flex} onPress={() => answer(true)} accessibilityLabel="I knew it" />
          </View>
          <Button title="Hide Answer" variant="ghost" icon="eye-off-outline" onPress={() => setFlipped(false)} style={styles.hide} />
        </>
      ) : (
        <Button title="Show Answer" icon="eye-outline" onPress={() => setFlipped(true)} style={styles.show} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  cardOf: { fontSize: 18, fontWeight: '800' },
  cardArea: { flex: 1, paddingVertical: 18 },
  ask: { textAlign: 'center', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  answerRow: { flexDirection: 'row', gap: 12 },
  hide: { marginTop: 4, marginBottom: 4 },
  show: { marginBottom: 12 },
});
