import { useState } from 'react'
import { getDistanceTable, getMarketBook } from '../api/endpoints'
import { useApiQuery } from '../api/useApiQuery'
import { fmt, fmtTime } from '../lib/format'
import { bestOffer, bookRows, sortRows } from '../lib/market'
import { Badge } from './ui/Badge'
import { Icon } from './ui/Icon'
import { RefreshTimer } from './ui/RefreshTimer'
import { StatTile } from './ui/StatTile'
import { EmptyState, ErrorState, LoadingState, StaleNotice } from './ui/States'
import { TableCard } from './ui/TableCard'
import { Marker, ViewHeader } from './ui/ViewHeader'
import { td, textSecondary, th, tr } from './ui/classes'

// RF02 (DF-038, DF-045): libro de ofertas de market.{CODE}. master calcula el transporte y el precio efectivo con
// la distance-table vigente; la tabla solo da la ciudad propia y su hora. Libro cada 5 s y tabla cada 10 s: un
// offer-updated o una ruta caída se ven en segundos (anomalía 6). El reloj del mercado vive en la sidebar (DF-044).
const BOOK_POLL_MS = 5_000
const TABLE_POLL_MS = 10_000

const COLUMNS = [
  { key: 'pricePerEnergy', label: 'Precio', unit: 'CR/kWh' },
  { key: 'remaining', label: 'Remaining', unit: 'kWh' },
  { key: 'effectivePrice', label: 'Precio efectivo', unit: 'CR/kWh' },
]

function RouteBadge({ row }) {
  if (row.status === 'own') return <Badge tone="category">Propia</Badge>
  if (row.status === 'no-route') return <Badge tone="warning">Sin ruta</Badge>
  if (row.status === 'disabled') return <Badge tone="error">Deshabilitada</Badge>
  return <Badge tone="active">Habilitada</Badge>
}

function TransportCell({ row }) {
  if (row.status === 'own' || row.status === 'no-route') return <span className={textSecondary}>—</span>
  if (row.status === 'disabled') {
    return (
      <span className="text-coral-ink dark:text-coral">
        {row.transport.perKwh != null ? <>{fmt(row.transport.perKwh)} <span className="text-xs">punitiva</span></> : 'Tarifa punitiva'}
      </span>
    )
  }
  return fmt(row.transport.perKwh)
}

function SortHeader({ column, sort, onSort }) {
  const active = sort.key === column.key
  const ariaSort = active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'
  return (
    <th className={th} aria-sort={ariaSort}>
      <button
        type="button"
        onClick={() => onSort(column.key)}
        className="inline-flex cursor-pointer items-center gap-1 rounded uppercase tracking-wider focus-ring"
      >
        {column.label} <span className="normal-case">({column.unit})</span>
        <Icon name={active ? (sort.dir === 'asc' ? 'chevron' : 'chevronUp') : 'updown'} className={`size-3.5 ${active ? '' : 'opacity-50'}`} />
      </button>
    </th>
  )
}

export function MarketBook() {
  const book = useApiQuery(getMarketBook, null, { pollMs: BOOK_POLL_MS })
  const table = useApiQuery(getDistanceTable, null, { pollMs: TABLE_POLL_MS })
  const [sort, setSort] = useState({ key: 'effectivePrice', dir: 'asc' })

  function onSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'remaining' ? 'desc' : 'asc' }))
  }

  const rows = sortRows(bookRows(book.data, table.data?.cityId), sort.key, sort.dir)
  const best = bestOffer(rows)
  const disabledSellers = rows.filter((r) => r.status === 'disabled').map((r) => r.cityId)
  // 404: el EC2 corre una versión sin S6. No es un error rojo (como DF-016 en Conectividad).
  const notDeployed = book.error?.status === 404

  let content
  if (!book.data && book.loading) content = <LoadingState label="Cargando el libro de ofertas…" />
  else if (notDeployed) {
    content = (
      <EmptyState icon="market" title="Libro de ofertas aún no disponible">
        El backend respondió 404 en <code className="font-mono">/api/market/book</code>: la versión desplegada no trae el libro.
      </EmptyState>
    )
  } else if (!book.data && book.error) content = <ErrorState error={book.error} onRetry={book.reload} onRelogin={book.relogin} />
  else if (rows.length === 0) {
    content = (
      <EmptyState icon="market" title="Sin ofertas vigentes">
        Nadie ha publicado su <code className="font-mono">offer</code> o el mercado ya cerró (<code className="font-mono">market-closed</code>).
        El libro se llena apenas una ciudad publique en el ciclo siguiente.
      </EmptyState>
    )
  } else {
    content = (
      <>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Ofertas vigentes" value={rows.length} unit={rows.length === 1 ? 'vendedor' : 'vendedores'} icon="market" />
          <StatTile
            label="Mejor precio efectivo"
            value={best ? fmt(best.effectivePrice) : '—'}
            unit={best ? `CR/kWh · ${best.cityId}` : ''}
            icon="bolt"
          />
          <StatTile
            label="Rutas deshabilitadas"
            value={disabledSellers.length}
            unit={disabledSellers.length ? disabledSellers.join(', ') : 'ninguna'}
            tone={disabledSellers.length ? 'warning' : 'neutral'}
            icon="network"
          />
        </div>
        {!table.data && table.error ? (
          <p role="status" className="rounded-xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm dark:bg-rose-soft">
            No se pudo cargar la distance-table: la oferta propia puede aparecer como “Sin ruta”.
          </p>
        ) : null}
        <TableCard>
          <thead>
            <tr>
              <th className={th}>Ciudad</th>
              <SortHeader column={COLUMNS[0]} sort={sort} onSort={onSort} />
              <SortHeader column={COLUMNS[1]} sort={sort} onSort={onSort} />
              <th className={th}>Transporte <span className="normal-case">(CR/kWh)</span></th>
              <SortHeader column={COLUMNS[2]} sort={sort} onSort={onSort} />
              <th className={th}>Ruta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.offerId} className={`${tr} ${row.status === 'disabled' ? 'bg-coral/10' : ''}`}>
                <td className={`${td} font-mono font-bold text-ink dark:text-paper`} title={row.offerId}>{row.cityId}</td>
                <td className={`${td} whitespace-nowrap tabular-nums`}>{fmt(row.pricePerEnergy)}</td>
                <td className={`${td} whitespace-nowrap tabular-nums`}>
                  {fmt(row.remaining, 0)}
                  <span className={`ml-1 text-xs ${textSecondary}`}>de {fmt(row.quantity, 0)}</span>
                </td>
                <td className={`${td} whitespace-nowrap tabular-nums`}><TransportCell row={row} /></td>
                <td className={`${td} whitespace-nowrap font-semibold tabular-nums text-ink dark:text-paper`}>
                  {row.effectivePrice != null ? fmt(row.effectivePrice) : <span className={`font-normal ${textSecondary}`}>—</span>}
                </td>
                <td className={td}><RouteBadge row={row} /></td>
              </tr>
            ))}
          </tbody>
        </TableCard>
        <p className={`text-xs ${textSecondary}`}>
          Precio efectivo = precio + transporte por kWh según la última distance-table
          {book.data?.distanceTableUpdatedAt ? <> ({fmtTime(book.data.distanceTableUpdatedAt)})</> : null}, calculado por el backend. El remaining puede estar viejo: el
          vendedor responde <code className="font-mono">QUANTITY_UNAVAILABLE</code> con lo que de verdad le queda.
        </p>
      </>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <ViewHeader
        title={<><Marker>Mercado</Marker>{book.data?.cycleId ? <> · <span className="font-mono">{book.data.cycleId}</span></> : null}</>}
        subtitle="Libro de ofertas de market.{CODE}"
      >
        <RefreshTimer updatedAt={book.updatedAt} intervalMs={book.interval} loading={book.loading} onRefresh={() => { book.reload(); table.reload() }} />
      </ViewHeader>
      <StaleNotice error={book.data && !notDeployed ? book.error : null} />
      {content}
    </div>
  )
}
