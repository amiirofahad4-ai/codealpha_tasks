import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/ui';
import { useQuotes } from '../../context/QuoteContext';
import { CATEGORIES, QUOTES } from '../../data/quotes';
import { useAppTheme } from '../../theme';

const FEATURES = [
  ['dice-multiple-outline', 'A random quote on every launch and every tap'],
  ['repeat-off', 'Never shows the same quote twice in a row'],
  ['shape-outline', 'Filter by category, plus a daily Quote of the Day'],
  ['heart-outline', 'Save favorites — stored on your device'],
  ['share-variant-outline', 'Copy or share any quote in one tap'],
  ['theme-light-dark', 'Light and dark mode, works fully offline'],
];

export default function AboutScreen() {
  const { colors, radius } = useAppTheme();
  const { favoriteIds } = useQuotes();

  const stats = [
    [QUOTES.length, 'Quotes'],
    [CATEGORIES.length, 'Categories'],
    [favoriteIds.length, 'Favorites'],
  ];

  const cardStyle = [styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }];

  return (
    <Screen>
      <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { borderRadius: radius.lg }]}>
        <View style={styles.heroIcon}>
          <MaterialCommunityIcons name="format-quote-open" size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.heroTitle}>QuoteVibe</Text>
        <Text style={styles.heroText}>
          A simple, beautiful random quote generator. Get a fresh dose of motivation, wisdom and joy whenever you need it.
        </Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </LinearGradient>

      <View style={styles.stats}>
        {stats.map(([value, label]) => (
          <View key={label} style={[cardStyle, styles.stat]} accessible accessibilityLabel={`${value} ${label}`}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={cardStyle}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Features</Text>
        {FEATURES.map(([icon, text]) => (
          <View key={text} style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primarySoft }]}>
              <MaterialCommunityIcons name={icon} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.featureText, { color: colors.text }]}>{text}</Text>
          </View>
        ))}
      </View>

      <View style={[cardStyle, styles.cardGap]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
        <Text style={[styles.featureText, { color: colors.textMuted }]}>{CATEGORIES.join(' · ')}</Text>
      </View>

      <Text style={[styles.credit, { color: colors.textMuted }]}>
        Made for the CodeAlpha App Development Internship {'–'} Task 2
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 28, alignItems: 'center', gap: 10 },
  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  heroText: { color: 'rgba(255,255,255,0.88)', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  version: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', marginTop: 4 },
  stats: { flexDirection: 'row', gap: 12, marginVertical: 16 },
  card: { padding: 20, borderWidth: 1 },
  cardGap: { marginTop: 16 },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  statValue: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  featureIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, fontSize: 14, lineHeight: 20 },
  credit: { textAlign: 'center', fontSize: 13, marginTop: 28, lineHeight: 19 },
});
