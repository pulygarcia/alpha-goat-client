import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { AxiosError, type InternalAxiosRequestConfig } from 'axios';

vi.mock('@/config/env', () => ({
  env: { NEXT_PUBLIC_API_URL: 'http://localhost:3001' },
}));

import { apiClient } from './api-client';

type InterceptorHandler = {
  fulfilled: (value: unknown) => unknown;
  rejected: (error: unknown) => unknown;
};

// The interceptor registered in api-client.ts is the only one on this instance.
const interceptor = (
  apiClient.interceptors.response as unknown as {
    handlers: InterceptorHandler[];
  }
).handlers[0];

function axiosError(status: number, url: string): AxiosError {
  return new AxiosError(
    'request failed',
    'ERR_BAD_RESPONSE',
    { url } as InternalAxiosRequestConfig,
    undefined,
    { status } as AxiosError['response'],
  );
}

const dispatchSpy = vi.spyOn(window, 'dispatchEvent').mockReturnValue(true);

describe('apiClient response interceptor', () => {
  beforeEach(() => {
    dispatchSpy.mockClear();
  });

  afterAll(() => {
    dispatchSpy.mockRestore();
  });

  it('passes successful responses through unchanged', () => {
    const res = { data: { ok: true } };
    expect(interceptor.fulfilled(res)).toBe(res);
  });

  it('dispatches auth:unauthorized on a 401 from a non-auth call', async () => {
    await expect(
      interceptor.rejected(axiosError(401, '/feed')),
    ).rejects.toBeInstanceOf(AxiosError);
    expect(dispatchSpy).toHaveBeenCalledOnce();
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe('auth:unauthorized');
  });

  it('does not dispatch on a 401 from an auth call (login/register/me)', async () => {
    for (const url of ['/auth/login', '/auth/register', '/auth/me']) {
      await expect(
        interceptor.rejected(axiosError(401, url)),
      ).rejects.toBeTruthy();
    }
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('does not dispatch on a non-401 error', async () => {
    await expect(
      interceptor.rejected(axiosError(500, '/feed')),
    ).rejects.toBeTruthy();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('re-rejects non-axios errors without dispatching', async () => {
    const plain = new Error('boom');
    await expect(interceptor.rejected(plain)).rejects.toBe(plain);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
