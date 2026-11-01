import { useState } from 'react'
import { getCycle, listCycles } from '../api/endpoints'
import { useApiQuery } from '../api/useApiQuery'
import { buyerTotals, hasLegacyData, marketPhase, matchLastOperation, reportPending } from '../lib/cycles'
import { fmt, fmtDate, fmtTime, truncId } from '../lib/format'
import { paymentAmount, priceCap, round2 } from '../lib/negotiation'
import {
  bidState, cyclePhase, directionLabel, marketPhaseLabel, negotiationStatus, operationLabel, origin, swapRole, swapStatus,
} from '../lib/status'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'
import { Icon } from './ui/Icon'
import { Pagination } from './ui/Pagination'
import { StatTile } from './ui/StatTile'
import { EmptyState, ErrorState, LoadingState, StaleNotice } from './ui/States'
import { RefreshButton, ViewHeader } from './ui/ViewHeader'
import { focusRing, labelBase } from './ui/classes'

// Cada tarjeta es grande: 10 por página (DF-020). Polling suave solo en la página 1, donde está el ciclo en curso.
// El listado trae la cabecera; el detalle se pide al abrir la tarjeta (DF-024).
const LIMIT = 10
const POLL_MS = 30_000

// Un ciclo v3 trae los instantes del mercado (DF-027); uno de la E1, no.
const isV3 = (cycle) => Boolean(cycle?.market || cycle?.statusStatement?.market)

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
          <CycleCard key={cycle.cycleId} cycle={cycle} defaultOpen={i === 0} live={page === 1 && i === 0} />
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

function PhaseBadge({ cycle }) {
  const v3 = marketPhase(cycle)
  const phase = v3 ? marketPhaseLabel(v3) : cyclePhase(cycle.phase)
  return <Badge tone={phase.tone}>{phase.label}</Badge>
}

function WindowLine({ cycle }) {
  const m = cycle.market
  if (m) {
    return (
      <p className="mt-1 text-sm text-text tabular-nums">
        Mercado {fmtDate(m.opensAt)} – {fmtTime(m.closesAt)} · Cierre hasta {fmtTime(cycle.validUntil)}
      </p>
    )
  }
  return (
    <p className="mt-1 text-sm text-text tabular-nums">
      Ventana: {cycle.windowOpensAt ? `${fmtDate(cycle.windowOpensAt)} – ${fmtTime(cycle.windowClosesAt)}` : '—'}
    </p>
  )
}

function CycleCard({ cycle, defaultOpen, live }) {
  const [open, setOpen] = useState(defaultOpen)
  const last = cycle.lastOperationApplied
  const counts = cycle.counts

  return (
    <Card highlight={defaultOpen}>
      {/* Cabecera siempre visible: RF01 exige identificar la última operación aplicada (DF-020). */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={labelBase}>Ciclo</p>
          <h3 className="mt-1 flex flex-wrap items-center gap-2 text-xl font-semibold text-accent">
            {cycle.cycleId}
            <PhaseBadge cycle={cycle} />
          </h3>
          <WindowLine cycle={cycle} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ReportBadge cycle={cycle} />
          <Badge tone="cyan">Créditos al cierre {cycle.finalBalances?.budget == null ? '—' : `${fmt(cycle.finalBalances.budget)} CR`}</Badge>
        </div>
      </div>

      {counts ? (
        <p className="mt-3 flex flex-wrap gap-2">
          <Badge>{counts.bidsReceived} bids recibidos</Badge>
          <Badge>{counts.bidsSent} bids enviados</Badge>
          <Badge tone="success">{counts.swapsSettled} swaps liquidados</Badge>
        </p>
      ) : null}

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

      <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="group mt-4">
        <summary className={`flex w-fit cursor-pointer list-none items-center gap-2 rounded-lg text-sm font-semibold text-text-h [&::-webkit-details-marker]:hidden ${focusRing}`}>
          <Icon name="chevron" className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
          <span className="group-open:hidden">Ver detalle del ciclo</span>
          <span className="hidden group-open:inline">Ocultar detalle</span>
        </summary>
        {/* Se monta solo abierto: una tarjeta cerrada no pide el detalle (DF-024). */}
        {open ? <CycleDetail cycleId={cycle.cycleId} live={live} /> : null}
      </details>
    </Card>
  )
}

function CycleDetail({ cycleId, live }) {
  const { data: cycle, loading, error, reload, relogin } = useApiQuery(
    (api) => getCycle(api, cycleId),
    { cycleId },
    { pollMs: live ? POLL_MS : null },
  )

  if (!cycle && loading) return <p role="status" className="mt-6 text-sm text-text">Cargando detalle…</p>
  if (!cycle && error) {
    return (
      <div className="mt-6">
        <ErrorState title="No se pudo cargar el detalle del ciclo" error={error} onRetry={reload} onRelogin={relogin} />
      </div>
    )
  }

  const match = matchLastOperation(cycle)
  const v3 = isV3(cycle)

  return (
    <div className="mt-6 flex flex-col gap-6">
      <StaleNotice error={error} />
      <StatusStatementSection cycle={cycle} v3={v3} />
      {v3 ? (
        <>
          <FundingSection funding={cycle.funding} highlighted={match?.section === 'funding'} />
          <OfferSection offer={cycle.offer} />
          <BidsSection title="Bids recibidos (como vendedor)" bids={cycle.bidsReceived} counterpartyKey="buyer" timeKey="receivedAt" empty="Sin bids recibidos." />
          <BidsSection title="Bids enviados (como comprador)" bids={cycle.bidsSent} counterpartyKey="seller" timeKey="sentAt" empty="Sin bids enviados." />
          <SwapsSection cycle={cycle} match={match} />
          <ImbalanceSection settlement={cycle.imbalanceSettlement} highlighted={match?.section === 'imbalance'} />
        </>
      ) : null}
      {hasLegacyData(cycle) ? (
        <div className="flex flex-col gap-6 rounded-xl border border-border p-4">
          <p className={labelBase}>Protocolo E1 (flujos retirados en la v3, DF-026)</p>
          <TransfersSection cycle={cycle} match={match} />
          <DemandsSection cycle={cycle} match={match} />
          <NegotiationsSection cycle={cycle} match={match} />
        </div>
      ) : null}
      <ReportSection cycle={cycle} />
      <section>
        <h4 className={labelBase}>Saldos al cierre</h4>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile label="Créditos" value={fmt(cycle.finalBalances?.budget)} unit="CR" tone="cyan" icon="wallet" />
          <StatTile label="Energía" value={fmt(cycle.finalBalances?.energy)} unit="kWh" tone="violet" icon="battery" />
        </div>
      </section>
    </div>
  )
}

function StatusStatementSection({ cycle, v3 }) {
  const ss = cycle.statusStatement
  const energy = ss?.energy
  const m = ss?.market
  return (
    <section>
      <h4 className={labelBase}>Status-statement</h4>
      {energy ? (
        <>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Generación" value={fmt(energy.generationCapacity)} unit="kWh" tone="cyan" icon="bolt" />
            <StatTile label="Consumo" value={fmt(energy.consumption)} unit="kWh" tone="violet" icon="plug" />
            <StatTile label="Costo de generación" value={fmt(energy.generationCost)} unit="CR/kWh" tone="pink" icon="wallet" />
            {v3 ? <StatTile label="Vendible" value={fmt(energy.sellable)} unit="kWh" tone="orange" icon="battery" /> : null}
          </div>
          {m ? (
            <>
              <p className="mt-2 text-sm text-text tabular-nums">
                Recompra {fmt(m.buybackPrice)} · Desbalance {fmt(m.imbalancePrice)} CR/kWh · Bid mínimo {fmt(m.minBid)} kWh
              </p>
              <p className="mt-1 text-sm text-text tabular-nums">
                Abre {fmtTime(m.opensAt)} · Última oferta {fmtTime(m.lastOfferAt)} · Último bid {fmtTime(m.lastBidAt)} ·
                Cierre {fmtTime(m.closesAt)} · Válido hasta {fmtTime(ss.validUntil)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-text tabular-nums">
              Válido hasta {fmtDate(ss.validUntil)} · Tope de precio {fmt(priceCap(energy.generationCost))} cr/kWh
            </p>
          )}
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

// highlighted: ítem que corresponde a lastOperationApplied (DF-027 por referencia; DF-020 en ciclos E1).
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

function FundingSection({ funding, highlighted }) {
  return (
    <section>
      <h4 className={labelBase}>Financiamiento (transfer)</h4>
      {!funding ? <Empty>Sin financiamiento recibido.</Empty> : (
        <OpList>
          <OpItem dot="bg-accent" highlighted={highlighted}>
            <span className="font-semibold text-text-h tabular-nums">+{fmt(funding.quantity)} CR</span>
            <span className="text-text tabular-nums">
              {' '}· saldo {fmt(funding.balanceAfter)} CR · línea de crédito {fmt(funding.creditLine)} CR · {fmtDate(funding.receivedAt)}
            </span>
            {funding.penalty ? (
              <span className="mt-1 block text-xs text-pink-soft tabular-nums">
                Multa por reporte faltante de {funding.penalty.forCycleId}: −{fmt(funding.penalty.amount)} CR (ya descontada)
              </span>
            ) : null}
          </OpItem>
        </OpList>
      )}
    </section>
  )
}

const OFFER_STATUS = { active: { label: 'Vigente', tone: 'cyan' }, withdrawn: { label: 'Retirada', tone: 'neutral' }, closed: { label: 'Cerrada', tone: 'neutral' } }

function OfferSection({ offer }) {
  const status = OFFER_STATUS[offer?.status] ?? { label: offer?.status ?? '—', tone: 'neutral' }
  return (
    <section>
      <h4 className={labelBase}>Oferta publicada</h4>
      {!offer ? <Empty>Sin oferta en este ciclo.</Empty> : (
        <OpList>
          <OpItem dot="bg-orange">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-text-h">{offer.offerId}</span>
              <Badge tone={status.tone}>{status.label}</Badge>
            </span>
            <span className="mt-1 block text-text tabular-nums">
              {fmt(offer.quantity)} kWh a {fmt(offer.pricePerEnergy)} CR/kWh · quedan {fmt(offer.remaining)} kWh · {fmtDate(offer.publishedAt)}
            </span>
          </OpItem>
          {(offer.updates ?? []).map((u, i) => (
            <OpItem key={`${u.type}-${i}`} dot="bg-white/40">
              <span className="text-text-h">{u.type === 'offer-withdrawn' ? 'Oferta retirada' : 'Actualización'}</span>
              <span className="text-text tabular-nums">
                {u.type === 'offer-withdrawn' ? '' : ` · quedan ${fmt(u.remaining)} kWh a ${fmt(u.pricePerEnergy)} CR/kWh`} · {fmtTime(u.sentAt)}
              </span>
            </OpItem>
          ))}
        </OpList>
      )}
    </section>
  )
}

function BidsSection({ title, bids, counterpartyKey, timeKey, empty }) {
  const list = bids ?? []
  return (
    <section>
      <h4 className={labelBase}>{title}</h4>
      {list.length === 0 ? <Empty>{empty}</Empty> : (
        <OpList>
          {list.map((b) => {
            const state = bidState(b.state)
            return (
              <OpItem key={b.idpk} dot="bg-violet">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-text-h">{b[counterpartyKey]}</span>
                  <span className="text-text tabular-nums">{fmt(b.quantity)} kWh · {b.offerId}</span>
                  <Badge tone={state.tone}>{state.label}</Badge>
                </span>
                <span className="mt-1 block text-text tabular-nums" title={b.idpk}>
                  idpk {truncId(b.idpk)} · {fmtTime(b[timeKey])}
                  {b.swapId ? ` · ${b.swapId}` : ''}
                </span>
                {b.rejectReason ? (
                  <span className="mt-1 block text-xs text-pink-soft tabular-nums">
                    {b.rejectReason}{b.available != null ? `: disponibles ${fmt(b.available)} kWh` : ''}
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

function SwapsSection({ cycle, match }) {
  const swaps = cycle.swaps ?? []
  const totals = buyerTotals(cycle)
  return (
    <section>
      <h4 className={labelBase}>Swaps (estado final)</h4>
      {swaps.length === 0 ? <Empty>Sin swaps en este ciclo.</Empty> : (
        <>
          <OpList>
            {swaps.map((s) => {
              const status = swapStatus(s.status)
              return (
                <OpItem key={s.swapId} dot={s.role === 'buyer' ? 'bg-pink' : 'bg-accent'} highlighted={match?.section === 'swaps' && match.id === s.swapId}>
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-text-h">{s.swapId} · {swapRole(s.role)} con {s.counterparty}</span>
                    <Badge tone={status.tone}>{status.label}</Badge>
                    {s.transport && !s.transport.routeEnabled ? <Badge tone="pink">Ruta deshabilitada</Badge> : null}
                  </span>
                  <span className="mt-1 block text-text tabular-nums">
                    {fmt(s.quantity)} kWh × {fmt(s.pricePerEnergy)} = {s.role === 'buyer' ? '−' : '+'}{fmt(s.amount)} CR
                    {s.settledAt ? ` · liquidado ${fmtTime(s.settledAt)}` : ` · ${fmtTime(s.updatedAt)}`}
                  </span>
                  {s.transport ? (
                    <span className="mt-1 block text-text tabular-nums">
                      Transporte {fmt(s.transport.perEnergy)} CR/kWh → −{fmt(s.transport.total)} CR
                    </span>
                  ) : null}
                </OpItem>
              )
            })}
          </OpList>
          {totals.kwh > 0 ? (
            <p className="mt-2 text-sm text-text tabular-nums">
              Compras liquidadas: {fmt(totals.kwh)} kWh · energía {fmt(totals.energy)} CR · transporte {fmt(totals.transport)} CR
            </p>
          ) : null}
        </>
      )}
    </section>
  )
}

function ImbalanceSection({ settlement, highlighted }) {
  return (
    <section>
      <h4 className={labelBase}>Liquidación al cierre (imbalance-settlement)</h4>
      {!settlement ? <Empty>Sin liquidación todavía: llega después de closesAt.</Empty> : (
        <OpList>
          <OpItem dot={settlement.coverage < 0 ? 'bg-pink' : 'bg-success'} highlighted={highlighted}>
            <span className="text-text-h tabular-nums">
              En cuenta {fmt(settlement.kwhHeld)} kWh · déficit {fmt(settlement.deficit)} kWh ·{' '}
              <span className="font-semibold">cobertura {fmt(settlement.coverage)} kWh</span>
            </span>
            <span className="mt-1 block text-text tabular-nums">
              {settlement.coverage < 0 ? 'Desbalance' : 'Recompra'} a {fmt(settlement.pricePerEnergy)} CR/kWh →{' '}
              {settlement.total > 0 ? '+' : ''}{fmt(settlement.total)} CR · saldo {fmt(settlement.balanceAfter)} CR
              {settlement.settledAt ? ` · ${fmtTime(settlement.settledAt)}` : ''}
            </span>
          </OpItem>
        </OpList>
      )}
    </section>
  )
}

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
            <StatTile label="Créditos reportados" value={fmt(report.budgetBalance)} unit="CR" tone="cyan" icon="wallet" />
            <StatTile label="Energía reportada" value={fmt(report.energyBalance)} unit="kWh" tone="violet" icon="battery" />
          </div>
          <p className="mt-2 text-sm text-text tabular-nums">Enviado {fmtDate(report.sentAt)}</p>
        </>
      ) : (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-text">
          <ReportBadge cycle={cycle} />
          {reportPending(cycle) ? 'Se envía en el periodo de cierre, antes de validUntil.' : 'No se envió: multa de 50 000 CR en el próximo financiamiento.'}
        </p>
      )}
    </section>
  )
}
