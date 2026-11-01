import { SEA_WAVE } from './Logo'

// Fondo del login, "Mar de olas" (DF-035): seis líneas de ola con el trazo del logo cruzan la pantalla hacia la
// derecha. Las de abajo son más rápidas, altas y marcadas, y las de arriba más lentas y tenues, lo que da
// profundidad. Solo transform (translateX sobre un trazo del doble del ancho), con desfases negativos para que no
// partan alineadas. Decorativo, y quieto con "Reducir movimiento".
const LAYERS = [
  { top: '10%', height: 'h-6', opacity: 'opacity-30', duration: '46s', delay: '-12s' },
  { top: '24%', height: 'h-8', opacity: 'opacity-40', duration: '40s', delay: '-30s' },
  { top: '40%', height: 'h-10', opacity: 'opacity-50', duration: '34s', delay: '-5s' },
  { top: '58%', height: 'h-12', opacity: 'opacity-60', duration: '28s', delay: '-19s' },
  { top: '74%', height: 'h-14', opacity: 'opacity-75', duration: '22s', delay: '-9s' },
  { top: '88%', height: 'h-16', opacity: 'opacity-90', duration: '17s', delay: '-14s' },
]

export function SeaBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden text-sand-300 dark:text-sand-700">
      {LAYERS.map((l) => (
        <svg
          key={l.top}
          viewBox="0 0 96 8"
          preserveAspectRatio="none"
          className={`absolute left-0 w-[200%] motion-safe:animate-wave-run ${l.height} ${l.opacity}`}
          style={{ top: l.top, animationDuration: l.duration, animationDelay: l.delay }}
        >
          <path d={SEA_WAVE} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      ))}
    </div>
  )
}
