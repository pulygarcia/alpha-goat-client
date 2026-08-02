'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import InputGroup from './InputGroup';
import Link from 'next/link';
import { loginSchema, type LoginSchema } from '../schemas/login.schema';
import { useLogin } from '../hooks/useLogin';

type FormData = LoginSchema;

function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 401) return 'Mail o contraseña incorrectos.';
    const msg = (
      err.response?.data as { message?: string | string[] } | undefined
    )?.message;
    if (Array.isArray(msg)) return msg[0];
    if (typeof msg === 'string') return msg;
    if (err.code === 'ERR_NETWORK') return 'No pudimos contactar al servidor.';
  }
  return 'Algo salió mal. Probá de nuevo.';
}

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  function onSubmit(data: FormData) {
    login.mutate(data);
  }

  return (
    <div className="fade-in flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1
          className="text-ink leading-[1.1] font-medium tracking-[-0.022em]"
          style={{ fontSize: 'clamp(26px, 2.6vw, 32px)' }}
        >
          Iniciar sesión
        </h1>
        <p className="text-gris-400 mt-1.5 text-[0.88rem] leading-[1.4]">
          Bienvenido de vuelta a AlphaGoat.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <InputGroup
          label="Mail"
          type="email"
          placeholder="vos@dulcedeleche.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <InputGroup
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.password?.message}
          rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          onRightIcon={() => setShowPassword((v) => !v)}
          {...register('password')}
        />

        <div className="flex justify-end">
          <button
            type="button"
            className="text-gris-400 hover:text-curry-deep cursor-pointer text-[0.78rem] transition-colors"
          >
            Olvidé mi contraseña
          </button>
        </div>

        {login.isError && (
          <p role="alert" className="text-error text-[0.82rem]">
            {extractError(login.error)}
          </p>
        )}

        <button
          type="submit"
          disabled={!isValid || login.isPending}
          className="btn-solid mt-2 flex w-full cursor-pointer items-center justify-center rounded-full px-9 py-4 text-sm font-bold tracking-[0.06em] uppercase transition-all duration-200 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {login.isPending ? (
            <>
              <span className="spin-loader mr-2 inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent" />
              Ingresando…
            </>
          ) : (
            'Entrar →'
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-gris-400 text-center text-[0.82rem]">
        ¿Todavía no tenés cuenta?{' '}
        <Link
          href="/register"
          className="text-curry-deep underline-offset-2 hover:underline"
        >
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
