import { BID_RESULT, SAGA_ROLE, SAGA_STATUS, SEVERITY, alertInfo, feedType } from '../../lib/feed'
import { fmtTime, truncId } from '../../lib/format'
import { Badge } from '../ui/Badge'
import { Icon } from '../ui/Icon'
import { divider, textPrimary, textSecondary } from '../ui/classes'

function Id({ label, value }) {
  if (!value) return null
  return (
    <span className={`text-xs ${textSecondary}`}>
      {label} <span className={`font-mono ${textPrimary}`} title={value}>{truncId(value, 12)}</span>
    </span>
  )
}

// Badges propios de cada tipo: estado de la saga, resultado del bid, alerta abierta o resuelta.
function Extra({ event }) {
  const ex = event.execution
  if (ex) {
    const st = SAGA_STATUS[ex.status]
    return (
      <>
        {ex.role ? <Badge tone="category">{SAGA_ROLE[ex.role] ?? ex.role}</Badge> : null}
        {ex.status ? <Badge tone={st?.tone ?? 'neutral'}>{st?.label ?? ex.status}</Badge> : null}
      </>
    )
  }
  if (event.type === 'market.bid_result' && event.payload?.result) {
    const r = BID_RESULT[event.payload.result]
    return <Badge tone={r?.tone ?? 'neutral'}>{r?.label ?? event.payload.result}</Badge>
  }
  if (event.type === 'alert.fired') {
    const a = alertInfo(event)
    return <Badge tone={a.state === 'open' ? 'error' : 'neutral'}>{a.state === 'open' ? 'Abierta' : 'Resuelta'}</Badge>
  }
  return null
}

// Una fila del feed. Se abre con <details> para ver el payload completo; sin estado propio.
export function FeedRow({ event, fresh }) {
  const t = feedType(event.type)
  const sev = SEVERITY[event.severity]
  const consoleUrl = event.execution?.consoleUrl
  return (
    <li className={`border-t first:border-t-0 ${divider} ${fresh ? 'motion-safe:animate-fade-in' : ''}`}>
      <details className="group">
        <summary className="flex cursor-pointer list-none flex-col gap-2 px-5 py-3 transition-colors hover:bg-sand-100 focus-ring sm:flex-row sm:items-start sm:gap-4 dark:hover:bg-sand-800 [&::-webkit-details-marker]:hidden">
          <span className={`flex shrink-0 items-center gap-2 text-xs tabular-nums sm:w-36 ${textSecondary}`}>
            <Icon name="chevron" className="size-3.5 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
            {fmtTime(event.ts)}
            <span className="font-mono">#{event.id}</span>
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="flex flex-wrap items-center gap-1.5">
              <Badge tone={t.tone}>
                <Icon name={t.icon} className="size-3.5" />
                {t.label}
              </Badge>
              {event.severity !== 'info' ? <Badge tone={sev.tone}>{sev.label}</Badge> : null}
              <Extra event={event} />
            </span>
            <span className={`text-sm break-words ${textPrimary}`}>{event.summary || event.type}</span>
            <span className="flex flex-wrap gap-x-4 gap-y-1">
              <Id label="ciclo" value={event.cycleId} />
              <Id label="swap" value={event.swapId} />
              <Id label="idpk" value={event.idpk} />
            </span>
          </span>
          {consoleUrl ? (
            <a
              href={consoleUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start rounded-xl px-2 text-sm font-semibold text-accent-ink hover:bg-sand-100 focus-ring sm:min-h-0 sm:py-1 dark:text-accent dark:hover:bg-sand-800"
            >
              Ver ejecución
              <Icon name="external" className="size-4" />
            </a>
          ) : null}
        </summary>
        <div className="px-5 pb-4 sm:pl-[10.25rem]">
          {event.execution?.arn ? (
            <p className={`mb-2 text-xs break-all ${textSecondary}`}>
              Ejecución <span className={`font-mono ${textPrimary}`}>{event.execution.arn}</span>
            </p>
          ) : null}
          <pre className="overflow-x-auto rounded-xl bg-sand-100 p-3 font-mono text-xs text-ink dark:bg-sand-800 dark:text-paper">
            {JSON.stringify(event.payload ?? {}, null, 2)}
          </pre>
        </div>
      </details>
    </li>
  )
}
