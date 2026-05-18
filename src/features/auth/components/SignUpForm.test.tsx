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
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
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

  it('submits valid data and shows the success screen', async () => {
    vi.mocked(authApi.register).mockResolvedValue({ accessToken: 't', user: fakeUser });

    renderForm();

    await userEvent.type(screen.getByLabelText(/usuario/i), 'belgrano');
    await userEvent.type(screen.getByLabelText(/mail/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'longenough');
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(authApi.register).toHaveBeenCalledWith(
      { username: 'belgrano', email: 'a@b.com', password: 'longenough' },
      expect.anything(),
    );
    expect(await screen.findByText(/¡bienvenido, belgrano/i)).toBeInTheDocument();
    expect(pushMock).toHaveBeenCalledWith('/feed');
  });

  it('shows a friendly message on 409', async () => {
    const err = new AxiosError('Conflict', '409', undefined, null, {
      status: 409,
      statusText: 'Conflict',
      data: { message: 'taken' },
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    vi.mocked(authApi.register).mockRejectedValue(err);

    renderForm();

    await userEvent.type(screen.getByLabelText(/usuario/i), 'belgrano');
    await userEvent.type(screen.getByLabelText(/mail/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'longenough');
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/ya hay una cuenta/i);
    expect(pushMock).not.toHaveBeenCalled();
  });
});
