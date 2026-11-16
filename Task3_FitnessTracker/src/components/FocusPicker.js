// "What's your fitness goal?" picker. Used after sign up and from the Profile tab.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { FOCUS_OPTIONS } from '../constants';
import { useTheme } from '../theme';
import { Button } from './ui';

export default function FocusPicker({ onDone, buttonTitle = 'Next' }) {
  const c = useTheme();
  const { profile, updateProfile } = useAuth();
  const [focus, setFocus] = useState(profile.focus || '');
  const [name, setName] = useState(profile.name || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onNext = async () => {
    if (!name.trim()) return setError('Enter your name.');
    if (!focus) return setError('Pick a goal to continue.');
    setBusy(true);
    try {
      await updateProfile({ name: name.trim(), focus });
      onDone?.();
    } catch (e) {
      setError(`Could not save: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={[styles.question, { color: c.text }]}>What should we call you?</Text>
      <View style={[styles.field, { borderColor: c.border, backgroundColor: c.card }]}>
        <MaterialCommunityIcons name="account-outline" size={22} color={c.muted} />
        <TextInput
          value={name}
          onChangeText={(v) => { setError(''); setName(v); }}
          placeholder="Your name"
          placeholderTextColor={c.muted}
          style={[styles.input, { color: c.text }]}
          accessibilityLabel="Your name"
        />
      </View>

      <Text style={[styles.question, { color: c.text, marginTop: 22 }]}>{"What's your fitness goal?"}</Text>
      {FOCUS_OPTIONS.map((o) => {
        const active = o.key === focus;
        return (
          <Pressable
            key={o.key}
            onPress={() => { setError(''); setFocus(o.key); }}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            style={[
              styles.option,
              { backgroundColor: c.card, borderColor: active ? c.primary : c.border, borderWidth: active ? 2 : 1 },
            ]}
          >
            <View style={[styles.iconBox, { backgroundColor: c.primarySoft }]}>
              <MaterialCommunityIcons name={o.icon} size={24} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optTitle, { color: c.text }]}>{o.label}</Text>
              <Text style={[styles.optSub, { color: c.muted }]}>{o.sub}</Text>
            </View>
            {active && <MaterialCommunityIcons name="check-circle" size={26} color={c.primary} />}
          </Pressable>
        );
      })}

      {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}
      <Button title={busy ? 'Saving…' : buttonTitle} onPress={busy ? undefined : onNext} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40, maxWidth: 520, width: '100%', alignSelf: 'center' },
  question: { fontSize: 20, fontWeight: '800', marginBottom: 14 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 26, paddingHorizontal: 18 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, minWidth: 0 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, padding: 14, marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  optTitle: { fontSize: 16, fontWeight: '700' },
  optSub: { fontSize: 13, marginTop: 2 },
  error: { marginTop: 6, fontWeight: '600' },
});
