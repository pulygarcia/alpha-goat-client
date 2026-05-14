interface Props {
  value: string
}

function getScore(value: string): number {
  let score = 0
  if (value.length >= 8) score++
  if (/[A-Z]/.test(value)) score++
  if (/[0-9]/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  return score
}

const levels = [
  { label: '', color: 'transparent', width: '0%' },
  { label: 'Frágil', color: '#ff7a59', width: '25%' },
  { label: 'Aceptable', color: '#f4a02b', width: '50%' },
  { label: 'Sólida', color: '#f4a02b', width: '75%' },
  { label: 'De fierro', color: '#7dd693', width: '100%' },
]

export default function PasswordStrength({ value }: Props) {
  if (!value) return null

  const score = getScore(value)
  const level = levels[score]

  return (
    <div className="flex flex-col gap-1">
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-[rgba(244,160,43,0.12)]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: level.width, background: level.color }}
        />
      </div>
      {level.label && (
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em]" style={{ color: level.color }}>
          Fuerza: {level.label}
        </p>
      )}
    </div>
  )
}
