// Activity types. `met` is used to estimate calories:
// calories = MET x body weight (kg) x hours.
// `spm` = estimated steps per minute, used by the workout timer.
export const ACTIVITY_TYPES = [
  { key: 'walking', label: 'Walking', icon: 'walk', met: 3.5, spm: 100, color: '#22A06B' },
  { key: 'running', label: 'Running', icon: 'run-fast', met: 9.8, spm: 160, color: '#E5484D' },
  { key: 'cycling', label: 'Cycling', icon: 'bike', met: 7.5, spm: 0, color: '#3E63DD' },
  { key: 'swimming', label: 'Swimming', icon: 'swim', met: 8.0, spm: 0, color: '#0B8BB8' },
  { key: 'hiit', label: 'HIIT', icon: 'lightning-bolt', met: 8.0, spm: 0, color: '#F2662F' },
  { key: 'strength', label: 'Strength', icon: 'dumbbell', met: 5.0, spm: 0, color: '#8E4EC6' },
  { key: 'yoga', label: 'Yoga', icon: 'yoga', met: 2.5, spm: 0, color: '#D6409F' },
  { key: 'other', label: 'Other', icon: 'heart-pulse', met: 4.0, spm: 0, color: '#6F6E77' },
];

export const DEFAULT_GOALS = {
  steps: 10000,
  calories: 500,
  minutes: 30,
  weight: 70,
};

// Fitness focus picked on the "Set Your Goal" screen.
export const FOCUS_OPTIONS = [
  { key: 'lose_weight', label: 'Lose Weight', sub: 'Get healthier', icon: 'scale-bathroom' },
  { key: 'build_muscle', label: 'Build Muscle', sub: 'Get stronger', icon: 'dumbbell' },
  { key: 'run_5k', label: 'Run a 5K', sub: 'Be active', icon: 'run-fast' },
  { key: 'endurance', label: 'Improve Endurance', sub: 'Go longer', icon: 'speedometer' },
];

// Ready-made workouts on the Workouts tab. Tapping one starts the timer.
export const WORKOUTS = [
  { id: 'full-body', title: 'Full Body Workout', minutes: 20, level: 'Beginner', type: 'strength', category: 'Strength', colors: ['#7B4DF2', '#3D1F86'], featured: true },
  { id: 'hiit', title: 'HIIT Cardio', minutes: 15, level: 'High Intensity', type: 'hiit', category: 'Cardio', colors: ['#FF8A5B', '#E5484D'] },
  { id: 'abs', title: 'Abs Workout', minutes: 12, level: 'Beginner', type: 'strength', category: 'Strength', colors: ['#B58CFF', '#7B4DF2'] },
  { id: 'yoga', title: 'Yoga for Wellness', minutes: 20, level: 'Beginner', type: 'yoga', category: 'Yoga', colors: ['#F59EC8', '#D6409F'] },
  { id: 'run', title: 'Morning Run', minutes: 30, level: 'Intermediate', type: 'running', category: 'Cardio', colors: ['#6E9BFF', '#3E63DD'] },
  { id: 'walk', title: 'Brisk Walk', minutes: 30, level: 'Easy', type: 'walking', category: 'Cardio', colors: ['#5FD39A', '#22A06B'] },
  { id: 'cycle', title: 'Cycling Ride', minutes: 45, level: 'Intermediate', type: 'cycling', category: 'Cardio', colors: ['#7FB2FF', '#3E63DD'] },
  { id: 'upper', title: 'Upper Body Strength', minutes: 25, level: 'Intermediate', type: 'strength', category: 'Strength', colors: ['#A98BFA', '#5A2DD6'] },
  { id: 'stretch', title: 'Stretch & Relax', minutes: 15, level: 'Beginner', type: 'yoga', category: 'Yoga', colors: ['#FFB8D9', '#E0609F'] },
];

export const WORKOUT_CATEGORIES = ['All', 'Cardio', 'Strength', 'Yoga'];

export function getType(key) {
  return ACTIVITY_TYPES.find((t) => t.key === key) ?? ACTIVITY_TYPES[ACTIVITY_TYPES.length - 1];
}

export function estimateCalories(typeKey, minutes, weightKg) {
  const met = getType(typeKey).met;
  return Math.round(met * weightKg * (minutes / 60));
}

// Average step length of about 0.76 m.
export function stepsToKm(steps) {
  return Math.round(steps * 0.000762 * 10) / 10;
}
