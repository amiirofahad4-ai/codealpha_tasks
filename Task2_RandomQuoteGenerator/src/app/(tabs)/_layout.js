import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';

import { useQuotes } from '../../context/QuoteContext';
import { useAppTheme } from '../../theme';

function icon(name, focusedName = name) {
  function TabIcon({ color, size, focused }) {
    return <MaterialCommunityIcons name={focused ? focusedName : name} size={size} color={color} />;
  }
  return TabIcon;
}

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { favoriteIds } = useQuotes();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Quotes', tabBarIcon: icon('format-quote-open-outline', 'format-quote-open') }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: icon('heart-outline', 'heart'),
          tabBarBadge: favoriteIds.length || undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary, color: colors.onPrimary },
        }}
      />
      <Tabs.Screen
        name="about"
        options={{ title: 'About', tabBarIcon: icon('information-outline', 'information') }}
      />
    </Tabs>
  );
}
