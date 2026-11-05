import { getDistanceTable } from '../api/endpoints'
import { useApiQuery } from '../api/useApiQuery'
import { fmt, fmtDate } from '../lib/format'
import { routeTransport } from '../lib/market'
import { disabledRoutes, distanceKm } from '../lib/transport'
import { Badge } from './ui/Badge'
import { EmptyState, ErrorState, LoadingState, StaleNotice } from './ui/States'
import { TableCard } from './ui/TableCard'
import { RefreshTimer } from './ui/RefreshTimer'
import { Marker, ViewHeader } from './ui/ViewHeader'
import { td, th, tr } from './ui/classes'

// RF02: la tabla se ve "actualizada cuando la central publique cambios" (DF-015). Transporte por kWh y rutas
// deshabilitadas destacadas para la E2 (DF-029); tarifa punitiva y "rige la última tabla" (DF-039).
const POLL_MS = 60_000

function PunitiveCell({ perKwh }) {
  return (
    <span className="text-coral-ink dark:text-coral">
      {perKwh != null ? <>{fmt(perKwh)} <span className="text-xs">punitiva</span></> : 'Tarifa punitiva'}
    </span>
  )
}

export function DistanceTable() {
  const { data, loading, error, reload, relogin, updatedAt, interval } = useApiQuery(getDistanceTable, null, { pollMs: POLL_MS })
  const entries = Object.entries(data?.distances ?? {}).sort(([a], [b]) => a.localeCompare(b))
  // 404: GET /api/distance-table puede no estar desplegado en el EC2 todavía (DF-016). No es un error rojo.
  const notDeployed = error?.status === 404
  const disabled = disabledRoutes(data?.distances)
  const punitiveRate = data?.disabledRouteTransportCost

  let content
  if (!data && loading) content = <LoadingState label="Cargando la distance-table…" />
  else if (notDeployed) {
    content = (
      <EmptyState icon="network" title="Sin datos o endpoint aún no desplegado">
        El backend respondió 404 en <code className="font-mono">/api/distance-table</code>.
      </EmptyState>
    )
  } else if (!data && error) content = <ErrorState error={error} onRetry={reload} onRelogin={relogin} />
  else if (entries.length === 0) {
    content = (
      <EmptyState icon="network" title="La central todavía no publica una distance-table">
        Aparece en cuanto la central la publique.
      </EmptyState>
    )
  } else {
    content = (
      <>
      {disabled.length > 0 ? (
        <p role="status" className="flex flex-wrap items-center gap-2 rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 dark:bg-coral/15 text-sm text-ink dark:text-paper">
          <Badge tone="error">{disabled.length} {disabled.length === 1 ? 'ruta deshabilitada' : 'rutas deshabilitadas'}</Badge>
          {disabled.join(', ')} · comprarles cobra la tarifa punitiva
          {punitiveRate != null ? <> de <span className="font-mono tabular-nums">{fmt(punitiveRate, 6)}</span> CR/kWh·km</> : ' de la distance-table'}.
        </p>
      ) : null}
      <TableCard>
        <thead>
          <tr>
            <th className={th}>Destino</th>
            <th className={th}>Distancia <span className="normal-case">(km)</span></th>
            <th className={th}>Costo <span className="normal-case">(CR/kWh·km)</span></th>
            <th className={th}>Transporte <span className="normal-case">(CR/kWh)</span></th>
            <th className={th}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([destination, row]) => (
            <tr key={destination} className={`${tr} ${row?.enabled === false ? 'bg-coral/10' : ''}`}>
              <td className={`${td} font-mono font-bold text-ink dark:text-paper`}>{destination}</td>
              <td className={`${td} whitespace-nowrap tabular-nums`}>{fmt(distanceKm(row), 0)}</td>
              <td className={`${td} whitespace-nowrap tabular-nums`}>{fmt(row?.transportCost, 6)}</td>
              <td className={`${td} whitespace-nowrap tabular-nums`}>
                {row?.enabled === false ? <PunitiveCell perKwh={routeTransport(row, punitiveRate).perKwh} /> : fmt(routeTransport(row).perKwh)}
              </td>
              <td className={td}>
                <Badge tone={row?.enabled ? 'active' : 'error'}>
                  {row?.enabled ? 'Habilitado' : 'Deshabilitado'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>
      </>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <ViewHeader
        title={<><Marker>Conectividad</Marker>{data?.cityId ? <> de <span className="font-mono">{data.cityId}</span></> : null}</>}
        subtitle={data?.updatedAt ? `Rige la última tabla publicada por la central: ${fmtDate(data.updatedAt)}` : 'Sin tabla publicada aún'}
      >
        <RefreshTimer updatedAt={updatedAt} intervalMs={interval} loading={loading} onRefresh={reload} />
      </ViewHeader>
      <StaleNotice error={data && !notDeployed ? error : null} />
      {content}
    </div>
  )
}
