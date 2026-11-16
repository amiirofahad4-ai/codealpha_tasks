// Holds decks, cards and scores in memory so every screen updates instantly.
// Each action updates state first, then saves through src/db/storage.js.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as db from '../db/storage';

const FlashContext = createContext(null);

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function FlashProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [decks, setDecks] = useState([]);
  const [cards, setCards] = useState([]);
  const [scores, setScores] = useState({});

  useEffect(() => {
    let alive = true;
    db.loadAll().then((data) => {
      if (!alive) return;
      setDecks(data.decks);
      setCards(data.cards);
      setScores(data.scores);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // ---- Decks ----
  const addDeck = useCallback((name, color) => {
    const deck = { id: newId(), name: name.trim(), color, createdAt: Date.now() };
    setDecks((prev) => [...prev, deck]);
    db.saveDeck(deck);
    return deck.id;
  }, []);

  const updateDeck = useCallback(
    (id, patch) => {
      const current = decks.find((d) => d.id === id);
      if (!current) return;
      const deck = { ...current, ...patch };
      setDecks((prev) => prev.map((d) => (d.id === id ? deck : d)));
      db.saveDeck(deck);
    },
    [decks]
  );

  const removeDeck = useCallback((id) => {
    setDecks((prev) => prev.filter((d) => d.id !== id));
    setCards((prev) => prev.filter((c) => c.deckId !== id));
    setScores((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    db.deleteDeck(id);
  }, []);

  // ---- Cards ----
  const addCard = useCallback((deckId, question, answer) => {
    const card = { id: newId(), deckId, question: question.trim(), answer: answer.trim(), createdAt: Date.now() };
    setCards((prev) => [...prev, card]);
    db.saveCard(card);
    return card.id;
  }, []);

  const updateCard = useCallback(
    (id, question, answer) => {
      const current = cards.find((c) => c.id === id);
      if (!current) return;
      const card = { ...current, question: question.trim(), answer: answer.trim() };
      setCards((prev) => prev.map((c) => (c.id === id ? card : c)));
      db.saveCard(card);
    },
    [cards]
  );

  const removeCard = useCallback((id) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    db.deleteCard(id);
  }, []);

  // ---- Scores ----
  const recordScore = useCallback((deckId, correct, total) => {
    const score = { deckId, correct, total, date: Date.now() };
    setScores((prev) => ({ ...prev, [deckId]: score }));
    db.saveScore(score);
  }, []);

  // ---- Reset ----
  const resetSamples = useCallback(async () => {
    const data = await db.resetSampleData();
    setDecks(data.decks);
    setCards(data.cards);
    setScores(data.scores);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      decks,
      cards,
      scores,
      addDeck,
      updateDeck,
      removeDeck,
      addCard,
      updateCard,
      removeCard,
      recordScore,
      resetSamples,
    }),
    [ready, decks, cards, scores, addDeck, updateDeck, removeDeck, addCard, updateCard, removeCard, recordScore, resetSamples]
  );

  return <FlashContext.Provider value={value}>{children}</FlashContext.Provider>;
}

export function useFlash() {
  const ctx = useContext(FlashContext);
  if (!ctx) throw new Error('useFlash must be used inside <FlashProvider>');
  return ctx;
}

// Cards of one deck, in the order they were added
export function useDeckCards(deckId) {
  const { cards } = useFlash();
  return useMemo(() => cards.filter((c) => c.deckId === deckId), [cards, deckId]);
}
