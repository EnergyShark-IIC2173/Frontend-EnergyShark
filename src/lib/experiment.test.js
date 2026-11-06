import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bestSpan, cycleRow, ratio, spanRows, totals } from './experiment.js'

test('ratio no inventa ceros', () => {
  assert.equal(ratio(1, 4), 0.25)
  assert.equal(ratio(1, 0), null)
  assert.equal(ratio(null, 4), null)
})

test('cycleRow: ahorro, cobertura y ahorro relativo', () => {
  // Déficit 12 000 kWh a 735 = 8 820 000 de baseline; compró 10 300 y pagó 4 516 112 + 1 249 500 de faltante.
  const row = cycleRow({ cycleId: 'c1', spanSeconds: 20, deficitKwh: 12000, coveredKwh: 10300, effectiveCost: 5765612, baselineCost: 8820000, bidsRejected: 1 })
  assert.equal(row.savings, 3054388)
  assert.equal(Math.round(row.coverage * 1000) / 1000, 0.858)
  assert.equal(Math.round(row.savingsRatio * 1000) / 1000, 0.346)
})

test('cycleRow: sin déficit la cobertura queda vacía', () => {
  const row = cycleRow({ deficitKwh: 0, coveredKwh: 0, effectiveCost: 0, baselineCost: 0 })
  assert.equal(row.coverage, null)
  assert.equal(row.savingsRatio, null)
  assert.equal(row.savings, 0)
})

const aggregates = [
  { spanSeconds: 40, cycles: 12, deficitKwh: 120000, coveredKwh: 90000, effectiveCost: 70e6, baselineCost: 88e6, bidsRejected: 6 },
  { spanSeconds: 10, cycles: 12, deficitKwh: 120000, coveredKwh: 70000, effectiveCost: 76e6, baselineCost: 88e6, bidsRejected: 18 },
  { spanSeconds: 20, cycles: 2, deficitKwh: 20000, coveredKwh: 20000, effectiveCost: 5e6, baselineCost: 14.7e6, bidsRejected: 0 },
]

test('spanRows ordena por span y calcula bids rechazados por ciclo', () => {
  const rows = spanRows(aggregates)
  assert.deepEqual(rows.map((r) => r.spanSeconds), [10, 20, 40])
  assert.equal(rows[0].bidsRejectedPerCycle, 1.5)
  assert.equal(rows[2].savings, 18e6)
})

test('bestSpan exige un mínimo de ciclos para no premiar uno suelto', () => {
  const rows = spanRows(aggregates)
  assert.equal(bestSpan(rows), 40)
  assert.equal(bestSpan(rows, 1), 20)
  assert.equal(bestSpan([]), null)
})

test('totals suma y recalcula las razones (no promedia promedios)', () => {
  const t = totals(spanRows(aggregates))
  assert.equal(t.cycles, 26)
  assert.equal(t.savings, 39.7e6)
  assert.equal(Math.round(t.savingsRatio * 1000) / 1000, Math.round((39.7 / 190.7) * 1000) / 1000)
})

test('spanRows nunca mezcla dos config_version bajo el mismo span (bug real de /api/metrics/spans)', () => {
  const mixed = [
    { spanSeconds: 20, configVersion: 1, cycles: 40, deficitKwh: 0, coveredKwh: 0, effectiveCost: 0, baselineCost: 0, bidsRejected: 0 },
    { spanSeconds: 10, configVersion: 2, cycles: 5, deficitKwh: 40000, coveredKwh: 30000, effectiveCost: 20e6, baselineCost: 29.4e6, bidsRejected: 2 },
    { spanSeconds: 20, configVersion: 2, cycles: 4, deficitKwh: 36000, coveredKwh: 20000, effectiveCost: 22e6, baselineCost: 26.46e6, bidsRejected: 3 },
  ]
  const rows = spanRows(mixed)
  // Solo quedan las filas de la versión 2 (la más alta): la de span=20/versión 1 (surplus, config por
  // defecto) se descarta aunque exista en la respuesta cruda.
  assert.deepEqual(rows.map((r) => r.spanSeconds), [10, 20])
  assert.ok(rows.every((r) => r.configVersion === 2))
})
