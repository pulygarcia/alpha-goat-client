import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

export default function SocialButton({ icon, label, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-curry-soft hover:border-curry/30 hover:bg-curry/6 flex h-[52px] w-full items-center justify-center gap-2.5 rounded-xl border text-sm font-medium transition-all duration-200"
      style={{
        background: 'var(--color-bg-deep)',
        borderColor: 'color-mix(in oklab, var(--color-curry) 14%, transparent)',
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
