import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import React from 'react';
import { useModerateAlfajor } from './useModerateAlfajor';
import { moderationApi } from '../api/moderation.api';
import { notifyError, notifySuccess } from '@/shared/lib/toast';

vi.mock('../api/moderation.api', () => ({
  moderationApi: { getPending: vi.fn(), approve: vi.fn(), reject: vi.fn() },
}));
vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

function axios400() {
  return new AxiosError('Bad Request', '400', undefined, undefined, {
    status: 400,
    statusText: 'Bad Request',
    data: {},
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  });
}

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(client, 'invalidateQueries');
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
  return { wrapper, invalidateSpy };
}

beforeEach(() => {
  vi.mocked(moderationApi.approve).mockReset();
  vi.mocked(moderationApi.reject).mockReset();
  vi.mocked(notifySuccess).mockReset();
  vi.mocked(notifyError).mockReset();
});

describe('useModerateAlfajor', () => {
  it('approves, toasts success and invalidates the queue', async () => {
    vi.mocked(moderationApi.approve).mockResolvedValue({
      id: 'a1',
    } as never);
    const { wrapper, invalidateSpy } = setup();

    const { result } = renderHook(() => useModerateAlfajor(), { wrapper });
    result.current.mutate({ id: 'a1', action: 'approve' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(moderationApi.approve).toHaveBeenCalledWith('a1', undefined);
    expect(notifySuccess).toHaveBeenCalledWith('Alfajor aprobado');
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['admin', 'pending'],
    });
  });

  it('forwards the marcaId when approving a free-brand proposal', async () => {
    vi.mocked(moderationApi.approve).mockResolvedValue({ id: 'a1' } as never);
    const { wrapper } = setup();

    const { result } = renderHook(() => useModerateAlfajor(), { wrapper });
    result.current.mutate({ id: 'a1', action: 'approve', marcaId: 'm1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(moderationApi.approve).toHaveBeenCalledWith('a1', 'm1');
  });

  it('rejects with the reason and toasts success', async () => {
    vi.mocked(moderationApi.reject).mockResolvedValue({ id: 'a1' } as never);
    const { wrapper } = setup();

    const { result } = renderHook(() => useModerateAlfajor(), { wrapper });
    result.current.mutate({
      id: 'a1',
      action: 'reject',
      rejectionReason: 'Duplicado',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(moderationApi.reject).toHaveBeenCalledWith('a1', 'Duplicado');
    expect(notifySuccess).toHaveBeenCalledWith('Alfajor rechazado');
  });

  it('on 400 (already moderated) shows the specific toast and refetches the queue', async () => {
    vi.mocked(moderationApi.approve).mockRejectedValue(axios400());
    const { wrapper, invalidateSpy } = setup();

    const { result } = renderHook(() => useModerateAlfajor(), { wrapper });
    result.current.mutate({ id: 'a1', action: 'approve' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifyError).toHaveBeenCalledWith('Ese alfajor ya fue moderado');
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['admin', 'pending'],
    });
  });

  it('on any other error shows the generic toast and does not invalidate', async () => {
    vi.mocked(moderationApi.approve).mockRejectedValue(new Error('boom'));
    const { wrapper, invalidateSpy } = setup();

    const { result } = renderHook(() => useModerateAlfajor(), { wrapper });
    result.current.mutate({ id: 'a1', action: 'approve' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifyError).toHaveBeenCalledWith(
      'No pudimos moderar el alfajor. Probá de nuevo.',
    );
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
