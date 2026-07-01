'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { UserAvatar } from '@/shared/components/UserAvatar';

interface ProfileAvatarModalProps {
  avatarUrl: string | null;
  username: string;
  /** Clases de la miniatura (forma/borde), heredadas del sidebar. */
  className?: string;
}

/**
 * Avatar del perfil clickeable: al tocarlo abre un modal con la foto ampliada.
 * Reusa `UserAvatar` en ambos lados para respetar el fallback (imagen del gato)
 * cuando el usuario no tiene avatar.
 */
export function ProfileAvatarModal({
  avatarUrl,
  username,
  className,
}: ProfileAvatarModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Ver la foto de ${username} en grande`}
        className="block cursor-zoom-in rounded-full transition-opacity outline-none hover:opacity-90"
      >
        <UserAvatar
          avatarUrl={avatarUrl}
          username={username}
          className={className}
        />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-paper-raised flex max-w-md items-center justify-center border-[rgba(74,30,8,0.22)] p-4">
          <DialogHeader className="sr-only">
            <DialogTitle>Foto de {username}</DialogTitle>
            <DialogDescription>Imagen de perfil ampliada.</DialogDescription>
          </DialogHeader>
          <UserAvatar
            avatarUrl={avatarUrl}
            username={username}
            className="max-h-[70vh] w-full rounded-2xl object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
