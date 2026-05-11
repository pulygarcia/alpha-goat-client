import axios from 'axios';
import { env } from '@/config/env';

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    return Promise.reject(err);
  },
);
