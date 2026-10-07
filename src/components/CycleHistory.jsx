import { useState } from 'react'
import { listCycles } from '../api/endpoints'
import { useApiQuery } from '../api/useApiQuery'
import { matchLastOperation, reportPending } from '../lib/cycles'
import { fmt, fmtDate, fmtTime } from '../lib/format'
import { paymentAmount, priceCap, round2 } from '../lib/negotiation'
import { cyclePhase, directionLabel, negotiationStatus, operationLabel, origin } from '../lib/status'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'
import { Icon } from './ui/Icon'
import { Pagination } from './ui/Pagination'
import { StatTile } from './ui/StatTile'
import { EmptyState, ErrorState, LoadingState, StaleNotice } from './ui/States'
import { RefreshButton, ViewHeader } from './ui/ViewHeader'
import { focusRing, labelBase } from './ui/classes'

// Cada tarjeta es grande: 10 por página (DF-020). Polling suave solo en la página 1, donde está el ciclo en curso.
const LIMIT = 10
const POLL_MS = 30_000

export function CycleHistory() {
  const [page, setPage] = useState(1)
  const { data, loading, error, reload, relogin } = useApiQuery(
    (api) => listCycles(api, { page, limit: LIMIT }),
    { page },
    { pollMs: page === 1 ? POLL_MS : null },
  )
  const cycles = data?.data ?? []

  let content
  if (!data && loading) content = <LoadingState label="Cargando ciclos…" />
  else if (!data && error) content = <ErrorState error={error} onRetry={reload} onRelogin={relogin} />
  else if (cycles.length === 0) {
    content = <EmptyState title="Aún no hay ciclos">Aparecen cuando la central abre el primer ciclo de la ciudad.</EmptyState>
  } else {
    content = (
      <>
        {cycles.map((cycle, i) => (
          <CycleCard key={cycle.cycleId} cycle={cycle} defaultOpen={i === 0} />
        ))}
        <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={setPage} disabled={loading} />
      </>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <ViewHeader
        title="Historial de Ciclos"
        subtitle={page === 1 ? `Más reciente primero (RF01). La página 1 se actualiza cada ${POLL_MS / 1000} s.` : 'Más reciente primero (RF01).'}
      >
        <RefreshButton onClick={reload} loading={loading} />
      </ViewHeader>
      <StaleNotice error={data ? error : null} />
      {content}
    </div>
  )
}

function ReportBadge({ cycle }) {
  if (cycle.negotiationReportSent) return <Badge tone="success">Reporte enviado</Badge>
  if (reportPending(cycle)) return <Badge tone="neutral">Reporte pendiente</Badge>
  return <Badge tone="pink">Reporte no enviado</Badge>
}

function CycleCard({ cycle, defaultOpen }) {
  const phase = cyclePhase(cycle.phase)
  const last = cycle.lastOperationApplied
  const match = matchLastOperation(cycle)

  return (
    <Card highlight={defaultOpen}>
      {/* Cabecera siempre visible: RF01 exige identificar la última operación aplicada (DF-020). */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={labelBase}>Ciclo</p>
          <h3 className="mt-1 flex flex-wrap items-center gap-2 text-xl font-semibold text-accent">
            {cycle.cycleId}
            <Badge tone={phase.tone}>{phase.label}</Badge>
          </h3>
          <p className="mt-1 text-sm text-text tabular-nums">
            Ventana: {cycle.windowOpensAt ? `${fmtDate(cycle.windowOpensAt)} – ${fmtTime(cycle.windowClosesAt)}` : '—'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ReportBadge cycle={cycle} />
          <Badge tone="cyan">Budget final {cycle.finalBalances?.budget == null ? '—' : `${fmt(cycle.finalBalances.budget)} cr`}</Badge>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3">
        <Icon name="bolt" className="size-5 shrink-0 text-accent" />
        <p className="text-sm text-text-h">
          <span className={`${labelBase} mr-2`}>Última operación aplicada</span>
          {last ? (
            <span className="font-semibold tabular-nums">{operationLabel(last.type)} · {fmtDate(last.appliedAt)}</span>
          ) : (
            <span>Ninguna todavía</span>
          )}
        </p>
      </div>

      <details open={defaultOpen} className="group mt-4">
        <summary className={`flex w-fit cursor-pointer list-none items-center gap-2 rounded-lg text-sm font-semibold text-text-h [&::-webkit-details-marker]:hidden ${focusRing}`}>
          <Icon name="chevron" className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
          <span className="group-open:hidden">Ver detalle del ciclo</span>
          <span className="hidden group-open:inline">Ocultar detalle</span>
        </summary>

        <div className="mt-6 flex flex-col gap-6">
          <StatusStatementSection cycle={cycle} />
          <TransfersSection cycle={cycle} match={match} />
          <DemandsSection cycle={cycle} match={match} />
          <NegotiationsSection cycle={cycle} match={match} />
          <ReportSection cycle={cycle} />
          <section>
            <h4 className={labelBase}>Balances finales</h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatTile label="Presupuesto" value={fmt(cycle.finalBalances?.budget)} unit="cr" tone="cyan" icon="wallet" />
              <StatTile label="Energía" value={fmt(cycle.finalBalances?.energy)} unit="kWh" tone="violet" icon="battery" />
            </div>
          </section>
        </div>
      </details>
    </Card>
  )
}

function StatusStatementSection({ cycle }) {
  const ss = cycle.statusStatement
  const energy = ss?.energy
  return (
    <section>
      <h4 className={labelBase}>Status-statement</h4>
      {energy ? (
        <>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile label="Generación" value={fmt(energy.generationCapacity)} unit="kWh" tone="cyan" icon="bolt" />
            <StatTile label="Consumo" value={fmt(energy.consumption)} unit="kWh" tone="violet" icon="plug" />
            <StatTile label="Costo de generación" value={fmt(energy.generationCost)} unit="cr/kWh" tone="pink" icon="wallet" />
          </div>
          <p className="mt-2 text-sm text-text tabular-nums">
            Válido hasta {fmtDate(ss.validUntil)} · Tope de precio {fmt(priceCap(energy.generationCost))} cr/kWh
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-text">Sin status-statement.</p>
      )}
    </section>
  )
}

function OpList({ children }) {
  return <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl bg-bg">{children}</ul>
}

// highlighted: ítem emparejado con lastOperationApplied (heurística, DF-020).
function OpItem({ dot, highlighted, children }) {
  return (
    <li className={`flex items-start gap-3 px-4 py-3 text-sm ${highlighted ? 'bg-accent/10 shadow-[inset_3px_0_0_var(--color-accent)]' : ''}`}>
      <span aria-hidden="true" className={`mt-1.5 size-2 shrink-0 rounded-full ${dot}`} />
      <div className="min-w-0 flex-1">{children}</div>
      {highlighted ? <Badge tone="cyan">Última operación</Badge> : null}
    </li>
  )
}

const Empty = ({ children }) => <p className="mt-3 text-sm text-text">{children}</p>

function TransfersSection({ cycle, match }) {
  const transfers = cycle.transfersReceived ?? []
  return (
    <section>
      <h4 className={labelBase}>Fondos del ciclo (transfer)</h4>
      {transfers.length === 0 ? <Empty>Sin transferencias de fondos.</Empty> : (
        <OpList>
          {transfers.map((t, i) => (
            <OpItem key={t.msgId ?? i} dot="bg-accent" highlighted={match?.section === 'transfers' && match.index === i}>
              <span className="font-semibold text-text-h tabular-nums">+{fmt(t.quantity)} cr</span>
              <span className="text-text tabular-nums"> · {fmtDate(t.receivedAt)}</span>
            </OpItem>
          ))}
        </OpList>
      )}
    </section>
  )
}

function DemandsSection({ cycle, match }) {
  const demands = cycle.demandStatementsApplied ?? []
  return (
    <section>
      <h4 className={labelBase}>Demand-statements</h4>
      {demands.length === 0 ? <Empty>Sin demand-statements.</Empty> : (
        <OpList>
          {demands.map((d, i) => {
            // q > 0: la central entrega energía y el budget baja q·v; q < 0: la retira y el budget sube.
            const delivers = d.quantity > 0
            const budgetDelta = round2(-d.quantity * d.valuePerKwh)
            return (
              <OpItem key={d.msgId ?? i} dot="bg-violet" highlighted={match?.section === 'demands' && match.index === i}>
                <span className="text-text-h">
                  {delivers ? 'Entrega' : 'Retiro'} de <span className="font-semibold tabular-nums">{fmt(Math.abs(d.quantity))} kWh</span> a {fmt(d.valuePerKwh)} cr/kWh
                </span>
                <span className="text-text tabular-nums"> · budget {budgetDelta > 0 ? '+' : ''}{fmt(budgetDelta)} cr · {fmtDate(d.appliedAt)}</span>
              </OpItem>
            )
          })}
        </OpList>
      )}
    </section>
  )
}

function NegotiationsSection({ cycle, match }) {
  const negotiations = cycle.voluntaryNegotiations ?? []
  return (
    <section>
      <h4 className={labelBase}>Negociaciones voluntarias</h4>
      {negotiations.length === 0 ? <Empty>Sin negociaciones en este ciclo.</Empty> : (
        <OpList>
          {negotiations.map((n) => {
            const status = negotiationStatus(n.status)
            const amount = paymentAmount(n)
            return (
              <OpItem key={n.id} dot="bg-pink" highlighted={match?.section === 'negotiations' && match.id === n.id}>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-text-h">#{n.id} {directionLabel(n.direction)}</span>
                  <Badge tone={status.tone}>{status.label}</Badge>
                  <Badge tone={origin(n.origin).tone}>{origin(n.origin).label}</Badge>
                </span>
                <span className="mt-1 block text-text tabular-nums">
                  {fmt(n.quantity)} kWh · techo {fmt(n.pricePerEnergy)} · liquidado {fmt(n.settledPricePerEnergy)} cr/kWh
                  {amount !== null ? ` · ${n.direction === 'give' ? 'ingreso +' : 'egreso −'}${fmt(amount)} cr` : ''}
                  {n.paidAt ? ` · pagada ${fmtTime(n.paidAt)}` : ''}
                </span>
                {n.failureReason ? (
                  <span className="mt-1 block text-xs text-pink-soft" title={n.failureDetail ?? undefined}>
                    {n.failureReason}{n.failureDetail ? `: ${n.failureDetail}` : ''}
                  </span>
                ) : null}
              </OpItem>
            )
          })}
        </OpList>
      )}
    </section>
  )
}

function ReportSection({ cycle }) {
  const report = cycle.negotiationReportSent
  return (
    <section>
      <h4 className={labelBase}>Negotiation-report enviado</h4>
      {report ? (
        <>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile label="Budget reportado" value={fmt(report.budgetBalance)} unit="cr" tone="cyan" icon="wallet" />
            <StatTile label="Energía reportada" value={fmt(report.energyBalance)} unit="kWh" tone="violet" icon="battery" />
          </div>
          <p className="mt-2 text-sm text-text tabular-nums">Enviado {fmtDate(report.sentAt)}</p>
        </>
      ) : (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-text">
          <ReportBadge cycle={cycle} />
          {reportPending(cycle) ? 'Se envía antes del cierre de la ventana.' : 'No se envió: implica multa en el próximo budget.'}
        </p>
      )}
    </section>
  )
}
