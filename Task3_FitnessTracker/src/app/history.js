// History: every logged activity grouped by day. Tap to edit, trash icon to delete.
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFitness } from '../context/FitnessContext';
import { useTheme } from '../theme';
import { prettyDate } from '../utils/date';
import { ActivityRow, confirm, notify } from '../components/ui';
import { getType } from '../constants';
import AddButton from '../components/AddButton';

export default function History() {
  const c = useTheme();
  const { activities, dayTotal, deleteActivity } = useFitness();

  // activities are already sorted newest first
  const sections = [];
  for (const a of activities) {
    const last = sections[sections.length - 1];
    if (last && last.date === a.date) last.data.push(a);
    else sections.push({ date: a.date, data: [a] });
  }

  const onDelete = async (a) => {
    const ok = await confirm('Delete activity?', `${getType(a.type).label} on ${prettyDate(a.date)} will be removed.`);
    if (!ok) return;
    try {
      await deleteActivity(a.id);
    } catch (e) {
      notify('Could not delete', e.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SectionList
        sections={sections}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => {
          const t = dayTotal(section.date);
          return (
            <View style={styles.dayHead}>
              <Text style={[styles.dayTitle, { color: c.text }]}>{prettyDate(section.date)}</Text>
              <Text style={[styles.daySub, { color: c.muted }]}>
                {t.calories} kcal · {t.minutes} min · {t.steps.toLocaleString()} steps
              </Text>
            </View>
          );
        }}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: c.card, borderColor: c.border }]}>
            <ActivityRow
              activity={item}
              onPress={() => router.push(`/activity?id=${item.id}`)}
              onDelete={() => onDelete(item)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={c.muted} />
            <Text style={[styles.emptyText, { color: c.muted }]}>
              No activities yet. Tap + to log your first workout.
            </Text>
          </View>
        }
      />
      <AddButton />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 100, maxWidth: 640, width: '100%', alignSelf: 'center' },
  dayHead: { marginTop: 10, marginBottom: 8 },
  dayTitle: { fontSize: 16, fontWeight: '700' },
  daySub: { fontSize: 13, marginTop: 2 },
  item: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, marginBottom: 8 },
  empty: { alignItems: 'center', marginTop: 80, gap: 12, paddingHorizontal: 24 },
  emptyText: { textAlign: 'center', fontSize: 15 },
});
