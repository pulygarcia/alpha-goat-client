'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useChangePassword } from '../hooks/useChangePassword';
import {
  passwordSchema,
  usernameSchema,
  type PasswordSchema,
  type UsernameSchema,
} from '../schemas/editProfile.schema';

type Section = 'profile' | 'password';

const inputClass =
  'w-full rounded-[10px] border border-[rgba(74,30,8,0.18)] bg-paper px-3 py-2 text-[14px] text-ink outline-none focus:border-[#3a1808]';
const labelClass = 'text-cinnamon mb-1 block text-[12px] font-semibold';
const errorClass = 'text-sienna mt-1 text-[12px]';
// Chocolate casi negro; el hover apenas levanta el brillo (un toque cálido, sin saturar).
const submitClass =
  'text-paper mt-2 inline-flex h-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#3a1808] to-[#1c0a03] px-5 text-[13px] font-semibold tracking-[0.03em] uppercase transition-[filter] hover:brightness-125 disabled:opacity-60';

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'pb-2 text-[13px] font-semibold transition-colors ' +
        (active
          ? 'text-ink border-b-2 border-[#3a1808]'
          : 'text-cinnamon hover:text-ink border-b-2 border-transparent')
      }
    >
      {children}
    </button>
  );
}

function ProfileSection({ username }: { username: string }) {
  const update = useUpdateProfile();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsernameSchema>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { username },
    mode: 'onChange',
  });

  return (
    <form onSubmit={handleSubmit((data) => update.mutate(data))}>
      <label htmlFor="edit-username" className={labelClass}>
        Nombre de usuario
      </label>
      <input
        id="edit-username"
        className={inputClass}
        {...register('username')}
      />
      {errors.username && (
        <p className={errorClass}>{errors.username.message}</p>
      )}

      <div>
        <button
          type="submit"
          disabled={update.isPending}
          className={submitClass}
        >
          {update.isPending ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

function PasswordSection() {
  const change = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordSchema>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
  });

  return (
    <form
      onSubmit={handleSubmit((data) =>
        change.mutate(data, { onSuccess: () => reset() }),
      )}
    >
      <label htmlFor="current-password" className={labelClass}>
        Contraseña actual
      </label>
      <input
        id="current-password"
        type="password"
        className={inputClass}
        {...register('currentPassword')}
      />
      {errors.currentPassword && (
        <p className={errorClass}>{errors.currentPassword.message}</p>
      )}

      <label htmlFor="new-password" className={`${labelClass} mt-3`}>
        Nueva contraseña
      </label>
      <input
        id="new-password"
        type="password"
        className={inputClass}
        {...register('newPassword')}
      />
      {errors.newPassword && (
        <p className={errorClass}>{errors.newPassword.message}</p>
      )}

      <div>
        <button
          type="submit"
          disabled={change.isPending}
          className={submitClass}
        >
          {change.isPending ? 'Cambiando...' : 'Cambiar contraseña'}
        </button>
      </div>
    </form>
  );
}

/**
 * Modal de edición del perfil propio. Dos secciones (perfil / contraseña) con
 * transición animada entre ellas (`AnimatePresence`, respeta reduced-motion).
 */
export function EditProfileModal({
  open,
  onOpenChange,
  username,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
}) {
  const [section, setSection] = useState<Section>('profile');
  const reduce = useReducedMotion();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-paper-raised text-ink max-w-[440px] border-0">
        {/* Apertura con un leve fade + subida. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>

          <div className="mt-4 mb-5 flex gap-5 border-b border-[rgba(74,30,8,0.14)]">
            <TabButton
              active={section === 'profile'}
              onClick={() => setSection('profile')}
            >
              Perfil
            </TabButton>
            <TabButton
              active={section === 'password'}
              onClick={() => setSection('password')}
            >
              Contraseña
            </TabButton>
          </div>

          {/* Cambio de sección: el contenido viejo se desmonta al instante (no
              hay AnimatePresence) y el nuevo entra con un fade+slide → sin
              superposición ni parpadeo. La `key` fuerza el remonte por sección. */}
          <motion.div
            key={section}
            initial={reduce ? false : { opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            {section === 'profile' ? (
              <ProfileSection username={username} />
            ) : (
              <PasswordSection />
            )}
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
