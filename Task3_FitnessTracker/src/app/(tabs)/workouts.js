// Workouts: ready-made sessions by category. Tapping one starts the timer.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../theme';
import { WORKOUT_CATEGORIES, WORKOUTS, getType } from '../../constants';
import { Chip, SectionTitle } from '../../components/ui';
import Screen from '../../components/Screen';

function start(w) {
  router.push(`/session?type=${w.type}&title=${encodeURIComponent(w.title)}&minutes=${w.minutes}`);
}

export default function Workouts() {
  const c = useTheme();
  const [category, setCategory] = useState('All');
  const list = WORKOUTS.filter((w) => category === 'All' || w.category === category);
  const featured = list.find((w) => w.featured) ?? list[0];
  const others = list.filter((w) => w !== featured);

  return (
    <Screen>
      <Text style={[styles.title, { color: c.text }]}>Workouts</Text>
      <View style={styles.chips}>
        {WORKOUT_CATEGORIES.map((cat) => (
          <Chip key={cat} label={cat} active={cat === category} onPress={() => setCategory(cat)} />
        ))}
      </View>

      {featured && (
        <Pressable onPress={() => start(featured)} accessibilityRole="button" accessibilityLabel={`Start ${featured.title}`}>
          <LinearGradient colors={featured.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featured}>
            <MaterialCommunityIcons name={getType(featured.type).icon} size={120} color="rgba(255,255,255,0.22)" style={styles.bigIcon} />
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <Text style={styles.featTitle}>{featured.title}</Text>
              <Text style={styles.featSub}>{featured.minutes} min • {featured.level}</Text>
            </View>
            <View style={styles.playBig}>
              <MaterialCommunityIcons name="play" size={28} color={c.primary} />
            </View>
          </LinearGradient>
        </Pressable>
      )}

      <View style={{ marginTop: 20 }}>
        <SectionTitle>{category === 'All' ? 'Popular Workouts' : `${category} Workouts`}</SectionTitle>
      </View>
      {others.map((w) => (
        <Pressable
          key={w.id}
          onPress={() => start(w)}
          accessibilityRole="button"
          accessibilityLabel={`Start ${w.title}`}
          style={({ pressed }) => [styles.row, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}
        >
          <LinearGradient colors={w.colors} style={styles.thumb}>
            <MaterialCommunityIcons name={getType(w.type).icon} size={30} color="#FFFFFF" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: c.text }]}>{w.title}</Text>
            <Text style={{ color: c.muted, fontSize: 13, marginTop: 2 }}>{w.minutes} min • {w.level}</Text>
          </View>
          <View style={[styles.play, { backgroundColor: c.primary }]}>
            <MaterialCommunityIcons name="play" size={18} color="#FFFFFF" />
          </View>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', marginBottom: 14 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  featured: { height: 190, borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'flex-end', overflow: 'hidden' },
  bigIcon: { position: 'absolute', right: 10, top: 6 },
  featTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  featSub: { color: '#EDE6FF', fontSize: 14, marginTop: 4 },
  playBig: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, marginBottom: 10 },
  thumb: { width: 64, height: 64, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 16, fontWeight: '700' },
  play: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
