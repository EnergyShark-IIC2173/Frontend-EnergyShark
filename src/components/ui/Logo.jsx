import { useSharkSwim } from '../../hooks/sharkSwim'

// Logo de TiburonShark (DF-030, nombre en DF-034): isotipo propio (una aleta sobre una línea de agua) y wordmark tipográfico. Es la
// técnica del logo de StudyLicc, sin su marca. La aleta va en `accent` con trazo en tinta, que sobre el fondo oscuro
// se funde solo; la onda usa el color del texto. `public/favicon.svg` repite estos paths.

export const FIN_PATH = 'M4.5 20.25C7.5 12.5 12.5 6.25 21.75 3.75C19.25 9.25 19 14.75 22.75 20.25Z'
// Ola periódica (período de 12 unidades) para dibujarla al doble del ancho de su caja: correrla un 50 % no deja
// salto. La usan la intro, el logo del login y el fondo del login (DF-033, DF-035).
export const SEA_WAVE = `M0 4${' c2 -1.5 4 -1.5 6 0 s4 1.5 6 0'.repeat(8)}`

export const WAVE_PATH = 'M2 24.25C4 22.75 6 22.75 8 24.25S12 25.75 14 24.25S18 22.75 20 24.25S24 25.75 26 24.25'

const SIZES = {
  sm: { mark: 'size-8', text: 'text-lg', gap: 'gap-2' },
  xl: { mark: 'size-16', text: 'text-3xl sm:text-4xl', gap: 'gap-3' },
}

export function LogoMark({ className = 'size-8', label }) {
  return (
    <svg
      viewBox="0 0 28 28"
      className={`shrink-0 ${className}`}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <path d={FIN_PATH} className="fill-accent stroke-ink" strokeWidth={1.5} strokeLinejoin="round" />
      <path d={WAVE_PATH} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Isotipo del login (DF-035): la aleta quieta y el agua corriendo sin parar hacia la derecha. Quieto con
// "Reducir movimiento". La aleta es el easter egg (DF-037): al apretarla se sumerge, el tiburón cruza el fondo y
// al terminar vuelve a asomar.
export function WaterMark() {
  const { swimming, swims, start } = useSharkSwim()
  const fin = swimming ? 'motion-safe:animate-fin-dive motion-reduce:opacity-0' : swims > 0 ? 'motion-safe:animate-fin-rise motion-reduce:animate-fade-in' : ''
  return (
    <span className="relative block h-16 w-24 overflow-hidden">
      <button
        type="button"
        onClick={start}
        disabled={swimming}
        aria-label="Hacer nadar al tiburón"
        className="absolute bottom-[0.7rem] left-[calc(50%-1.5rem)] flex h-11 w-12 cursor-pointer items-end rounded-lg focus-ring-inset disabled:cursor-default"
      >
        <svg key={swims} viewBox="0 0 28 22" aria-hidden="true" className={`h-10 w-12 ${fin}`}>
          <path d={FIN_PATH} className="fill-accent stroke-ink" strokeWidth={1.5} strokeLinejoin="round" />
        </svg>
      </button>
      <svg viewBox="0 0 96 8" preserveAspectRatio="none" aria-hidden="true" className="pointer-events-none absolute bottom-1.5 left-0 h-3 w-[200%] motion-safe:animate-wave-run">
        <path d={SEA_WAVE} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  )
}

// El wordmark es texto real en mayúsculas por CSS: el lector de pantalla lee "TiburonShark", no letra por letra.
// `water`: el isotipo con el agua en movimiento (login).
export function Logo({ size = 'sm', as: Tag = 'span', className = '', water = false }) {
  const s = SIZES[size]
  return (
    <Tag className={`inline-flex items-center ${s.gap} text-ink dark:text-paper ${className}`}>
      {water ? <WaterMark /> : <LogoMark className={s.mark} />}
      <span className={`font-display leading-none font-bold tracking-[-0.02em] uppercase ${s.text}`}>TiburonShark</span>
    </Tag>
  )
}
