'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import InputGroup from './InputGroup'
import PasswordStrength from './PasswordStrength'
import Link from 'next/link'
import { registerSchema, type RegisterSchema } from '../schemas/register.schema'
import { useRegister } from '../hooks/useRegister'

type FormData = RegisterSchema

function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    const raw = (err.response?.data as { message?: string | string[] } | undefined)?.message
    const msg = Array.isArray(raw) ? raw[0] : raw
    if (status === 409) {
      const lower = msg?.toLowerCase() ?? ''
      if (lower.includes('username') || lower.includes('usuario')) {
        return 'Ese usuario ya está tomado.'
      }
      if (lower.includes('email') || lower.includes('mail') || lower.includes('correo')) {
        return 'Ya hay una cuenta con ese mail.'
      }
      return msg ?? 'Ese usuario o mail ya está registrado.'
    }
    if (typeof msg === 'string') return msg
    if (err.code === 'ERR_NETWORK') return 'No pudimos contactar al servidor.'
  }
  return 'Algo salió mal. Probá de nuevo.'
}

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)
  const signup = useRegister()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  })

  const passwordValue = watch('password', '')

  function onSubmit(data: FormData) {
    signup.mutate(data)
  }

  return (
    <div className="fade-in flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1
          className="font-medium leading-[1.1] tracking-[-0.022em]"
          style={{ fontSize: 'clamp(26px, 2.6vw, 32px)', color: '#fdf6e8' }}
        >
          Crear nuevo perfil
        </h1>
        <p className="mt-1.5 text-[0.88rem] leading-[1.4]" style={{ color: 'rgba(246,201,119,0.55)' }}>
          Ingresá tus datos básicos para empezar el viaje.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <InputGroup
          label="Usuario"
          placeholder="belgrano.mitre"
          error={errors.username?.message}
          helper="Letras, números, _ y . — entre 3 y 50."
          {...register('username')}
        />

        <InputGroup
          label="Mail"
          type="email"
          placeholder="vos@dulcedeleche.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="flex flex-col gap-2">
          <InputGroup
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            error={errors.password?.message}
            helper="Mínimo 8 caracteres."
            rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            onRightIcon={() => setShowPassword((v) => !v)}
            {...register('password')}
          />
          <PasswordStrength value={passwordValue} />
        </div>

        {signup.isError && (
          <p role="alert" className="text-[0.82rem]" style={{ color: '#ff9b6b' }}>
            {extractError(signup.error)}
          </p>
        )}

        <button
          type="submit"
          disabled={!isValid || signup.isPending}
          className="btn-curry-lg mt-2 w-full cursor-pointer justify-center disabled:cursor-not-allowed disabled:opacity-40 !text-[#fdf6e8]"
        >
          {signup.isPending ? (
            <>
              <span
                className="spin-loader mr-2 inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent"
              />
              Emitiendo ficha…
            </>
          ) : (
            'Crear cuenta →'
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-[0.82rem]" style={{ color: 'rgba(246,201,119,0.45)' }}>
        ¿Ya sos del Instituto?{' '}
        <Link href="/login" className="underline-offset-2 hover:underline" style={{ color: '#fdf6e8' }}>
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
