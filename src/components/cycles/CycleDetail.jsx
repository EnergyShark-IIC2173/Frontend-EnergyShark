import { getCycle } from '../../api/endpoints'
import { useApiQuery } from '../../api/useApiQuery'
import { useNow } from '../../hooks/useNow'
import { buyerTotals, hasLegacyData, matchLastOperation, reportPending } from '../../lib/cycles'
import { EMPTY, fmt, fmtDate, fmtTime, truncId } from '../../lib/format'
import { paymentAmount, priceCap, round2 } from '../../lib/negotiation'
import { bidState, directionLabel, negotiationStatus, operationLabel, origin, swapRole, swapStatus } from '../../lib/status'
import { Badge } from '../ui/Badge'
import { Icon } from '../ui/Icon'
import { ErrorState, LoadingDot, StaleNotice } from '../ui/States'
import { TabPanel, Tabs } from '../ui/Tabs'
import { btnSecondary, labelBase, textError, textPrimary, textSecondary } from '../ui/classes'
import { DataTable, KeyValues, Section } from './DataViews'
import { PhaseBadge, ReportBadge, WindowLine } from './parts'

// Detalle de un ciclo (RF01) dentro del diálogo, por pestañas (DF-033). Se pide solo al abrir (DF-024); el ciclo en
// curso se vuelve a pedir cada 30 s. La pestaña la guarda el diálogo, así se mantiene al pasar de un ciclo a otro.
const POLL_MS = 30_000
const ID = 'cycle-detail'

// Un ciclo v3 trae los instantes del mercado (DF-027); uno de la E1, no.
const isV3 = (cycle) => Boolean(cycle?.market || cycle?.statusStatement?.market)

// Pestaña donde vive cada ítem que puede ser la última operación aplicada.
const TAB_OF = { funding: 'resumen', swaps: 'swaps', imbalance: 'cierre', transfers: 'e1', demands: 'e1', negotiations: 'e1' }

const kwh = (v) => `${fmt(v)} kWh`
const cr = (v) => `${fmt(v)} CR`
const signed = (v) => (v > 0 ? `+${fmt(v)}` : fmt(v))

export function CycleDetail({ cycleId, live, tab, onTab }) {
  const { data: cycle, loading, error, reload, relogin } = useApiQuery(
    (api) => getCycle(api, cycleId),
    { cycleId },
    { pollMs: live ? POLL_MS : null },
  )

  if (!cycle && loading) {
    return (
      <p role="status" className={`mt-6 flex items-center gap-2 text-sm ${textSecondary}`}>
        <LoadingDot />
        Cargando detalle…
      </p>
    )
  }
  if (!cycle && error) {
    return (
      <div className="mt-6">
        <ErrorState title="No se pudo cargar el detalle del ciclo" error={error} onRetry={reload} onRelogin={relogin} />
      </div>
    )
  }

  const v3 = isV3(cycle)
  const legacy = hasLegacyData(cycle)
  const match = matchLastOperation(cycle)
  const markedTab = match ? TAB_OF[match.section] : null
  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    v3 ? { id: 'mercado', label: 'Mercado', count: (cycle.bidsReceived?.length ?? 0) + (cycle.bidsSent?.length ?? 0) } : null,
    v3 ? { id: 'swaps', label: 'Swaps', count: cycle.swaps?.length ?? 0 } : null,
    { id: 'cierre', label: 'Cierre' },
    legacy ? { id: 'e1', label: 'Protocolo E1' } : null,
  ]
    .filter(Boolean)
    .map((t) => ({ ...t, marked: t.id === markedTab }))
  const active = tabs.some((t) => t.id === tab) ? tab : 'resumen'

  // "Ver": abre la pestaña de la última operación y lleva la fila a la vista.
  function showLastOperation() {
    onTab(markedTab)
    setTimeout(() => {
      const row = document.querySelector(`#${ID}-panel-${markedTab} [data-last-op]`)
      row?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    }, 0)
  }

  return (
    <div className="flex flex-col gap-6 pt-5 motion-safe:animate-fade-in">
      <StaleNotice error={error} />
      <div className="flex flex-wrap items-center gap-2">
        <PhaseBadge cycle={cycle} />
        <ReportBadge cycle={cycle} />
        <WindowLine cycle={cycle} className="ml-1" />
      </div>

      <KeyFigures cycle={cycle} v3={v3} />
      <LastOperation cycle={cycle} canJump={Boolean(markedTab)} onJump={showLastOperation} />

      <div className="flex flex-col gap-5">
        <Tabs tabs={tabs} value={active} onChange={onTab} idPrefix={ID} label="Secciones del ciclo" />
        <TabPanel key={active} idPrefix={ID} id={active} className="flex flex-col gap-8 outline-none motion-safe:animate-section-in">
          {active === 'resumen' ? <SummaryPanel cycle={cycle} v3={v3} match={match} live={live} /> : null}
          {active === 'mercado' ? <MarketPanel cycle={cycle} /> : null}
          {active === 'swaps' ? <SwapsPanel cycle={cycle} match={match} /> : null}
          {active === 'cierre' ? <ClosePanel cycle={cycle} match={match} /> : null}
          {active === 'e1' ? <LegacyPanel cycle={cycle} match={match} /> : null}
        </TabPanel>
      </div>
    </div>
  )
}

// Cifras clave siempre a la vista, sin importar la pestaña.
function KeyFigures({ cycle, v3 }) {
  const energy = cycle.statusStatement?.energy
  const balance = cycle.finalBalances
  return (
    <KeyValues
      columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-6"
      items={[
        ['Generación', energy ? kwh(energy.generationCapacity) : 'Sin status-statement'],
        ['Consumo', energy ? kwh(energy.consumption) : EMPTY],
        v3 ? ['Vendible', energy ? kwh(energy.sellable) : EMPTY] : ['Tope de precio', energy ? `${fmt(priceCap(energy.generationCost))} CR/kWh` : EMPTY],
        ['Costo de generación', energy ? `${fmt(energy.generationCost)} CR/kWh` : EMPTY],
        ['Créditos al cierre', cr(balance?.budget), { tone: balance?.budget < 0 ? textError : undefined }],
        ['Energía al cierre', kwh(balance?.energy)],
      ]}
    />
  )
}

function LastOperation({ cycle, canJump, onJump }) {
  const last = cycle.lastOperationApplied
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 dark:bg-accent-soft">
      <Icon name="bolt" className="size-5 text-accent-ink dark:text-accent" />
      <p className={`min-w-0 flex-1 text-sm ${textPrimary}`}>
        <span className={`${labelBase} mr-2`}>Última operación aplicada</span>
        {last ? <span className="font-semibold tabular-nums">{operationLabel(last.type)} · {fmtDate(last.appliedAt)}</span> : <span>Ninguna todavía</span>}
      </p>
      {last && canJump ? (
        <button type="button" onClick={onJump} className={btnSecondary}>
          Ver
        </button>
      ) : null}
    </div>
  )
}

// --- Resumen ---------------------------------------------------------------------------------

function SummaryPanel({ cycle, v3, match, live }) {
  const market = cycle.statusStatement?.market
  const funding = cycle.funding
  return (
    <>
      {v3 && market ? (
        <Section title="Línea de tiempo del mercado">
          <Timeline market={market} validUntil={cycle.statusStatement?.validUntil ?? cycle.validUntil} live={live} />
        </Section>
      ) : null}
      {v3 && market ? (
        <Section title="Precios del ciclo">
          <KeyValues
            items={[
              ['Recompra del sobrante', `${fmt(market.buybackPrice)} CR/kWh`, { hint: 'Lo que paga la central por cada kWh que sobra al cierre' }],
              ['Desbalance del faltante', `${fmt(market.imbalancePrice)} CR/kWh`, { hint: 'Lo que cobra la central por cada kWh que falta' }],
              ['Bid mínimo', kwh(market.minBid)],
            ]}
          />
        </Section>
      ) : null}
      {v3 ? (
        <Section title="Financiamiento (transfer)">
          {funding ? (
            <>
              <KeyValues
                highlighted={match?.section === 'funding'}
                items={[
                  ['Monto recibido', `+${cr(funding.quantity)}`],
                  ['Saldo después', cr(funding.balanceAfter), { tone: funding.balanceAfter < 0 ? textError : undefined }],
                  ['Línea de crédito', cr(funding.creditLine)],
                  ['Recibido', fmtDate(funding.receivedAt)],
                ]}
                columns="sm:grid-cols-2 lg:grid-cols-4"
              />
              {funding.penalty ? (
                <p className={`flex items-center gap-2 text-sm ${textError}`}>
                  <Icon name="alert" className="size-4" />
                  Multa por reporte faltante de <span className="font-mono">{funding.penalty.forCycleId}</span>: −{cr(funding.penalty.amount)} (ya descontada).
                </p>
              ) : null}
            </>
          ) : (
            <p className={`text-sm ${textSecondary}`}>Sin financiamiento recibido.</p>
          )}
        </Section>
      ) : (
        <Section title="Status-statement">
          <p className={`text-sm ${textSecondary}`}>
            {cycle.statusStatement ? `Válido hasta ${fmtDate(cycle.statusStatement.validUntil)}.` : 'Sin status-statement.'} Los flujos de la E1 están en su pestaña.
          </p>
        </Section>
      )}
    </>
  )
}

// Instantes de la central en orden, con lo pasado marcado (DF-027: el reloj solo se compara contra ellos).
function Timeline({ market, validUntil, live }) {
  const now = useNow(5000, live)
  const steps = [
    ['Abre el mercado', market.opensAt],
    ['Última oferta', market.lastOfferAt],
    ['Último bid', market.lastBidAt],
    ['Cierra el mercado', market.closesAt],
    ['Vence el reporte', validUntil],
  ]
  const nextIndex = steps.findIndex(([, at]) => new Date(at).getTime() > now)
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-5 sm:gap-0">
      {steps.map(([label, at], i) => {
        const past = nextIndex === -1 || i < nextIndex
        const next = i === nextIndex
        return (
          <li key={label} className="relative flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2 sm:pr-3">
            <span aria-hidden="true" className="relative flex items-center sm:w-full">
              <span className={`z-10 size-3 shrink-0 rounded-full ${past ? 'bg-accent' : next ? 'bg-card ring-2 ring-accent dark:bg-sand-900' : 'bg-sand-300 dark:bg-sand-700'}`} />
              {i < steps.length - 1 ? <span className={`ml-1 hidden h-0.5 flex-1 sm:block ${past && !next ? 'bg-accent' : 'bg-sand-200 dark:bg-sand-800'}`} /> : null}
            </span>
            <span>
              <span className={`block text-xs ${textSecondary}`}>
                {label}
                {next ? <span className="sr-only"> (próximo)</span> : null}
              </span>
              <span className={`block font-semibold tabular-nums ${past || next ? textPrimary : textSecondary}`}>{fmtTime(at)}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

// --- Mercado ---------------------------------------------------------------------------------

const OFFER_STATUS = { active: { label: 'Vigente', tone: 'active' }, withdrawn: { label: 'Retirada', tone: 'neutral' }, closed: { label: 'Cerrada', tone: 'neutral' } }

function MarketPanel({ cycle }) {
  const offer = cycle.offer
  return (
    <>
      <Section title="Oferta publicada" aside={offer ? <OfferBadge offer={offer} /> : null}>
        {offer ? <Offer offer={offer} /> : <p className={`text-sm ${textSecondary}`}>Sin oferta en este ciclo.</p>}
      </Section>
      <Section title="Bids recibidos (como vendedor)">
        <BidsTable bids={cycle.bidsReceived} who="buyer" whoLabel="Comprador" timeKey="receivedAt" timeLabel="Recibido" empty="Sin bids recibidos." />
      </Section>
      <Section title="Bids enviados (como comprador)">
        <BidsTable bids={cycle.bidsSent} who="seller" whoLabel="Vendedor" timeKey="sentAt" timeLabel="Enviado" empty="Sin bids enviados." />
      </Section>
    </>
  )
}

function OfferBadge({ offer }) {
  const status = OFFER_STATUS[offer.status] ?? { label: offer.status, tone: 'neutral' }
  return <Badge tone={status.tone}>{status.label}</Badge>
}

function Offer({ offer }) {
  const sold = offer.quantity ? Math.min(1, Math.max(0, (offer.quantity - offer.remaining) / offer.quantity)) : 0
  return (
    <>
      <KeyValues
        columns="sm:grid-cols-2 lg:grid-cols-4"
        items={[
          ['Oferta', <span key="id" className="font-mono">{offer.offerId}</span>],
          ['Precio', `${fmt(offer.pricePerEnergy)} CR/kWh`],
          ['Publicada', kwh(offer.quantity), { hint: fmtDate(offer.publishedAt) }],
          ['Quedan', kwh(offer.remaining)],
        ]}
      />
      <div>
        <div className={`flex justify-between text-xs ${textSecondary}`}>
          <span>Vendido {fmt(sold * 100, 0)} %</span>
          <span>{kwh(offer.quantity - offer.remaining)} de {kwh(offer.quantity)}</span>
        </div>
        <div aria-hidden="true" className="relative mt-1 h-2 overflow-hidden rounded-full bg-sand-100 dark:bg-sand-800">
          <span className="absolute inset-0 origin-left rounded-full bg-accent" style={{ transform: `scaleX(${sold})` }} />
        </div>
      </div>
      {offer.updates?.length ? (
        <DataTable
          caption="Actualizaciones de la oferta"
          rowKey={(u) => `${u.type}-${u.queuedAt ?? u.sentAt}`}
          rows={offer.updates}
          empty=""
          columns={[
            { key: 'type', label: 'Cambio', render: (u) => (u.type === 'offer-withdrawn' ? 'Oferta retirada' : 'Actualización') },
            { key: 'remaining', label: 'Quedan', unit: 'kWh', align: 'right', render: (u) => (u.type === 'offer-withdrawn' ? '' : fmt(u.remaining)) },
            { key: 'price', label: 'Precio', unit: 'CR/kWh', align: 'right', render: (u) => (u.type === 'offer-withdrawn' ? '' : fmt(u.pricePerEnergy)) },
            { key: 'at', label: 'Hora', align: 'right', render: (u) => (u.sentAt ? fmtTime(u.sentAt) : <Badge tone="neutral">En cola</Badge>) },
          ]}
        />
      ) : null}
    </>
  )
}

function BidsTable({ bids, who, whoLabel, timeKey, timeLabel, empty }) {
  return (
    <DataTable
      caption={empty.replace('Sin ', '').replace('.', '')}
      rows={bids ?? []}
      rowKey={(b) => b.idpk}
      empty={empty}
      columns={[
        { key: 'who', label: whoLabel, render: (b) => <span className="font-mono">{b[who]}</span> },
        { key: 'qty', label: 'Cantidad', unit: 'kWh', align: 'right', render: (b) => fmt(b.quantity) },
        { key: 'offer', label: 'Oferta', mono: true, render: (b) => b.offerId },
        {
          key: 'state',
          label: 'Estado',
          render: (b) => {
            const s = bidState(b.state)
            return (
              <span className="flex flex-col items-start gap-1">
                <Badge tone={s.tone}>{s.label}</Badge>
                {b.rejectReason ? (
                  <span className={`text-xs ${textError}`}>
                    {b.rejectReason}
                    {b.available != null ? `: disponibles ${fmt(b.available)} kWh` : ''}
                  </span>
                ) : null}
              </span>
            )
          },
        },
        { key: 'swap', label: 'Swap', mono: true, render: (b) => b.swapId ?? '' },
        { key: 'time', label: timeLabel, align: 'right', render: (b) => fmtTime(b[timeKey]) },
        { key: 'idpk', label: 'idpk', mono: true, render: (b) => <span title={b.idpk}>{truncId(b.idpk)}</span> },
      ]}
    />
  )
}

// --- Swaps -----------------------------------------------------------------------------------

function SwapsPanel({ cycle, match }) {
  const swaps = cycle.swaps ?? []
  const totals = buyerTotals(cycle)
  return (
    <Section title="Swaps (estado final)">
      <DataTable
        caption="Swaps del ciclo"
        rows={swaps}
        rowKey={(s) => s.swapId}
        highlight={(s) => match?.section === 'swaps' && match.id === s.swapId}
        empty="Sin swaps en este ciclo."
        columns={[
          { key: 'id', label: 'Swap', render: (s) => <span className="font-mono">{s.swapId}</span> },
          { key: 'role', label: 'Rol', render: (s) => <>{swapRole(s.role)} con <span className="font-mono">{s.counterparty}</span></> },
          { key: 'qty', label: 'Cantidad', unit: 'kWh', align: 'right', render: (s) => fmt(s.quantity) },
          { key: 'price', label: 'Precio', unit: 'CR/kWh', align: 'right', render: (s) => fmt(s.pricePerEnergy) },
          { key: 'amount', label: 'Monto', unit: 'CR', align: 'right', render: (s) => `${s.role === 'buyer' ? '−' : '+'}${fmt(s.amount)}` },
          {
            key: 'transport',
            label: 'Transporte',
            unit: 'CR',
            align: 'right',
            render: (s) =>
              s.transport ? (
                <span className="flex flex-col items-end gap-1">
                  <span>−{fmt(s.transport.total)}</span>
                  <span className={`text-xs ${textSecondary}`}>{fmt(s.transport.perEnergy)} CR/kWh</span>
                  {s.transport.routeEnabled === false ? <Badge tone="error">Ruta deshabilitada</Badge> : null}
                </span>
              ) : (
                ''
              ),
          },
          { key: 'status', label: 'Estado', render: (s) => <Badge tone={swapStatus(s.status).tone}>{swapStatus(s.status).label}</Badge> },
          { key: 'at', label: 'Hora', align: 'right', render: (s) => fmtTime(s.settledAt ?? s.updatedAt) },
        ]}
        footer={
          totals.kwh > 0 ? (
            <tr>
              <th scope="row" colSpan={2} className={`px-4 py-3 text-left text-sm font-semibold ${textPrimary}`}>Compras liquidadas</th>
              <td className={`px-4 py-3 text-right font-semibold tabular-nums ${textPrimary}`}>{fmt(totals.kwh)}</td>
              <td />
              <td className={`px-4 py-3 text-right font-semibold tabular-nums ${textPrimary}`}>−{fmt(totals.energy)}</td>
              <td className={`px-4 py-3 text-right font-semibold tabular-nums ${textPrimary}`}>−{fmt(totals.transport)}</td>
              <td colSpan={2} />
            </tr>
          ) : null
        }
      />
    </Section>
  )
}

// --- Cierre ----------------------------------------------------------------------------------

function ClosePanel({ cycle, match }) {
  const s = cycle.imbalanceSettlement
  const report = cycle.negotiationReportSent
  const v3 = isV3(cycle)
  return (
    <>
      {v3 ? (
        <Section title="Liquidación al cierre (imbalance-settlement)">
          {s ? (
            <>
              <Coverage settlement={s} />
              <KeyValues
                highlighted={match?.section === 'imbalance'}
                columns="sm:grid-cols-2 lg:grid-cols-3"
                items={[
                  ['En cuenta', kwh(s.kwhHeld)],
                  ['Déficit', kwh(s.deficit)],
                  ['Cobertura', `${signed(s.coverage)} kWh`, { tone: s.coverage < 0 ? textError : undefined }],
                  [s.coverage < 0 ? 'Precio de desbalance' : 'Precio de recompra', `${fmt(s.pricePerEnergy)} CR/kWh`],
                  ['Total', `${signed(s.total)} CR`, { tone: s.total < 0 ? textError : undefined }],
                  ['Saldo después', cr(s.balanceAfter), { hint: s.settledAt ? fmtTime(s.settledAt) : undefined, tone: s.balanceAfter < 0 ? textError : undefined }],
                ]}
              />
            </>
          ) : (
            <p className={`text-sm ${textSecondary}`}>Sin liquidación todavía: llega después de que cierra el mercado.</p>
          )}
        </Section>
      ) : null}
      <Section title="Negotiation-report enviado" aside={<ReportBadge cycle={cycle} />}>
        {report ? (
          <KeyValues
            columns="sm:grid-cols-3"
            items={[
              ['Créditos reportados', cr(report.budgetBalance)],
              ['Energía reportada', kwh(report.energyBalance)],
              ['Enviado', fmtDate(report.sentAt)],
            ]}
          />
        ) : (
          <p className={`text-sm ${textSecondary}`}>
            {reportPending(cycle) ? 'Se envía en el periodo de cierre, antes de validUntil.' : 'No se envió: multa de 50.000 CR en el próximo financiamiento.'}
          </p>
        )}
      </Section>
    </>
  )
}

// Cuánto del déficit cubrió lo que había en cuenta, en una barra (solo transform).
function Coverage({ settlement }) {
  const { kwhHeld, deficit, coverage } = settlement
  const ratio = deficit > 0 ? Math.min(1, kwhHeld / deficit) : 1
  return (
    <div>
      <p className={`text-sm ${textPrimary}`}>
        {coverage < 0
          ? <>Faltaron <span className="font-semibold tabular-nums">{kwh(-coverage)}</span>: se cobran a precio de desbalance.</>
          : <>Sobraron <span className="font-semibold tabular-nums">{kwh(coverage)}</span>: la central los recompra.</>}
      </p>
      <div aria-hidden="true" className="relative mt-2 h-2 overflow-hidden rounded-full bg-coral/20 dark:bg-coral/25">
        <span className="absolute inset-0 origin-left rounded-full bg-accent" style={{ transform: `scaleX(${ratio})` }} />
      </div>
      <p className={`mt-1 text-xs ${textSecondary}`}>Cubierto {fmt(ratio * 100, 0)} % del déficit</p>
    </div>
  )
}

// --- Protocolo E1 (DF-026) ---------------------------------------------------------------------

function LegacyPanel({ cycle, match }) {
  return (
    <>
      <Section title="Fondos del ciclo (transfer)">
        <DataTable
          caption="Transferencias de fondos"
          rows={(cycle.transfersReceived ?? []).map((t, index) => ({ ...t, index }))}
          rowKey={(t) => t.msgId ?? t.index}
          highlight={(t) => match?.section === 'transfers' && match.index === t.index}
          empty="Sin transferencias de fondos."
          columns={[
            { key: 'qty', label: 'Monto', unit: 'CR', align: 'right', render: (t) => `+${fmt(t.quantity)}` },
            { key: 'at', label: 'Recibido', align: 'right', render: (t) => fmtDate(t.receivedAt) },
          ]}
        />
      </Section>
      <Section title="Demand-statements">
        <DataTable
          caption="Demand-statements aplicados"
          rows={(cycle.demandStatementsApplied ?? []).map((d, index) => ({ ...d, index }))}
          rowKey={(d) => d.msgId ?? d.index}
          highlight={(d) => match?.section === 'demands' && match.index === d.index}
          empty="Sin demand-statements."
          columns={[
            // q > 0: la central entrega energía y el budget baja q·v; q < 0: la retira y el budget sube.
            { key: 'kind', label: 'Movimiento', render: (d) => (d.quantity > 0 ? 'Entrega' : 'Retiro') },
            { key: 'qty', label: 'Cantidad', unit: 'kWh', align: 'right', render: (d) => fmt(Math.abs(d.quantity)) },
            { key: 'value', label: 'Valor', unit: 'CR/kWh', align: 'right', render: (d) => fmt(d.valuePerKwh) },
            { key: 'budget', label: 'Budget', unit: 'CR', align: 'right', render: (d) => signed(round2(-d.quantity * d.valuePerKwh)) },
            { key: 'at', label: 'Aplicado', align: 'right', render: (d) => fmtDate(d.appliedAt) },
          ]}
        />
      </Section>
      <Section title="Negociaciones voluntarias">
        <DataTable
          caption="Negociaciones voluntarias"
          rows={cycle.voluntaryNegotiations ?? []}
          rowKey={(n) => n.id}
          highlight={(n) => match?.section === 'negotiations' && match.id === n.id}
          empty="Sin negociaciones en este ciclo."
          columns={[
            { key: 'id', label: 'Negociación', render: (n) => `#${n.id} ${directionLabel(n.direction)}` },
            { key: 'status', label: 'Estado', render: (n) => <span className="flex flex-wrap gap-1"><Badge tone={negotiationStatus(n.status).tone}>{negotiationStatus(n.status).label}</Badge><Badge tone={origin(n.origin).tone}>{origin(n.origin).label}</Badge></span> },
            { key: 'qty', label: 'Cantidad', unit: 'kWh', align: 'right', render: (n) => fmt(n.quantity) },
            { key: 'price', label: 'Liquidado', unit: 'CR/kWh', align: 'right', render: (n) => fmt(n.settledPricePerEnergy) },
            { key: 'amount', label: 'Monto', unit: 'CR', align: 'right', render: (n) => { const a = paymentAmount(n); return a === null ? '' : `${n.direction === 'give' ? '+' : '−'}${fmt(a)}` } },
          ]}
        />
      </Section>
    </>
  )
}
