'use client';

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts';
import { FollowButton } from '@/features/follows/components/FollowButton';
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
  const { author, alfajor, marca, quote, photoUrl, overall, axes, likes, commentsCount } =
    item;

  return (
    <article className="grid grid-cols-[96px_1fr_110px_64px] items-start gap-6 border-b border-[rgba(74,30,8,0.14)] py-[22px] last:border-b-0">
      {/* Foto */}
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={alfajor.nombre}
          className="aspect-square w-full rounded-[10px] object-cover"
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-[10px] bg-paper-sunken text-[0.55rem] uppercase tracking-[0.18em] text-cinnamon">
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
              className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-[10px] font-bold text-paper"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-curry), var(--color-curry-bright))',
              }}
            >
              {initials(author.username)}
            </div>
          )}
          <span className="text-[13px] font-semibold text-ink">{author.username}</span>
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
            {marca.provincia ? `· ${marca.provincia} ` : ''}· {timeAgo(item.createdAt)}
          </span>
          <FollowButton userId={author.id} isFollowing={author.isFollowing} />
        </div>

        <h5 className="mb-2 text-[18px] font-medium tracking-[-0.018em] text-ink">
          {alfajor.nombre} · <em className="not-italic text-cinnamon">{marca.nombre}</em>
        </h5>

        {quote && (
          <p className="mb-[10px] text-[14px] leading-[1.5] text-sienna">“{quote}”</p>
        )}

        <div
          className="flex gap-4 text-cinnamon"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          <span className="inline-flex items-center gap-[5px] text-curry-deep">
            ★ {likes} likes
          </span>
          <span className="inline-flex items-center gap-[5px]">
            ↳ {commentsCount} comentarios
          </span>
        </div>
      </div>

      {/* Radar mini */}
      <div className="h-[100px] w-[100px]">
        <RadarChart width={100} height={100} data={toRadarData(axes)} outerRadius="78%">
          <PolarGrid stroke="rgba(74,30,8,0.18)" />
          <PolarAngleAxis dataKey="axis" tick={false} />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="var(--color-curry-deep)"
            fill="var(--color-curry-deep)"
            fillOpacity={0.28}
            isAnimationActive={false}
          />
        </RadarChart>
      </div>

      {/* Rating */}
      <div className="text-right">
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
          className="block text-cinnamon"
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
