// Change name and fitness goal from the Profile tab.
import { router } from 'expo-router';
import FocusPicker from '../components/FocusPicker';

export default function Focus() {
  return <FocusPicker buttonTitle="Save" onDone={() => router.back()} />;
}
