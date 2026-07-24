'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { FollowButton } from '@/features/follows/components/FollowButton';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useSuggestedUsers } from '../hooks/useSuggestedUsers';
import { useUsersSearch } from '../hooks/useUsersSearch';

/**
 * Buscador global de usuarios (modal centrado, disparado por el ícono lupa
 * del `AppHeader`). Input debounced contra `GET /users?q=`; cada fila lleva
 * su propio `FollowButton` y navega al perfil al hacer click.
 */
export function UserSearchModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [text, setText] = useState('');
  const q = useDebouncedValue(text, 300).trim();
  const { data: users = [], isLoading } = useUsersSearch(q);
  const { data: suggested = [] } = useSuggestedUsers(open && q.length === 0);

  function goToProfile(username: string) {
    onOpenChange(false);
    setText('');
    router.push(`/u/${username}`);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setText('');
      }}
    >
      <DialogContent className="top-[20%] max-w-md translate-y-0 gap-3 border-none px-4 pt-4 pb-4 [&>button]:hidden">
        <DialogTitle className="sr-only">Buscar usuarios</DialogTitle>

        <label className="bg-paper-sunken focus-within:border-cinnamon flex h-11 items-center gap-2 rounded-[10px] border-[1.5px] border-[rgba(74,30,8,0.22)] px-3 transition-colors">
          <Search className="text-cinnamon h-4 w-4" strokeWidth={2} />
          <input
            autoFocus
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Buscá por nombre de usuario"
            className="text-ink h-full flex-1 bg-transparent text-[14px] placeholder:text-[rgba(44,18,9,0.55)] focus:outline-none"
          />
        </label>

        <ul className="max-h-[50vh] overflow-y-auto">
          {q.length === 0 && suggested.length > 0 && (
            <li
              className="text-sienna px-1 pt-1 pb-2 text-[11px] font-semibold tracking-[0.08em] uppercase"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Sugeridos
            </li>
          )}

          {q.length === 0 && suggested.length === 0 && (
            <li className="text-sienna px-1 py-3 text-[13px]">
              Escribí un nombre de usuario para buscar.
            </li>
          )}

          {q.length > 0 && isLoading && (
            <li className="text-sienna px-1 py-3 text-[13px]">Buscando...</li>
          )}

          {q.length > 0 && !isLoading && users.length === 0 && (
            <li className="text-sienna px-1 py-3 text-[13px]">
              No encontramos “{q}”.
            </li>
          )}

          {(q.length === 0 ? suggested : users).map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-3 rounded-[8px] px-1 py-2 transition-colors hover:bg-black/[0.03]"
            >
              <button
                type="button"
                onClick={() => goToProfile(user.username)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <UserAvatar
                  avatarUrl={user.avatarUrl}
                  username={user.username}
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
                <span className="text-ink text-[14px] font-medium">
                  {user.username}
                </span>
              </button>
              <FollowButton userId={user.id} isFollowing={user.isFollowing} />
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
