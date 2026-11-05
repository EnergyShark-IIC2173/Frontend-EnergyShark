import { useCallback, useMemo, useState } from 'react'
import { SharkSwimContext } from '../../hooks/sharkSwim'
import { SeaBackground } from './SeaBackground'
import { surface } from './classes'

// Login: un mar de olas en movimiento detrás de una tarjeta opaca, sin degradados ni sombras (DF-030, DF-035).
// Comparte el estado del easter egg del tiburón entre la aleta del logo y el fondo (DF-037).
export function AuthScreen({ children }) {
  const [swimming, setSwimming] = useState(false)
  const [swims, setSwims] = useState(0)
  const start = useCallback(() => setSwimming(true), [])
  // Se llama una sola vez por nado: el tiburón se desmonta al terminar y su timeout de respaldo se limpia.
  const finish = useCallback(() => {
    setSwimming(false)
    setSwims((n) => n + 1)
  }, [])
  const value = useMemo(() => ({ swimming, swims, start, finish }), [swimming, swims, start, finish])
  return (
    <SharkSwimContext.Provider value={value}>
    <main className="relative grid min-h-svh place-items-center overflow-hidden bg-paper p-4 dark:bg-ink">
      <SeaBackground />
      <div className={`relative w-full max-w-sm rounded-2xl p-8 text-center sm:p-10 motion-safe:animate-pop-in motion-reduce:animate-fade-in ${surface}`}>
        {children}
      </div>
    </main>
    </SharkSwimContext.Provider>
  )
}
