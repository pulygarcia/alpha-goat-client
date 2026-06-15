import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import React from 'react';
import SignUpForm from './SignUpForm';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('../api/auth.api', () => ({
  authApi: { register: vi.fn() },
}));

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <SignUpForm />
    </QueryClientProvider>,
  );
}

describe('SignUpForm', () => {
  beforeEach(() => {
    pushMock.mockReset();
    useAuthStore.setState({ user: null });
    vi.mocked(authApi.register).mockReset();
  });

  const fakeUser = {
    id: '1',
    email: 'a@b.com',
    username: 'belgrano',
    avatarUrl: null,
    role: 'USER' as const,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('disables submit until the form is valid', async () => {
    renderForm();
    const submit = screen.getByRole('button', { name: /crear cuenta/i });
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/usuario/i), 'belgrano');
    await userEvent.type(screen.getByLabelText(/mail/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'short');
    expect(submit).toBeDisabled();

    await userEvent.clear(screen.getByLabelText(/contraseña/i));
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'longenough');
    expect(submit).toBeEnabled();
  });

  it('submits valid data and redirects to the feed', async () => {
    vi.mocked(authApi.register).mockResolvedValue({
      accessToken: 't',
      user: fakeUser,
    });

    renderForm();

    await userEvent.type(screen.getByLabelText(/usuario/i), 'belgrano');
    await userEvent.type(screen.getByLabelText(/mail/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'longenough');
    await userEvent.click(
      screen.getByRole('button', { name: /crear cuenta/i }),
    );

    expect(authApi.register).toHaveBeenCalledWith(
      { username: 'belgrano', email: 'a@b.com', password: 'longenough' },
      expect.anything(),
    );
    await vi.waitFor(() => expect(pushMock).toHaveBeenCalledWith('/feed'));
  });

  it('shows a friendly message on 409', async () => {
    const err = new AxiosError('Conflict', '409', undefined, null, {
      status: 409,
      statusText: 'Conflict',
      data: { message: 'email already taken' },
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    vi.mocked(authApi.register).mockRejectedValue(err);

    renderForm();

    await userEvent.type(screen.getByLabelText(/usuario/i), 'belgrano');
    await userEvent.type(screen.getByLabelText(/mail/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'longenough');
    await userEvent.click(
      screen.getByRole('button', { name: /crear cuenta/i }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /ya hay una cuenta/i,
    );
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('toggles password visibility when clicking the eye button', async () => {
    renderForm();
    const password = screen.getByLabelText(/contraseña/i);
    expect(password).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByRole('button', { name: /toggle/i }));
    expect(password).toHaveAttribute('type', 'text');
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
    vi.mocked(authApi.register).mockRejectedValue(rejection);
    renderForm();
    await userEvent.type(screen.getByLabelText(/usuario/i), 'belgrano');
    await userEvent.type(screen.getByLabelText(/mail/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'longenough');
    await userEvent.click(
      screen.getByRole('button', { name: /crear cuenta/i }),
    );
    return screen.findByRole('alert');
  }

  it('maps a 409 about the username to a taken-username message', async () => {
    const alert = await submitWith(
      axiosErr(409, { message: 'username already in use' }),
    );
    expect(alert).toHaveTextContent(/usuario ya está tomado/i);
  });

  it('passes through an unrecognized 409 message', async () => {
    const alert = await submitWith(
      axiosErr(409, { message: 'cuenta duplicada' }),
    );
    expect(alert).toHaveTextContent('cuenta duplicada');
  });

  it('surfaces a plain string message for non-409 errors', async () => {
    const alert = await submitWith(
      axiosErr(400, { message: 'Datos inválidos' }),
    );
    expect(alert).toHaveTextContent('Datos inválidos');
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
