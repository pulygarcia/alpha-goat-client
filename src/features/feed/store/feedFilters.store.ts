import { create } from 'zustand';
import type { FeedScope } from '../types/feed.types';

interface FeedFiltersStore {
  /** Scope activo del feed. `null` = todas (sin filtro). */
  scope: FeedScope | null;
  /** Selecciona un scope; si ya estaba activo, lo deselecciona (vuelve a "todas"). */
  toggleScope: (scope: FeedScope) => void;
  /** Limpia el scope a "todas" (null), sin importar el valor previo. */
  clearScope: () => void;
}

export const useFeedFilters = create<FeedFiltersStore>()((set) => ({
  // Default "todas" (sin filtro): el feed arranca mostrando todo. Filtrar por
  // 'today' de entrada deja la lista vacía si no hubo reseñas hoy.
  scope: null,
  toggleScope: (scope) =>
    set((state) => ({ scope: state.scope === scope ? null : scope })),
  clearScope: () => set({ scope: null }),
}));
