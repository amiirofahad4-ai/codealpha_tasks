// Study/quiz card with a 3D Y-axis flip (React Native Animated API).
// Give it key={card.id} so a new card always starts on the question side without animating.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Animated, PanResponder, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { RADIUS, useTheme } from '../theme';

const SWIPE_DISTANCE = 60;
const useNativeDriver = Platform.OS !== 'web';

function fontSizeFor(text) {
  if (text.length > 200) return 17;
  if (text.length > 100) return 20;
  if (text.length > 40) return 24;
  return 28;
}

export default function FlipCard({ question, answer, flipped, onFlip, onSwipeLeft, onSwipeRight }) {
  const t = useTheme();
  const [anim] = useState(() => new Animated.Value(flipped ? 1 : 0));

  useEffect(() => {
    Animated.timing(anim, { toValue: flipped ? 1 : 0, duration: 420, useNativeDriver }).start();
  }, [flipped, anim]);

  // Swipe left = next, swipe right = previous. Only clear horizontal moves count.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
        onPanResponderRelease: (_, g) => {
          if (g.dx <= -SWIPE_DISTANCE) onSwipeLeft?.();
          else if (g.dx >= SWIPE_DISTANCE) onSwipeRight?.();
        },
      }),
    [onSwipeLeft, onSwipeRight]
  );

  const frontStyle = {
    transform: [{ perspective: 1200 }, { rotateY: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }],
    // Opacity switch backs up backfaceVisibility, which Android doesn't always respect
    opacity: anim.interpolate({ inputRange: [0, 0.5, 0.501, 1], outputRange: [1, 1, 0, 0] }),
  };
  const backStyle = {
    transform: [{ perspective: 1200 }, { rotateY: anim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] }) }],
    opacity: anim.interpolate({ inputRange: [0, 0.5, 0.501, 1], outputRange: [0, 0, 1, 1] }),
  };

  return (
    <View style={styles.flex} {...pan.panHandlers}>
      <Pressable
        onPress={onFlip}
        style={styles.flex}
        accessibilityRole="button"
        accessibilityLabel={flipped ? `Answer: ${answer}` : `Question: ${question}`}
        accessibilityHint={flipped ? 'Double tap to show the question' : 'Double tap to show the answer'}
      >
        {/* Front: purple gradient with the question */}
        <Animated.View
          style={[styles.face, frontStyle]}
          pointerEvents="none"
          accessibilityElementsHidden={flipped}
          importantForAccessibility={flipped ? 'no-hide-descendants' : 'auto'}
        >
          <LinearGradient colors={t.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.inner}>
            <View style={styles.blob} />
            <Text style={styles.frontKicker}>QUESTION</Text>
            <Text style={[styles.frontText, { fontSize: fontSizeFor(question), lineHeight: fontSizeFor(question) * 1.3 }]}>
              {question}
            </Text>
            <View style={styles.hint}>
              <MaterialCommunityIcons name="gesture-tap" size={17} color="rgba(255,255,255,0.8)" />
              <Text style={styles.frontHint}>Tap to flip</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Back: white with purple text */}
        <Animated.View
          style={[styles.face, backStyle]}
          pointerEvents="none"
          accessibilityElementsHidden={!flipped}
          importantForAccessibility={flipped ? 'auto' : 'no-hide-descendants'}
        >
          <View style={[styles.inner, styles.back, { backgroundColor: t.card, borderColor: t.dark ? t.border : '#E4DAFD' }]}>
            <Text style={[styles.backKicker, { color: t.muted }]}>ANSWER</Text>
            <Text style={[styles.backText, { color: t.accent, fontSize: fontSizeFor(answer), lineHeight: fontSizeFor(answer) * 1.3 }]}>
              {answer}
            </Text>
            <View style={styles.hint}>
              <MaterialCommunityIcons name="gesture-tap" size={17} color={t.muted} />
              <Text style={[styles.backHint, { color: t.muted }]}>Tap to see the question</Text>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minHeight: 300 },
  face: { ...StyleSheet.absoluteFillObject, backfaceVisibility: 'hidden' },
  inner: {
    flex: 1,
    borderRadius: RADIUS.card,
    padding: 26,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: '0 14px 30px rgba(79, 34, 201, 0.22)',
  },
  back: { borderWidth: 1.5, boxShadow: '0 10px 26px rgba(79, 34, 201, 0.10)' },
  blob: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.08)', top: -70, right: -60 },
  frontKicker: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '800', letterSpacing: 1.6, marginBottom: 14 },
  frontText: { color: '#FFFFFF', fontWeight: '800', textAlign: 'center' },
  frontHint: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  backKicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.6, marginBottom: 14 },
  backText: { fontWeight: '800', textAlign: 'center' },
  backHint: { fontSize: 13, fontWeight: '600' },
  hint: { position: 'absolute', bottom: 18, flexDirection: 'row', alignItems: 'center', gap: 6 },
});
