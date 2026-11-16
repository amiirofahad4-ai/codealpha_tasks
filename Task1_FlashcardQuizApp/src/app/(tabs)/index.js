import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import DeckForm from '../../components/DeckForm';
import { ActionSheet, Button, Card, EmptyState, IconButton, Screen, confirm } from '../../components/ui';
import { useFlash } from '../../context/FlashContext';
import { useTheme } from '../../theme';

export default function DecksScreen() {
  const t = useTheme();
  const { decks, cards, scores, addDeck, updateDeck, removeDeck } = useFlash();
  const [query, setQuery] = useState('');
  const [menuDeck, setMenuDeck] = useState(null); // deck whose ⋯ menu is open
  const [form, setForm] = useState(null); // { deck?, key } while the deck form is open

  const countFor = (id) => cards.filter((c) => c.deckId === id).length;
  const q = query.trim().toLowerCase();
  const visible = q ? decks.filter((d) => d.name.toLowerCase().includes(q)) : decks;

  const openForm = (deck) => setForm({ deck, key: Date.now() });

  const saveForm = (name, color) => {
    if (form.deck) updateDeck(form.deck.id, { name, color });
    else addDeck(name, color);
    setForm(null);
  };

  const askDelete = async (deck) => {
    const n = countFor(deck.id);
    const ok = await confirm('Delete deck?', `"${deck.name}" and its ${n} ${n === 1 ? 'card' : 'cards'} will be deleted.`, {
      confirmText: 'Delete',
      destructive: true,
    });
    if (ok) removeDeck(deck.id);
  };

  return (
    <View style={styles.flex}>
      <Screen scroll contentStyle={styles.content}>
        <Text style={[styles.title, { color: t.text }]} accessibilityRole="header">
          Decks
        </Text>
        <Text style={[styles.sub, { color: t.muted }]}>
          {cards.length} {cards.length === 1 ? 'card' : 'cards'} in {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
        </Text>

        <View style={[styles.search, { backgroundColor: t.card, borderColor: t.border }]}>
          <MaterialCommunityIcons name="magnify" size={22} color={t.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search decks"
            placeholderTextColor={t.muted}
            style={[styles.searchInput, { color: t.text }]}
            accessibilityLabel="Search decks"
            returnKeyType="search"
          />
          {query ? <IconButton icon="close-circle" size={20} color={t.muted} label="Clear search" onPress={() => setQuery('')} /> : null}
        </View>

        {decks.length === 0 ? (
          <EmptyState icon="cards-outline" title="No decks yet" hint="Tap the + button to create your first deck." />
        ) : visible.length === 0 ? (
          <EmptyState icon="magnify" title="No matching decks" hint={`Nothing found for "${query.trim()}".`} />
        ) : (
          <View style={styles.list}>
            {visible.map((deck) => {
              const n = countFor(deck.id);
              const score = scores[deck.id];
              return (
                <Card key={deck.id} style={styles.deck}>
                  <View style={[styles.strip, { backgroundColor: deck.color }]} />
                  <View style={styles.deckBody}>
                    <View style={styles.deckTop}>
                      <Pressable
                        style={styles.deckInfo}
                        onPress={() => router.push(`/deck/${deck.id}`)}
                        onLongPress={() => setMenuDeck(deck)}
                        accessibilityRole="button"
                        accessibilityLabel={`${deck.name}, ${n} cards. Open deck`}
                        accessibilityHint="Long press for more options"
                      >
                        <Text style={[styles.deckName, { color: t.text }]} numberOfLines={2}>
                          {deck.name}
                        </Text>
                        <Text style={[styles.deckMeta, { color: t.muted }]}>
                          {n} {n === 1 ? 'card' : 'cards'}
                          {'  •  '}
                          {score ? `Last quiz: ${score.correct}/${score.total}` : 'No quiz yet'}
                        </Text>
                      </Pressable>
                      <IconButton icon="dots-horizontal" label={`More options for ${deck.name}`} onPress={() => setMenuDeck(deck)} />
                    </View>
                    <View style={styles.deckActions}>
                      <Button
                        title="Study"
                        icon="cards-playing-outline"
                        small
                        variant="secondary"
                        disabled={n === 0}
                        style={styles.flex}
                        onPress={() => router.push(`/study/${deck.id}`)}
                        accessibilityLabel={`Study ${deck.name}`}
                      />
                      <Button
                        title="Quiz"
                        icon="help-circle-outline"
                        small
                        disabled={n === 0}
                        style={styles.flex}
                        onPress={() => router.push(`/quiz/${deck.id}`)}
                        accessibilityLabel={`Quiz ${deck.name}`}
                      />
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </Screen>

      <Pressable
        onPress={() => openForm(null)}
        accessibilityRole="button"
        accessibilityLabel="New deck"
        style={({ pressed }) => [styles.fab, { backgroundColor: t.primary }, pressed && { opacity: 0.85 }]}
      >
        <MaterialCommunityIcons name="plus" size={30} color="#FFFFFF" />
      </Pressable>

      <ActionSheet
        visible={menuDeck !== null}
        title={menuDeck?.name}
        onClose={() => setMenuDeck(null)}
        actions={
          menuDeck
            ? [
                { label: 'Rename', icon: 'pencil-outline', onPress: () => openForm(menuDeck) },
                { label: 'Delete', icon: 'trash-can-outline', destructive: true, onPress: () => askDelete(menuDeck) },
              ]
            : []
        }
      />

      {form ? <DeckForm key={form.key} visible deck={form.deck} onSave={saveForm} onClose={() => setForm(null)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 110 },
  title: { fontSize: 28, fontWeight: '800', marginTop: 16 },
  sub: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingLeft: 16,
    paddingRight: 4,
    minHeight: 50,
    marginTop: 18,
    marginBottom: 18,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 12 },
  list: { gap: 14 },
  deck: { flexDirection: 'row', padding: 0, overflow: 'hidden' },
  strip: { width: 8 },
  deckBody: { flex: 1, padding: 16, paddingRight: 8 },
  deckTop: { flexDirection: 'row', alignItems: 'flex-start' },
  deckInfo: { flex: 1, paddingRight: 4 },
  deckName: { fontSize: 18, fontWeight: '800' },
  deckMeta: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  deckActions: { flexDirection: 'row', gap: 10, marginTop: 14, paddingRight: 8 },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 22,
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 24px rgba(108, 60, 233, 0.45)',
  },
});
