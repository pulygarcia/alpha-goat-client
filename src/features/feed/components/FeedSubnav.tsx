'use client';

import { useState } from 'react';
import { useFeedStats } from '../hooks/useFeedStats';

const PERIOD_CHIPS = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Esta semana' },
] as const;

const SCOPE_CHIPS = [
  { id: 'siguiendo', label: 'Siguiendo' },
  { id: 'provincia', label: 'Por provincia' },
] as const;

type ChipId =
  | (typeof PERIOD_CHIPS)[number]['id']
  | (typeof SCOPE_CHIPS)[number]['id'];

function formatIssueDate(date: Date): string {
  // ej: "Jue 21.05.2026"
  const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${weekdays[date.getDay()]} ${dd}.${mm}.${date.getFullYear()}`;
}

export function FeedSubnav() {
  const [active, setActive] = useState<ChipId>('hoy');
  const issue = formatIssueDate(new Date());
  const { data: stats } = useFeedStats();

  return (
    <div className="flex items-center gap-6 border-b border-[rgba(74,30,8,0.14)] bg-paper px-7 py-4">
      <div
        className="flex items-center gap-[10px] whitespace-nowrap border-r border-[rgba(74,30,8,0.14)] pr-5 font-bold text-sienna"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        <span className="relative inline-block h-2 w-2 rounded-full bg-curry-deep before:absolute before:inset-[-4px] before:rounded-full before:bg-[rgba(244,160,43,0.22)] before:content-['']" />
        <span>{issue}</span>
      </div>

      <div className="flex items-center gap-[6px]">
        {PERIOD_CHIPS.map((chip) => (
          <Chip
            key={chip.id}
            label={chip.label}
            isActive={active === chip.id}
            onClick={() => setActive(chip.id)}
          />
        ))}
        <span className="mx-[6px] h-[18px] w-px bg-[rgba(74,30,8,0.14)]" />
        <Chip
          label={SCOPE_CHIPS[0].label}
          isActive={active === SCOPE_CHIPS[0].id}
          onClick={() => setActive(SCOPE_CHIPS[0].id)}
        />
        <span className="mx-[6px] h-[18px] w-px bg-[rgba(74,30,8,0.14)]" />
        <Chip
          label={SCOPE_CHIPS[1].label}
          isActive={active === SCOPE_CHIPS[1].id}
          onClick={() => setActive(SCOPE_CHIPS[1].id)}
        />
      </div>

      <div
        className="ml-auto flex items-center gap-[14px] text-[rgba(44,18,9,0.62)]"
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
      className={`whitespace-nowrap rounded-full border px-[14px] py-[7px] text-[13px] font-medium transition-colors ${
        isActive
          ? 'border-ink bg-ink text-paper'
          : 'border-transparent text-sienna hover:bg-paper-sunken'
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
        className="mr-[6px] align-middle text-cinnamon"
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
