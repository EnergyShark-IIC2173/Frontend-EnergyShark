// Derivaciones sobre los ciclos de RF01 (DF-024). Las de la vista de negociaciones E1 se retiraron (DF-028).

const time = (iso) => (iso ? new Date(iso).getTime() : NaN)

// Tolerancia para give/take: el evento del ledger y paidAt difieren en milisegundos (DF-020).
const NEGOTIATION_TOLERANCE_MS = 60_000

// Qué ítem de la tarjeta corresponde a lastOperationApplied.
// v3 (DF-027): igualdad exacta por `ref` → { section: 'swaps', id } o { section: 'funding' | 'imbalance' }.
// E1 (DF-020): heurística de mejor esfuerzo → { section: 'transfers' | 'demands', index } o
// { section: 'negotiations', id }. Sin coincidencia: null.
export function matchLastOperation(cycle) {
  const last = cycle?.lastOperationApplied
  if (!last) return null
  if (last.ref) return matchByRef(cycle, last)
  const t = time(last.appliedAt)
  if (!Number.isFinite(t)) return null

  if (last.type === 'transfer') {
    const index = (cycle.transfersReceived ?? []).findIndex((x) => time(x.receivedAt) === t)
    return index >= 0 ? { section: 'transfers', index } : null
  }
  if (last.type === 'demand-statement') {
    const index = (cycle.demandStatementsApplied ?? []).findIndex((x) => time(x.appliedAt) === t)
    return index >= 0 ? { section: 'demands', index } : null
  }
  if (last.type === 'give' || last.type === 'take') {
    let best = null
    for (const n of cycle.voluntaryNegotiations ?? []) {
      if (n.direction !== last.type || n.status !== 'paid') continue
      const diff = Math.abs(time(n.paidAt) - t)
      if (diff <= NEGOTIATION_TOLERANCE_MS && (!best || diff < best.diff)) best = { id: n.id, diff }
    }
    return best ? { section: 'negotiations', id: best.id } : null
  }
  return null
}

// "Pendiente" mientras se puede reportar: en v3 hasta validUntil (DF-027); en E1, mientras la ventana
// sigue abierta (DF-019). Si no, el reporte no se envió.
export function reportPending(cycle, now = Date.now()) {
  if (cycle?.market) return time(cycle.validUntil) > now
  return cycle?.phase === 'negotiating' && time(cycle?.windowClosesAt) > now
}

const SWAP_OPERATIONS = ['swap-settled', 'trade-recorded']

function matchByRef(cycle, last) {
  const { swapId, msgId } = last.ref
  if (SWAP_OPERATIONS.includes(last.type) && swapId) {
    return (cycle.swaps ?? []).some((s) => s.swapId === swapId) ? { section: 'swaps', id: swapId } : null
  }
  if (last.type === 'transfer' && msgId && cycle.funding?.msgId === msgId) return { section: 'funding' }
  if (last.type === 'imbalance-settlement' && msgId && cycle.imbalanceSettlement?.settlementId === msgId) {
    return { section: 'imbalance' }
  }
  return null
}

// Fase de un ciclo v3 desde los instantes del status-statement, nunca desde el reloj propio (DF-027).
// El reloj solo se compara contra esos instantes. Sin bloque market (ciclo E1): null.
export function marketPhase(cycle, now = Date.now()) {
  const market = cycle?.market
  if (!market) return null
  const opens = time(market.opensAt)
  const closes = time(market.closesAt)
  const reportOpens = time(market.reportOpensAt ?? market.closesAt)
  const validUntil = time(cycle.validUntil)
  if (Number.isFinite(opens) && now < opens) return 'pending'
  if (Number.isFinite(closes) && now < closes) return 'market'
  if (Number.isFinite(validUntil) && now >= reportOpens && now < validUntil) return 'closing'
  return 'closed'
}

// Un ciclo E1 trae alguno de los flujos retirados en la v3 (DF-026).
export function hasLegacyData(cycle) {
  return ['transfersReceived', 'demandStatementsApplied', 'voluntaryNegotiations']
    .some((key) => (cycle?.[key]?.length ?? 0) > 0)
}

// Totales de compra del ciclo como comprador: kWh liquidados, energía pagada y transporte.
export function buyerTotals(cycle) {
  const settled = (cycle?.swaps ?? []).filter((s) => s.role === 'buyer' && s.status === 'settled')
  const sum = (f) => settled.reduce((acc, s) => acc + Number(f(s) ?? 0), 0)
  return {
    kwh: sum((s) => s.quantity),
    energy: Math.round(sum((s) => s.amount) * 100) / 100,
    transport: Math.round(sum((s) => s.transport?.total) * 100) / 100,
  }
}
