// Traducciones y tonos de Badge. Los estados viajan en inglés y solo se traducen al mostrar.
// Naranja queda reservado para "duplicate" (DF-008).

const fallback = (value) => ({ label: value ?? '—', tone: 'neutral' })

export const NEGOTIATION_STATUS = {
  proposed: { label: 'Propuesta', tone: 'cyan' },
  confirmed: { label: 'Confirmada', tone: 'violet' },
  paid: { label: 'Pagada', tone: 'success' },
  expired: { label: 'Expirada', tone: 'neutral' },
  rejected: { label: 'Rechazada', tone: 'pink' },
}

export const REJECTED_KIND = {
  duplicate: { label: 'Duplicado', tone: 'orange' },
  nack: { label: 'NACK', tone: 'pink' },
  discarded: { label: 'Descartado', tone: 'neutral' },
}

export const CYCLE_PHASE = {
  negotiating: { label: 'En negociación', tone: 'cyan' },
  consuming: { label: 'Consumiendo', tone: 'violet' },
  closed: { label: 'Cerrado', tone: 'neutral' },
}

export const ORIGIN = {
  auto: { label: 'Automática', tone: 'neutral' },
  manual: { label: 'Manual', tone: 'cyan' },
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
  'trade-recorded': 'Transporte cobrado',
  'imbalance-settlement': 'Liquidación de desbalance',
  reconciliation: 'Ajuste de reconciliación',
}

// Fases v3 derivadas de los instantes del status-statement (DF-027).
export const MARKET_PHASE = {
  pending: { label: 'Consumo (sin mercado)', tone: 'violet' },
  market: { label: 'Mercado abierto', tone: 'cyan' },
  closing: { label: 'Periodo de cierre', tone: 'orange' },
  closed: { label: 'Cerrado', tone: 'neutral' },
}

// Estado final de un swap en la wallet (Referencia API v3). accepted = recibido y sin resolver.
export const SWAP_STATUS = {
  accepted: { label: 'Enviado', tone: 'neutral' },
  proposed: { label: 'Propuesto', tone: 'cyan' },
  settled: { label: 'Liquidado', tone: 'success' },
  cancelled: { label: 'Cancelado', tone: 'neutral' },
  expired: { label: 'Expirado', tone: 'neutral' },
  rejected: { label: 'Rechazado', tone: 'pink' },
}

// Estado de un bid (ADR-004). Naranja sigue reservado para duplicados (DF-008).
export const BID_STATE = {
  received: { label: 'Recibido', tone: 'neutral' },
  sent: { label: 'Enviado', tone: 'neutral' },
  accepted: { label: 'Aceptado', tone: 'cyan' },
  settled: { label: 'Liquidado', tone: 'success' },
  rejected: { label: 'Rechazado', tone: 'pink' },
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
export const directionLabel = (direction) => DIRECTION[direction] ?? direction ?? '—'
export const operationLabel = (type) => OPERATION_TYPE[type] ?? type ?? '—'
export const marketPhaseLabel = (phase) => MARKET_PHASE[phase] ?? fallback(phase)
export const swapStatus = (status) => SWAP_STATUS[status] ?? fallback(status)
export const bidState = (state) => BID_STATE[state] ?? fallback(state)
export const swapRole = (role) => SWAP_ROLE[role] ?? role ?? '—'
