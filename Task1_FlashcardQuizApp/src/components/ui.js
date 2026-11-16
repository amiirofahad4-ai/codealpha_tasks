// Small reusable UI pieces.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { MAX_WIDTH, RADIUS, useTheme } from '../theme';

// ---------- Dialogs (web + native) ----------

export function confirm(title, message, { confirmText = 'OK', destructive = false } = {}) {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(message ? `${title}\n\n${message}` : title));
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}

export function notify(title, message) {
  if (Platform.OS === 'web') window.alert(message ? `${title}\n\n${message}` : title);
  else Alert.alert(title, message);
}

// Go back, or to a fallback route when there is no history (e.g. after a web refresh).
export function goBack(fallback = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

// ---------- Layout ----------

export function Screen({ children, scroll = false, edges = ['top'], contentStyle }) {
  const t = useTheme();
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.bg }]} edges={edges}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.column, styles.scrollPad, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.column, styles.pad, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Header({ title, subtitle, onBack, backIcon = 'arrow-left', right }) {
  const t = useTheme();
  return (
    <View style={styles.header}>
      {onBack ? <IconButton icon={backIcon} label="Go back" onPress={onBack} /> : <View style={styles.headerSide} />}
      <View style={styles.headerCenter}>
        {title ? (
          <Text style={[styles.headerTitle, { color: t.text }]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={[styles.headerSub, { color: t.muted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? <View style={styles.headerSide} />}
    </View>
  );
}

export function Card({ children, style }) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.card, borderColor: t.border },
        !t.dark && { boxShadow: '0 4px 16px rgba(79, 34, 201, 0.06)' },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ---------- Buttons ----------

// variant: primary | secondary | outline | ghost | danger | success
export function Button({ title, onPress, variant = 'primary', icon, iconRight, disabled, small, style, accessibilityLabel }) {
  const t = useTheme();
  const v = {
    primary: { bg: t.primary, fg: t.onPrimary, border: t.primary },
    secondary: { bg: t.soft, fg: t.accent, border: t.soft },
    outline: { bg: 'transparent', fg: t.accent, border: t.dark ? t.border : '#D9CFFB' },
    ghost: { bg: 'transparent', fg: t.accent, border: 'transparent' },
    danger: { bg: t.dangerSoft, fg: t.danger, border: t.dangerSoft },
    success: { bg: t.success, fg: '#FFFFFF', border: t.success },
  }[variant];
  const size = small ? 18 : 20;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: v.bg, borderColor: v.border },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon ? <MaterialCommunityIcons name={icon} size={size} color={v.fg} /> : null}
      {title ? (
        <Text style={[styles.buttonText, small && styles.buttonTextSmall, { color: v.fg }]} numberOfLines={1}>
          {title}
        </Text>
      ) : null}
      {iconRight ? <MaterialCommunityIcons name={iconRight} size={size} color={v.fg} /> : null}
    </Pressable>
  );
}

export function IconButton({ icon, onPress, label, color, size = 22, filled, disabled, style }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.iconButton,
        filled && { backgroundColor: t.card, borderColor: t.border },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <MaterialCommunityIcons name={icon} size={size} color={color || t.text} />
    </Pressable>
  );
}

// ---------- Content ----------

export function Chip({ label, icon, color, bg, style }) {
  const t = useTheme();
  const fg = color || t.accent;
  return (
    <View style={[styles.chip, { backgroundColor: bg || t.soft }, style]}>
      {icon ? <MaterialCommunityIcons name={icon} size={15} color={fg} /> : null}
      <Text style={[styles.chipText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({ icon, title, hint, children }) {
  const t = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: t.soft }]}>
        <MaterialCommunityIcons name={icon} size={38} color={t.accent} />
      </View>
      <Text style={[styles.emptyTitle, { color: t.text }]}>{title}</Text>
      {hint ? <Text style={[styles.emptyHint, { color: t.muted }]}>{hint}</Text> : null}
      {children}
    </View>
  );
}

export function ProgressBar({ value, color }) {
  const t = useTheme();
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View
      style={[styles.track, { backgroundColor: t.soft }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
    >
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color || t.primary }]} />
    </View>
  );
}

// Circular score ring. value is 0–100. Rotated with an SVG transform so it also works on web.
export function ScoreRing({ value, size = 190, stroke = 16, color, children }) {
  const t = useTheme();
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={{ width: size, height: size }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: pct }}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r} stroke={t.soft} strokeWidth={stroke} fill="none" />
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={color || t.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - pct / 100)}
          transform={`rotate(-90 ${c} ${c})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

// Labeled text input with an optional character counter and error message.
export function Field({ label, value, onChangeText, max, error, multiline, style, ...rest }) {
  const t = useTheme();
  const over = max && value.length > max;
  return (
    <View style={style}>
      <View style={styles.fieldHead}>
        <Text style={[styles.fieldLabel, { color: t.text }]}>{label}</Text>
        {max ? (
          <Text style={[styles.counter, { color: over ? t.danger : t.muted }]}>
            {value.length}/{max}
          </Text>
        ) : null}
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor={t.muted}
        accessibilityLabel={label}
        style={[
          styles.input,
          multiline && styles.multiline,
          { color: t.text, backgroundColor: t.input, borderColor: error ? t.danger : t.border },
        ]}
        {...rest}
      />
      {error ? <Text style={[styles.error, { color: t.danger }]}>{error}</Text> : null}
    </View>
  );
}

// Bottom sheet with a list of actions. actions: [{ label, icon, onPress, destructive }]
export function ActionSheet({ visible, title, actions, onClose }) {
  const t = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close menu" />
        <View style={[styles.sheet, { backgroundColor: t.card }]}>
          {title ? (
            <Text style={[styles.sheetTitle, { color: t.muted }]} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {actions.map((a) => (
            <Pressable
              key={a.label}
              accessibilityRole="button"
              accessibilityLabel={a.label}
              onPress={() => {
                onClose();
                // iOS can't show an alert or another modal while this one is still closing
                if (Platform.OS === 'ios') setTimeout(a.onPress, 400);
                else a.onPress();
              }}
              style={({ pressed }) => [styles.sheetItem, pressed && { backgroundColor: t.soft }]}
            >
              <MaterialCommunityIcons name={a.icon} size={22} color={a.destructive ? t.danger : t.text} />
              <Text style={[styles.sheetText, { color: a.destructive ? t.danger : t.text }]}>{a.label}</Text>
            </Pressable>
          ))}
          <Button title="Cancel" variant="secondary" onPress={onClose} style={styles.sheetCancel} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  column: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  pad: { paddingHorizontal: 20 },
  scrollPad: { paddingHorizontal: 20, paddingBottom: 40 },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.4 },

  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  headerSide: { width: 44 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  headerSub: { fontSize: 13, fontWeight: '600', marginTop: 1 },

  card: { borderRadius: RADIUS.card, borderWidth: 1, padding: 18 },

  button: {
    minHeight: 50,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonSmall: { minHeight: 40, paddingHorizontal: 14 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  buttonTextSmall: { fontSize: 14 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, alignSelf: 'flex-start' },
  chipText: { fontSize: 13, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20, gap: 8 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  emptyTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  emptyHint: { fontSize: 15, textAlign: 'center', lineHeight: 22 },

  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },

  fieldHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  fieldLabel: { fontSize: 15, fontWeight: '800' },
  counter: { fontSize: 13, fontWeight: '600' },
  input: { borderWidth: 1.5, borderRadius: RADIUS.input, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, minHeight: 50 },
  multiline: { minHeight: 110, textAlignVertical: 'top', lineHeight: 22 },
  error: { fontSize: 13, fontWeight: '600', marginTop: 6 },

  sheetRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 6, 25, 0.45)' },
  sheet: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 16,
    paddingBottom: 28,
  },
  sheetTitle: { fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  sheetItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 12, paddingVertical: 14, borderRadius: 14 },
  sheetText: { fontSize: 16, fontWeight: '700' },
  sheetCancel: { marginTop: 10 },
});
