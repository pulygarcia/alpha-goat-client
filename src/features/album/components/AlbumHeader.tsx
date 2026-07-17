import Link from 'next/link';
import { UserAvatar } from '@/shared/components/UserAvatar';
import type { AlbumOwner, AlbumStats } from '../types/album.types';

/** Header del álbum: dueño + progreso global + barra. */
export function AlbumHeader({
  owner,
  stats,
  isOwnAlbum,
}: {
  owner: AlbumOwner;
  stats: AlbumStats;
  isOwnAlbum: boolean;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 flex items-center gap-2.5">
            <Link href={`/u/${owner.username}`} className="cursor-pointer">
              <UserAvatar
                username={owner.username}
                avatarUrl={owner.avatarUrl}
                className="h-8.5 w-8.5 rounded-full border border-[rgba(74,30,8,0.25)] object-cover p-0.5"
              />
            </Link>
            <p className="text-ink/70 font-mono text-[10px] tracking-[0.26em] uppercase">
              Álbum de{' '}
              <Link
                href={`/u/${owner.username}`}
                className="cursor-pointer hover:underline"
              >
                @{owner.username}
              </Link>
            </p>
          </div>
          <h1 className="font-archivo text-4xl tracking-tight md:text-[45px]">
            {isOwnAlbum ? 'Tu Álbum' : 'Álbum'}
          </h1>
        </div>
        <div className="text-right">
          <p className="font-archivo text-cinnamon text-3xl">
            {stats.collected}/{stats.total}
          </p>
          <p className="text-ink/70 font-mono text-[10px] tracking-[0.26em] uppercase">
            {stats.pct}% completo
          </p>
        </div>
      </div>

      <div className="bg-paper-sunken mt-3.5 h-2.5 overflow-hidden rounded-full">
        <div
          className="from-cinnamon to-curry h-full rounded-full bg-gradient-to-r"
          style={{ width: `${stats.pct}%` }}
        />
      </div>
    </div>
  );
}
