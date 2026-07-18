'use client';

import { RadialBar, RadialBarChart, PolarAngleAxis } from 'recharts';

/** Medidor circular chico: % de completitud de una hoja del álbum. */
export function HojaProgressGauge({ pct }: { pct: number }) {
  return (
    <div className="relative h-[72px] w-[72px] flex-none">
      <RadialBarChart
        width={72}
        height={72}
        cx="50%"
        cy="50%"
        innerRadius="72%"
        outerRadius="100%"
        barSize={7}
        data={[{ value: pct }]}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          angleAxisId={0}
          tick={false}
        />
        <RadialBar
          dataKey="value"
          cornerRadius={999}
          background={{ fill: 'var(--color-paper-sunken)' }}
          fill="var(--color-curry)"
        />
      </RadialBarChart>
      <span className="font-archivo text-cinnamon pointer-events-none absolute inset-0 flex items-center justify-center text-[15px]">
        {pct}%
      </span>
    </div>
  );
}
