export function SessionLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-ink">
      <p className="coda flex items-center gap-3 text-curry-soft">
        <span className="spin-loader inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent" />
        Verificando sesión…
      </p>
    </div>
  );
}
