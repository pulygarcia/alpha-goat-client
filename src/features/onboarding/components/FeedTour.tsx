'use client';

import { useEffect, useState } from 'react';
import { Joyride, type EventData, type Step } from 'react-joyride';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { useFeedTourSeen } from '../hooks/useFeedTourSeen';

const STEPS: Step[] = [
  {
    target: '[data-tour="feed-fab"]',
    content: 'Clickeá el alfajor flotante para hacer una reseña rápido.',
    placement: 'top',
    skipBeacon: true,
  },
];

const SHOW_DELAY_MS = 600;

/**
 * Tour de un solo paso apuntando al `ReviewFab`, mobile only. `forceClose`
 * lo cierra y lo marca visto cuando el caller (el propio FAB) abre el
 * quick-review — el objetivo del tour ya se cumplió, no hace falta que el
 * usuario interactúe con el tooltip.
 */
export function FeedTour({ forceClose }: { forceClose: boolean }) {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const { seen, markSeen } = useFeedTourSeen();
  const [ready, setReady] = useState(false);

  const eligible = isMobile && seen === false;

  useEffect(() => {
    // No hace falta volver a `false`: si `eligible` se apaga es porque
    // `markSeen` ya corrió, y este componente queda oculto para siempre.
    if (!eligible || forceClose) return;
    const id = setTimeout(() => setReady(true), SHOW_DELAY_MS);
    return () => clearTimeout(id);
  }, [eligible, forceClose]);

  useEffect(() => {
    if (forceClose && seen === false) markSeen();
  }, [forceClose, seen, markSeen]);

  if (!eligible || forceClose || !ready) return null;

  function handleEvent(data: EventData) {
    if (data.status === 'finished' || data.status === 'skipped') {
      markSeen();
    }
  }

  return (
    <Joyride
      steps={STEPS}
      run
      continuous={false}
      onEvent={handleEvent}
      locale={{ close: 'Cerrar', last: 'Entendido' }}
      options={{
        buttons: ['close'],
        arrowColor: 'var(--color-blanco-tibio)',
        backgroundColor: 'var(--color-blanco-tibio)',
        textColor: 'var(--color-ink)',
        primaryColor: 'var(--color-curry)',
        overlayColor: 'color-mix(in oklab, var(--color-ink) 55%, transparent)',
        zIndex: 60,
      }}
    />
  );
}
