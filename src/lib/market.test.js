import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bestOffer, bookRows, routeTransport, sortRows } from './market.js'

// 21 600 km con 0.0034 → 73.44 CR/kWh (el transporte del ejemplo de trade-recorded en la Referencia API v3).
const table = {
  cityId: 'TEST',
  disabledRouteTransportCost: 0.0089,
  distances: {
    HGW: { distance: 21600000, transportCost: 0.0034, enabled: true },
    MET: { distance: 13540000, transportCost: 0.0021, enabled: false },
    COR: { distance: 5000000, transportCost: 0.01, enabled: true },
  },
}
const offer = (cityId, pricePerEnergy, remaining, quantity = remaining) => ({ offerId: `${cityId}-1`, cityId, pricePerEnergy, quantity, remaining })

test('routeTransport: ruta habilitada usa transportCost; deshabilitada, la tarifa punitiva', () => {
  assert.deepEqual(routeTransport(table.distances.HGW, 0.0089), { enabled: true, punitive: false, perKwh: 73.44 })
  // 13 540 km × 0.0089 = 120.506 → 120.51
  assert.deepEqual(routeTransport(table.distances.MET, 0.0089), { enabled: false, punitive: true, perKwh: 120.51 })
  // Sin disabledRouteTransportCost (antes de S6): punitiva sin cifra.
  assert.deepEqual(routeTransport(table.distances.MET, undefined), { enabled: false, punitive: true, perKwh: null })
  assert.deepEqual(routeTransport(undefined, 0.0089), { enabled: null, punitive: false, perKwh: null })
})

test('bookRows: precio efectivo = precio + transporte por kWh, con las filas especiales', () => {
  const book = { offers: [offer('HGW', 330, 12700), offer('MET', 290, 3000), offer('TEST', 300, 5000), offer('ZZZ', 100, 10)] }
  const rows = Object.fromEntries(bookRows(book, table).map((r) => [r.cityId, r]))

  assert.equal(rows.HGW.status, 'enabled')
  assert.equal(rows.HGW.effectivePrice, 403.44)
  assert.equal(rows.MET.status, 'disabled')
  assert.equal(rows.MET.effectivePrice, 410.51)
  assert.equal(rows.TEST.status, 'own')
  assert.equal(rows.TEST.effectivePrice, null)
  assert.equal(rows.ZZZ.status, 'no-route')
  assert.equal(rows.ZZZ.effectivePrice, null)
})

test('bookRows: sin tabla o sin libro no inventa nada', () => {
  assert.deepEqual(bookRows(null, table), [])
  const [row] = bookRows({ offers: [offer('HGW', 330, 1)] }, null)
  assert.equal(row.status, 'no-route')
})

test('sortRows: por precio efectivo ascendente, sin valor al final; también por remaining descendente', () => {
  const rows = bookRows({ offers: [offer('MET', 290, 3000), offer('TEST', 300, 5000), offer('HGW', 330, 12700), offer('COR', 380, 800)] }, table)
  // COR: 5 000 km × 0.01 = 50 → 430
  assert.deepEqual(sortRows(rows).map((r) => r.cityId), ['HGW', 'MET', 'COR', 'TEST'])
  assert.deepEqual(sortRows(rows, 'remaining', 'desc').map((r) => r.cityId), ['HGW', 'TEST', 'MET', 'COR'])
  assert.deepEqual(sortRows(rows, 'pricePerEnergy').map((r) => r.cityId), ['MET', 'TEST', 'HGW', 'COR'])
})

test('bestOffer: la comprable más barata con remaining; null si no hay', () => {
  const rows = bookRows({ offers: [offer('HGW', 330, 0), offer('MET', 290, 3000), offer('TEST', 1, 5000)] }, table)
  assert.equal(bestOffer(rows).cityId, 'MET')
  assert.equal(bestOffer([]), null)
})
