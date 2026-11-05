import { test } from 'node:test'
import assert from 'node:assert/strict'
import { disabledRoutes, distanceKm, transportPerKwh } from './transport.js'

test('transportPerKwh = round2(distance/1000 × transportCost)', () => {
  // Ejemplo del enunciado de la E1: 62 763 183 m con 0.0034 → 62763.183 × 0.0034 = 213.3948 → 213.39
  assert.equal(transportPerKwh({ distance: 62763183, transportCost: 0.0034 }), 213.39)
  // 94 306 517 m con 0.0013 → 94306.517 × 0.0013 = 122.5984721 → 122.6
  assert.equal(transportPerKwh({ distance: 94306517, transportCost: 0.0013 }), 122.6)
  assert.equal(transportPerKwh({ distance: null, transportCost: 0.1 }), null)
  assert.equal(transportPerKwh(undefined), null)
})

test('distanceKm convierte metros a km', () => {
  assert.equal(distanceKm({ distance: 62763183 }), 62763.183)
  assert.equal(distanceKm({ distance: null }), null)
})

test('disabledRoutes lista solo enabled: false, ordenadas', () => {
  const distances = { TAL: { enabled: false }, COR: { enabled: true }, HGW: { enabled: false }, MET: {} }
  assert.deepEqual(disabledRoutes(distances), ['HGW', 'TAL'])
  assert.deepEqual(disabledRoutes(null), [])
})
