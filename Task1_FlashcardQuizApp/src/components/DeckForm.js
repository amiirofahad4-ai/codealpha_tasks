// Bottom-sheet form for a new deck or renaming one (name + color).
// Mount it with a new `key` each time it opens so the fields start fresh.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { DECK_COLORS, MAX_WIDTH, useTheme } from '../theme';
import { Button, Field } from './ui';

export default function DeckForm({ visible, deck, onSave, onClose }) {
  const t = useTheme();
  const [name, setName] = useState(deck?.name ?? '');
  const [color, setColor] = useState(deck?.color ?? DECK_COLORS[0]);
  const [error, setError] = useState('');

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a deck name.');
      return;
    }
    onSave(trimmed, color);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.sheet, { backgroundColor: t.card }]}>
          <Text style={[styles.title, { color: t.text }]} accessibilityRole="header">
            {deck ? 'Edit deck' : 'New deck'}
          </Text>

          <Field
            label="Deck name"
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (error) setError('');
            }}
            placeholder="e.g. Biology"
            maxLength={40}
            error={error}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={save}
          />

          <Text style={[styles.label, { color: t.text }]}>Color</Text>
          <View style={styles.colors} accessibilityRole="radiogroup">
            {DECK_COLORS.map((c, i) => {
              const active = c === color;
              return (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={`Color ${i + 1}`}
                  style={[styles.swatch, { backgroundColor: c, borderColor: active ? t.text : 'transparent' }]}
                >
                  {active ? <MaterialCommunityIcons name="check" size={22} color="#FFFFFF" /> : null}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Button title="Cancel" variant="secondary" onPress={onClose} style={styles.flex} />
            <Button
              title={deck ? 'Save' : 'Create deck'}
              onPress={save}
              style={styles.flex}
              accessibilityLabel={deck ? 'Save deck' : 'Create deck'}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 6, 25, 0.45)' },
  sheet: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 22,
    paddingBottom: 32,
  },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 18 },
  label: { fontSize: 15, fontWeight: '800', marginTop: 18, marginBottom: 10 },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatch: { width: 46, height: 46, borderRadius: 23, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 26 },
});
