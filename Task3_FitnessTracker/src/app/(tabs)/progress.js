// Progress: totals for 1 week / 1 month / 3 months / 1 year, compared with the period before.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFitness } from '../../context/FitnessContext';
import { useTheme } from '../../theme';
import { stepsToKm } from '../../constants';
import { addDays, todayKey } from '../../utils/date';
import { Card, Chip, MiniBars, ProgressBar, Ring, SectionTitle } from '../../components/ui';
import Screen from '../../components/Screen';

const RANGES = [
  { key: '1W', days: 7 },
  { key: '1M', days: 30 },
  { key: '3M', days: 90 },
  { key: '1Y', days: 365 },
];

// Totals for `days` days ending `endOffset` days before today, plus 7 buckets for the mini bars.
function periodStats(dayTotal, days, endOffset = 0) {
  const end = addDays(todayKey(), -endOffset);
  const totals = { steps: 0, calories: 0, minutes: 0 };
  const buckets = Array.from({ length: 7 }, () => ({ steps: 0, calories: 0, minutes: 0 }));
  for (let i = 0; i < days; i++) {
    const d = dayTotal(addDays(end, -(days - 1 - i)));
    const b = buckets[Math.min(Math.floor((i * 7) / days), 6)];
    for (const k of ['steps', 'calories', 'minutes']) {
      totals[k] += d[k];
      b[k] += d[k];
    }
  }
  return { totals, buckets };
}

function change(now, before) {
  if (!before) return now ? null : 0;
  return Math.round(((now - before) / before) * 100);
}

export default function Progress() {
  const c = useTheme();
  const { dayTotal, goals } = useFitness();
  const [range, setRange] = useState('1W');
  const days = RANGES.find((r) => r.key === range).days;
  const now = periodStats(dayTotal, days);
  const before = periodStats(dayTotal, days, days);
  const today = dayTotal(todayKey());

  const cards = [
    { key: 'steps', label: 'Total Steps', icon: 'shoe-print', color: c.steps, value: now.totals.steps.toLocaleString(), pct: change(now.totals.steps, before.totals.steps), bars: now.buckets.map((b) => b.steps) },
    { key: 'calories', label: 'Calories Burned', icon: 'fire', color: c.calories, value: now.totals.calories.toLocaleString(), pct: change(now.totals.calories, before.totals.calories), bars: now.buckets.map((b) => b.calories) },
    { key: 'distance', label: 'Distance Covered', icon: 'map-marker-distance', color: c.distance, value: `${stepsToKm(now.totals.steps)} km`, pct: change(now.totals.steps, before.totals.steps), bars: now.buckets.map((b) => b.steps) },
    { key: 'minutes', label: 'Active Time', icon: 'timer-outline', color: c.minutes, value: `${now.totals.minutes} min`, pct: change(now.totals.minutes, before.totals.minutes), bars: now.buckets.map((b) => b.minutes) },
  ];

  const stepPct = Math.min(today.steps / goals.steps, 1);

  return (
    <Screen>
      <Text style={[styles.title, { color: c.text }]}>Your Progress</Text>
      <View style={styles.ranges}>
        {RANGES.map((r) => (
          <View key={r.key} style={{ flex: 1 }}>
            <Chip label={r.key} active={r.key === range} onPress={() => setRange(r.key)} />
          </View>
        ))}
      </View>

      {cards.map((card) => (
        <Card key={card.key} style={styles.statCard}>
          <View style={{ flex: 1 }}>
            <View style={styles.row}>
              <MaterialCommunityIcons name={card.icon} size={20} color={card.color} />
              <Text style={{ color: c.muted, fontWeight: '600' }}>{card.label}</Text>
            </View>
            <View style={[styles.row, { marginTop: 8 }]}>
              <Text style={[styles.big, { color: c.text }]}>{card.value}</Text>
              {card.pct != null && card.pct !== 0 ? (
                <Text style={{ color: card.pct > 0 ? c.success : c.danger, fontWeight: '700' }}>
                  {card.pct > 0 ? '↑' : '↓'} {Math.abs(card.pct)}%
                </Text>
              ) : null}
            </View>
          </View>
          <MiniBars values={card.bars} color={card.color} />
        </Card>
      ))}
      <Text style={[styles.note, { color: c.muted }]}>
        Change is compared with the {days} days before. Distance is estimated from your steps.
      </Text>

      <Card style={{ marginTop: 10 }}>
        <SectionTitle actionLabel="Edit" onAction={() => router.push('/goals')}>
          {"Today's Goals"}
        </SectionTitle>
        <View style={styles.goalRow}>
          <Ring size={86} stroke={8} progress={stepPct}>
            <Text style={{ color: c.text, fontWeight: '800' }}>{Math.round(stepPct * 100)}%</Text>
          </Ring>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>Daily Steps</Text>
            <Text style={{ color: c.muted, marginTop: 2 }}>
              {today.steps.toLocaleString()} / {goals.steps.toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 16 }}>
          <ProgressBar icon="fire" label="Calories" value={today.calories} goal={goals.calories} unit="kcal" color={c.calories} />
          <ProgressBar icon="timer-outline" label="Active time" value={today.minutes} goal={goals.minutes} unit="min" color={c.minutes} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', marginBottom: 14 },
  ranges: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  big: { fontSize: 28, fontWeight: '800' },
  note: { fontSize: 12, marginBottom: 4 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
});
