'use client';

import { useEffect, useState } from 'react';

/**
 * Devuelve `value` recién después de que se mantuvo estable `delay` ms. Cada
 * cambio reinicia el timer, así que en cambios rápidos solo "gana" el último.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
