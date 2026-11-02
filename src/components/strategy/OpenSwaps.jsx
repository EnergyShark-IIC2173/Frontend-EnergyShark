import { listOpenSwaps } from '../../api/endpoints'
import { useApiQuery } from '../../api/useApiQuery'
import { useNow } from '../../hooks/useNow'
import { fmt } from '../../lib/format'
import { fmtSeconds, swapRow } from '../../lib/swaps'
import { Badge } from '../ui/Badge'
import { EmptyState, ErrorState, LoadingState, StaleNotice } from '../ui/States'
import { TableCard } from '../ui/TableCard'
import { sectionTitle, td, textError, textSecondary, th, tr } from '../ui/classes'

// Swaps en curso de RF04 (DF-040): wallet_operations sin confirmar (S5). Cada 3 s: un swap vive a lo sumo 60 s.
const POLL_MS = 3_000

const asset = (leg) => (leg ? <>{fmt(leg.amount, leg.asset === 'KWH' ? 0 : 2)} <span className={`text-xs ${textSecondary}`}>{leg.asset}</span></> : <span className={textSecondary}>—</span>)

export function OpenSwaps() {
  const { data, loading, error, reload, relogin } = useApiQuery(listOpenSwaps, null, { pollMs: POLL_MS })
  const now = useNow(1000, Boolean(data?.data?.length))
  const rows = (data?.data ?? []).map((op) => swapRow(op, now))
  const notDeployed = error?.status === 404

  let content
  if (!data && loading) content = <LoadingState label="Cargando los swaps en curso…" />
  else if (notDeployed) {
    content = (
      <EmptyState icon="swap" title="Swaps en curso aún no disponibles">
        El backend respondió 404 en <code className="font-mono">/api/swaps</code>.
      </EmptyState>
    )
  } else if (!data && error) content = <ErrorState error={error} onRetry={reload} onRelogin={relogin} />
  else if (rows.length === 0) {
    content = (
      <EmptyState icon="swap" title="No hay swaps en curso">
        Aparecen mientras esperamos la confirmación de la wallet y salen cuando llega el evento (liquidado, rechazado, cancelado o expirado).
      </EmptyState>
    )
  } else {
    content = (
      <TableCard>
        <thead>
          <tr>
            <th className={th}>Operación</th>
            <th className={th}>Swap</th>
            <th className={th}>Entregamos</th>
            <th className={th}>Recibimos</th>
            <th className={th}>Estado</th>
            <th className={th}>Hace</th>
            <th className={th}>Expira en</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className={tr}>
              <td className={`${td} whitespace-nowrap font-medium text-ink dark:text-paper`}>
                {row.action}
                <span className={`block font-mono text-xs font-normal ${textSecondary}`}>{row.cycleId ?? '—'}</span>
              </td>
              <td className={`${td} whitespace-nowrap font-mono`}>{row.swapId ?? <span className={`font-sans ${textSecondary}`}>sin swapId aún</span>}</td>
              <td className={`${td} whitespace-nowrap tabular-nums`}>{asset(row.give)}</td>
              <td className={`${td} whitespace-nowrap tabular-nums`}>{asset(row.take)}</td>
              <td className={td}><Badge tone={row.state.tone}>{row.state.label}</Badge></td>
              <td className={`${td} whitespace-nowrap tabular-nums ${textSecondary}`}>{fmtSeconds(row.ageMs) ?? '—'}</td>
              <td className={`${td} whitespace-nowrap tabular-nums`}>
                {row.expiresInMs === null ? <span className={textSecondary}>—</span>
                  : row.expiresInMs <= 0 ? <span className={textError}>Vencido</span>
                  : fmtSeconds(row.expiresInMs)}
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    )
  }

  return (
    <section aria-labelledby="open-swaps" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="open-swaps" className={sectionTitle}>Swaps en curso</h3>
        <p className={`text-xs ${textSecondary}`}>Se actualiza cada 3 s · {rows.length} en curso</p>
      </div>
      <StaleNotice error={data && !notDeployed ? error : null} />
      {content}
    </section>
  )
}
