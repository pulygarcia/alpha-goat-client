interface Props {
  number: number
  text: string
  state: 'idle' | 'active' | 'done'
}

export default function StepItem({ number, text, state }: Props) {
  const isActive = state === 'active'
  const isDone = state === 'done'

  return (
    <div
      className="flex items-center gap-[14px] rounded-[14px] px-[14px] py-3 transition-all duration-[220ms]"
      style={{
        background: isActive ? '#f4a02b' : isDone ? 'rgba(244,160,43,0.08)' : '#4f1f08',
        boxShadow: isActive ? '0 0 24px -4px rgba(244,160,43,0.45)' : undefined,
      }}
    >
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[0.78rem] font-bold"
        style={{
          background: isActive
            ? '#5a2208'
            : isDone
              ? '#f4a02b'
              : 'rgba(244,160,43,0.12)',
          color: isActive
            ? '#f4a02b'
            : isDone
              ? '#5a2208'
              : 'rgba(246,201,119,0.55)',
        }}
      >
        {isDone ? '✓' : number}
      </div>
      <span
        className="text-sm font-medium"
        style={{
          color: isActive ? '#5a2208' : isDone ? 'rgba(246,201,119,0.7)' : 'rgba(255,255,255,0.85)',
        }}
      >
        {text}
      </span>
    </div>
  )
}
