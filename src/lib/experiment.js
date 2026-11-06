// Experimento de span de RF06 (DF-041, ADR-006, AD6). Puro, para probarlo con `node --test`.
// Ahorro = baseline − costo efectivo; ahorro relativo = ahorro / |baseline| (la razón del leaderboard).
import { round2 } from './negotiation.js'

const finite = (value) => value !== null && value !== undefined && Number.isFinite(Number(value))
// Cociente o null si falta un dato o el denominador es 0 (nunca 0 inventado).
export function ratio(a, b) {
  if (!finite(a) || !finite(b) || Number(b) === 0) return null
  return Number(a) / Number(b)
}

function derive(m) {
  const savings = finite(m.baselineCost) && finite(m.effectiveCost) ? round2(Number(m.baselineCost) - Number(m.effectiveCost)) : null
  return {
    ...m,
    savings,
    coverage: ratio(m.coveredKwh, m.deficitKwh),
    savingsRatio: savings === null ? null : ratio(savings, Math.abs(Number(m.baselineCost))),
  }
}

export const cycleRow = derive

// La versión más alta presente en el agregado (la del experimento vigente). null si no viene
// (fixtures de test sin configVersion, o backend viejo): en ese caso no se filtra nada.
function latestConfigVersion(aggregates) {
  const versions = (aggregates ?? []).map((a) => Number(a.configVersion)).filter(Number.isFinite)
  return versions.length ? Math.max(...versions) : null
}

// Agregado por span, ordenado por span ascendente, con bids rechazados por ciclo. Se queda solo con
// la versión de estrategia vigente: un span de 20s bajo la config por defecto (sin span_plan) y un
// span de 20s bajo el span_plan del experimento no son comparables, aunque /api/metrics/spans los
// traiga por separado (GROUP BY span_seconds, config_version en el backend).
export function spanRows(aggregates) {
  const latest = latestConfigVersion(aggregates)
  return (aggregates ?? [])
    .filter((a) => latest === null || Number(a.configVersion) === latest)
    .map((a) => ({ ...derive(a), bidsRejectedPerCycle: ratio(a.bidsRejected, a.cycles) }))
    .sort((a, b) => Number(a.spanSeconds) - Number(b.spanSeconds))
}

// El span con mayor ahorro relativo entre los que tienen al menos minCycles ciclos. null si ninguno califica.
export function bestSpan(rows, minCycles = 3) {
  const eligible = rows.filter((r) => Number(r.cycles) >= minCycles && r.savingsRatio !== null)
  if (!eligible.length) return null
  return eligible.reduce((best, r) => (r.savingsRatio > best.savingsRatio ? r : best)).spanSeconds
}

// Totales del experimento (todas las filas), con las mismas razones.
export function totals(rows) {
  const sum = (key) => rows.reduce((acc, r) => acc + (finite(r[key]) ? Number(r[key]) : 0), 0)
  return derive({
    cycles: sum('cycles'),
    deficitKwh: sum('deficitKwh'),
    coveredKwh: sum('coveredKwh'),
    effectiveCost: round2(sum('effectiveCost')),
    baselineCost: round2(sum('baselineCost')),
    bidsRejected: sum('bidsRejected'),
  })
}
