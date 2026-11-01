import { SeaBackground } from './SeaBackground'
import { surface } from './classes'

// Login: un mar de olas en movimiento detrás de una tarjeta opaca, sin degradados ni sombras (DF-030, DF-035).
export function AuthScreen({ children }) {
  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden bg-paper p-4 dark:bg-ink">
      <SeaBackground />
      <div className={`relative w-full max-w-sm rounded-2xl p-8 text-center sm:p-10 motion-safe:animate-pop-in motion-reduce:animate-fade-in ${surface}`}>
        {children}
      </div>
    </main>
  )
}
