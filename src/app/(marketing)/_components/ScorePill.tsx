export function ScorePill() {
  return (
    <div
      className="inline-flex flex-col items-start rounded-2xl bg-curry px-5 py-3 text-sienna shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)]"
      style={{ transform: 'rotate(8deg)' }}
    >
      <span
        className="text-[0.62rem] font-bold uppercase tracking-[0.22em]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Top 3 nacional
      </span>
      <span
        className="text-2xl leading-none"
        style={{ fontFamily: 'var(--font-archivo)' }}
      >
        8.4<span className="text-base opacity-70">/10</span>
      </span>
    </div>
  );
}
