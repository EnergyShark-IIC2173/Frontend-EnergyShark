import { cycleProgress, marketPhase, nextMilestone } from '../../lib/cycles'
import { EMPTY, fmt, fmtClock, fmtCountdown, fmtTime } from '../../lib/format'
import { operationLabel } from '../../lib/status'
import { useNow } from '../../hooks/useNow'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { Icon } from '../ui/Icon'
import { btnPrimary, labelBase, textPrimary, textSecondary } from '../ui/classes'
import { PhaseBadge, ReportBadge, WindowLine } from './parts'

const credits = (cycle) => (cycle.finalBalances?.budget == null ? EMPTY : `${fmt(cycle.finalBalances.budget)} CR`)

// Tarjeta grande del ciclo más reciente (DF-033): ocupa la mitad del ancho y se distingue de las demás con la fase,
// el avance del ciclo, la cuenta regresiva al próximo instante de la central y los contadores en grande.
// Con mouse o dedo se abre apretándola entera; con teclado, con su botón.
export function CurrentCycleCard({ cycle, onOpen, style, className = '' }) {
  const closed = marketPhase(cycle) === 'closed' || (!cycle.market && cycle.phase === 'closed')
  const now = useNow(1000, !closed)
  const milestone = nextMilestone(cycle, now)
  const progress = cycleProgress(cycle, now)
  const last = cycle.lastOperationApplied
  const counts = cycle.counts

  return (
    <Card
      highlight
      data-cycle-id={cycle.cycleId}
      onClick={(e) => !window.getSelection()?.toString() && onOpen(e.currentTarget)}
      className={`flex cursor-pointer flex-col gap-5 ${className}`}
      style={style}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={labelBase}>{closed ? 'Último ciclo' : 'Ciclo actual'}</p>
          <h3 className="mt-1 font-mono text-3xl font-bold text-accent-ink dark:text-accent">{cycle.cycleId}</h3>
          <WindowLine cycle={cycle} className="mt-1" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PhaseBadge cycle={cycle} />
          <ReportBadge cycle={cycle} />
        </div>
      </div>

      {progress ? (
        <div>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className={textSecondary}>{milestone ? milestone.label : 'Ciclo terminado'}</span>
            {milestone ? (
              <span className={`font-display font-bold tabular-nums ${textPrimary}`}>
                en {fmtCountdown(milestone.at, now) ?? 'instantes'} <span className={`font-sans font-normal ${textSecondary}`}>({fmtTime(milestone.at)})</span>
              </span>
            ) : null}
          </div>
          {/* Avance del ciclo: mercado y luego cierre. La barra crece con scaleX (solo transform). */}
          <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-sand-100 dark:bg-sand-800" aria-hidden="true">
            <span className="absolute inset-0 origin-left rounded-full bg-accent transition-transform duration-300 ease-out motion-reduce:transition-none" style={{ transform: `scaleX(${progress.value})` }} />
            {progress.marketEnds != null ? <span className="absolute inset-y-0 w-0.5 bg-card dark:bg-sand-900" style={{ left: `${progress.marketEnds * 100}%` }} /> : null}
          </div>
          <div className={`mt-1 flex justify-between text-xs ${textSecondary}`}>
            <span>Mercado</span>
            <span>Cierre</span>
          </div>
        </div>
      ) : null}

      {counts ? (
        <dl className="grid grid-cols-3 gap-3">
          {[
            ['Bids recibidos', counts.bidsReceived],
            ['Bids enviados', counts.bidsSent],
            ['Swaps liquidados', counts.swapsSettled],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-sand-100 p-3 dark:bg-sand-800">
              <dt className={labelBase}>{label}</dt>
              <dd className={`mt-1 font-display text-3xl font-bold tabular-nums ${textPrimary}`}>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 dark:bg-accent-soft">
        <Icon name="bolt" className="size-5 text-accent-ink dark:text-accent" />
        <p className={`text-sm ${textPrimary}`}>
          <span className={`${labelBase} mr-2`}>Última operación aplicada</span>
          {last ? <span className="font-semibold tabular-nums">{operationLabel(last.type)} · {fmtTime(last.appliedAt)}</span> : <span>Ninguna todavía</span>}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        <p className={`text-sm ${textSecondary}`}>
          Créditos al cierre <span className={`font-semibold tabular-nums ${textPrimary}`}>{credits(cycle)}</span>
        </p>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={(e) => {
            e.stopPropagation()
            onOpen(e.currentTarget.closest('[data-cycle-id]'))
          }}
          className={btnPrimary}
        >
          Ver detalle
          <Icon name="expand" className="size-4" />
        </button>
      </div>
    </Card>
  )
}

// Tarjeta chica (DF-033): la tarjeta entera es el botón que abre el diálogo.
export function CycleTile({ cycle, onOpen, style, className = '' }) {
  const last = cycle.lastOperationApplied
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      data-cycle-id={cycle.cycleId}
      onClick={(e) => onOpen(e.currentTarget)}
      style={style}
      className={`group flex h-full cursor-pointer flex-col gap-3 rounded-2xl border border-sand-200 bg-card p-5 text-left edge-light transition-[border-color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-sand-300 focus-ring motion-safe:hover:-translate-y-0.5 dark:border-sand-800 dark:bg-sand-900 dark:hover:border-sand-700 ${className}`}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className={`block font-mono text-lg font-bold ${textPrimary}`}>{cycle.cycleId}</span>
          <WindowLine cycle={cycle} compact className="mt-0.5 !text-xs" />
        </span>
        <PhaseBadge cycle={cycle} />
      </span>
      <span className="flex flex-wrap gap-1.5">
        <ReportBadge cycle={cycle} />
        {cycle.counts ? <Badge tone={cycle.counts.swapsSettled > 0 ? 'active' : 'neutral'}>{cycle.counts.swapsSettled} swaps</Badge> : null}
      </span>
      <span className="mt-auto block border-t border-sand-200 pt-3 dark:border-sand-800">
        <span className={`block text-xs ${textSecondary}`}>Créditos al cierre</span>
        <span className={`block font-display text-lg font-bold tabular-nums ${textPrimary}`}>{credits(cycle)}</span>
        <span className={`mt-1 flex items-center gap-1.5 text-xs ${textSecondary}`}>
          <Icon name="bolt" className="size-3.5 text-accent-ink dark:text-accent" />
          {last ? `${operationLabel(last.type)} · ${fmtClock(last.appliedAt)}` : 'Sin operaciones'}
        </span>
      </span>
    </button>
  )
}
