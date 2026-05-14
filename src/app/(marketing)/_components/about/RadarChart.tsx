export function RadarChart() {
  const rings = [1, 0.8, 0.6, 0.4];
  const cx = 110;
  const cy = 110;
  const r = 90;

  function pentagon(scale: number, offset = 0) {
    const points = Array.from({ length: 5 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2 + offset;
      return [cx + r * scale * Math.cos(angle), cy + r * scale * Math.sin(angle)];
    });
    return points.map((p) => p.join(',')).join(' ');
  }

  const dataPoints = [0.8, 0.9, 1.0, 0.9, 0.9];
  const dataPolygon = Array.from({ length: 5 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return [cx + r * dataPoints[i] * Math.cos(angle), cy + r * dataPoints[i] * Math.sin(angle)];
  });
  const dataStr = dataPolygon.map((p) => p.join(',')).join(' ');

  const labels = [
    { text: 'DULZOR',  x: 110, y: 12  },
    { text: 'DDL',     x: 208, y: 72  },
    { text: 'BAÑO',    x: 190, y: 185 },
    { text: 'RATIO',   x: 30,  y: 185 },
    { text: 'TEXTURA', x: 12,  y: 72  },
  ];

  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[320px] mx-auto">
      <defs>
        <radialGradient id="rGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#f4a02b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f4a02b" stopOpacity="0.08" />
        </radialGradient>
        <style>{`
          @keyframes radarSweep {
            from { transform: rotate(0deg); transform-origin: 110px 110px; }
            to   { transform: rotate(360deg); transform-origin: 110px 110px; }
          }
          .radar-sweep {
            animation: radarSweep 8s linear infinite;
            transform-origin: 110px 110px;
          }
          @media (prefers-reduced-motion: reduce) {
            .radar-sweep { animation: none; }
          }
        `}</style>
      </defs>

      {rings.map((scale, i) => (
        <polygon
          key={i}
          points={pentagon(scale)}
          fill="none"
          stroke="rgba(244,160,43,0.22)"
          strokeWidth={i === 0 ? 1.5 : 1}
          strokeDasharray={i === 0 ? 'none' : '4 3'}
        />
      ))}

      {Array.from({ length: 5 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={cx + r * Math.cos(angle)}
            y2={cy + r * Math.sin(angle)}
            stroke="rgba(244,160,43,0.22)"
            strokeWidth="1"
          />
        );
      })}

      <g className="radar-sweep">
        <polygon
          points={`${cx},${cy} ${cx + r * Math.cos(-Math.PI / 2)},${cy + r * Math.sin(-Math.PI / 2)} ${cx + r * Math.cos(-Math.PI / 2 + (Math.PI * 2) / 5)},${cy + r * Math.sin(-Math.PI / 2 + (Math.PI * 2) / 5)}`}
          fill="rgba(244,160,43,0.06)"
        />
        <line
          x1={cx} y1={cy}
          x2={cx + r * Math.cos(-Math.PI / 2)}
          y2={cy + r * Math.sin(-Math.PI / 2)}
          stroke="#ffb53d"
          strokeWidth="1.5"
          opacity="0.6"
        />
      </g>

      <polygon
        points={dataStr}
        fill="url(#rGrad)"
        stroke="#faae33"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {dataPolygon.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#f4a02b" />
      ))}

      {labels.map(({ text, x, y }) => (
        <text
          key={text}
          x={x} y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9"
          fontFamily="var(--font-mono)"
          letterSpacing="1.5"
          fill="rgba(255,240,200,0.75)"
        >
          {text}
        </text>
      ))}
    </svg>
  );
}
