interface SectionHeaderProps {
  index: string;
  label: string;
  centered?: boolean;
}

export function SectionHeader({ index, label, centered = false }: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-4 ${centered ? 'justify-center' : ''}`}>
      <span className="coda text-curry">{index}</span>
      <span className="h-px flex-1 max-w-[64px] bg-curry/40" />
      <span className="coda text-curry-soft">{label}</span>
    </div>
  );
}
