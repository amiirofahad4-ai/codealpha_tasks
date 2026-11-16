import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, confirm, EmptyState, IconButton, notify, Toast, useToast } from '../../components/ui';
import { useQuotes } from '../../context/QuoteContext';
import { useAppTheme } from '../../theme';
import { shareQuote } from '../../utils/quoteActions';

export default function FavoritesScreen() {
  const theme = useAppTheme();
  const { colors, radius } = theme;
  const insets = useSafeAreaInsets();
  const { favorites, toggleFavorite, clearFavorites } = useQuotes();
  const [toast, showToast] = useToast();

  const onClearAll = async () => {
    const ok = await confirm(
      'Clear all favorites?',
      `This removes all ${favorites.length} saved quote${favorites.length === 1 ? '' : 's'}.`,
      'Clear all',
    );
    if (ok) clearFavorites();
  };

  const onShare = async (quote) => {
    try {
      const result = await shareQuote(quote);
      if (result === 'copied') showToast('Sharing unavailable — copied instead');
    } catch {
      notify('Share failed', 'Could not open the share sheet.');
    }
  };

  const onRemove = (quote) => {
    toggleFavorite(quote.id);
    showToast('Removed from favorites');
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {favorites.length ? `${favorites.length} saved quote${favorites.length === 1 ? '' : 's'}` : 'Your saved quotes'}
        </Text>
      </View>
      {favorites.length > 0 ? (
        <Button title="Clear all" icon="delete-sweep-outline" variant="soft" onPress={onClearAll} accessibilityLabel="Clear all favorites" />
      ) : null}
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
      <Text style={[styles.quoteText, { color: colors.text }]} selectable>
        {`“${item.text}”`}
      </Text>
      <Text style={[styles.author, { color: colors.textMuted }]}>{`— ${item.author}`}</Text>
      <View style={styles.cardFooter}>
        <Chip label={item.category} />
        <View style={styles.cardActions}>
          <IconButton icon="share-variant" size={18} onPress={() => onShare(item)} accessibilityLabel={`Share quote by ${item.author}`} />
          <IconButton
            icon="heart"
            size={18}
            color={colors.heart}
            active
            onPress={() => onRemove(item)}
            accessibilityLabel={`Remove quote by ${item.author} from favorites`}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState icon="heart-outline" title="No favorites yet" message={'No favorites yet. Tap ❤️ on a quote to save it.'} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[
          styles.list,
          { maxWidth: theme.maxWidth, paddingTop: insets.top + 16 },
          favorites.length === 0 && styles.fill,
        ]}
        showsVerticalScrollIndicator={false}
      />
      <Toast toast={toast} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flexGrow: 1, flex: 1 },
  list: { width: '100%', alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12 },
  headerText: { flex: 1 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 2 },
  card: { padding: 20, borderWidth: 1, gap: 8 },
  quoteText: { fontSize: 17, lineHeight: 25, fontWeight: '500' },
  author: { fontSize: 14 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  separator: { height: 12 },
});
