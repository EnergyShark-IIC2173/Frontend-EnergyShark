import { test } from 'node:test'
import assert from 'node:assert/strict'
import { giveSpare, paymentAmount, priceCap, round2, validateProposal } from './negotiation.js'

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

test('giveSpare descuenta los give comprometidos del ciclo', () => {
  // max(0, 37831.26 − 12152.44) − 25678.82 = 25678.82 − 25678.82 = 0
  assert.equal(giveSpare(openCycle), 0)
  const sinGives = { ...openCycle, voluntaryNegotiations: [{ direction: 'give', quantity: 1000, status: 'expired' }] }
  assert.equal(giveSpare(sinGives), 25678.82)
  assert.equal(giveSpare({ statusStatement: null }), null)
})

test('validateProposal: válida bajo el tope', () => {
  const r = validateProposal({ direction: 'take', quantity: '100', pricePerEnergy: '65.49' }, openCycle)
  assert.equal(r.ok, true)
  assert.equal(r.cap, 68.76)
})

test('validateProposal: el tope bloquea', () => {
  const r = validateProposal({ direction: 'take', quantity: '100', pricePerEnergy: '68.77' }, openCycle)
  assert.equal(r.ok, false)
  assert.match(r.errors.pricePerEnergy, /tope de 68,76/)
})

test('validateProposal: la capacidad del give solo advierte', () => {
  const r = validateProposal({ direction: 'give', quantity: '10', pricePerEnergy: '68.76' }, openCycle)
  assert.equal(r.ok, true)
  assert.match(r.warnings.quantity, /OVER_CAPACITY/)
})

test('validateProposal: vacíos, ceros, negativos y sin ciclo abierto', () => {
  const r = validateProposal({ direction: 'take', quantity: '', pricePerEnergy: '-1' }, null)
  assert.equal(r.ok, false)
  assert.equal(r.errors.quantity, 'Ingresa un número.')
  assert.equal(r.errors.pricePerEnergy, 'Debe ser mayor que 0.')
  assert.match(r.errors.form, /No hay una ventana/)
  assert.equal(validateProposal({ direction: 'take', quantity: '0', pricePerEnergy: '1' }, openCycle).errors.quantity, 'Debe ser mayor que 0.')
})
