'use client';

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from 'recharts';
import Link from 'next/link';
import { FollowButton } from '@/features/follows/components/FollowButton';
import { LikeButton } from '@/features/reviews/components/LikeButton';
import { useRevealOnScroll } from '@/shared/hooks/useRevealOnScroll';
import type { FeedAxes, FeedItem } from '../types/feed.types';

const AXIS_LABELS: Record<keyof FeedAxes, string> = {
  dulzor: 'Dulzor',
  cantidadDDL: 'DDL',
  calidadBano: 'Baño',
  ratioTapaRelleno: 'Tapa/Relleno',
  textura: 'Textura',
};

function toRadarData(axes: FeedAxes) {
  return (Object.keys(AXIS_LABELS) as Array<keyof FeedAxes>).map((k) => ({
    axis: AXIS_LABELS[k],
    value: axes[k],
  }));
}

function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

/** "hace X min/h/d" a partir de un ISO string. */
function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

export function ReviewRow({ item }: { item: FeedItem }) {
  const {
    author,
    alfajor,
    marca,
    quote,
    photoUrl,
    overall,
    axes,
    likes,
    isLiked,
    commentsCount,
  } = item;

  const { ref, revealed, animate } = useRevealOnScroll<HTMLDivElement>();

  return (
    <article className="grid grid-cols-[64px_1fr] items-start gap-4 border-b border-[rgba(74,30,8,0.14)] py-[22px] last:border-b-0 md:grid-cols-[96px_1fr_110px_64px] md:gap-6">
      {/* Foto */}
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={alfajor.nombre}
          className="aspect-square w-full rounded-[10px] object-cover"
        />
      ) : (
        <div className="bg-paper-sunken text-cinnamon flex aspect-square w-full items-center justify-center rounded-[10px] text-[0.55rem] tracking-[0.18em] uppercase">
          {alfajor.tipo}
        </div>
      )}

      {/* Cuerpo */}
      <div>
        <div className="mb-2 flex items-center gap-[10px]">
          {author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={author.avatarUrl}
              alt={author.username}
              className="h-[26px] w-[26px] rounded-full object-cover"
            />
          ) : (
            <div
              className="text-paper flex h-[26px] w-[26px] items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-curry), var(--color-curry-bright))',
              }}
            >
              {initials(author.username)}
            </div>
          )}
          <span className="text-ink text-[13px] font-semibold">
            {author.username}
          </span>
          <span
            className="text-cinnamon"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            {marca.provincia ? `· ${marca.provincia} ` : ''}·{' '}
            {timeAgo(item.createdAt)}
          </span>
          <FollowButton userId={author.id} isFollowing={author.isFollowing} />
        </div>

        <div className="mb-2 flex items-start justify-between gap-3">
          <h5 className="text-ink text-[18px] font-medium tracking-[-0.018em]">
            <Link
              href={`/alfajores/${alfajor.id}`}
              className="hover:text-curry-deep underline-offset-2 transition-colors hover:underline"
            >
              {alfajor.nombre}
            </Link>{' '}
            · <em className="text-cinnamon not-italic">{marca.nombre}</em>
          </h5>
          {/* Rating compacto solo en mobile (el radar y el rating grande se ocultan <md). */}
          <span
            className="text-curry-deep shrink-0 md:hidden"
            style={{
              fontFamily: 'var(--font-archivo)',
              fontSize: 26,
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            {overall.toFixed(1)}
            <span className="text-cinnamon ml-[2px] text-[0.6rem] font-bold">
              /10
            </span>
          </span>
        </div>

        {quote && (
          <p className="text-sienna mb-[10px] text-[14px] leading-[1.5]">
            “{quote}”
          </p>
        )}

        <div
          className="text-cinnamon flex gap-4"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          <LikeButton reviewId={item.id} likes={likes} isLiked={isLiked} />
          <span className="inline-flex items-center gap-[5px]">
            ↳ {commentsCount} comentarios
          </span>
        </div>
      </div>

      {/* Radar mini */}
      <div ref={ref} className="hidden h-[100px] w-[100px] md:block">
        <RadarChart
          width={100}
          height={100}
          data={toRadarData(axes)}
          outerRadius="78%"
        >
          <PolarGrid stroke="rgba(74,30,8,0.18)" />
          <PolarAngleAxis dataKey="axis" tick={false} />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          {revealed && (
            <Radar
              dataKey="value"
              stroke="var(--color-curry-deep)"
              fill="var(--color-curry-deep)"
              fillOpacity={0.28}
              isAnimationActive={animate}
              animationDuration={700}
            />
          )}
        </RadarChart>
      </div>

      {/* Rating (columna en ≥md; en mobile se muestra compacto junto al título) */}
      <div className="hidden text-right md:block">
        <span
          className="text-curry-deep"
          style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 44,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          {overall.toFixed(1)}
        </span>
        <span
          className="text-cinnamon block"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.22em',
            fontWeight: 700,
            marginTop: 2,
          }}
        >
          /10
        </span>
      </div>
    </article>
  );
}
