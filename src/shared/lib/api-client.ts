import axios from 'axios';
import { env } from '@/config/env';

// En el browser pegamos a `/api`, que el rewrite de `next.config.ts` proxea a
// la API: mismo origen, cookie first-party. En el server no hay proxy que
// valga (la request no pasa por el front), asi que va la URL absoluta.
const baseURL =
  typeof window === 'undefined' ? env.NEXT_PUBLIC_API_URL : '/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/me'];

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      const url = err.config?.url ?? '';
      const isAuthCall = AUTH_PATHS.some((p) => url.includes(p));
      if (!isAuthCall && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(err);
  },
);
