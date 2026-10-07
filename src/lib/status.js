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

// lastOperationApplied.type (RF01).
export const OPERATION_TYPE = {
  transfer: 'Transferencia de fondos',
  'demand-statement': 'Demand-statement',
  give: 'Venta (give)',
  take: 'Compra (take)',
}

export const negotiationStatus = (status) => NEGOTIATION_STATUS[status] ?? fallback(status)
export const rejectedKind = (kind) => REJECTED_KIND[kind] ?? fallback(kind)
export const cyclePhase = (phase) => CYCLE_PHASE[phase] ?? fallback(phase)
export const origin = (value) => ORIGIN[value] ?? fallback(value)
export const directionLabel = (direction) => DIRECTION[direction] ?? direction ?? '—'
export const operationLabel = (type) => OPERATION_TYPE[type] ?? type ?? '—'

// Estados que todavía pueden cambiar: activan el polling de 3 s en V4 (DF-015).
export const isActiveNegotiation = (n) => n?.status === 'proposed' || n?.status === 'confirmed'
