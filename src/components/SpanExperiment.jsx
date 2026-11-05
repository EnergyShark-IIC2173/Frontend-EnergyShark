import { useState } from 'react'
import { listCycleMetrics, listSpanMetrics } from '../api/endpoints'
import { useApiQuery } from '../api/useApiQuery'
import { fmt, fmtTime } from '../lib/format'
import { bestSpan, cycleRow, spanRows, totals } from '../lib/experiment'
import { Badge } from './ui/Badge'
import { Pager } from './ui/Pager'
import { RefreshTimer } from './ui/RefreshTimer'
import { StatTile } from './ui/StatTile'
import { EmptyState, ErrorState, LoadingState, StaleNotice } from './ui/States'
import { TableCard } from './ui/TableCard'
import { Marker, ViewHeader } from './ui/ViewHeader'
import { sectionTitle, td, textSecondary, th, tr } from './ui/classes'

// RF06 (DF-041, ADR-006, AD6): experimento de span. Cada ciclo cuenta para el span de su snapshot
// (cycle_strategy), no para la configuración vigente. Las métricas cambian una vez por ciclo: recarga cada 60 s.
const POLL_MS = 60_000
const LIMIT = 10

const pct = (value, digits = 1) => (value === null || value === undefined ? '—' : `${fmt(value * 100, digits)} %`)

// Medidor de una sola serie dentro de la celda: la cifra va en texto al lado, la barra es decorativa.
function SavingsMeter({ value }) {
  if (value === null || value === undefined) return <span className={textSecondary}>—</span>
  const width = Math.min(100, Math.abs(value) * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-right font-semibold tabular-nums text-ink dark:text-paper">{pct(value)}</span>
      <span aria-hidden="true" className="h-2 w-28 shrink-0 overflow-hidden rounded-full bg-sand-100 dark:bg-sand-800">
        <span className={`block h-full rounded-full ${value >= 0 ? 'bg-accent' : 'bg-sand-400'}`} style={{ width: `${width}%` }} />
      </span>
    </div>
  )
}

function SpanTable({ rows, best }) {
  return (
    <TableCard>
      <caption className="sr-only">Experimento agregado por valor de span</caption>
      <thead>
        <tr>
          <th className={th}>Span</th>
          <th className={th}>Ciclos</th>
          <th className={th}>Cobertura</th>
          <th className={th}>Costo efectivo <span className="normal-case">(CR)</span></th>
          <th className={th}>Baseline <span className="normal-case">(CR)</span></th>
          <th className={th}>Ahorro relativo</th>
          <th className={th}>Bids rechazados</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.spanSeconds} className={`${tr} ${r.spanSeconds === best ? 'bg-accent/5 dark:bg-accent-soft/40' : ''}`}>
            <td className={`${td} whitespace-nowrap`}>
              <span className="font-mono font-bold text-ink dark:text-paper">{r.spanSeconds} s</span>
              {r.spanSeconds === best ? <Badge tone="settled" className="ml-2">Mejor span</Badge> : null}
            </td>
            <td className={`${td} tabular-nums`}>{r.cycles}</td>
            <td className={`${td} whitespace-nowrap tabular-nums`}>
              {pct(r.coverage)}
              <span className={`block text-xs ${textSecondary}`}>{fmt(r.coveredKwh, 0)} de {fmt(r.deficitKwh, 0)} kWh</span>
            </td>
            <td className={`${td} whitespace-nowrap tabular-nums`}>{fmt(r.effectiveCost)}</td>
            <td className={`${td} whitespace-nowrap tabular-nums`}>{fmt(r.baselineCost)}</td>
            <td className={td}><SavingsMeter value={r.savingsRatio} /></td>
            <td className={`${td} whitespace-nowrap tabular-nums`}>
              {r.bidsRejected}
              <span className={`block text-xs ${textSecondary}`}>{fmt(r.bidsRejectedPerCycle, 1)} por ciclo</span>
            </td>
          </tr>
        ))}
      </tbody>
    </TableCard>
  )
}

function CycleTable({ rows }) {
  return (
    <TableCard>
      <caption className="sr-only">Experimento por ciclo</caption>
      <thead>
        <tr>
          <th className={th}>Ciclo</th>
          <th className={th}>Span usado</th>
          <th className={th}>Déficit <span className="normal-case">(kWh)</span></th>
          <th className={th}>Cubierto en mercado</th>
          <th className={th}>Costo efectivo <span className="normal-case">(CR)</span></th>
          <th className={th}>Baseline <span className="normal-case">(CR)</span></th>
          <th className={th}>Ahorro <span className="normal-case">(CR)</span></th>
          <th className={th}>Bids rechazados</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.cycleId} className={tr}>
            <td className={`${td} whitespace-nowrap`}>
              <span className="font-mono font-bold text-ink dark:text-paper">{r.cycleId}</span>
              <span className={`block text-xs ${textSecondary}`}>calculado {fmtTime(r.computedAt)}</span>
            </td>
            <td className={`${td} whitespace-nowrap`}>
              <span className="font-mono tabular-nums">{r.spanSeconds} s</span>
              <span className={`block text-xs ${textSecondary}`}>config v{r.configVersion ?? '—'}</span>
            </td>
            <td className={`${td} tabular-nums`}>{fmt(r.deficitKwh, 0)}</td>
            <td className={`${td} whitespace-nowrap tabular-nums`}>
              {fmt(r.coveredKwh, 0)} <span className={`text-xs ${textSecondary}`}>({pct(r.coverage, 0)})</span>
            </td>
            <td className={`${td} whitespace-nowrap tabular-nums`}>{fmt(r.effectiveCost)}</td>
            <td className={`${td} whitespace-nowrap tabular-nums`}>{fmt(r.baselineCost)}</td>
            <td className={`${td} whitespace-nowrap font-semibold tabular-nums text-ink dark:text-paper`}>
              {fmt(r.savings)} <span className={`text-xs font-normal ${textSecondary}`}>{pct(r.savingsRatio, 0)}</span>
            </td>
            <td className={`${td} tabular-nums`}>{r.bidsRejected}</td>
          </tr>
        ))}
      </tbody>
    </TableCard>
  )
}

export function SpanExperiment() {
  const spans = useApiQuery(listSpanMetrics, null, { pollMs: POLL_MS })
  const [page, setPage] = useState(1)
  const cycles = useApiQuery((api) => listCycleMetrics(api, { page, limit: LIMIT }), { page }, { pollMs: POLL_MS })

  const rows = spanRows(spans.data?.data)
  const best = bestSpan(rows)
  const all = totals(rows)
  const notDeployed = spans.error?.status === 404

  let content
  if (!spans.data && spans.loading) content = <LoadingState label="Cargando el experimento de span…" />
  else if (notDeployed) {
    content = (
      <EmptyState icon="chart" title="Métricas del experimento aún no disponibles">
        El backend respondió 404 en <code className="font-mono">/api/metrics/spans</code>.
      </EmptyState>
    )
  } else if (!spans.data && spans.error) content = <ErrorState error={spans.error} onRetry={spans.reload} onRelogin={spans.relogin} />
  else if (rows.length === 0) {
    content = (
      <EmptyState icon="chart" title="Todavía no hay ciclos medidos">
        Las métricas se calculan al cierre de cada ciclo en que compramos.
      </EmptyState>
    )
  } else {
    content = (
      <>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Ciclos medidos" value={all.cycles} unit={`en ${rows.length} ${rows.length === 1 ? 'span' : 'spans'}`} icon="chart" tone="neutral" />
          <StatTile label="Ahorro relativo total" value={pct(all.savingsRatio)} unit="Σ ahorro / Σ |baseline|" icon="bolt" />
          <StatTile label="Mejor span" value={best !== null ? `${best} s` : '—'} unit={best !== null ? 'mayor ahorro relativo' : 'falta un span con 3 ciclos'} icon="clock" tone="category" />
        </div>
        <section aria-labelledby="span-aggregate" className="flex flex-col gap-3">
          <h3 id="span-aggregate" className={sectionTitle}>Agregado por span</h3>
          <SpanTable rows={rows} best={best} />
        </section>
        <section aria-labelledby="span-cycles" className="flex flex-col gap-3">
          <h3 id="span-cycles" className={sectionTitle}>Por ciclo</h3>
          {cycles.data?.data?.length ? (
            <>
              <CycleTable rows={cycles.data.data.map(cycleRow)} />
              <Pager label="Paginación de ciclos medidos" noun="ciclos" page={cycles.data.page} totalPages={cycles.data.totalPages} total={cycles.data.total} onChange={setPage} disabled={cycles.loading} />
            </>
          ) : cycles.error ? <ErrorState error={cycles.error} onRetry={cycles.reload} onRelogin={cycles.relogin} /> : <LoadingState label="Cargando los ciclos…" />}
        </section>
      </>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <ViewHeader title={<><Marker>Experimento</Marker> de span</>} subtitle="Cada ciclo cuenta para el span de su snapshot (cycle_strategy), no para la configuración actual.">
        <RefreshTimer updatedAt={spans.updatedAt} intervalMs={spans.interval} loading={spans.loading} onRefresh={() => { spans.reload(); cycles.reload() }} />
      </ViewHeader>
      <StaleNotice error={spans.data && !notDeployed ? spans.error : null} />
      {content}
      <p className={`text-xs ${textSecondary}`}>
        Ahorro = baseline − costo efectivo (compras + transporte + faltante liquidado). Baseline = déficit × imbalancePrice. Ahorro relativo = Σ ahorro / Σ |baseline|, la razón del leaderboard.
      </p>
    </div>
  )
}
