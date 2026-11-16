import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { QUOTES_BY_ID } from '../data/quotes';
import * as storage from '../db/storage';

const QuoteContext = createContext(null);

export function QuoteProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load saved favorites once. State is set from the async result, not synchronously.
  useEffect(() => {
    let active = true;
    storage.getFavorites().then((ids) => {
      if (!active) return;
      setFavoriteIds((current) => [...new Set([...ids, ...current])]);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const toggleFavorite = useCallback((id) => {
    // Optimistic update so every screen reacts instantly; storage catches up.
    setFavoriteIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
    storage.toggleFavorite(id).catch(() => {});
  }, []);

  const clearFavorites = useCallback(() => {
    setFavoriteIds([]);
    storage.clearFavorites().catch(() => {});
  }, []);

  const value = useMemo(() => {
    const favoriteSet = new Set(favoriteIds);
    return {
      loaded,
      favoriteIds,
      // Newest first, skipping ids that no longer exist in the data file.
      favorites: [...favoriteIds].reverse().map((id) => QUOTES_BY_ID[id]).filter(Boolean),
      isFavorite: (id) => favoriteSet.has(id),
      toggleFavorite,
      clearFavorites,
    };
  }, [favoriteIds, loaded, toggleFavorite, clearFavorites]);

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuotes() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error('useQuotes must be used inside <QuoteProvider>');
  return ctx;
}
