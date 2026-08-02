'use client';

import { useEffect, useState } from 'react';
import { Hero } from './Hero';
import { WelcomeScreen } from './WelcomeScreen';

const WELCOME_SEEN_KEY = 'ag-welcome-seen';

/**
 * La bienvenida se muestra una sola vez: se decide en un efecto
 * (localStorage) para no arriesgar un mismatch de hidratación, así que hay
 * un frame donde no se renderiza nada todavía.
 */
export function HomeExperience() {
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    const alreadySeen = window.localStorage.getItem(WELCOME_SEEN_KEY) === '1';
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot resolution of the localStorage check, not a cascading update
    setShowWelcome(!alreadySeen);
  }, []);

  function handleStart() {
    window.localStorage.setItem(WELCOME_SEEN_KEY, '1');
    setShowWelcome(false);
  }

  if (showWelcome === null) {
    return <div className="bg-blanco-tibio min-h-[100dvh]" />;
  }

  return showWelcome ? <WelcomeScreen onStart={handleStart} /> : <Hero />;
}
