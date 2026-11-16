import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

const TABS = [
  { name: 'index', title: 'Home', icon: 'home-variant' },
  { name: 'progress', title: 'Progress', icon: 'chart-bar' },
  { name: 'workouts', title: 'Workouts', icon: 'dumbbell' },
  { name: 'profile', title: 'Profile', icon: 'account-outline' },
];

export default function TabLayout() {
  const c = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border, height: 64, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', paddingBottom: 4 },
        sceneStyle: { backgroundColor: c.bg },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name={t.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
