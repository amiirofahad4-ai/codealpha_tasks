// Live workout timer. Opened as /session?type=running&title=Running&minutes=30
// Finish saves the workout as an activity.
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useFitness } from '../context/FitnessContext';
import { estimateCalories, getType } from '../constants';
import { useTheme } from '../theme';
import { todayKey } from '../utils/date';
import { Button, Ring, confirm, notify } from '../components/ui';

function clock(ms) {
  const s = Math.floor(ms / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export default function Session() {
  const c = useTheme();
  const params = useLocalSearchParams();
  const type = getType(String(params.type ?? 'other'));
  const title = String(params.title ?? type.label);
  const target = Math.max(parseInt(params.minutes, 10) || 30, 1);
  const { goals, addActivity } = useFitness();

  // Time is measured from timestamps, so it stays right even if the phone sleeps.
  const [startedAt, setStartedAt] = useState(null); // when the current run segment began
  const [savedMs, setSavedMs] = useState(0); // time from earlier segments (before pauses)
  const [now, setNow] = useState(0);
  const [saving, setSaving] = useState(false);
  const running = startedAt != null;

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [running]);

  const elapsed = savedMs + (running ? Math.max(now - startedAt, 0) : 0);
  const minutes = elapsed / 60000;
  const calories = estimateCalories(type.key, minutes, goals.weight);
  const steps = Math.round(type.spm * minutes);
  const started = elapsed > 0 || running;

  const onStart = () => {
    const t = Date.now();
    setStartedAt(t);
    setNow(t);
  };
  const onPause = () => {
    setSavedMs(elapsed);
    setStartedAt(null);
  };

  const onFinish = async () => {
    if (minutes < 1) {
      notify('Keep going', 'Work out for at least 1 minute to save it.');
      return;
    }
    const mins = Math.round(minutes);
    if (!(await confirm('Finish workout?', `${title}: ${mins} min, about ${calories} kcal.`, 'Save'))) return;
    setSaving(true);
    try {
      await addActivity({
        type: type.key,
        duration: mins,
        calories,
        steps,
        date: todayKey(),
        note: title === type.label ? '' : title,
      });
      router.back();
    } catch (e) {
      notify('Could not save', e.message);
      setSaving(false);
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: c.bg }]}>
      <Stack.Screen options={{ title }} />
      <Text style={[styles.time, { color: c.text }]} accessibilityLabel={`Elapsed ${clock(elapsed)}`}>
        {clock(elapsed)}
      </Text>

      <View style={styles.stats}>
        <Stat icon="fire" color={c.calories} value={calories} label="Calories" />
        <View style={[styles.divider, { backgroundColor: c.border }]} />
        {type.spm ? (
          <Stat icon="shoe-print" color={c.steps} value={steps.toLocaleString()} label="Steps (est.)" />
        ) : (
          <Stat icon="flag-checkered" color={c.steps} value={`${target} min`} label="Target" />
        )}
        <View style={[styles.divider, { backgroundColor: c.border }]} />
        <Stat icon="percent" color={c.primary} value={`${Math.min(Math.round((minutes / target) * 100), 999)}%`} label="Of target" />
      </View>

      <View style={styles.ringWrap}>
        <Ring size={230} stroke={18} progress={minutes / target}>
          <MaterialCommunityIcons name={type.icon} size={96} color={c.text} />
        </Ring>
        <Text style={{ color: c.muted, marginTop: 12 }}>
          {running ? 'In progress…' : started ? 'Paused' : `Target: ${target} minutes`}
        </Text>
      </View>

      <View style={styles.buttons}>
        {!started ? (
          <Button title="Start" icon="play" onPress={onStart} style={styles.btn} />
        ) : running ? (
          <Button title="Pause" icon="pause" onPress={onPause} style={styles.btn} />
        ) : (
          <Button title="Resume" icon="play" onPress={onStart} style={styles.btn} />
        )}
        {started && (
          <Button
            title={saving ? 'Saving…' : 'Finish'}
            icon="check"
            variant="outline"
            onPress={saving ? undefined : onFinish}
            style={styles.btn}
          />
        )}
      </View>
    </View>
  );
}

function Stat({ icon, color, value, label }) {
  const c = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
      <Text style={{ color: c.text, fontSize: 22, fontWeight: '800', marginTop: 6 }}>{value}</Text>
      <Text style={{ color: c.muted, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, alignItems: 'center' },
  time: { fontSize: 58, fontWeight: '800', marginTop: 10, fontVariant: ['tabular-nums'] },
  stats: { flexDirection: 'row', alignItems: 'center', width: '100%', maxWidth: 420, marginTop: 18 },
  divider: { width: 1, height: 44 },
  ringWrap: { alignItems: 'center', marginTop: 34, flex: 1 },
  buttons: { flexDirection: 'row', gap: 12, width: '100%', maxWidth: 420, marginBottom: 20 },
  btn: { flex: 1 },
});
