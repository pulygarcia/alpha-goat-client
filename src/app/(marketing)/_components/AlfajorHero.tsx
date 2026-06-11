export function AlfajorHero() {
  return (
    <div
      className="drift relative aspect-square w-[clamp(340px,56vw,720px)] rounded-full"
      style={{
        background: `
          radial-gradient(circle at 50% 38%, #3a1606 0%, #2a0f04 55%, #1a0902 100%),
          radial-gradient(circle at 50% 50%, rgba(244,160,43,0.18) 0%, transparent 70%)
        `,
        boxShadow: `
          inset 0 -40px 80px rgba(0,0,0,0.55),
          inset 0 30px 60px rgba(184,96,21,0.25),
          0 60px 120px -30px rgba(0,0,0,0.55),
          0 0 200px rgba(244,160,43,0.18)
        `,
      }}
      aria-hidden="true"
    >
      <div
        className="absolute top-1/2 right-0 left-0 h-[14%] -translate-y-1/2"
        style={{
          background:
            'linear-gradient(to bottom, #c97a26 0%, #b86015 45%, #8a4510 100%)',
          boxShadow:
            'inset 0 6px 12px rgba(0,0,0,0.35), inset 0 -6px 12px rgba(0,0,0,0.45)',
        }}
      />
    </div>
  );
}
