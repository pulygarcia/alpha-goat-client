import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../api/stats.api';

export function useGlobalStats() {
  return useQuery({
    queryKey: ['stats', 'global'],
    queryFn: statsApi.global,
  });
}
