'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import InputGroup from './InputGroup'
import PasswordStrength from './PasswordStrength'
import Link from 'next/link'

const schema = z.object({
  firstName: z.string().min(1, 'Requerido'),
  lastName: z.string().min(1, 'Requerido'),
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type FormData = z.infer<typeof schema>

type Status = 'idle' | 'submitting' | 'success'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-curry-soft">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.28.07 2.18.74 2.95.8.94-.19 1.84-.89 3.06-.95 1.5-.08 2.59.61 3.32 1.56-3.01 1.8-2.5 5.74.32 6.9-.52 1.39-1.21 2.75-1.65 4.57zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  )
}

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [submittedName, setSubmittedName] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const passwordValue = watch('password', '')

  function onSubmit(data: FormData) {
    setStatus('submitting')
    setSubmittedName(data.firstName)
    setTimeout(() => setStatus('success'), 1200)
  }

  if (status === 'success') {
    return (
      <div className="fade-in flex flex-col items-center gap-6 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
          style={{ background: 'rgba(244,160,43,0.12)' }}
        >
          ✓
        </div>
        <div>
          <h1
            className="font-medium leading-[1.1] tracking-[-0.022em]"
            style={{ fontSize: 'clamp(26px, 2.6vw, 32px)', color: '#fdf6e8' }}
          >
            ¡Bienvenido, {submittedName}!
          </h1>
          <p className="mt-2 text-[0.88rem] leading-[1.4]" style={{ color: 'rgba(246,201,119,0.55)' }}>
            Tu ficha quedó emitida. Empezá reseñando el primer alfajor — necesitamos al menos uno para armar tu radar.
          </p>
        </div>
        <button className="btn-curry-lg">
          Empezar a calificar →
        </button>
      </div>
    )
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
        <div className="grid gap-4 sm:grid-cols-2">
          <InputGroup
            label="Nombre"
            placeholder="Belgrano"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <InputGroup
            label="Apellido"
            placeholder="Mitre"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

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

        <button
          type="submit"
          disabled={!isValid || status === 'submitting'}
          className="btn-curry-lg mt-2 w-full cursor-pointer justify-center disabled:cursor-not-allowed disabled:opacity-40 !text-[#fdf6e8]"
        >
          {status === 'submitting' ? (
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
