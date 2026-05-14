import { RadarChart } from './RadarChart';

export function ChampionCard() {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.55)', borderColor: 'rgba(255,180,80,0.18)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12">

        {/* Left col */}
        <div
          className="lg:col-span-7 p-8 sm:p-12 flex flex-col gap-8 border-b lg:border-b-0 lg:border-r"
          style={{ borderColor: 'rgba(255,180,80,0.18)' }}
        >
          <div>
            <p className="h-sub" style={{ color: '#f5ead6', lineHeight: 0.92, letterSpacing: '-0.035em' }}>
              EL RANKING
            </p>
            <p className="h-sub text-curry" style={{ lineHeight: 0.92, letterSpacing: '-0.035em' }}>
              QUE TODOS QUERÍAN.
            </p>
            <p className="mt-6 text-sm leading-relaxed max-w-lg" style={{ color: 'rgba(255,240,200,0.85)' }}>
              Se actualiza con cada reseña nueva. Sin pauta, sin acuerdos, sin "el alfajor de mi infancia". Solo cinco ejes y un promedio.
            </p>
          </div>
        </div>

        {/* Right col */}
        <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col gap-6" style={{ background: 'rgba(0,0,0,0.25)' }}>
          <span className="coda text-curry-soft">Perfil del campeón</span>
          <RadarChart />
        </div>

      </div>
    </div>
  );
}
