// Shared building blocks used across screens.
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';
import { useTheme } from '../theme';
import { getType } from '../constants';

export function Card({ children, style }) {
  const c = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, style]}>{children}</View>
  );
}

export function SectionTitle({ children, actionLabel, onAction }) {
  const c = useTheme();
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.sectionTitle, { color: c.text }]}>{children}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button" style={styles.row}>
          <Text style={{ color: c.primary, fontWeight: '700', fontSize: 13 }}>{actionLabel}</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={c.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

// Circular progress ring (0..1). Children are drawn in the middle.
export function Ring({ size = 120, stroke = 10, progress = 0, color, track, children }) {
  const c = useTheme();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(progress, 1));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track ?? c.track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? c.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={circ * (1 - p)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

// Horizontal progress bar toward a goal.
export function ProgressBar({ icon, label, value, goal, unit, color }) {
  const c = useTheme();
  const pct = goal > 0 ? Math.min(value / goal, 1) : 0;
  const done = goal > 0 && value >= goal;
  return (
    <View style={styles.progressWrap} accessibilityLabel={`${label}: ${value} of ${goal} ${unit}`}>
      <View style={styles.progressHead}>
        <View style={styles.row}>
          <MaterialCommunityIcons name={icon} size={18} color={color} />
          <Text style={[styles.progressLabel, { color: c.text }]}>{label}</Text>
        </View>
        <Text style={[styles.progressValue, { color: c.muted }]}>
          <Text style={{ color: c.text, fontWeight: '700' }}>{value.toLocaleString()}</Text> / {goal.toLocaleString()} {unit}
          {done ? '  ✓' : ''}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: c.track }]}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// Smooth line chart with a soft fill. data: [{ key, label, value }]
export function LineChart({ data, color, unit, height = 150 }) {
  const c = useTheme();
  const [width, setWidth] = useState(0);
  const padX = 14;
  const padTop = 34;
  const padBottom = 8;
  const max = Math.max(...data.map((d) => d.value), 1);
  const maxIndex = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const step = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0;
  const pts = data.map((d, i) => ({
    x: padX + i * step,
    y: padTop + (1 - d.value / max) * (height - padTop - padBottom),
  }));

  let line = '';
  pts.forEach((p, i) => {
    if (i === 0) {
      line = `M ${p.x} ${p.y}`;
    } else {
      const prev = pts[i - 1];
      const mx = (prev.x + p.x) / 2;
      line += ` C ${mx} ${prev.y}, ${mx} ${p.y}, ${p.x} ${p.y}`;
    }
  });
  const area = pts.length ? `${line} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z` : '';
  const peak = pts[maxIndex];
  const hasData = data.some((d) => d.value > 0);

  return (
    <View>
      <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Defs>
              <SvgGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity={0.25} />
                <Stop offset="1" stopColor={color} stopOpacity={0} />
              </SvgGradient>
            </Defs>
            {pts.map((p, i) => (
              <Path key={`g${i}`} d={`M ${p.x} ${padTop - 6} L ${p.x} ${height}`} stroke={c.border} strokeWidth={1} />
            ))}
            <Path d={area} fill="url(#fill)" />
            <Path d={line} stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" />
            {pts.map((p, i) => (
              <Circle key={`d${i}`} cx={p.x} cy={p.y} r={i === maxIndex && hasData ? 6 : 4.5} fill={c.card} stroke={color} strokeWidth={2.5} />
            ))}
          </Svg>
        )}
        {width > 0 && hasData && (
          <View style={[styles.peak, { left: Math.min(Math.max(peak.x - 40, 0), width - 80), top: peak.y - 32, backgroundColor: c.text }]}>
            <Text style={{ color: c.card, fontSize: 12, fontWeight: '700' }} numberOfLines={1}>
              {data[maxIndex].value.toLocaleString()} {unit}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.chartLabels}>
        {data.map((d, i) => (
          <Text key={d.key} style={[styles.barLabel, { color: i === data.length - 1 ? c.text : c.muted }]}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

// Tiny bar sparkline used on the Progress cards.
export function MiniBars({ values, color }) {
  const max = Math.max(...values, 1);
  return (
    <View style={styles.miniBars}>
      {values.map((v, i) => (
        <View
          key={i}
          style={{
            width: 7,
            borderRadius: 3,
            height: `${Math.max((v / max) * 100, 8)}%`,
            backgroundColor: color,
            opacity: 0.35 + (0.65 * (i + 1)) / values.length,
          }}
        />
      ))}
    </View>
  );
}

export function StatTile({ icon, color, value, label }) {
  const c = useTheme();
  return (
    <View style={[styles.statTile, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '1F' }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: c.text }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: c.muted }]}>{label}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress }) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, { backgroundColor: active ? c.primary : c.card, borderColor: active ? c.primary : c.border }]}
    >
      <Text style={{ color: active ? c.primaryText : c.text, fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function MenuRow({ icon, label, onPress, danger }) {
  const c = useTheme();
  const color = danger ? c.danger : c.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.menuRow, { borderColor: c.border, opacity: pressed ? 0.6 : 1 }]}
    >
      <MaterialCommunityIcons name={icon} size={22} color={danger ? c.danger : c.primary} />
      <Text style={[styles.menuLabel, { color }]}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={22} color={c.muted} />
    </Pressable>
  );
}

export function ActivityRow({ activity, onPress, onDelete }) {
  const c = useTheme();
  const t = getType(activity.type);
  const details = [`${activity.duration} min`, `${activity.calories} kcal`];
  if (activity.steps) details.push(`${activity.steps.toLocaleString()} steps`);
  // The edit area and the delete icon are sibling buttons (a button inside a button breaks on web).
  return (
    <View style={styles.actRow}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.actMain, { opacity: pressed ? 0.6 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${t.label}`}
      >
        <View style={[styles.actIcon, { backgroundColor: t.color + '22' }]}>
          <MaterialCommunityIcons name={t.icon} size={22} color={t.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.actTitle, { color: c.text }]}>{t.label}</Text>
          <Text style={[styles.actSub, { color: c.muted }]}>{details.join(' · ')}</Text>
          {activity.note ? (
            <Text style={[styles.actSub, { color: c.muted }]} numberOfLines={1}>
              {activity.note}
            </Text>
          ) : null}
        </View>
      </Pressable>
      {onDelete && (
        <Pressable onPress={onDelete} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Delete ${t.label}`}>
          <MaterialCommunityIcons name="trash-can-outline" size={22} color={c.muted} />
        </Pressable>
      )}
    </View>
  );
}

export function Button({ title, onPress, variant = 'primary', icon, style }) {
  const c = useTheme();
  const bg = variant === 'primary' ? c.primary : variant === 'light' ? '#FFFFFF' : 'transparent';
  const fg =
    variant === 'primary' ? c.primaryText
      : variant === 'danger' ? c.danger
        : variant === 'light' ? c.primaryDark
          : variant === 'ghost' ? '#FFFFFF'
            : c.text;
  const border =
    variant === 'primary' ? c.primary
      : variant === 'danger' ? c.danger
        : variant === 'light' ? '#FFFFFF'
          : variant === 'ghost' ? 'transparent'
            : c.border;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, { backgroundColor: bg, borderColor: border, opacity: pressed ? 0.75 : 1 }, style]}
    >
      {icon && <MaterialCommunityIcons name={icon} size={18} color={fg} />}
      <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

// Yes/no question that works on phones and on web.
export function confirm(title, message, okText = 'Delete') {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: okText, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

// Simple message popup that works on phones and on web.
export function notify(title, message) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 16, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  progressWrap: { marginBottom: 14 },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressLabel: { fontSize: 15, fontWeight: '600' },
  progressValue: { fontSize: 13 },
  track: { height: 10, borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  peak: { position: 'absolute', width: 80, alignItems: 'center', paddingVertical: 4, borderRadius: 8 },
  chartLabels: { flexDirection: 'row', marginTop: 6 },
  barLabel: { flex: 1, textAlign: 'center', fontSize: 12 },
  miniBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 44 },
  statTile: { flex: 1, alignItems: 'center', borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, paddingVertical: 14, paddingHorizontal: 6 },
  statIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  actIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  actTitle: { fontSize: 15, fontWeight: '600' },
  actSub: { fontSize: 13, marginTop: 2 },
  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 15, paddingHorizontal: 20, borderRadius: 28, borderWidth: 1,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
