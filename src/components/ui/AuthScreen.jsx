// Fondo del login y de "Cargando Auth0...": ningún texto va sobre el degradado, todo va en la card (DF-008)
export function AuthScreen({ children }) {
  return (
    <main className="grid min-h-svh place-items-center bg-linear-to-br from-frame-from to-frame-to p-4">
      <div className="w-full max-w-sm rounded-3xl bg-panel p-8 text-center shadow-[0_24px_60px_-12px_rgb(0_0_0/0.55)] sm:p-10">
        {children}
      </div>
    </main>
  )
}

export function LogoMark({ src, alt, size = 'lg' }) {
  const box = size === 'lg' ? 'size-24' : 'size-9'
  const img = size === 'lg' ? 'w-20' : 'w-8'
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-linear-to-br from-pink to-magenta shadow-[0_8px_24px_-6px_var(--color-pink)] ${box}`}>
      <img src={src} alt={alt} className={`${img} brightness-0 invert`} />
    </span>
  )
}
