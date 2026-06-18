import { FollowButton } from '@/features/follows/components/FollowButton';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { LikeButton } from './LikeButton';
import type { Review } from '../types/reviews.types';

function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

/** "hace X min/h/d" a partir de un ISO string. */
function timeAgo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

const AXES: Array<[string, keyof Review]> = [
  ['Dulzor', 'dulzor'],
  ['DDL', 'cantidadDDL'],
  ['Baño', 'calidadBano'],
  ['Tapa/Relleno', 'ratioTapaRelleno'],
  ['Textura', 'textura'],
];

export function ReviewCard({ review }: { review: Review }) {
  const { author, comentario, ratingGeneral, likesCount, commentsCount } =
    review;
  const name = author?.username ?? 'Anónimo';

  return (
    <Card className="border-[rgba(74,30,8,0.14)] shadow-[0_10px_28px_-22px_rgba(44,18,9,0.5)]">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-center gap-[10px]">
          <div
            className="text-paper flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold"
            style={{
              background:
                'linear-gradient(135deg, var(--color-curry), var(--color-curry-bright))',
            }}
          >
            {initials(name)}
          </div>
          <div>
            <p className="text-ink text-[14px] font-semibold">{name}</p>
            <p
              className="text-cinnamon"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              {timeAgo(review.createdAt)}
            </p>
          </div>
          {author && (
            <FollowButton
              userId={author.id}
              isFollowing={author.isFollowing ?? false}
            />
          )}
        </div>

        <div className="text-right">
          <span
            className="text-curry-deep"
            style={{
              fontFamily: 'var(--font-archivo)',
              fontSize: 26,
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            {ratingGeneral.toFixed(1)}
          </span>
          <span
            className="text-cinnamon ml-[2px] text-[0.6rem] font-bold"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            /10
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {comentario && (
          <p className="text-sienna mb-4 text-[14px] leading-relaxed">
            “{comentario}”
          </p>
        )}

        <dl className="flex flex-wrap gap-x-5 gap-y-1">
          {AXES.map(([label, key]) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <dt
                className="text-cinnamon"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.58rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </dt>
              <dd className="text-ink text-[13px] font-semibold">
                {(review[key] as number).toFixed(1)}
              </dd>
            </div>
          ))}
        </dl>

        <div
          className="text-cinnamon mt-5 flex gap-4"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          <LikeButton
            reviewId={review.id}
            likes={likesCount ?? 0}
            isLiked={review.isLiked ?? false}
          />
          <span className="inline-flex items-center gap-[5px]">
            ↳ {commentsCount ?? 0} comentarios
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
