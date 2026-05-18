import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import React from 'react';
import LoginForm from './LoginForm';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: () => null }),
}));

vi.mock('../api/auth.api', () => ({
  authApi: { login: vi.fn() },
}));

function renderForm() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <LoginForm />
    </QueryClientProvider>,
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    pushMock.mockReset();
    useAuthStore.setState({ user: null });
    vi.mocked(authApi.login).mockReset();
  });

  it('keeps the submit button disabled until the form is valid', async () => {
    renderForm();
    const submit = screen.getByRole('button', { name: /entrar/i });
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/mail/i), 'no-mail');
    expect(submit).toBeDisabled();

    await userEvent.clear(screen.getByLabelText(/mail/i));
    await userEvent.type(screen.getByLabelText(/mail/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'secret');
    expect(submit).toBeEnabled();
  });

  it('submits valid credentials and shows the success screen', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 't',
      user: { id: '1', email: 'a@b.com', username: 'a', avatarUrl: null, role: 'USER', createdAt: '2026-01-01T00:00:00.000Z' },
    });

    renderForm();

    await userEvent.type(screen.getByLabelText(/mail/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(authApi.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret' }, expect.anything());
    expect(await screen.findByText(/de vuelta por acá/i)).toBeInTheDocument();
    expect(pushMock).toHaveBeenCalledWith('/feed');
  });

  it('shows a friendly message on 401', async () => {
    const err = new AxiosError('Unauthorized', '401', undefined, null, {
      status: 401,
      statusText: 'Unauthorized',
      data: { message: 'nope' },
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    vi.mocked(authApi.login).mockRejectedValue(err);

    renderForm();

    await userEvent.type(screen.getByLabelText(/mail/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/incorrectos/i);
    expect(pushMock).not.toHaveBeenCalled();
  });
});
