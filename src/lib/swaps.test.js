import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fmtSeconds, swapRow } from './swaps.js'

const now = Date.parse('2026-10-20T14:06:10Z')

test('swapRow: propuesta con give/take, estado y cuenta regresiva', () => {
  const row = swapRow({
    idpk: 'i1', kind: 'propose-swap', cycleId: 'cycle-9431', swapId: 'swp-77', state: 'sent',
    request: { give: { asset: 'KWH', amount: 7300 }, take: { asset: 'CR', amount: 2409000 }, expiresAt: '2026-10-20T14:06:42Z', memo: 'OWN-9431' },
    createdAt: '2026-10-20T14:06:00Z',
  }, now)
  assert.equal(row.action, 'Proponemos')
  assert.deepEqual(row.give, { asset: 'KWH', amount: 7300 })
  assert.equal(row.state.label, 'Enviado a la wallet')
  assert.equal(row.ageMs, 10_000)
  assert.equal(row.expiresInMs, 32_000)
})

test('swapRow: aceptar toma el swapId del request y no tiene expiración propia', () => {
  const row = swapRow({ idpk: 'i2', kind: 'accept-swap', swapId: null, state: 'pending', request: { swapId: 'swp-9' }, createdAt: '2026-10-20T14:06:08Z' }, now)
  assert.equal(row.action, 'Aceptamos')
  assert.equal(row.swapId, 'swp-9')
  assert.equal(row.give, null)
  assert.equal(row.expiresInMs, null)
  assert.equal(row.state.label, 'En cola')
})

test('swapRow: estado desconocido se muestra tal cual, como advertencia', () => {
  assert.deepEqual(swapRow({ kind: 'x', state: 'weird' }, now).state, { label: 'weird', tone: 'warning' })
})

test('fmtSeconds', () => {
  assert.equal(fmtSeconds(32_400), '32 s')
  assert.equal(fmtSeconds(185_000), '3 min 05 s')
  assert.equal(fmtSeconds(-5), '0 s')
  assert.equal(fmtSeconds(null), null)
})
