// Home: greeting, today's progress, stats, weekly line chart, quick actions.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFitness } from '../../context/FitnessContext';
import { useAuth } from '../../context/AuthContext';
import { METRICS, useTheme } from '../../theme';
import { stepsToKm } from '../../constants';
import { lastNDays, shortDay, todayKey } from '../../utils/date';
import { ActivityRow, Button, Card, Chip, LineChart, Ring, SectionTitle, StatTile } from '../../components/ui';
import Screen from '../../components/Screen';

const QUICK_ACTIONS = [
  { label: 'Start Run', icon: 'run-fast', go: () => router.push('/session?type=running&title=Running&minutes=30') },
  { label: 'Log', icon: 'plus-circle-outline', go: () => router.push('/activity') },
  { label: 'Workouts', icon: 'dumbbell', go: () => router.navigate('/workouts') },
  { label: 'Goals', icon: 'target', go: () => router.push('/goals') },
];

export default function Home() {
  const c = useTheme();
  const { profile } = useAuth();
  const { goals, dayTotal, activities, streak, loadError, retry } = useFitness();
  const [metric, setMetric] = useState('steps');

  const today = todayKey();
  const t = dayTotal(today);
  const parts = [t.steps / goals.steps, t.calories / goals.calories, t.minutes / goals.minutes].map((x) => Math.min(x, 1));
  const overall = parts.reduce((a, b) => a + b, 0) / parts.length;
  const pct = Math.round(overall * 100);
  const m = METRICS.find((x) => x.key === metric);
  const chartData = lastNDays(7).map((key) => ({ key, label: shortDay(key), value: dayTotal(key)[metric] }));
  const recent = activities.slice(0, 3);
  const firstName = (profile.name || 'there').split(' ')[0];

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.hello, { color: c.text }]}>Hello, {firstName} 👋</Text>
          <Text style={{ color: c.muted, marginTop: 2 }}>
            {pct >= 100 ? 'All goals reached today. Amazing!' : pct >= 50 ? "Keep going! You're doing great." : "Let's get moving today."}
          </Text>
        </View>
        <View style={[styles.streak, { backgroundColor: c.primarySoft }]} accessibilityLabel={`${streak} day streak`}>
          <MaterialCommunityIcons name="fire" size={18} color={c.calories} />
          <Text style={{ color: c.text, fontWeight: '800' }}>{streak}</Text>
        </View>
      </View>

      {loadError ? (
        <Card style={{ borderColor: c.danger }}>
          <Text style={{ color: c.danger, fontWeight: '700', marginBottom: 4 }}>Could not load your data</Text>
          <Text style={{ color: c.muted, marginBottom: 10 }}>{loadError}</Text>
          <Button title="Try again" icon="refresh" variant="outline" onPress={retry} />
        </Card>
      ) : null}

      <LinearGradient colors={c.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroLabel}>{"Today's Progress"}</Text>
          <Text style={styles.heroValue}>{pct}%</Text>
          <Text style={styles.heroSub}>of your daily goals</Text>
        </View>
        <Ring size={104} stroke={10} progress={overall} color="#FFFFFF" track="rgba(255,255,255,0.25)">
          <MaterialCommunityIcons name="run-fast" size={36} color="#FFFFFF" />
        </Ring>
      </LinearGradient>

      <View style={styles.tiles}>
        <StatTile icon="fire" color={c.calories} value={t.calories.toLocaleString()} label="Calories" />
        <StatTile icon="shoe-print" color={c.distance} value={`${stepsToKm(t.steps)} km`} label="Distance" />
        <StatTile icon="timer-outline" color={c.minutes} value={`${t.minutes} min`} label="Active Time" />
      </View>

      <Card>
        <SectionTitle>Activity Chart</SectionTitle>
        <View style={styles.chips}>
          {METRICS.map((x) => (
            <Chip key={x.key} label={x.label} active={x.key === metric} onPress={() => setMetric(x.key)} />
          ))}
        </View>
        <LineChart data={chartData} color={c.primary} unit={m.unit} />
      </Card>

      <SectionTitle>Quick Actions</SectionTitle>
      <View style={styles.quick}>
        {QUICK_ACTIONS.map((q) => (
          <Pressable key={q.label} onPress={q.go} accessibilityRole="button" style={styles.quickItem}>
            <View style={[styles.quickIcon, { backgroundColor: c.card, borderColor: c.border }]}>
              <MaterialCommunityIcons name={q.icon} size={26} color={c.primary} />
            </View>
            <Text style={[styles.quickLabel, { color: c.text }]}>{q.label}</Text>
          </Pressable>
        ))}
      </View>

      <Card style={{ marginTop: 6 }}>
        <SectionTitle actionLabel={activities.length ? 'See All' : undefined} onAction={() => router.push('/history')}>
          Recent Activities
        </SectionTitle>
        {recent.length === 0 ? (
          <Text style={{ color: c.muted }}>No activities yet. Start a workout or tap Log to add one.</Text>
        ) : (
          recent.map((a) => <ActivityRow key={a.id} activity={a} onPress={() => router.push(`/activity?id=${a.id}`)} />)
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  hello: { fontSize: 26, fontWeight: '800' },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  hero: { borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  heroLabel: { color: '#EDE6FF', fontSize: 15, fontWeight: '600' },
  heroValue: { color: '#FFFFFF', fontSize: 48, fontWeight: '900', marginTop: 2 },
  heroSub: { color: '#EDE6FF', fontSize: 13 },
  tiles: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  quick: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  quickItem: { alignItems: 'center', width: '23%' },
  quickIcon: { width: 62, height: 62, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 12, fontWeight: '600', marginTop: 6, textAlign: 'center' },
});
