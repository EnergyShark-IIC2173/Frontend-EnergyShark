import { test } from 'node:test'
import assert from 'node:assert/strict'
import { activeAlerts, connectionText, alertInfo, appendEvent, countByGroup, feedType, filterEvents, normalizeFeedEvent } from './feed.js'

const base = {
  id: 10, ts: '2026-11-25T14:03:11.123Z', type: 'saga.terminal', severity: 'info', cycleId: 'c-1', swapId: 'swp-1',
  idpk: 'idpk-1', execution: { name: 'idpk-1', arn: 'arn:x', consoleUrl: 'https://console.aws.amazon.com/x', role: 'seller', status: 'settled' },
  summary: 'Saga liquidada', payload: { x: 1 },
}

test('normalizeFeedEvent: evento completo del contrato', () => {
  const e = normalizeFeedEvent(JSON.stringify(base))
  assert.equal(e.id, 10)
  assert.equal(e.execution.role, 'seller')
  assert.equal(e.execution.consoleUrl, 'https://console.aws.amazon.com/x')
  assert.deepEqual(e.payload, { x: 1 })
})

test('normalizeFeedEvent: llaves faltantes quedan en null y el id puede venir del campo SSE', () => {
  const e = normalizeFeedEvent('{"type":"market.offer_seen"}', { sseId: '42' })
  assert.equal(e.id, 42)
  assert.equal(e.cycleId, null)
  assert.equal(e.execution, null)
  assert.equal(e.severity, 'info')
  assert.equal(e.summary, '')
})

test('normalizeFeedEvent: tipo desde `event:` si falta en el JSON; inválidos devuelven null', () => {
  assert.equal(normalizeFeedEvent('{"id":3}', { sseType: 'alert.fired' }).type, 'alert.fired')
  assert.equal(normalizeFeedEvent('{"id":3}').type, 'unknown')
  assert.equal(normalizeFeedEvent('no-json'), null)
  assert.equal(normalizeFeedEvent('{"id":"abc"}'), null)
  assert.equal(normalizeFeedEvent('{"id":-1}'), null)
})

test('normalizeFeedEvent: consoleUrl que no es https se descarta', () => {
  const e = normalizeFeedEvent(JSON.stringify({ ...base, execution: { ...base.execution, consoleUrl: 'javascript:alert(1)' } }))
  assert.equal(e.execution.consoleUrl, null)
})

test('feedType: conocido toma ícono del grupo; desconocido cae en "otros"', () => {
  assert.deepEqual(feedType('wallet.event'), { label: 'Evento wallet', group: 'wallet', icon: 'wallet', tone: 'category' })
  assert.equal(feedType('nuevo.tipo').group, 'other')
  assert.equal(feedType('nuevo.tipo').label, 'nuevo.tipo')
})

test('appendEvent: más nuevo primero, sin duplicados, desordenados en su lugar, con tope', () => {
  let list = []
  for (const id of [1, 2, 3]) list = appendEvent(list, { id })
  assert.deepEqual(list.map((e) => e.id), [3, 2, 1])
  assert.equal(appendEvent(list, { id: 2 }), list)
  assert.deepEqual(appendEvent([{ id: 5 }, { id: 3 }], { id: 4 }).map((e) => e.id), [5, 4, 3])
  assert.deepEqual(appendEvent(list, { id: 4 }, 2).map((e) => e.id), [4, 3])
})

test('filterEvents: por grupo, severidad mínima y búsqueda por ids', () => {
  const list = [
    { id: 3, type: 'alert.fired', severity: 'error', cycleId: 'c-2', swapId: null, idpk: null },
    { id: 2, type: 'market.bid_sent', severity: 'info', cycleId: 'c-1', swapId: null, idpk: 'abc' },
    { id: 1, type: 'saga.started', severity: 'warn', cycleId: 'c-1', swapId: 'SWP-9', idpk: null },
  ]
  assert.deepEqual(filterEvents(list, { groups: new Set(['market', 'saga']) }).map((e) => e.id), [2, 1])
  assert.deepEqual(filterEvents(list, { minSeverity: 'warn' }).map((e) => e.id), [3, 1])
  assert.deepEqual(filterEvents(list, { search: 'swp-9' }).map((e) => e.id), [1])
  assert.deepEqual(filterEvents(list, { search: 'c-1', minSeverity: 'warn' }).map((e) => e.id), [1])
  assert.deepEqual(countByGroup(list), { alert: 1, market: 1, saga: 1 })
})

test('alertInfo y activeAlerts: la última noticia de cada alerta manda', () => {
  const fired = (id, alert, state) => ({ id, type: 'alert.fired', payload: { alert, state } })
  const list = [fired(4, 'outbox_lag', 'closed'), fired(3, 'wallet_slow', 'open'), fired(2, 'outbox_lag', 'open'), fired(1, 'wallet_slow', 'open')]
  const active = activeAlerts(list)
  assert.deepEqual(active.map((a) => [a.key, a.event.id]), [['wallet_slow', 3]])
  assert.match(active[0].runbookUrl, /runbook-alertas\.md#wallet-lenta$/)
  assert.equal(alertInfo({ payload: { alert: 'otra' } }).label, 'otra')
})

test('connectionText: estados y cuenta regresiva de la reconexión', () => {
  assert.equal(connectionText('open'), 'En vivo')
  assert.equal(connectionText('reconnecting', { inMs: 4000, at: 1000, attempt: 3 }, 2000), 'Reconectando en 3 s (intento 3)')
  assert.equal(connectionText('reconnecting', { inMs: 0, at: 0, attempt: 2 }, 0), 'Reconectando (intento 2)…')
  assert.equal(connectionText('auth'), 'Sesión expirada')
  // Reloj detenido 45 s antes del cambio de estado: cuenta desde el cambio, no desde el reloj viejo.
  assert.equal(connectionText('reconnecting', { inMs: 2000, at: 50_000, attempt: 1 }, 5000), 'Reconectando en 2 s (intento 1)')
})
