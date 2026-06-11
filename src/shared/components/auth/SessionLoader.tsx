export function SessionLoader() {
  return (
    <div className="bg-bg-ink flex min-h-screen items-center justify-center">
      <p className="coda text-curry-soft flex items-center gap-3">
        <span className="spin-loader inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent" />
        Verificando sesión…
      </p>
    </div>
  );
}
