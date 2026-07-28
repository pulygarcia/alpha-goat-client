'use client';

import { useRequireAuth } from '@/shared/hooks/useRequireAuth';
import { useFeedStats } from '../hooks/useFeedStats';
import { useFeedFilters } from '../store/feedFilters.store';
import type { FeedScope } from '../types/feed.types';

const PERIOD_CHIPS = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Esta semana' },
] as const satisfies ReadonlyArray<{ id: FeedScope; label: string }>;

const SCOPE_CHIPS = [
  { id: 'following', label: 'Siguiendo' },
] as const satisfies ReadonlyArray<{ id: FeedScope; label: string }>;

function formatIssueDate(date: Date): string {
  // ej: "Jue 21.05.2026"
  const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${weekdays[date.getDay()]} ${dd}.${mm}.${date.getFullYear()}`;
}

export function FeedSubnav() {
  const scope = useFeedFilters((s) => s.scope);
  const toggleScope = useFeedFilters((s) => s.toggleScope);
  const issue = formatIssueDate(new Date());
  const { data: stats } = useFeedStats();
  const requireAuth = useRequireAuth();

  return (
    <div className="bg-blanco-tibio border-gris-50 flex flex-wrap items-center gap-x-6 gap-y-3 border-b px-5 py-4 md:px-7">
      <div
        className="text-gris-400 border-gris-50 hidden items-center gap-[10px] border-r pr-5 font-bold whitespace-nowrap md:flex"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        <span className="bg-curry-deep relative inline-block h-2 w-2 rounded-full before:absolute before:inset-[-4px] before:rounded-full before:bg-[rgba(244,160,43,0.22)] before:content-['']" />
        <span>{issue}</span>
      </div>

      <div className="flex items-center gap-[6px]">
        {PERIOD_CHIPS.map((chip) => (
          <Chip
            key={chip.id}
            label={chip.label}
            isActive={scope === chip.id}
            onClick={() => toggleScope(chip.id)}
          />
        ))}
        <span className="bg-gris-50 mx-[6px] h-[18px] w-px" />
        <Chip
          label={SCOPE_CHIPS[0].label}
          isActive={scope === SCOPE_CHIPS[0].id}
          // "Siguiendo" es un feed personal: anónimo → login.
          onClick={() => requireAuth(() => toggleScope(SCOPE_CHIPS[0].id))}
        />
      </div>

      <div
        className="text-gris-400 ml-auto hidden items-center gap-[14px] md:flex"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        <Stat
          value={stats ? String(stats.todayCount) : '—'}
          label="reseñas hoy"
        />
        <Stat
          value={stats ? String(stats.weekCount) : '—'}
          label="esta semana"
        />
      </div>
    </div>
  );
}

function Chip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-[14px] py-[7px] text-[13px] font-medium whitespace-nowrap transition-colors ${
        isActive
          ? 'border-ink bg-ink text-blanco-tibio'
          : 'text-gris-400 hover:bg-gris-25 hover:text-ink border-transparent'
      }`}
    >
      {label}
    </button>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span
        className="text-cinnamon mr-[6px] align-middle"
        style={{
          fontFamily: 'var(--font-archivo)',
          fontSize: 18,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span>{label}</span>
    </span>
  );
}
