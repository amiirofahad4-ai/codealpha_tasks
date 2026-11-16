/**
 * Picks a random item from `list`, never returning the item whose id is
 * `excludeId` (unless it is the only item available).
 */
export function pickRandom(list, excludeId) {
  if (!list.length) return null;
  const pool = list.length > 1 ? list.filter((item) => item.id !== excludeId) : list;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Same quote for the whole local calendar day, different on the next day. */
export function getQuoteOfTheDay(list, date = new Date()) {
  if (!list.length) return null;
  const dayNumber = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000,
  );
  // Multiply by a prime so consecutive days don't show neighbouring quotes.
  return list[(dayNumber * 7919) % list.length];
}
