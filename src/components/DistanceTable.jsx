import { getDistanceTable } from '../api/endpoints'
import { useApiQuery } from '../api/useApiQuery'
import { fmt, fmtDate } from '../lib/format'
import { Badge } from './ui/Badge'
import { EmptyState, ErrorState, LoadingState, StaleNotice } from './ui/States'
import { TableCard } from './ui/TableCard'
import { RefreshButton, ViewHeader } from './ui/ViewHeader'
import { td, th, tr } from './ui/classes'

// RF02: la tabla se ve "actualizada cuando la central publique cambios" (DF-015).
const POLL_MS = 60_000

export function DistanceTable() {
  const { data, loading, error, reload, relogin } = useApiQuery(getDistanceTable, null, { pollMs: POLL_MS })
  const entries = Object.entries(data?.distances ?? {}).sort(([a], [b]) => a.localeCompare(b))
  // 404: GET /api/distance-table puede no estar desplegado en el EC2 todavía (DF-016). No es un error rojo.
  const notDeployed = error?.status === 404

  let content
  if (!data && loading) content = <LoadingState label="Cargando la distance-table…" />
  else if (notDeployed) {
    content = (
      <EmptyState icon="network" title="Sin datos o endpoint aún no desplegado">
        El backend respondió 404 en <code className="font-mono">/api/distance-table</code>. Se revisa de nuevo cada {POLL_MS / 1000} s.
      </EmptyState>
    )
  } else if (!data && error) content = <ErrorState error={error} onRetry={reload} onRelogin={relogin} />
  else if (entries.length === 0) {
    content = (
      <EmptyState icon="network" title="La central todavía no publica una distance-table">
        Se revisa de nuevo cada {POLL_MS / 1000} s.
      </EmptyState>
    )
  } else {
    content = (
      <TableCard>
        <thead>
          <tr>
            <th className={th}>Destino</th>
            <th className={th}>Distancia <span className="normal-case">(m)</span></th>
            <th className={th}>Costo <span className="normal-case">(cr/kWh*km)</span></th>
            <th className={th}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([destination, row]) => (
            <tr key={destination} className={tr}>
              <td className={`${td} font-semibold text-accent`}>{destination}</td>
              <td className={`${td} whitespace-nowrap tabular-nums`}>{fmt(row?.distance, 0)}</td>
              <td className={`${td} whitespace-nowrap tabular-nums`}>{fmt(row?.transportCost, 6)}</td>
              <td className={td}>
                <Badge tone={row?.enabled ? 'cyan' : 'pink'}>
                  {row?.enabled ? 'Habilitado' : 'Deshabilitado'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <ViewHeader
        title={data?.cityId ? `Conectividad de ${data.cityId}` : 'Conectividad'}
        subtitle={`Última actualización: ${data?.updatedAt ? fmtDate(data.updatedAt) : 'sin datos aún'} · se revisa cada ${POLL_MS / 1000} s.`}
      >
        <RefreshButton onClick={reload} loading={loading} />
      </ViewHeader>
      <StaleNotice error={data && !notDeployed ? error : null} />
      {content}
    </div>
  )
}
