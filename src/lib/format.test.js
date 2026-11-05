import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EMPTY, fmt, fmtClock, fmtCountdown, fmtDate, fmtDay, fmtTime, orDash, truncId } from './format.js'

test('fmt usa separadores es-CL y redondea a 2 decimales', () => {
  assert.equal(fmt(119392553.0988), '119.392.553,1')
  assert.equal(fmt(12395.49), '12.395,49')
  assert.equal(fmt(0.0034, 4), '0,0034')
  assert.equal(fmt(-1500), '-1.500')
})

test('fmt devuelve guion largo para null, undefined, vacío y no numéricos', () => {
  for (const v of [null, undefined, '', 'abc', NaN]) assert.equal(fmt(v), EMPTY)
})

test('fmtDate y fmtTime en hora de Chile (UTC-3 en octubre)', () => {
  const iso = '2026-10-06T17:40:04.181Z'
  assert.match(fmtDate(iso, { timeZone: 'America/Santiago' }), /06-10-(20)?26.*14:40:04/)
  assert.equal(fmtTime(iso, { timeZone: 'America/Santiago' }), '14:40:04')
  assert.equal(fmtDate(null), EMPTY)
  assert.equal(fmtDate('no-es-fecha'), EMPTY)
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
  assert.equal(truncId(null), EMPTY)
  assert.equal(orDash(null), EMPTY)
  assert.equal(orDash(0), 0)
})

test('los nulos se muestran como "Sin dato", sin em-dash (DF-031)', () => {
  assert.equal(EMPTY, 'Sin dato')
  assert.equal(fmt(null), 'Sin dato')
  assert.equal(fmtTime(undefined), 'Sin dato')
  assert.doesNotMatch(EMPTY, /[—–]/)
})

test('fmtClock y fmtDay dan la hora y la fecha cortas (DF-033)', () => {
  assert.equal(fmtClock('2026-11-01T14:05:59Z', { timeZone: 'UTC' }), '14:05')
  assert.equal(fmtDay('2026-11-01T14:05:59Z', { timeZone: 'UTC' }), '01-11-26')
  assert.equal(fmtClock(null), EMPTY)
})
