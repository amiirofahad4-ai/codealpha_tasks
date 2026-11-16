import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Chip, EmptyState, Header, IconButton, Screen, confirm, goBack } from '../../components/ui';
import { useDeckCards, useFlash } from '../../context/FlashContext';
import { useTheme } from '../../theme';

export default function DeckScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams();
  const { decks, scores, removeCard } = useFlash();
  const deck = decks.find((d) => d.id === id);
  const cards = useDeckCards(id);
  const score = scores[id];

  if (!deck) {
    return (
      <Screen>
        <Header onBack={() => goBack()} />
        <EmptyState icon="cards-outline" title="Deck not found" hint="This deck may have been deleted.">
          <Button title="Back to decks" onPress={() => router.dismissTo('/')} />
        </EmptyState>
      </Screen>
    );
  }

  const addCard = () => router.push({ pathname: '/card', params: { deckId: deck.id } });
  const editCard = (cardId) => router.push({ pathname: '/card', params: { deckId: deck.id, id: cardId } });

  const askDelete = async (card) => {
    const ok = await confirm('Delete card?', card.question, { confirmText: 'Delete', destructive: true });
    if (ok) removeCard(card.id);
  };

  return (
    <Screen scroll>
      <Header onBack={() => goBack()} title={deck.name} />

      {/* Deck header in the deck's color */}
      <View style={[styles.hero, { backgroundColor: deck.color }]}>
        <View style={styles.heroBlob} />
        <Text style={styles.heroName} accessibilityRole="header">
          {deck.name}
        </Text>
        <Text style={styles.heroMeta}>
          {cards.length} {cards.length === 1 ? 'card' : 'cards'}
          {score ? `  •  Last quiz: ${score.correct}/${score.total}` : ''}
        </Text>
        <View style={styles.heroActions}>
          <Button
            title="Study"
            icon="cards-playing-outline"
            variant="secondary"
            disabled={cards.length === 0}
            style={[styles.flex, styles.heroBtn]}
            onPress={() => router.push(`/study/${deck.id}`)}
            accessibilityLabel={`Study ${deck.name}`}
          />
          <Button
            title="Quiz"
            icon="help-circle-outline"
            variant="secondary"
            disabled={cards.length === 0}
            style={[styles.flex, styles.heroBtn]}
            onPress={() => router.push(`/quiz/${deck.id}`)}
            accessibilityLabel={`Quiz ${deck.name}`}
          />
        </View>
      </View>

      <View style={styles.listHead}>
        <Text style={[styles.listTitle, { color: t.text }]}>Cards</Text>
        <Button title="Add card" icon="plus" small variant="outline" onPress={addCard} />
      </View>

      {cards.length === 0 ? (
        <EmptyState icon="card-plus-outline" title="No cards yet. Add your first card." hint="Each card has a question and an answer.">
          <Button title="Add card" icon="plus" onPress={addCard} style={styles.emptyBtn} />
        </EmptyState>
      ) : (
        <View style={styles.list}>
          {cards.map((card, i) => (
            <Card key={card.id} style={styles.row}>
              <Pressable
                style={styles.rowMain}
                onPress={() => editCard(card.id)}
                accessibilityRole="button"
                accessibilityLabel={`Card ${i + 1}: ${card.question}. Edit`}
              >
                <Text style={[styles.q, { color: t.text }]} numberOfLines={2}>
                  {card.question}
                </Text>
                <Text style={[styles.a, { color: t.muted }]} numberOfLines={2}>
                  {card.answer}
                </Text>
              </Pressable>
              <IconButton icon="trash-can-outline" color={t.danger} size={21} label={`Delete card ${i + 1}`} onPress={() => askDelete(card)} />
            </Card>
          ))}
          <Chip icon="gesture-tap" label="Tap a card to edit it" style={styles.tip} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { borderRadius: 24, padding: 22, overflow: 'hidden', marginTop: 4 },
  heroBlob: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.14)', top: -60, right: -40 },
  heroName: { color: '#FFFFFF', fontSize: 27, fontWeight: '800' },
  heroMeta: { color: 'rgba(255,255,255,0.88)', fontSize: 15, fontWeight: '600', marginTop: 4 },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  heroBtn: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  listHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 12 },
  listTitle: { fontSize: 20, fontWeight: '800' },
  list: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingLeft: 16, paddingRight: 6 },
  rowMain: { flex: 1, paddingRight: 6 },
  q: { fontSize: 16, fontWeight: '800' },
  a: { fontSize: 14, fontWeight: '500', marginTop: 3, lineHeight: 20 },
  tip: { alignSelf: 'center', marginTop: 6 },
  emptyBtn: { marginTop: 8, alignSelf: 'stretch' },
});
