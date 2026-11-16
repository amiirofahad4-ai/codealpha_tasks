import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../theme';

const useNativeDriver = Platform.OS !== 'web';

/** Big gradient card that fades + slides in whenever the quote changes. */
export default function QuoteCard({ quote }) {
  const { colors, radius } = useAppTheme();
  const [progress] = useState(() => new Animated.Value(1));

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 420, useNativeDriver }).start();
  }, [quote?.id, progress]);

  if (!quote) return null;

  return (
    <LinearGradient
      colors={colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderRadius: radius.lg }]}
    >
      <View style={styles.decorCircle} />
      <Text style={styles.mark} accessible={false}>
        {'“'}
      </Text>
      <Animated.View
        accessible
        accessibilityLabel={`${quote.text}, by ${quote.author}`}
        style={{
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
        }}
      >
        <Text style={styles.text} selectable>
          {quote.text}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.author}>{`— ${quote.author}`}</Text>
        </View>
        <Text style={styles.category}>{quote.category.toUpperCase()}</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 28,
    paddingTop: 20,
    minHeight: 280,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowColor: '#5A2DD6',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  decorCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -70,
    top: -80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  mark: {
    fontSize: 88,
    lineHeight: 88,
    height: 64,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '800',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
  },
  text: { color: '#FFFFFF', fontSize: 24, lineHeight: 34, fontWeight: '600' },
  footer: { marginTop: 20 },
  author: { color: 'rgba(255,255,255,0.82)', fontSize: 16, fontWeight: '500', flexShrink: 1 },
  category: { marginTop: 18, color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
});
