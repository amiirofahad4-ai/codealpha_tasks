// Profile: name, email, lifetime stats, settings links and log out.
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useFitness } from '../../context/FitnessContext';
import { useTheme } from '../../theme';
import { FOCUS_OPTIONS } from '../../constants';
import { Button, Card, MenuRow, confirm, notify } from '../../components/ui';
import Screen from '../../components/Screen';

function compact(n) {
  return n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n);
}

export default function Profile() {
  const c = useTheme();
  const { user, profile, signOut } = useAuth();
  const { activities } = useFitness();

  const minutes = activities.reduce((s, a) => s + a.duration, 0);
  const calories = activities.reduce((s, a) => s + a.calories, 0);
  const name = profile.name || 'FitTrack user';
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const focus = FOCUS_OPTIONS.find((f) => f.key === profile.focus);

  const onLogOut = async () => {
    if (!(await confirm('Log out?', 'You can sign in again any time.', 'Log Out'))) return;
    try {
      await signOut();
    } catch (e) {
      notify('Could not log out', e.message);
    }
  };

  return (
    <Screen>
      <View style={styles.top}>
        <LinearGradient colors={c.gradient} style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </LinearGradient>
        <Text style={[styles.name, { color: c.text }]}>{name}</Text>
        <Text style={{ color: c.muted }}>{user?.email}</Text>
        {focus ? (
          <View style={[styles.focus, { backgroundColor: c.primarySoft }]}>
            <Text style={{ color: c.primary, fontWeight: '700', fontSize: 13 }}>Goal: {focus.label}</Text>
          </View>
        ) : null}
      </View>

      <Card style={styles.stats}>
        <Stat value={activities.length} label="Workouts" />
        <View style={[styles.divider, { backgroundColor: c.border }]} />
        <Stat value={`${Math.round((minutes / 60) * 10) / 10}h`} label="Active Time" />
        <View style={[styles.divider, { backgroundColor: c.border }]} />
        <Stat value={compact(calories)} label="Calories" />
      </Card>

      <Card>
        <MenuRow icon="target" label="My Goals" onPress={() => router.push('/goals')} />
        <MenuRow icon="flag-checkered" label="Fitness Goal" onPress={() => router.push('/focus')} />
        <MenuRow icon="history" label="All Activities" onPress={() => router.push('/history')} />
        <MenuRow
          icon="information-outline"
          label="About App"
          onPress={() => notify('FitTrack', 'Fitness tracker built with React Native, Expo and Supabase for the CodeAlpha App Development Internship.')}
        />
      </Card>

      <Button title="Log Out" icon="logout" onPress={onLogOut} style={{ marginTop: 6 }} />
    </Screen>
  );
}

function Stat({ value, label }) {
  const c = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color: c.text, fontSize: 20, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: c.muted, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', marginBottom: 18, marginTop: 8 },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  initials: { color: '#FFFFFF', fontSize: 34, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  focus: { marginTop: 10, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  stats: { flexDirection: 'row', alignItems: 'center' },
  divider: { width: 1, height: 36 },
});
