import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import FlipCard from '../../components/FlipCard';
import { Button, EmptyState, Header, ProgressBar, Screen, goBack } from '../../components/ui';
import { useDeckCards, useFlash } from '../../context/FlashContext';
import { useTheme } from '../../theme';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Study a deck. Optional ?ids=a,b,c studies only those cards (used by "Study wrong cards").
export default function StudyScreen() {
  const t = useTheme();
  const { id, ids } = useLocalSearchParams();
  const { decks } = useFlash();
  const deck = decks.find((d) => d.id === id);
  const deckCards = useDeckCards(id);

  // The study order is a list of card ids, so shuffling doesn't touch the deck itself
  const [order, setOrder] = useState(() => {
    const only = typeof ids === 'string' && ids ? ids.split(',') : null;
    return deckCards.filter((c) => !only || only.includes(c.id)).map((c) => c.id);
  });
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  // Cards deleted while studying just drop out
  const list = order.map((cid) => deckCards.find((c) => c.id === cid)).filter(Boolean);
  const i = Math.min(index, Math.max(0, list.length - 1));
  const card = list[i];
  const isLast = i === list.length - 1;

  // Moving to another card always starts on the question side
  const goTo = (n) => {
    setIndex(n);
    setFlipped(false);
  };
  const next = () => (isLast ? setDone(true) : goTo(i + 1));
  const prev = () => i > 0 && goTo(i - 1);
  const restart = () => {
    setDone(false);
    goTo(0);
  };
  const doShuffle = () => {
    setOrder((o) => shuffle(o));
    restart();
  };

  if (!deck || list.length === 0) {
    return (
      <Screen>
        <Header onBack={() => goBack()} title={deck?.name ?? 'Study'} />
        <EmptyState icon="cards-outline" title="No cards to study" hint="Add some cards to this deck first." />
      </Screen>
    );
  }

  if (done) {
    return (
      <Screen>
        <Header onBack={() => goBack()} title={deck.name} />
        <View style={styles.doneWrap}>
          <EmptyState icon="check-decagram" title="Nice work! 🎉" hint={`You went through all ${list.length} cards.`} />
          <View style={styles.doneActions}>
            <Button title="Take the quiz" icon="help-circle-outline" onPress={() => router.replace(`/quiz/${deck.id}`)} />
            <Button title="Restart" icon="restart" variant="secondary" onPress={restart} />
            <Button title="Back to deck" variant="outline" onPress={() => goBack(`/deck/${deck.id}`)} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Header onBack={() => goBack()} title={deck.name} subtitle={ids ? 'Wrong cards' : 'Study'} />

      <View style={styles.progressRow}>
        <Text style={[styles.progressText, { color: t.text }]}>
          {i + 1} / {list.length}
        </Text>
        <View style={styles.tools}>
          <Button title="Shuffle" icon="shuffle-variant" small variant="ghost" onPress={doShuffle} accessibilityLabel="Shuffle cards" />
          <Button title="Restart" icon="restart" small variant="ghost" onPress={restart} accessibilityLabel="Restart from the first card" />
        </View>
      </View>
      <ProgressBar value={(i + 1) / list.length} />

      <View style={styles.cardArea}>
        <FlipCard
          key={card.id}
          question={card.question}
          answer={card.answer}
          flipped={flipped}
          onFlip={() => setFlipped((f) => !f)}
          onSwipeLeft={next}
          onSwipeRight={prev}
        />
      </View>

      <Button
        title={flipped ? 'Hide Answer' : 'Show Answer'}
        icon={flipped ? 'eye-off-outline' : 'eye-outline'}
        onPress={() => setFlipped((f) => !f)}
      />
      <View style={styles.navRow}>
        <Button title="Previous" icon="chevron-left" variant="outline" style={styles.flex} disabled={i === 0} onPress={prev} accessibilityLabel="Previous card" />
        <Button
          title={isLast ? 'Finish' : 'Next'}
          iconRight={isLast ? 'flag-checkered' : 'chevron-right'}
          variant={isLast ? 'secondary' : 'outline'}
          style={styles.flex}
          onPress={next}
          accessibilityLabel={isLast ? 'Finish studying' : 'Next card'}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: 18, fontWeight: '800' },
  tools: { flexDirection: 'row' },
  cardArea: { flex: 1, paddingVertical: 18 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 12, marginBottom: 12 },
  doneWrap: { flex: 1, justifyContent: 'center' },
  doneActions: { gap: 12 },
});
