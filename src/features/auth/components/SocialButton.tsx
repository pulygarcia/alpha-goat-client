import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  label: string
  onClick?: () => void
}

export default function SocialButton({ icon, label, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-xl border text-sm font-medium text-curry-soft transition-all duration-200 hover:border-[rgba(244,160,43,0.30)] hover:bg-[rgba(244,160,43,0.06)]"
      style={{
        background: '#4f1f08',
        borderColor: 'rgba(244,160,43,0.14)',
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
