import { useEffect, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { FIN_PATH } from './Logo'

// Ola periódica (período de 12 unidades) del doble del ancho de su caja: correrla un 50 % no deja salto.
const WAVE = `M0 4${' c2 -1.5 4 -1.5 6 0 s4 1.5 6 0'.repeat(8)}`

// Intro del tiburón (DF-033), en lugar de "Cargando Auth0...".
// Fases: enter (la aleta entra nadando) → idle (se mece sobre la ola mientras Auth0 carga) → out (sale nadando)
// → fade (la pantalla se funde y deja ver la vista). `full` false: versión corta, solo idle y fade.
// `skip`: sin sesión, se va directo al fundido para mostrar el login. Con "Reducir movimiento" no hay nado.
// onReveal: empieza el fundido (la vista se monta debajo). onDone: terminó y se desmonta.
export function SharkIntro({ ready, full, skip, onReveal, onDone }) {
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [phase, setPhase] = useState(full ? 'enter' : 'idle')

  let view = phase
  if (phase !== 'out' && phase !== 'fade' && ready && (phase === 'idle' || skip)) {
    view = full && !skip && !reduce ? 'out' : 'fade'
  }

  // Respaldo: si un navegador no dispara animationend, la intro nunca bloquea la app.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (view === 'enter') setPhase('idle')
      else if (view === 'out' || view === 'fade') {
        onReveal()
        onDone()
      }
    }, view === 'enter' ? 1600 : 1800)
    return () => clearTimeout(timer)
  }, [view, onReveal, onDone])

  function onFinEnd(e) {
    if (e.target !== e.currentTarget) return
    if (e.animationName === 'swim-in' || e.animationName === 'fade-in') setPhase('idle')
    if (e.animationName === 'swim-out') setPhase('fade')
  }

  const finMotion = {
    enter: 'motion-safe:animate-swim-in motion-reduce:animate-fade-in',
    idle: '',
    out: 'animate-swim-out',
    fade: 'opacity-0',
  }[view]

  return (
    <div
      role="status"
      aria-live="polite"
      onAnimationStart={(e) => e.target === e.currentTarget && e.animationName === 'splash-out' && onReveal()}
      onAnimationEnd={(e) => e.target === e.currentTarget && e.animationName === 'splash-out' && onDone()}
      className={`fixed inset-0 z-50 grid place-items-center bg-paper dark:bg-ink ${view === 'fade' ? 'animate-splash-out' : ''}`}
    >
      <span className="sr-only">Cargando TiburonShark</span>
      <div aria-hidden="true" className="flex flex-col items-center gap-5 text-ink dark:text-paper">
        <div className="relative h-20 w-44 overflow-hidden">
          <span onAnimationEnd={onFinEnd} className={`absolute bottom-[0.85rem] left-[calc(50%-1.75rem)] block ${finMotion}`}>
            <span className="block motion-safe:animate-bob">
              <svg viewBox="0 0 28 22" className="h-11 w-14">
                <path d={FIN_PATH} className="fill-accent stroke-ink" strokeWidth={1.5} strokeLinejoin="round" />
              </svg>
            </span>
          </span>
          <svg viewBox="0 0 96 8" preserveAspectRatio="none" className="absolute bottom-2 left-0 h-3 w-[200%] motion-safe:animate-wave-run">
            <path d={WAVE} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <span className={`font-display text-3xl leading-none font-bold tracking-[-0.02em] uppercase ${full ? 'motion-safe:animate-wordmark-in motion-reduce:animate-fade-in' : ''}`}>
          TiburonShark
        </span>
      </div>
    </div>
  )
}
