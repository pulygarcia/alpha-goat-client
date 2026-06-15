import { create } from 'zustand';
import type { FeedScope } from '../types/feed.types';

interface FeedFiltersStore {
  /** Scope activo del feed. `null` = todas (sin filtro). */
  scope: FeedScope | null;
  /** Selecciona un scope; si ya estaba activo, lo deselecciona (vuelve a "todas"). */
  toggleScope: (scope: FeedScope) => void;
}

export const useFeedFilters = create<FeedFiltersStore>()((set) => ({
  scope: 'today',
  toggleScope: (scope) =>
    set((state) => ({ scope: state.scope === scope ? null : scope })),
}));
