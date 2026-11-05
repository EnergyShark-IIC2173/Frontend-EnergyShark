import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reconciliationState, signed } from './balance.js'

const rec = (over = {}) => ({ deltaCr: 0, deltaKwh: 0, openOps: 0, ...over })

test('reconciliationState: cuadra, explicado, sin explicar y sin datos', () => {
  assert.equal(reconciliationState(rec()), 'ok')
  // Medio centavo de redondeo no es delta.
  assert.equal(reconciliationState(rec({ deltaCr: 0.004 })), 'ok')
  assert.equal(reconciliationState(rec({ deltaCr: -1980000, openOps: 1 })), 'explained')
  assert.equal(reconciliationState(rec({ deltaKwh: 6000, openOps: 0 })), 'unexplained')
  assert.equal(reconciliationState(null), 'none')
  // Un delta que no vino no se toma como 0.
  assert.equal(reconciliationState(rec({ deltaCr: null })), 'unexplained')
})

test('signed escribe el signo', () => {
  const f = (n) => String(n)
  assert.equal(signed(1250.5, f), '+1250.5')
  assert.equal(signed(-300, f), '−300')
  assert.equal(signed(0, f), '0')
  assert.equal(signed(null, f), null)
})
