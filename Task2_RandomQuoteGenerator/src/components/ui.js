import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../theme';

const useNativeDriver = Platform.OS !== 'web';

/* ------------------------------------------------------------------ */
/* Dialogs — window.confirm/alert on web, Alert on iOS/Android          */
/* ------------------------------------------------------------------ */

/** Resolves to true when the user confirms. */
export function confirm(title, message, confirmText = 'OK') {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(message ? `${title}\n\n${message}` : title));
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmText, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

export function notify(title, message) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

/** Scrollable page with safe-area padding and a centered 640px column. */
export function Screen({ children, scroll = true, style }) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const column = [styles.column, { maxWidth: theme.maxWidth, paddingTop: insets.top + 16 }, style];

  if (!scroll) {
    return (
      <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
        <View style={[column, styles.fill]}>{children}</View>
      </View>
    );
  }
  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={column}>{children}</View>
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons & chips                                                     */
/* ------------------------------------------------------------------ */

/** Pill button. variant: 'primary' | 'soft' | 'ghost'. */
export function Button({ title, icon, onPress, variant = 'primary', size = 'md', accessibilityLabel, style }) {
  const { colors, radius } = useAppTheme();
  const palette = {
    primary: { bg: colors.primary, pressed: colors.primaryDark, fg: colors.onPrimary },
    soft: { bg: colors.primarySoft, pressed: colors.border, fg: colors.primary },
    ghost: { bg: 'transparent', pressed: colors.primarySoft, fg: colors.primary },
  }[variant];
  const large = size === 'lg';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => [
        styles.button,
        {
          borderRadius: radius.pill,
          backgroundColor: pressed ? palette.pressed : palette.bg,
          paddingVertical: large ? 18 : 10,
          paddingHorizontal: large ? 28 : 16,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        variant === 'primary' && large && styles.buttonShadow,
        style,
      ]}
    >
      {icon ? <MaterialCommunityIcons name={icon} size={large ? 22 : 18} color={palette.fg} /> : null}
      <Text style={[styles.buttonText, { color: palette.fg, fontSize: large ? 18 : 14 }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, selected = false, onPress, accessibilityLabel }) {
  const { colors, radius } = useAppTheme();
  const textStyle = [styles.chipText, { color: selected ? colors.onPrimary : colors.text }];

  // A chip without onPress is a static label (used inside cards that have their own buttons).
  if (!onPress) {
    return (
      <View style={[styles.chip, styles.chipSmall, { borderRadius: radius.pill, backgroundColor: colors.primarySoft }]}>
        <Text style={[styles.chipTextSmall, { color: colors.primary }]}>{label}</Text>
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${label} category`}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          borderRadius: radius.pill,
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

/** Round icon button with an optional caption underneath. */
export function IconButton({ icon, label, onPress, accessibilityLabel, color, active = false, size = 22 }) {
  const { colors } = useAppTheme();
  const tint = color ?? colors.primary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: active }}
      hitSlop={8}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.6 : 1 }]}
    >
      <View
        style={[
          styles.iconCircle,
          { width: size + 26, height: size + 26, backgroundColor: active ? colors.primarySoft : colors.card, borderColor: colors.border },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={size} color={tint} />
      </View>
      {label ? <Text style={[styles.iconLabel, { color: colors.textMuted }]}>{label}</Text> : null}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */

/** const [toast, showToast] = useToast(); … <Toast message={toast} /> */
export function useToast(duration = 1600) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const show = useCallback(
    (message) => {
      clearTimeout(timer.current);
      setToast({ message, key: Date.now() });
      timer.current = setTimeout(() => setToast(null), duration);
    },
    [duration],
  );

  useEffect(() => () => clearTimeout(timer.current), []);
  return [toast, show];
}

export function Toast({ toast }) {
  if (!toast) return null;
  // Keyed so each new message replays the entrance animation.
  return <ToastBubble key={toast.key} message={toast.message} />;
}

function ToastBubble({ message }) {
  const { colors, radius } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver, friction: 7 }).start();
  }, [anim]);

  return (
    <View style={[styles.toastWrap, { bottom: insets.bottom + 24 }]}>
      <Animated.View
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={[
          styles.toast,
          {
            backgroundColor: colors.toast,
            borderRadius: radius.pill,
            opacity: anim,
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
          },
        ]}
      >
        <MaterialCommunityIcons name="check-circle" size={18} color={colors.onToast} />
        <Text style={[styles.toastText, { color: colors.onToast }]}>{message}</Text>
      </Animated.View>
    </View>
  );
}

export function EmptyState({ icon, title, message }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
        <MaterialCommunityIcons name={icon} size={44} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      {message ? <Text style={[styles.emptyMessage, { color: colors.textMuted }]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
  column: { width: '100%', alignSelf: 'center', paddingHorizontal: 20 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonShadow: {
    shadowColor: '#6C3CE9',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  buttonText: { fontWeight: '700', letterSpacing: 0.2 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1 },
  chipText: { fontSize: 14, fontWeight: '600' },
  chipSmall: { paddingVertical: 4, paddingHorizontal: 10, borderWidth: 0, alignSelf: 'flex-start' },
  chipTextSmall: { fontSize: 12, fontWeight: '700' },
  iconButton: { alignItems: 'center', gap: 6, minWidth: 64 },
  iconCircle: { borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  iconLabel: { fontSize: 12, fontWeight: '600' },
  toastWrap: { pointerEvents: 'none', position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 20 },
  toastText: { fontSize: 15, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: 24, gap: 12 },
  emptyIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptyMessage: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
