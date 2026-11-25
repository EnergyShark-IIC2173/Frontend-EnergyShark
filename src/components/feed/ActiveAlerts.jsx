import { fmt, fmtTime } from '../../lib/format'
import { Card } from '../ui/Card'
import { Icon } from '../ui/Icon'
import { sectionTitle, textError, textPrimary, textSecondary } from '../ui/classes'

// Alertas disparadas que siguen abiertas, con su umbral y el enlace al runbook (DF-047, RNF01/RDOC04).
export function ActiveAlerts({ alerts }) {
  if (alerts.length === 0) return null
  return (
    <Card>
      <h3 className={`flex items-center gap-2 ${sectionTitle}`}>
        <Icon name="warning" className={`size-5 ${textError}`} />
        Alertas disparadas
      </h3>
      <ul className="mt-3 flex flex-col gap-2">
        {alerts.map((a) => (
          <li key={a.event.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
            <span className={`font-semibold ${textPrimary}`}>{a.label}</span>
            <span className={`tabular-nums ${textSecondary}`}>
              {a.value != null ? <>valor {fmt(a.value)}{a.event.payload?.unit ? ` ${a.event.payload.unit}` : ''} · umbral {fmt(a.threshold)} · </> : null}
              desde {fmtTime(a.event.ts)} ·{' '}
              <a href={a.runbookUrl} target="_blank" rel="noreferrer" className="font-semibold text-accent-ink underline-offset-2 hover:underline focus-ring dark:text-accent">
                Runbook
              </a>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
