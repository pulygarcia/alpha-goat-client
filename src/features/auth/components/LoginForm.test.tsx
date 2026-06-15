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
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
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

  it('submits valid credentials and redirects to the feed', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      user: {
        id: '1',
        email: 'a@b.com',
        username: 'a',
        avatarUrl: null,
        role: 'USER',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    });

    renderForm();

    await userEvent.type(screen.getByLabelText(/mail/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(authApi.login).toHaveBeenCalledWith(
      { email: 'a@b.com', password: 'secret' },
      expect.anything(),
    );
    await vi.waitFor(() => expect(pushMock).toHaveBeenCalledWith('/feed'));
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

  it('toggles password visibility when clicking the eye button', async () => {
    renderForm();
    const password = screen.getByLabelText(/contraseña/i);
    expect(password).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByRole('button', { name: /toggle/i }));
    expect(password).toHaveAttribute('type', 'text');

    await userEvent.click(screen.getByRole('button', { name: /toggle/i }));
    expect(password).toHaveAttribute('type', 'password');
  });

  function axiosErr(
    status: number | undefined,
    data: unknown,
    code = 'ERR_BAD_RESPONSE',
  ) {
    return new AxiosError(
      'err',
      code,
      { headers: new AxiosHeaders() } as never,
      null,
      status === undefined
        ? undefined
        : ({
            status,
            statusText: '',
            data,
            headers: {},
            config: { headers: new AxiosHeaders() },
          } as never),
    );
  }

  async function submitWith(rejection: unknown) {
    vi.mocked(authApi.login).mockRejectedValue(rejection);
    renderForm();
    await userEvent.type(screen.getByLabelText(/mail/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    return screen.findByRole('alert');
  }

  it('surfaces the first message when the error body is an array', async () => {
    const alert = await submitWith(
      axiosErr(400, { message: ['Campo inválido', 'otro'] }),
    );
    expect(alert).toHaveTextContent('Campo inválido');
  });

  it('surfaces a plain string message from the error body', async () => {
    const alert = await submitWith(
      axiosErr(400, { message: 'Servidor caído' }),
    );
    expect(alert).toHaveTextContent('Servidor caído');
  });

  it('shows a network message when the request never reaches the server', async () => {
    const alert = await submitWith(
      axiosErr(undefined, undefined, 'ERR_NETWORK'),
    );
    expect(alert).toHaveTextContent(/no pudimos contactar/i);
  });

  it('falls back to a generic message for non-axios errors', async () => {
    const alert = await submitWith(new Error('boom'));
    expect(alert).toHaveTextContent(/algo salió mal/i);
  });
});
