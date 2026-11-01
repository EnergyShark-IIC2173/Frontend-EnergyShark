import { useNow } from '../../hooks/useNow'
import { Icon } from './Icon'
import { textPrimary } from './classes'

const R = 19
const C = 2 * Math.PI * R

// Reloj de actualización (DF-034): un círculo con un reloj al centro y un anillo que se descuenta hasta el próximo
// poll. Apretarlo actualiza ahora; "Actualizar" aparece al pasar el mouse o con foco. Sin polling, el anillo queda
// lleno. El anillo avanza a saltos de 1 s (stroke-dashoffset), así que no depende de "Reducir movimiento".
export function RefreshTimer({ updatedAt, intervalMs, loading = false, onRefresh }) {
  const counting = Boolean(intervalMs && updatedAt)
  const now = useNow(1000, counting)
  // `now` puede ser del tick anterior a updatedAt: se acota al intervalo.
  const remaining = counting ? Math.min(intervalMs, Math.max(0, intervalMs - (now - updatedAt))) : null
  const fraction = remaining == null ? 1 : remaining / intervalMs
  const seconds = remaining == null ? null : Math.ceil(remaining / 1000)
  const label = loading ? 'Actualizando' : seconds != null ? `Actualizar ahora. Próxima actualización en ${seconds} s` : 'Actualizar ahora'

  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={loading}
      aria-label={label}
      title={label}
      className="group relative grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-card focus-ring disabled:cursor-wait dark:bg-sand-900"
    >
      <svg viewBox="0 0 44 44" aria-hidden="true" className="absolute inset-0 size-full -rotate-90">
        <circle cx="22" cy="22" r={R} fill="none" strokeWidth="3" className="stroke-sand-200 dark:stroke-sand-800" />
        <circle
          cx="22"
          cy="22"
          r={R}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - fraction)}
          className="stroke-accent transition-[stroke-dashoffset] duration-1000 ease-linear motion-reduce:transition-none"
        />
      </svg>
      <Icon
        name={loading ? 'refresh' : 'clock'}
        className={`relative size-5 ${textPrimary} ${loading ? 'motion-safe:animate-spin' : ''}`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 right-full mr-2 -translate-y-1/2 translate-x-1 rounded-lg border border-sand-200 bg-card px-2.5 py-1 text-sm font-semibold whitespace-nowrap opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 dark:border-sand-800 dark:bg-sand-900 ${textPrimary}`}
      >
        {loading ? 'Actualizando…' : 'Actualizar'}
        {seconds != null && !loading ? <span className="ml-1.5 font-normal text-sand-600 tabular-nums dark:text-sand-400">{seconds} s</span> : null}
      </span>
    </button>
  )
}
