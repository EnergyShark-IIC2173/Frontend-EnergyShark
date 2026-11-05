import { fmtMmSs } from '../lib/cycles'
import { Icon } from './ui/Icon'
import { labelBase, textPrimary, textSecondary } from './ui/classes'

// Reloj del ciclo (DF-044): el único reloj de la app, siempre visible en la sidebar. Cuenta hasta el próximo
// instante del status-statement del ciclo más reciente (datos de useCycleClock). Presentacional.
const URGENT_MS = 60_000
const R = 16
const C = 2 * Math.PI * R

function describe(clock) {
  if (clock.state === 'empty') return { main: '--:--', text: 'Sin ciclos todavía' }
  if (clock.state === 'no-market') return { main: '--:--', text: 'Sin instantes del mercado' }
  if (clock.state === 'waiting') {
    return { main: fmtMmSs(clock.sinceMs) ?? '--:--', text: clock.label, prefix: 'hace' }
  }
  return { main: fmtMmSs(clock.remainingMs), text: clock.label, prefix: 'en' }
}

function Ring({ progress, size = 'size-10', children }) {
  return (
    <span className={`relative grid shrink-0 place-items-center ${size}`}>
      <svg viewBox="0 0 40 40" aria-hidden="true" className="absolute inset-0 size-full -rotate-90">
        <circle cx="20" cy="20" r={R} fill="none" strokeWidth="3" className="stroke-sand-200 dark:stroke-sand-800" />
        {progress != null ? (
          <circle cx="20" cy="20" r={R} fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)} className="stroke-accent transition-[stroke-dashoffset] duration-1000 ease-linear motion-reduce:transition-none" />
        ) : null}
      </svg>
      {children}
    </span>
  )
}

// variant: 'full' (sidebar abierta), 'rail' (sidebar plegada) o 'compact' (barra superior del celular).
export function CycleClock({ clock, variant = 'full' }) {
  const d = describe(clock)
  const urgent = clock.state === 'counting' && clock.remainingMs <= URGENT_MS
  const tone = urgent ? 'text-rose-ink dark:text-rose' : textPrimary
  const sentence = clock.cycleId
    ? `${clock.cycleId}: ${d.text}${d.prefix ? ` ${d.prefix} ${d.main}` : ''}`
    : d.text

  if (variant === 'compact') {
    return (
      <div role="timer" aria-label={sentence} title={sentence} className="ml-auto flex items-center gap-2">
        <Ring progress={clock.progress} size="size-8" />
        <span className={`font-mono text-sm font-bold tabular-nums ${tone}`}>{d.main}</span>
      </div>
    )
  }

  if (variant === 'rail') {
    return (
      <div role="timer" aria-label={sentence} title={sentence} className="flex flex-col items-center gap-1 py-1">
        <Ring progress={clock.progress}>
          <Icon name={urgent ? 'warning' : 'clock'} className={`size-4 ${tone}`} />
        </Ring>
        <span className={`font-mono text-[0.7rem] font-bold tabular-nums ${tone}`}>{d.main}</span>
      </div>
    )
  }

  return (
    <div role="timer" aria-label={sentence} className="flex items-center gap-3 rounded-xl bg-sand-100 p-3 dark:bg-sand-800">
      <Ring progress={clock.progress}>
        <Icon name={urgent ? 'warning' : 'clock'} className={`size-4 ${tone}`} />
      </Ring>
      <div className="min-w-0">
        <p className={`${labelBase} truncate`}>{clock.cycleId ?? 'Ciclo'}</p>
        <p className={`truncate text-sm ${textSecondary}`}>{d.text}</p>
        <p className={`font-mono text-xl font-bold tabular-nums ${tone}`}>
          {d.prefix === 'hace' ? <span className={`mr-1 font-sans text-xs font-normal ${textSecondary}`}>hace</span> : null}
          {d.main}
        </p>
      </div>
    </div>
  )
}
