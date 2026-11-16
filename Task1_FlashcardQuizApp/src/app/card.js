import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, EmptyState, Field, Header, Screen, confirm, goBack } from '../components/ui';
import { useFlash } from '../context/FlashContext';
import { MAX_CHARS, useTheme } from '../theme';

// Add a card (?deckId=) or edit one (?deckId=&id=)
export default function CardScreen() {
  const t = useTheme();
  const params = useLocalSearchParams();
  const { decks, cards, addCard, updateCard, removeCard } = useFlash();
  const existing = params.id ? cards.find((c) => c.id === params.id) : null;
  const deckId = existing?.deckId ?? params.deckId;
  const deck = decks.find((d) => d.id === deckId);

  const [question, setQuestion] = useState(existing?.question ?? '');
  const [answer, setAnswer] = useState(existing?.answer ?? '');
  const [errors, setErrors] = useState({});

  if (!deck || (params.id && !existing)) {
    return (
      <Screen edges={['top', 'bottom']}>
        <Header onBack={() => goBack()} backIcon="close" />
        <EmptyState icon="card-remove-outline" title="Card not found" hint="It may have been deleted." />
      </Screen>
    );
  }

  const check = (value, name) => {
    if (!value.trim()) return `${name} is required.`;
    if (value.length > MAX_CHARS) return `${name} can be at most ${MAX_CHARS} characters.`;
    return undefined;
  };

  const save = () => {
    const e = { question: check(question, 'Question'), answer: check(answer, 'Answer') };
    setErrors(e);
    if (e.question || e.answer) return;
    if (existing) updateCard(existing.id, question, answer);
    else addCard(deck.id, question, answer);
    goBack(`/deck/${deck.id}`);
  };

  const remove = async () => {
    const ok = await confirm('Delete card?', existing.question, { confirmText: 'Delete', destructive: true });
    if (ok) {
      goBack(`/deck/${deck.id}`);
      removeCard(existing.id);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header onBack={() => goBack(`/deck/${deck.id}`)} backIcon="close" title={existing ? 'Edit card' : 'Add card'} subtitle={deck.name} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field
            label="Question"
            value={question}
            onChangeText={(v) => {
              setQuestion(v);
              if (errors.question) setErrors((e) => ({ ...e, question: undefined }));
            }}
            placeholder="e.g. What is the capital of Somalia?"
            multiline
            max={MAX_CHARS}
            maxLength={MAX_CHARS}
            error={errors.question}
            autoFocus={!existing}
          />
          <Field
            label="Answer"
            value={answer}
            onChangeText={(v) => {
              setAnswer(v);
              if (errors.answer) setErrors((e) => ({ ...e, answer: undefined }));
            }}
            placeholder="e.g. Mogadishu"
            multiline
            max={MAX_CHARS}
            maxLength={MAX_CHARS}
            error={errors.answer}
            style={styles.gap}
          />

          <View style={styles.actions}>
            <Button title="Cancel" variant="secondary" style={styles.flex} onPress={() => goBack(`/deck/${deck.id}`)} />
            <Button title="Save" icon="check" style={styles.flex} onPress={save} accessibilityLabel="Save card" />
          </View>
          {existing ? (
            <Button title="Delete card" icon="trash-can-outline" variant="danger" onPress={remove} style={styles.delete} />
          ) : null}
          <Text style={[styles.note, { color: t.muted }]}>Both fields are required (max {MAX_CHARS} characters).</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingTop: 12, paddingBottom: 40 },
  gap: { marginTop: 20 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 28 },
  delete: { marginTop: 12 },
  note: { fontSize: 13, textAlign: 'center', marginTop: 16 },
});
