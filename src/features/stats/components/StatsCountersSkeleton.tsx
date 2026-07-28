export function StatsCountersSkeleton() {
  return (
    <div
      data-testid="stats-counters-skeleton"
      aria-hidden
      className="grid animate-pulse grid-cols-2 gap-6 md:grid-cols-4"
    >
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className="bg-gris-50 h-8 w-16 rounded" />
          <div className="bg-gris-50 h-2 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}
