'use client';

import { useEffect, useRef, useState } from 'react';
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
import { useUploadAvatar } from '../hooks/useUploadAvatar';
import {
  avatarFileSchema,
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

function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

/**
 * Avatar con flujo preview + confirmar: elegir archivo muestra una vista previa
 * local (objectURL); "Guardar foto" dispara la subida; "Cancelar" descarta.
 * Valida tipo/tamaño client-side (espeja el pipe del back) antes de previsualizar.
 */
function AvatarSection({
  username,
  avatarUrl,
}: {
  username: string;
  avatarUrl: string | null;
}) {
  const upload = useUploadAvatar();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Liberar el objectURL del preview al reemplazarlo o desmontar.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const shownUrl = previewUrl ?? avatarUrl;

  function clearPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    const parsed = avatarFileSchema.safeParse(picked);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setError(null);
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
  }

  function onSave() {
    if (!file) return;
    upload.mutate(file, { onSuccess: () => clearPreview() });
  }

  return (
    <div className="mb-5 flex items-center gap-4">
      {shownUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={shownUrl}
          alt={username}
          className="h-16 w-16 rounded-full border border-[rgba(74,30,8,0.18)] object-cover"
        />
      ) : (
        <div
          className="text-paper flex h-16 w-16 items-center justify-center rounded-full text-[20px] font-bold"
          style={{
            background:
              'linear-gradient(135deg, var(--color-curry), var(--color-curry-bright))',
          }}
        >
          {initials(username)}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label
          htmlFor="avatar-file"
          className="text-ink inline-flex h-9 w-fit cursor-pointer items-center rounded-[10px] border border-[rgba(74,30,8,0.18)] bg-paper px-3 text-[13px] font-semibold transition-colors hover:border-[#3a1808]"
        >
          Cambiar foto
        </label>
        <input
          ref={inputRef}
          id="avatar-file"
          type="file"
          aria-label="Foto de perfil"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={onPick}
        />
        {error && <p className={errorClass}>{error}</p>}

        {file && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={upload.isPending}
              className={submitClass + ' mt-0'}
            >
              {upload.isPending ? 'Subiendo...' : 'Guardar foto'}
            </button>
            <button
              type="button"
              onClick={clearPreview}
              disabled={upload.isPending}
              className="text-cinnamon hover:text-ink h-10 px-2 text-[13px] font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileSection({
  username,
  avatarUrl,
}: {
  username: string;
  avatarUrl: string | null;
}) {
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
      <AvatarSection username={username} avatarUrl={avatarUrl} />

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
  avatarUrl,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  avatarUrl: string | null;
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
              <ProfileSection username={username} avatarUrl={avatarUrl} />
            ) : (
              <PasswordSection />
            )}
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
