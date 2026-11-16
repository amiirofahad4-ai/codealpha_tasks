// Goals: daily targets, body weight (for calorie estimates) and data tools.
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFitness } from '../context/FitnessContext';
import { useTheme } from '../theme';
import { Button, Card, SectionTitle, confirm } from '../components/ui';

const FIELDS = [
  { key: 'steps', label: 'Daily steps', unit: 'steps' },
  { key: 'calories', label: 'Daily calories burned', unit: 'kcal' },
  { key: 'minutes', label: 'Daily active time', unit: 'min' },
  { key: 'weight', label: 'Your body weight', unit: 'kg', hint: 'Used to estimate calories for each workout.' },
];

export default function Goals() {
  const c = useTheme();
  const { goals, saveGoals, loadDemoData, clearAll, activities } = useFitness();
  // Goals are already loaded before any screen shows, so start the form from them.
  const [form, setForm] = useState(() => Object.fromEntries(FIELDS.map((f) => [f.key, String(goals[f.key])])));
  const [message, setMessage] = useState('');

  const onSave = async () => {
    const next = {};
    for (const f of FIELDS) {
      const n = parseInt(form[f.key], 10);
      if (!Number.isFinite(n) || n <= 0) {
        setMessage(`${f.label} must be a number above 0.`);
        return;
      }
      next[f.key] = n;
    }
    await run(() => saveGoals(next), 'Goals saved ✓');
  };

  // Runs a database action and shows either the success text or the error.
  const run = async (action, doneText) => {
    try {
      await action();
      setMessage(doneText);
    } catch (e) {
      setMessage(`Something went wrong: ${e.message}`);
    }
  };

  const onClear = async () => {
    const ok = await confirm('Delete all activities?', `This removes all ${activities.length} logged activities. It cannot be undone.`);
    if (ok) await run(clearAll, 'All activities deleted.');
  };

  const onDemo = () => run(loadDemoData, 'Added a week of sample activities.');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <SectionTitle>Daily goals</SectionTitle>
          {FIELDS.map((f) => (
            <View key={f.key} style={styles.field}>
              <Text style={[styles.label, { color: c.text }]}>{f.label}</Text>
              <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.bg }]}>
                <TextInput
                  value={form[f.key] ?? ''}
                  onChangeText={(v) => {
                    setMessage('');
                    setForm((s) => ({ ...s, [f.key]: v.replace(/[^0-9]/g, '') }));
                  }}
                  keyboardType="number-pad"
                  style={[styles.input, { color: c.text }]}
                  accessibilityLabel={f.label}
                />
                <Text style={{ color: c.muted }}>{f.unit}</Text>
              </View>
              {f.hint ? <Text style={[styles.hint, { color: c.muted }]}>{f.hint}</Text> : null}
            </View>
          ))}
          <Button title="Save goals" icon="content-save" onPress={onSave} />
          {message ? <Text style={[styles.message, { color: c.muted }]}>{message}</Text> : null}
        </Card>

        <Card>
          <SectionTitle>Data</SectionTitle>
          <Text style={[styles.hint, { color: c.muted, marginBottom: 12 }]}>
            Your data is saved in the cloud with Supabase, so it is there on any phone you sign in on.
          </Text>
          {/* Sample data only when the account is empty, so it can't be added twice. */}
          {activities.length === 0 ? (
            <Button title="Add sample week" icon="database-plus" variant="outline" onPress={onDemo} style={{ marginBottom: 10 }} />
          ) : null}
          <Button title="Delete all activities" icon="trash-can-outline" variant="danger" onPress={onClear} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, maxWidth: 640, width: '100%', alignSelf: 'center' },
  field: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12 },
  input: { flex: 1, paddingVertical: 10, fontSize: 16 },
  hint: { fontSize: 12, marginTop: 4 },
  message: { textAlign: 'center', marginTop: 10 },
});
