// Log activity form. Opened as /activity (new) or /activity?id=5 (edit).
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useFitness } from '../context/FitnessContext';
import { ACTIVITY_TYPES, estimateCalories } from '../constants';
import { useTheme } from '../theme';
import { lastNDays, prettyDate, todayKey } from '../utils/date';
import { Button, confirm } from '../components/ui';

export default function ActivityForm() {
  const c = useTheme();
  const { id } = useLocalSearchParams();
  const { activities, goals, addActivity, updateActivity, deleteActivity } = useFitness();
  const existing = id ? activities.find((a) => String(a.id) === String(id)) : null;

  const [type, setType] = useState(existing?.type ?? 'walking');
  const [duration, setDuration] = useState(existing ? String(existing.duration) : '30');
  const [steps, setSteps] = useState(existing?.steps ? String(existing.steps) : '');
  const [calories, setCalories] = useState(existing ? String(existing.calories) : '');
  const [autoCalories, setAutoCalories] = useState(!existing);
  const [date, setDate] = useState(existing?.date ?? todayKey());
  const [note, setNote] = useState(existing?.note ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Show the live estimate until the user types their own number.
  const estimate = estimateCalories(type, parseInt(duration, 10) || 0, goals.weight);
  const shownCalories = autoCalories ? String(estimate) : calories;

  // Show the last 7 days, plus the activity's own date if it's older.
  const dates = lastNDays(7).reverse();
  if (!dates.includes(date)) dates.push(date);

  const onSave = async () => {
    const mins = parseInt(duration, 10);
    if (!Number.isFinite(mins) || mins <= 0) return setError('Enter how many minutes you exercised.');
    if (mins > 1440) return setError('Duration cannot be more than 24 hours.');
    const data = {
      type,
      duration: mins,
      steps: parseInt(steps, 10) || 0,
      calories: parseInt(shownCalories, 10) || 0,
      date,
      note: note.trim(),
    };
    setSaving(true);
    try {
      if (existing) await updateActivity(existing.id, data);
      else await addActivity(data);
      router.back();
    } catch (e) {
      setError(`Could not save: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!(await confirm('Delete activity?', 'This activity will be removed.'))) return;
    try {
      await deleteActivity(existing.id);
      router.back();
    } catch (e) {
      setError(`Could not delete: ${e.message}`);
    }
  };

  const inputBox = [styles.inputWrap, { borderColor: c.border, backgroundColor: c.card }];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: existing ? 'Edit activity' : 'Log activity' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: c.text }]}>Activity type</Text>
        <View style={styles.grid}>
          {ACTIVITY_TYPES.map((t) => {
            const active = t.key === type;
            return (
              <Pressable
                key={t.key}
                onPress={() => setType(t.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[
                  styles.typeBox,
                  { borderColor: active ? t.color : c.border, backgroundColor: active ? t.color + '22' : c.card },
                ]}
              >
                <MaterialCommunityIcons name={t.icon} size={26} color={t.color} />
                <Text style={[styles.typeText, { color: c.text }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: c.text }]}>Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {dates.map((d) => {
            const active = d === date;
            return (
              <Pressable
                key={d}
                onPress={() => setDate(d)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.chip, { borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primary : c.card }]}
              >
                <Text style={{ color: active ? c.primaryText : c.text, fontWeight: '600' }}>{prettyDate(d)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: c.text }]}>Duration</Text>
            <View style={inputBox}>
              <TextInput
                value={duration}
                onChangeText={(v) => { setError(''); setDuration(v.replace(/[^0-9]/g, '')); }}
                keyboardType="number-pad"
                style={[styles.input, { color: c.text }]}
                accessibilityLabel="Duration in minutes"
              />
              <Text style={{ color: c.muted }}>min</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: c.text }]}>Steps</Text>
            <View style={inputBox}>
              <TextInput
                value={steps}
                onChangeText={(v) => setSteps(v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="Optional"
                placeholderTextColor={c.muted}
                style={[styles.input, { color: c.text }]}
                accessibilityLabel="Steps"
              />
            </View>
          </View>
        </View>

        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: c.text, marginBottom: 0 }]}>Calories burned</Text>
          {!autoCalories && (
            <Pressable onPress={() => setAutoCalories(true)} accessibilityRole="button">
              <Text style={{ color: c.primary, fontWeight: '600' }}>Use estimate</Text>
            </Pressable>
          )}
        </View>
        <View style={inputBox}>
          <TextInput
            value={shownCalories}
            onChangeText={(v) => { setAutoCalories(false); setCalories(v.replace(/[^0-9]/g, '')); }}
            keyboardType="number-pad"
            style={[styles.input, { color: c.text }]}
            accessibilityLabel="Calories burned"
          />
          <Text style={{ color: c.muted }}>kcal</Text>
        </View>
        <Text style={[styles.hint, { color: c.muted }]}>
          {autoCalories
            ? `Estimated from activity type, duration and your weight (${goals.weight} kg). Type to change it.`
            : 'Using your own number.'}
        </Text>

        <Text style={[styles.label, { color: c.text }]}>Note</Text>
        <View style={inputBox}>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Morning run in the park"
            placeholderTextColor={c.muted}
            style={[styles.input, { color: c.text }]}
            maxLength={120}
            accessibilityLabel="Note"
          />
        </View>

        {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}

        <Button
          title={saving ? 'Saving…' : existing ? 'Save changes' : 'Save activity'}
          icon="check"
          onPress={saving ? undefined : onSave}
          style={{ marginTop: 24 }}
        />
        {existing && (
          <Button title="Delete activity" icon="trash-can-outline" variant="danger" onPress={onDelete} style={{ marginTop: 10 }} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, maxWidth: 640, width: '100%', alignSelf: 'center' },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 16 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBox: { width: '23.5%', alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, gap: 4 },
  typeText: { fontSize: 12, fontWeight: '600' },
  chips: { gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1 },
  row2: { flexDirection: 'row', gap: 12 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12 },
  input: { flex: 1, paddingVertical: 10, fontSize: 16, minWidth: 0 },
  hint: { fontSize: 12, marginTop: 6 },
  error: { marginTop: 14, fontWeight: '600' },
});
