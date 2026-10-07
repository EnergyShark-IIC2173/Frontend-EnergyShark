import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DASH, fmt, fmtCountdown, fmtDate, fmtTime, orDash, truncId } from './format.js'

test('fmt usa separadores es-CL y redondea a 2 decimales', () => {
  assert.equal(fmt(119392553.0988), '119.392.553,1')
  assert.equal(fmt(12395.49), '12.395,49')
  assert.equal(fmt(0.0034, 4), '0,0034')
  assert.equal(fmt(-1500), '-1.500')
})

test('fmt devuelve guion largo para null, undefined, vacío y no numéricos', () => {
  for (const v of [null, undefined, '', 'abc', NaN]) assert.equal(fmt(v), DASH)
})

test('fmtDate y fmtTime en hora de Chile (UTC-3 en octubre)', () => {
  const iso = '2026-10-06T17:40:04.181Z'
  assert.match(fmtDate(iso, { timeZone: 'America/Santiago' }), /06-10-(20)?26.*14:40:04/)
  assert.equal(fmtTime(iso, { timeZone: 'America/Santiago' }), '14:40:04')
  assert.equal(fmtDate(null), DASH)
  assert.equal(fmtDate('no-es-fecha'), DASH)
})

test('fmtCountdown: minutos y segundos, null si ya pasó', () => {
  const now = Date.parse('2026-10-06T17:47:55Z')
  assert.equal(fmtCountdown('2026-10-06T18:00:00Z', now), '12 min 05 s')
  assert.equal(fmtCountdown('2026-10-06T20:30:00Z', now), '2 h 42 min')
  assert.equal(fmtCountdown('2026-10-06T17:00:00Z', now), null)
})

test('truncId y orDash', () => {
  assert.equal(truncId('a12fb0b9-85d4-4422-8c8f-48ba0c4838f0'), 'a12fb0b9…')
  assert.equal(truncId('corto'), 'corto')
  assert.equal(truncId(null), DASH)
  assert.equal(orDash(null), DASH)
  assert.equal(orDash(0), 0)
})
