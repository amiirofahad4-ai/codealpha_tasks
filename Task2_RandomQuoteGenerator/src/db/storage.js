import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'quotevibe:favorites';

// Writes are chained so rapid taps can never interleave a read and a write.
let queue = Promise.resolve();
function enqueue(task) {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
}

async function readIds() {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'number') : [];
  } catch {
    return [];
  }
}

async function writeIds(ids) {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  return ids;
}

/** Returns the saved favorite quote ids (oldest first). */
export function getFavorites() {
  return enqueue(readIds);
}

/** Adds the id if missing, removes it if present. Returns the new id list. */
export function toggleFavorite(id) {
  return enqueue(async () => {
    const ids = await readIds();
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    return writeIds(next);
  });
}

/** Removes every favorite. */
export function clearFavorites() {
  return enqueue(() => writeIds([]));
}
