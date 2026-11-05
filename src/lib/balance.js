// Saldo local frente a la wallet (DF-043, ADR-005, AD5). Puro, para probarlo con `node --test`.

const finite = (value) => value !== null && value !== undefined && Number.isFinite(Number(value))
// Créditos: menos de medio centavo es redondeo, no delta. kWh: enteros.
const isZeroCr = (value) => finite(value) && Math.abs(Number(value)) < 0.005
const isZeroKwh = (value) => finite(value) && Number(value) === 0

export const RECONCILIATION_STATE = {
  ok: { label: 'Cuadra', tone: 'settled', icon: 'check' },
  explained: { label: 'Delta explicado', tone: 'category', icon: 'clock' },
  unexplained: { label: 'Delta sin explicar', tone: 'warning', icon: 'warning' },
  none: { label: 'Sin reconciliación', tone: 'neutral', icon: 'clock' },
}

// 'ok' | 'explained' | 'unexplained' | 'none'. Un delta que falta (null) no cuenta como 0.
export function reconciliationState(rec) {
  if (!rec) return 'none'
  if (isZeroCr(rec.deltaCr) && isZeroKwh(rec.deltaKwh)) return 'ok'
  return Number(rec.openOps) > 0 ? 'explained' : 'unexplained'
}

// "+1.250,5" / "−300" / "0": el signo va escrito, no solo en el color.
export function signed(value, format) {
  if (!finite(value)) return null
  const n = Number(value)
  if (n === 0) return format(0)
  return `${n > 0 ? '+' : '−'}${format(Math.abs(n))}`
}
