// Holds the signed-in user's activities and goals and keeps them in sync with Supabase.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as db from '../db/database';
import { DEFAULT_GOALS, estimateCalories } from '../constants';
import { addDays, lastNDays, todayKey } from '../utils/date';

const FitnessContext = createContext(null);

export function FitnessProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');

  const reload = useCallback(async () => {
    const [list, g] = await Promise.all([db.getActivities(), db.getGoals()]);
    setActivities(list);
    setGoals(g);
    setLoadError('');
  }, []);

  // First load from Supabase when the user signs in.
  useEffect(() => {
    let cancelled = false;
    Promise.all([db.getActivities(), db.getGoals()])
      .then(([list, g]) => {
        if (cancelled) return;
        setActivities(list);
        setGoals(g);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e.message);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    // Totals for each day, e.g. totals['2026-11-03'] = { steps, calories, minutes, count }
    const totals = {};
    for (const a of activities) {
      const t = (totals[a.date] ??= { steps: 0, calories: 0, minutes: 0, count: 0 });
      t.steps += a.steps;
      t.calories += a.calories;
      t.minutes += a.duration;
      t.count += 1;
    }

    return {
      ready,
      loadError,
      retry: () => reload().catch((e) => setLoadError(e.message)),
      activities,
      goals,
      totals,
      dayTotal: (key) => totals[key] ?? { steps: 0, calories: 0, minutes: 0, count: 0 },
      streak: computeStreak(totals),
      addActivity: async (a) => {
        await db.addActivity(a);
        await reload();
      },
      updateActivity: async (id, a) => {
        await db.updateActivity(id, a);
        await reload();
      },
      deleteActivity: async (id) => {
        await db.deleteActivity(id);
        await reload();
      },
      saveGoals: async (g) => {
        await db.saveGoals(g);
        await reload();
      },
      clearAll: async () => {
        await db.clearActivities();
        await reload();
      },
      loadDemoData: async () => {
        await db.addManyActivities(makeDemoData(goals.weight));
        await reload();
      },
    };
  }, [activities, goals, ready, loadError, reload]);

  return <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>;
}

export function useFitness() {
  const ctx = useContext(FitnessContext);
  if (!ctx) throw new Error('useFitness must be used inside FitnessProvider');
  return ctx;
}

// Days in a row with at least one activity, counting back from today.
// If today has nothing yet, the streak counts from yesterday.
function computeStreak(totals) {
  let day = todayKey();
  if (!totals[day]) day = addDays(day, -1);
  let streak = 0;
  while (totals[day]) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}

// A believable week of sample activities, handy for demos.
function makeDemoData(weight) {
  const plan = [
    ['walking', 45, 6200], ['running', 30, 4100],
    ['cycling', 50, 0], ['walking', 60, 8300],
    ['strength', 40, 0], ['swimming', 35, 0], ['yoga', 25, 0],
  ];
  return lastNDays(7).flatMap((date, i) => {
    const [type, duration, steps] = plan[i];
    const items = [{ type, duration, steps, date, calories: estimateCalories(type, duration, weight), note: '' }];
    // Add an everyday walk so step counts look realistic.
    if (type !== 'walking') {
      const walkSteps = 2500 + ((i * 1370) % 3000);
      items.push({ type: 'walking', duration: 20, steps: walkSteps, date, calories: estimateCalories('walking', 20, weight), note: 'Daily walk' });
    }
    return items;
  });
}
