import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import QuoteCard from '../../components/QuoteCard';
import { Button, Chip, IconButton, notify, Screen, Toast, useToast } from '../../components/ui';
import { useQuotes } from '../../context/QuoteContext';
import { CATEGORIES, QUOTES } from '../../data/quotes';
import { useAppTheme } from '../../theme';
import { copyQuote, shareQuote } from '../../utils/quoteActions';
import { getQuoteOfTheDay, pickRandom } from '../../utils/random';

const FILTERS = ['All', ...CATEGORIES];
const poolFor = (category) => (category === 'All' ? QUOTES : QUOTES.filter((q) => q.category === category));

export default function QuotesScreen() {
  const { colors, radius } = useAppTheme();
  const { isFavorite, toggleFavorite } = useQuotes();
  const [toast, showToast] = useToast();

  const [category, setCategory] = useState('All');
  // Lazy initial state: a fresh random quote every time the app opens.
  const [quote, setQuote] = useState(() => pickRandom(QUOTES));

  // Derived values — no effects needed.
  const today = new Date();
  const quoteOfTheDay = getQuoteOfTheDay(QUOTES, today);
  const pool = poolFor(category);
  const position = pool.findIndex((q) => q.id === quote.id) + 1;
  const saved = isFavorite(quote.id);

  const newQuote = () => setQuote((current) => pickRandom(poolFor(category), current.id));

  const selectCategory = (next) => {
    if (next === category) return;
    setCategory(next);
    setQuote((current) => pickRandom(poolFor(next), current.id));
  };

  const showQuoteOfTheDay = () => {
    if (category !== 'All' && quoteOfTheDay.category !== category) setCategory('All');
    setQuote(quoteOfTheDay);
  };

  const onFavorite = () => {
    toggleFavorite(quote.id);
    showToast(saved ? 'Removed from favorites' : 'Saved to favorites');
  };

  const onCopy = async () => {
    try {
      await copyQuote(quote);
      showToast('Copied!');
    } catch {
      notify('Copy failed', 'Could not copy the quote to the clipboard.');
    }
  };

  const onShare = async () => {
    try {
      const result = await shareQuote(quote);
      if (result === 'copied') showToast('Sharing unavailable — copied instead');
    } catch {
      notify('Share failed', 'Could not open the share sheet.');
    }
  };

  return (
    <View style={styles.fill}>
      <Screen>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.appName, { color: colors.text }]}>
              Quote<Text style={{ color: colors.primary }}>Vibe</Text>
            </Text>
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <View style={[styles.logo, { backgroundColor: colors.primarySoft }]}>
            <MaterialCommunityIcons name="format-quote-open" size={26} color={colors.primary} />
          </View>
        </View>

        {/* Quote of the Day */}
        <Pressable
          onPress={showQuoteOfTheDay}
          accessibilityRole="button"
          accessibilityLabel={`Quote of the Day: ${quoteOfTheDay.text}, by ${quoteOfTheDay.author}. Tap to show it in the main card.`}
          style={({ pressed }) => [
            styles.qotd,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <View style={[styles.qotdIcon, { backgroundColor: colors.primarySoft }]}>
            <MaterialCommunityIcons name="white-balance-sunny" size={20} color={colors.primary} />
          </View>
          <View style={styles.qotdBody}>
            <Text style={[styles.qotdLabel, { color: colors.primary }]}>QUOTE OF THE DAY</Text>
            <Text style={[styles.qotdText, { color: colors.text }]} numberOfLines={2}>
              {quoteOfTheDay.text}
            </Text>
            <Text style={[styles.qotdAuthor, { color: colors.textMuted }]}>{`— ${quoteOfTheDay.author}`}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
        </Pressable>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroller}
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map((c) => (
            <Chip key={c} label={c} selected={c === category} onPress={() => selectCategory(c)} />
          ))}
        </ScrollView>

        {/* Main quote */}
        <QuoteCard quote={quote} />

        {/* Actions */}
        <View style={styles.actions}>
          <IconButton
            icon={saved ? 'heart' : 'heart-outline'}
            label={saved ? 'Saved' : 'Favorite'}
            color={colors.heart}
            active={saved}
            onPress={onFavorite}
            accessibilityLabel={saved ? 'Remove from favorites' : 'Add to favorites'}
          />
          <IconButton icon="content-copy" label="Copy" onPress={onCopy} accessibilityLabel="Copy quote" />
          <IconButton icon="share-variant" label="Share" onPress={onShare} accessibilityLabel="Share quote" />
        </View>

        <Button title="New Quote" icon="refresh" size="lg" onPress={newQuote} accessibilityLabel="Show a new random quote" />

        <Text style={[styles.counter, { color: colors.textMuted }]}>
          {`Quote ${position} of ${pool.length}`}
          {category !== 'All' ? ` in ${category}` : ''}
        </Text>
      </Screen>
      <Toast toast={toast} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  appName: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  date: { fontSize: 14, marginTop: 2 },
  logo: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  qotd: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1 },
  qotdIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  qotdBody: { flex: 1, gap: 2 },
  qotdLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  qotdText: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  qotdAuthor: { fontSize: 12 },
  chipsScroller: { marginHorizontal: -20, marginVertical: 20, flexGrow: 0 },
  chips: { gap: 8, paddingHorizontal: 20 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 28, marginVertical: 24 },
  counter: { textAlign: 'center', fontSize: 13, marginTop: 14 },
});
