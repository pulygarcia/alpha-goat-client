'use client';

/** Slider 0-10 (paso 0.5) con etiqueta y valor visible. Control nativo estilizado. */
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
        <label className="text-ink text-[14px] font-medium">{label}</label>
        <span
          className="text-curry-deep text-[15px] font-bold"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {value.toFixed(1)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="accent-curry-deep h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[rgba(74,30,8,0.16)]"
      />
    </div>
  );
}
