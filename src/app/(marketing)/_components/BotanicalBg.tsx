export function BotanicalBg() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-10"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420' viewBox='0 0 420 420'>
  <g fill='none' stroke='%23f4a02b' stroke-width='1.2'>
    <path d='M40 80 Q70 50 100 80 T160 80'/>
    <path d='M260 60 Q290 30 320 60 T380 60'/>
    <circle cx='210' cy='210' r='3' fill='%23f4a02b'/>
    <rect x='60' y='280' width='14' height='14' transform='rotate(45 67 287)'/>
    <rect x='340' y='180' width='10' height='10' transform='rotate(45 345 185)'/>
    <path d='M120 340 Q150 310 180 340 T240 340'/>
    <path d='M300 320 Q330 290 360 320'/>
    <circle cx='90' cy='200' r='2' fill='%23f4a02b'/>
    <circle cx='330' cy='100' r='2' fill='%23f4a02b'/>
    <path d='M180 140 Q210 110 240 140'/>
    <path d='M20 380 Q50 350 80 380'/>
  </g>
</svg>
        `)}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '420px 420px',
      }}
    />
  );
}
