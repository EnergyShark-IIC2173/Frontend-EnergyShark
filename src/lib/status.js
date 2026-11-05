import { EMPTY } from './format.js'

// Traducciones y tonos de Badge. Los estados viajan en inglés y solo se traducen al mostrar.
// Tonos semánticos de DF-030: warning (rose) queda para "duplicate" y el periodo de cierre; error (coral), solo errores.

const fallback = (value) => ({ label: value ?? EMPTY, tone: 'neutral' })

export const NEGOTIATION_STATUS = {
  proposed: { label: 'Propuesta', tone: 'active' },
  confirmed: { label: 'Confirmada', tone: 'category' },
  paid: { label: 'Pagada', tone: 'settled' },
  expired: { label: 'Expirada', tone: 'neutral' },
  rejected: { label: 'Rechazada', tone: 'error' },
}

export const REJECTED_KIND = {
  duplicate: { label: 'Duplicado', tone: 'warning' },
  nack: { label: 'NACK', tone: 'error' },
  discarded: { label: 'Descartado', tone: 'neutral' },
}

// Reasons que registra el connector en la v3 (DF-042, de `git grep` sobre connector/src). "Otra…" permite uno exacto.
export const REJECT_REASONS = ['IDENTITY_MISMATCH', 'MALFORMED_MESSAGE', 'TYPE_RETIRED', 'UNKNOWN_TYPE', 'NOT_A_MARKET_TYPE', 'CYCLE_EXPIRED', 'REPORT_TOO_EARLY']

// Cola de origen de un rechazo (S2): la propia de la ciudad o el feed del mercado.
export const SOURCE_QUEUE = {
  city: { label: 'city.{CODE}', tone: 'category' },
  market: { label: 'market.{CODE}', tone: 'active' },
}

export const CYCLE_PHASE = {
  negotiating: { label: 'En negociación', tone: 'active' },
  consuming: { label: 'Consumiendo', tone: 'category' },
  closed: { label: 'Cerrado', tone: 'neutral' },
}

export const ORIGIN = {
  auto: { label: 'Automática', tone: 'neutral' },
  manual: { label: 'Manual', tone: 'active' },
}

export const DIRECTION = {
  give: 'Venta (give)',
  take: 'Compra (take)',
}

// lastOperationApplied.type (RF01). transfer es el financiamiento en la v3 (DF-027).
export const OPERATION_TYPE = {
  transfer: 'Transferencia de fondos',
  'demand-statement': 'Demand-statement',
  give: 'Venta (give)',
  take: 'Compra (take)',
  'swap-settled': 'Swap liquidado',
  'trade-recorded': 'Transporte registrado',
  'imbalance-settlement': 'Liquidación de desbalance',
  reconciliation: 'Ajuste de reconciliación',
}

// Fases v3 derivadas de los instantes del status-statement (DF-027).
export const MARKET_PHASE = {
  pending: { label: 'Consumo (sin mercado)', tone: 'category' },
  market: { label: 'Mercado abierto', tone: 'active' },
  closing: { label: 'Periodo de cierre', tone: 'warning' },
  closed: { label: 'Cerrado', tone: 'neutral' },
}

// Estado final de un swap en la wallet (Referencia API v3). accepted = recibido y sin resolver.
export const SWAP_STATUS = {
  accepted: { label: 'Enviado', tone: 'neutral' },
  proposed: { label: 'Propuesto', tone: 'active' },
  settled: { label: 'Liquidado', tone: 'settled' },
  cancelled: { label: 'Cancelado', tone: 'neutral' },
  expired: { label: 'Expirado', tone: 'neutral' },
  rejected: { label: 'Rechazado', tone: 'error' },
}

// Estado de un bid: el vendedor guarda accepted → proposed → settled (bids, ADR-004) y el comprador
// sent → accepting → settled (buyer_bids, ADR-005 addendum S8); ambos terminan en rejected o expired.
export const BID_STATE = {
  received: { label: 'Recibido', tone: 'neutral' },
  sent: { label: 'Enviado', tone: 'neutral' },
  accepted: { label: 'Aceptado', tone: 'active' },
  proposed: { label: 'Swap propuesto', tone: 'active' },
  accepting: { label: 'Aceptando swap', tone: 'active' },
  settled: { label: 'Liquidado', tone: 'settled' },
  rejected: { label: 'Rechazado', tone: 'error' },
  expired: { label: 'Expirado', tone: 'neutral' },
}

export const SWAP_ROLE = {
  seller: 'Venta',
  buyer: 'Compra',
}

export const negotiationStatus = (status) => NEGOTIATION_STATUS[status] ?? fallback(status)
export const rejectedKind = (kind) => REJECTED_KIND[kind] ?? fallback(kind)
export const cyclePhase = (phase) => CYCLE_PHASE[phase] ?? fallback(phase)
export const origin = (value) => ORIGIN[value] ?? fallback(value)
export const directionLabel = (direction) => DIRECTION[direction] ?? direction ?? EMPTY
export const operationLabel = (type) => OPERATION_TYPE[type] ?? type ?? EMPTY
export const marketPhaseLabel = (phase) => MARKET_PHASE[phase] ?? fallback(phase)
export const swapStatus = (status) => SWAP_STATUS[status] ?? fallback(status)
export const bidState = (state) => BID_STATE[state] ?? fallback(state)
export const swapRole = (role) => SWAP_ROLE[role] ?? role ?? EMPTY
