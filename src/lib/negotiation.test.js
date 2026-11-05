import { test } from 'node:test'
import assert from 'node:assert/strict'
import { paymentAmount, priceCap, round2 } from './negotiation.js'

// Ciclo real de producción (docs/integracion-backend.md, B.4), recortado.
const openCycle = {
  cycleId: 'cycle-248793',
  phase: 'negotiating',
  statusStatement: { energy: { consumption: 12152.44, generationCost: 65.49, generationCapacity: 37831.26 } },
  voluntaryNegotiations: [
    { id: 92, direction: 'give', quantity: 25678.82, status: 'paid', settledPricePerEnergy: 68.76 },
  ],
}

test('priceCap = round2(1.05 × generationCost), como el connector', () => {
  assert.equal(priceCap(65.49), 68.76) // 68.7645 → 68.76 (el valor real de la negociación 92)
  assert.equal(priceCap(10.1), 10.61) // 10.605 → 10.61; con floats ingenuos daría 10.6
  assert.equal(priceCap(210), 220.5)
  assert.equal(priceCap(null), null)
  assert.equal(priceCap(0), null)
})

test('round2 y paymentAmount', () => {
  assert.equal(round2(1.005), 1.01)
  assert.equal(round2(-2.345), -2.35)
  // 25678.82 × 68.76 = 1765675.6632 → 1765675.66
  assert.equal(paymentAmount(openCycle.voluntaryNegotiations[0]), 1765675.66)
  assert.equal(paymentAmount({ status: 'confirmed', quantity: 1, settledPricePerEnergy: 1 }), null)
})
