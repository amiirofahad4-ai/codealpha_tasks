// Floating "+" button that opens the Log activity form.
import { Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../theme';

export default function AddButton() {
  const c = useTheme();
  return (
    <Pressable
      onPress={() => router.push('/activity')}
      accessibilityRole="button"
      accessibilityLabel="Log activity"
      style={({ pressed }) => [styles.fab, { backgroundColor: c.primary, opacity: pressed ? 0.8 : 1 }]}
    >
      <MaterialCommunityIcons name="plus" size={30} color={c.primaryText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
