// All reads and writes go to the Supabase database (tables in supabase/schema.sql).
// Row Level Security on the server limits every query to the signed-in user's rows.
import { supabase } from '../lib/supabase';
import { DEFAULT_GOALS } from '../constants';

const FIELDS = 'id, type, duration, calories, steps, date, note, created_at';

// Supabase returns { data, error }. Throw the error so screens can show it.
function check({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

async function currentUserId() {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user?.id;
  if (!id) throw new Error('You are signed out. Please sign in again.');
  return id;
}

function clean(a) {
  return {
    type: a.type,
    duration: a.duration,
    calories: a.calories,
    steps: a.steps,
    date: a.date,
    note: a.note ?? '',
  };
}

export async function getActivities() {
  return check(
    await supabase
      .from('activities')
      .select(FIELDS)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
  );
}

export async function addActivity(a) {
  const row = check(await supabase.from('activities').insert(clean(a)).select('id').single());
  return row.id;
}

export async function updateActivity(id, a) {
  check(await supabase.from('activities').update(clean(a)).eq('id', id));
}

export async function deleteActivity(id) {
  check(await supabase.from('activities').delete().eq('id', id));
}

export async function clearActivities() {
  const userId = await currentUserId();
  check(await supabase.from('activities').delete().eq('user_id', userId));
}

export async function addManyActivities(list) {
  check(await supabase.from('activities').insert(list.map(clean)));
}

export async function getGoals() {
  const row = check(
    await supabase.from('goals').select('steps, calories, minutes, weight').maybeSingle()
  );
  return { ...DEFAULT_GOALS, ...(row ?? {}) };
}

export async function saveGoals(goals) {
  const userId = await currentUserId();
  check(
    await supabase.from('goals').upsert({
      user_id: userId,
      steps: goals.steps,
      calories: goals.calories,
      minutes: goals.minutes,
      weight: goals.weight,
      updated_at: new Date().toISOString(),
    })
  );
}
