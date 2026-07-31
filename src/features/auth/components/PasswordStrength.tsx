interface Props {
  value: string;
}

function getScore(value: string): number {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return score;
}

const levels = [
  { label: '', color: 'transparent', width: '0%' },
  { label: 'Frágil', color: 'var(--color-error)', width: '25%' },
  { label: 'Aceptable', color: 'var(--color-curry-deep)', width: '50%' },
  { label: 'Sólida', color: 'var(--color-curry-deep)', width: '75%' },
  { label: 'De fierro', color: 'var(--color-reward)', width: '100%' },
];

export default function PasswordStrength({ value }: Props) {
  if (!value) return null;

  const score = getScore(value);
  const level = levels[score];

  return (
    <div className="flex flex-col gap-1">
      <div className="bg-gris-100 h-[3px] w-full overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: level.width, background: level.color }}
        />
      </div>
      {level.label && (
        <p
          className="font-mono text-[0.65rem] tracking-[0.28em] uppercase"
          style={{ color: level.color }}
        >
          Fuerza: {level.label}
        </p>
      )}
    </div>
  );
}
