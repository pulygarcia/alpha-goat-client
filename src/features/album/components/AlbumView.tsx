'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAlbum } from '../hooks/useAlbum';
import { AlbumHeader } from './AlbumHeader';
import { MarcaIndex } from './MarcaIndex';
import { HojaPager } from './HojaPager';
import { AlbumHoja } from './AlbumHoja';
import { AlbumSkeleton } from './AlbumSkeleton';
import type { AlbumResponse } from '../types/album.types';

function statusOf(error: unknown): number | undefined {
  return (error as { response?: { status?: number } } | null)?.response?.status;
}

/** Página del álbum: header global + índice de marcas + hoja activa + pager. */
export function AlbumView({ username }: { username: string }) {
  const { data: album, isLoading, isError, error } = useAlbum(username);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeMarcaId, setActiveMarcaId] = useState<string | null>(null);
  const [syncedAlbum, setSyncedAlbum] = useState<AlbumResponse | undefined>(undefined);
  const marcaParam = searchParams.get('marca');
  const [syncedMarcaParam, setSyncedMarcaParam] = useState<string | null>(null);

  // Derive the active sheet from the URL whenever a new album payload
  // arrives OR the `marca` query param changes externally (e.g. browser
  // back/forward), without the cascading-render risk of doing this inside
  // a useEffect (see https://react.dev/learn/you-might-not-need-an-effect).
  if (album !== syncedAlbum || marcaParam !== syncedMarcaParam) {
    setSyncedAlbum(album);
    setSyncedMarcaParam(marcaParam);
    if (album) {
      const found = album.hojas.some((h) => h.marca.id === marcaParam);
      setActiveMarcaId(found ? marcaParam : (album.hojas[0]?.marca.id ?? null));
    } else {
      setActiveMarcaId(null);
    }
  }

  const activeIndex = album
    ? Math.max(
        0,
        album.hojas.findIndex((h) => h.marca.id === activeMarcaId),
      )
    : 0;

  function goToMarca(marcaId: string) {
    setActiveMarcaId(marcaId);
    router.replace(`${pathname}?marca=${marcaId}`, { scroll: false });
  }

  if (isLoading) return <AlbumSkeleton />;

  if (isError) {
    return (
      <p className="text-sienna text-[14px]">
        {statusOf(error) === 404
          ? 'No encontramos a este usuario.'
          : 'No pudimos cargar el álbum. Probá recargar.'}
      </p>
    );
  }

  if (!album) return null;

  if (album.hojas.length === 0) {
    return (
      <p className="text-ink/55 font-mono text-[11px] tracking-[0.2em] uppercase">
        Todavía no hay alfajores en el catálogo.
      </p>
    );
  }

  const activeHoja = album.hojas[activeIndex]!;

  return (
    <div className="flex flex-col gap-6">
      <AlbumHeader owner={album.owner} stats={album.stats} />
      <MarcaIndex
        hojas={album.hojas}
        activeMarcaId={activeHoja.marca.id}
        onSelect={goToMarca}
      />
      <AlbumHoja hoja={activeHoja} index={activeIndex + 1} />
      <HojaPager
        hojas={album.hojas}
        activeIndex={activeIndex}
        onNavigate={goToMarca}
      />
    </div>
  );
}
