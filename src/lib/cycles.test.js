import { test } from 'node:test'
import assert from 'node:assert/strict'
import { estimateNextWindow, findOpenCycle, findOpenCycleWithoutStatus, matchLastOperation, reportPending } from './cycles.js'

const ss = { energy: { consumption: 1, generationCost: 1, generationCapacity: 2 } }
const now = Date.parse('2026-10-06T17:50:00Z')

test('findOpenCycle exige negotiating, cierre futuro y status-statement', () => {
  const cycles = [
    { cycleId: 'sin-ss', phase: 'negotiating', windowClosesAt: '2026-10-06T18:00:00Z', statusStatement: null },
    { cycleId: 'abierto', phase: 'negotiating', windowClosesAt: '2026-10-06T18:00:00Z', statusStatement: ss },
    { cycleId: 'vencido', phase: 'negotiating', windowClosesAt: '2026-10-06T17:00:00Z', statusStatement: ss },
  ]
  assert.equal(findOpenCycle(cycles, now).cycleId, 'abierto')
  assert.equal(findOpenCycle([cycles[0], cycles[2]], now), null)
  assert.equal(findOpenCycleWithoutStatus(cycles, now).cycleId, 'sin-ss')
  assert.equal(findOpenCycle(null, now), null)
})

test('estimateNextWindow: mediana de los períodos, primera ventana futura', () => {
  // Ventanas cada 2 h (orden de la API: más reciente primero).
  const cycles = ['2026-10-06T15:40:00Z', '2026-10-06T13:40:00Z', '2026-10-06T11:40:00Z']
    .map((windowOpensAt) => ({ windowOpensAt }))
  const r = estimateNextWindow(cycles, now)
  assert.equal(r.periodMs, 2 * 3600 * 1000)
  // 15:40 + 2 h = 17:40 ya pasó (now = 17:50) → 15:40 + 2 × 2 h
  assert.equal(r.at.toISOString(), '2026-10-06T19:40:00.000Z')
})

test('estimateNextWindow: salta ventanas ya pasadas y tolera un ciclo faltante', () => {
  // Falta el de 13:40: diffs = [2 h, 4 h, 2 h] → mediana 2 h.
  const cycles = ['2026-10-06T09:40:00Z', '2026-10-06T11:40:00Z', '2026-10-06T15:40:00Z', '2026-10-06T17:40:00Z']
    .map((windowOpensAt) => ({ windowOpensAt }))
  const r = estimateNextWindow(cycles, Date.parse('2026-10-06T22:00:00Z'))
  assert.equal(r.periodMs, 2 * 3600 * 1000)
  assert.equal(r.at.toISOString(), '2026-10-06T23:40:00.000Z') // 17:40 + 3 × 2 h
})

test('estimateNextWindow: con menos de 2 ventanas no es estimable', () => {
  assert.equal(estimateNextWindow([{ windowOpensAt: '2026-10-06T15:40:00Z' }, { windowOpensAt: null }], now), null)
  assert.equal(estimateNextWindow([], now), null)
})

test('matchLastOperation: give real con appliedAt .181 y paidAt .184 (DF-020)', () => {
  const cycle = {
    lastOperationApplied: { type: 'give', appliedAt: '2026-10-06T17:40:04.181Z' },
    transfersReceived: [{ receivedAt: '2026-10-06T17:40:02.053Z' }],
    demandStatementsApplied: [{ appliedAt: '2026-10-06T17:40:02.089Z' }],
    voluntaryNegotiations: [
      { id: 91, direction: 'give', status: 'paid', paidAt: '2026-10-06T15:40:04.000Z' },
      { id: 92, direction: 'give', status: 'paid', paidAt: '2026-10-06T17:40:04.184Z' },
    ],
  }
  assert.deepEqual(matchLastOperation(cycle), { section: 'negotiations', id: 92 })
})

test('matchLastOperation: transfer y demand por igualdad exacta; sin match → null', () => {
  const base = {
    transfersReceived: [{ receivedAt: '2026-10-06T17:40:02.053Z' }],
    demandStatementsApplied: [{ appliedAt: '2026-10-06T17:40:02.089Z' }],
    voluntaryNegotiations: [],
  }
  assert.deepEqual(matchLastOperation({ ...base, lastOperationApplied: { type: 'transfer', appliedAt: '2026-10-06T17:40:02.053Z' } }), { section: 'transfers', index: 0 })
  assert.deepEqual(matchLastOperation({ ...base, lastOperationApplied: { type: 'demand-statement', appliedAt: '2026-10-06T17:40:02.089Z' } }), { section: 'demands', index: 0 })
  assert.equal(matchLastOperation({ ...base, lastOperationApplied: { type: 'take', appliedAt: '2026-10-06T17:40:02.089Z' } }), null)
  assert.equal(matchLastOperation({ ...base, lastOperationApplied: null }), null)
})

test('reportPending solo mientras la ventana sigue abierta', () => {
  assert.equal(reportPending({ phase: 'negotiating', windowClosesAt: '2026-10-06T18:00:00Z' }, now), true)
  assert.equal(reportPending({ phase: 'consuming', windowClosesAt: '2026-10-06T18:00:00Z' }, now), false)
  assert.equal(reportPending({ phase: 'negotiating', windowClosesAt: null }, now), false)
})
