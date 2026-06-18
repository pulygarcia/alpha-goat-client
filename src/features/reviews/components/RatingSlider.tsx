'use client';

import { Slider } from '@/shared/components/ui/slider';

/** Slider 0-10 (paso 0.5) con etiqueta y valor visible, sobre el `Slider` de shadcn. */
export function RatingSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-ink text-[14px] font-medium">{label}</span>
        <span
          className="text-curry-deep text-[15px] font-bold"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {value.toFixed(1)}
        </span>
      </div>
      <Slider
        aria-label={label}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={0}
        max={10}
        step={0.5}
        className="py-1"
      />
    </div>
  );
}
