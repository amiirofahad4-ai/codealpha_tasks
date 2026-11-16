// The only module that talks to AsyncStorage.
// Every read/write is wrapped in try/catch so the app still works if storage fails.
// Writes run one after another (a small queue) so quick changes never overwrite each other.
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createSampleData } from '../data/samples';

const KEYS = {
  decks: '@flashmind/v1/decks',
  cards: '@flashmind/v1/cards',
  scores: '@flashmind/v1/scores',
};

async function read(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function write(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable: data stays in memory for this session
  }
}

let queue = Promise.resolve();
function enqueue(task) {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
}

// ---------- Decks ----------

export function getDecks() {
  return read(KEYS.decks, []);
}

// Adds a new deck or replaces the one with the same id.
export function saveDeck(deck) {
  return enqueue(async () => {
    const decks = await read(KEYS.decks, []);
    const exists = decks.some((d) => d.id === deck.id);
    await write(KEYS.decks, exists ? decks.map((d) => (d.id === deck.id ? deck : d)) : [...decks, deck]);
  });
}

// Deletes a deck, its cards and its score.
export function deleteDeck(id) {
  return enqueue(async () => {
    const [decks, cards, scores] = await Promise.all([
      read(KEYS.decks, []),
      read(KEYS.cards, []),
      read(KEYS.scores, {}),
    ]);
    delete scores[id];
    await Promise.all([
      write(KEYS.decks, decks.filter((d) => d.id !== id)),
      write(KEYS.cards, cards.filter((c) => c.deckId !== id)),
      write(KEYS.scores, scores),
    ]);
  });
}

// ---------- Cards ----------

// Cards of one deck, or all cards when no deckId is given.
export async function getCards(deckId) {
  const cards = await read(KEYS.cards, []);
  return deckId ? cards.filter((c) => c.deckId === deckId) : cards;
}

export function saveCard(card) {
  return enqueue(async () => {
    const cards = await read(KEYS.cards, []);
    const exists = cards.some((c) => c.id === card.id);
    await write(KEYS.cards, exists ? cards.map((c) => (c.id === card.id ? card : c)) : [...cards, card]);
  });
}

export function deleteCard(id) {
  return enqueue(async () => {
    const cards = await read(KEYS.cards, []);
    await write(KEYS.cards, cards.filter((c) => c.id !== id));
  });
}

// ---------- Scores (last result per deck) ----------

export async function getScore(deckId) {
  const scores = await read(KEYS.scores, {});
  return scores[deckId] ?? null;
}

export async function getScores() {
  return read(KEYS.scores, {});
}

export function saveScore(score) {
  return enqueue(async () => {
    const scores = await read(KEYS.scores, {});
    scores[score.deckId] = score;
    await write(KEYS.scores, scores);
  });
}

// ---------- Setup ----------

// Loads everything. On first launch (no decks saved yet) the sample decks are saved first.
export async function loadAll() {
  const saved = await read(KEYS.decks, null);
  if (saved === null) return resetSampleData();
  const [cards, scores] = await Promise.all([getCards(), getScores()]);
  return { decks: saved, cards, scores };
}

// Replaces all decks and cards with the samples and clears the scores.
export function resetSampleData() {
  const { decks, cards } = createSampleData();
  return enqueue(async () => {
    await Promise.all([write(KEYS.decks, decks), write(KEYS.cards, cards), write(KEYS.scores, {})]);
    return { decks, cards, scores: {} };
  });
}
