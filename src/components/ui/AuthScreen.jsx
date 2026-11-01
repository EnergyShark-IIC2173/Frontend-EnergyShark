import { surface } from './classes'

// Login y "Cargando Auth0...": papel cuadriculado y una tarjeta opaca encima, sin degradado ni sombra (DF-030).
export function AuthScreen({ children }) {
  return (
    <main className="grid min-h-svh place-items-center bg-paper p-4 grid-lines dark:bg-ink">
      <div className={`w-full max-w-sm rounded-2xl p-8 text-center sm:p-10 motion-safe:animate-pop-in motion-reduce:animate-fade-in ${surface}`}>
        {children}
      </div>
    </main>
  )
}
