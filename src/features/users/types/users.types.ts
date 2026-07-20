import type { Paginated } from '@/shared/types/api.types';

// --- GET /users?q= (buscador de usuarios, requiere auth) ---

export interface UserSearchResult {
  id: string;
  username: string;
  avatarUrl: string | null;
  isFollowing: boolean;
}

export type PaginatedUserSearchResults = Paginated<UserSearchResult>;
