'use client';

import { useCallback, useEffect, useState } from 'react';

const TOUR_KEY = 'ag-feed-fab-tour-seen';

/**
 * Igual patrón que `HomeExperience`: se resuelve en un efecto (localStorage)
 * para no arriesgar un mismatch de hidratación, así que hay un frame donde
 * `seen` es `null`.
 */
export function useFeedTourSeen(): {
  seen: boolean | null;
  markSeen: () => void;
} {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    const alreadySeen = window.localStorage.getItem(TOUR_KEY) === '1';
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resolución única del check de localStorage, no un update en cascada
    setSeen(alreadySeen);
  }, []);

  const markSeen = useCallback(() => {
    window.localStorage.setItem(TOUR_KEY, '1');
    setSeen(true);
  }, []);

  return { seen, markSeen };
}
