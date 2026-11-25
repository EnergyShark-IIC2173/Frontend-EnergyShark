#!/usr/bin/env node
// Servidor SSE de prueba para el feed en vivo (RF01 de la E3, DF-047). Sin dependencias.
// Habla el contrato propuesto para S17: GET /api/feed/stream, solo con `Authorization: Bearer <algo>`,
// `Last-Event-ID` (header o ?lastEventId=), backlog a un cliente nuevo, `event: reset` si el id pedido ya no
// está, `retry:` y latido `: ping`. Genera historias coherentes de mercado, wallet, sagas, alertas y RF05.
// NO valida el JWT: es solo para desarrollo local. Nunca exponerlo.
//
// Uso: npm run mock:feed   (y en otra terminal: npm run dev:feed)
// Variables: MOCK_FEED_PORT (3002) · MOCK_FEED_RATE_MS (1500, promedio entre eventos) · MOCK_FEED_DROP_MS
// (60000, corta cada conexión a ese tiempo; 0 = nunca) · MOCK_FEED_RESET_MS (0 = nunca; reinicia la numeración,
// como si se vaciara la tabla) · MOCK_FEED_RETAIN (300) · MOCK_FEED_BACKLOG (100) · MOCK_FEED_HEARTBEAT_MS (15000)

import http from 'node:http'
import { randomUUID } from 'node:crypto'

const env = (k, d) => (process.env[k] === undefined ? d : Number(process.env[k]))
const PORT = env('MOCK_FEED_PORT', 3002)
const RATE_MS = env('MOCK_FEED_RATE_MS', 1500)
const DROP_MS = env('MOCK_FEED_DROP_MS', 60_000)
const RESET_MS = env('MOCK_FEED_RESET_MS', 0)
const RETAIN = env('MOCK_FEED_RETAIN', 300)
const BACKLOG = env('MOCK_FEED_BACKLOG', 100)
const HEARTBEAT_MS = env('MOCK_FEED_HEARTBEAT_MS', 15_000)
const RETRY_MS = 2000

const REGION = 'us-east-1'
const ACCOUNT = '000000000000' // ficticia
const MACHINES = { seller: 'energyshark-saga-vendedor', buyer: 'energyshark-saga-comprador' }
const CITIES = ['VAL', 'CON', 'ANT', 'PMO', 'IQQ', 'MET']
const ALERTS = [
  { alert: 'wallet_slow', summary: 'Wallet lenta: p95 de las llamadas sobre el umbral', unit: 'ms', value: 4200, threshold: 2500 },
  { alert: 'consumer_stalled', summary: 'Consumidor sin mensajes de market.{CODE} en el ciclo', unit: 's', value: 1260, threshold: 1200 },
  { alert: 'ledger_drift', summary: 'Ledger desviado: saldo local distinto de GET /balance al cierre', unit: 'CR', value: 1500, threshold: 0 },
  { alert: 'saga_stuck', summary: 'Ejecución abierta después de closesAt', unit: 'ejecuciones', value: 1, threshold: 0 },
  { alert: 'outbox_lag', summary: 'Outbox con atraso: la fila pendiente más antigua supera el umbral', unit: 's', value: 95, threshold: 60 },
]

let nextId = 1
let events = []
const clients = new Set()
let cycleNum = 9400
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const rnd = (min, max) => Math.round(min + Math.random() * (max - min))
const cycleId = () => `cycle-${cycleNum}`

function execution(role, idpk, status) {
  const arn = `arn:aws:states:${REGION}:${ACCOUNT}:execution:${MACHINES[role]}:${idpk}`
  return {
    name: idpk, arn, role, status,
    consoleUrl: `https://${REGION}.console.aws.amazon.com/states/home?region=${REGION}#/v2/executions/details/${encodeURIComponent(arn)}`,
  }
}

function emit({ type, severity = 'info', swapId = null, idpk = null, exec = null, summary, payload = null }) {
  const ev = {
    id: nextId++, ts: new Date().toISOString(), type, severity, cycleId: cycleId(), swapId, idpk,
    execution: exec, summary, payload,
  }
  events.push(ev)
  if (events.length > RETAIN) events = events.slice(-RETAIN)
  for (const c of clients) send(c, ev)
  return ev
}

// Historias: cada una es una lista de pasos con su espera, para que se entrelacen como en producción.
function sellerStory() {
  const buyer = pick(CITIES.filter((c) => c !== 'MET'))
  const bidIdpk = randomUUID()
  const swapId = `swp-${randomUUID().slice(0, 8)}`
  const qty = rnd(500, 8000)
  const outcome = pick(['settled', 'settled', 'compensated', 'rejected'])
  const steps = [
    () => emit({ type: 'market.bid_received', idpk: bidIdpk, summary: `Bid de ${buyer} por ${qty} kWh`, payload: { buyer, offerId: `OWN-${cycleNum}`, quantity: qty, decision: outcome === 'rejected' ? 'rejected' : 'accepted', reason: outcome === 'rejected' ? 'INSUFFICIENT_REMAINING' : null } }),
  ]
  if (outcome === 'rejected') {
    steps.push(() => emit({ type: 'market.bid_result', severity: 'warn', idpk: bidIdpk, summary: `Bid de ${buyer} rechazado: no alcanza el remaining`, payload: { direction: 'received', result: 'rejected', reason: 'INSUFFICIENT_REMAINING' } }))
    return steps
  }
  steps.push(
    () => emit({ type: 'saga.started', idpk: bidIdpk, exec: execution('seller', bidIdpk, 'running'), summary: `Saga del vendedor iniciada para ${buyer}` }),
    () => emit({ type: 'wallet.event', swapId, idpk: bidIdpk, summary: 'swap-proposed', payload: { event: 'swap-proposed', give: { asset: 'KWH', amount: qty } } }),
    () => emit({ type: 'market.bid_result', swapId, idpk: bidIdpk, summary: `bid-accepted enviado a ${buyer}`, payload: { direction: 'received', result: 'accepted', reason: null } }),
  )
  if (outcome === 'settled') {
    steps.push(
      () => emit({ type: 'wallet.event', swapId, idpk: bidIdpk, summary: 'swap-settled', payload: { event: 'swap-settled' } }),
      () => emit({ type: 'saga.terminal', swapId, idpk: bidIdpk, exec: execution('seller', bidIdpk, 'settled'), summary: `Swap con ${buyer} liquidado (${qty} kWh)` }),
    )
  } else {
    steps.push(
      () => emit({ type: 'wallet.event', severity: 'warn', swapId, idpk: bidIdpk, summary: 'swap-expired', payload: { event: 'swap-expired' } }),
      () => emit({ type: 'saga.compensated', severity: 'warn', swapId, idpk: bidIdpk, exec: execution('seller', bidIdpk, 'compensated'), summary: `${buyer} no aceptó: reserva liberada y offer-updated publicado`, payload: { releasedQuantity: qty } }),
    )
  }
  return steps
}

function buyerStory() {
  const seller = pick(CITIES)
  const bidIdpk = randomUUID()
  const acceptedIdpk = randomUUID()
  const swapId = `swp-${randomUUID().slice(0, 8)}`
  const qty = rnd(300, 5000)
  const outcome = pick(['settled', 'settled', 'not_proposed', 'rejected_bid'])
  const steps = [
    () => emit({ type: 'market.bid_sent', idpk: bidIdpk, summary: `Bid a ${seller} por ${qty} kWh`, payload: { seller, offerId: `${seller}-${cycleNum}`, quantity: qty } }),
  ]
  if (outcome === 'rejected_bid') {
    steps.push(() => emit({ type: 'market.bid_result', severity: 'warn', idpk: bidIdpk, summary: `${seller} rechazó el bid`, payload: { direction: 'sent', result: 'rejected', reason: 'OFFER_EXHAUSTED' } }))
    return steps
  }
  steps.push(
    () => emit({ type: 'market.bid_result', swapId, idpk: bidIdpk, summary: `${seller} aceptó: llegó bid-accepted`, payload: { direction: 'sent', result: 'accepted', reason: null } }),
    () => emit({ type: 'saga.started', swapId, idpk: acceptedIdpk, exec: execution('buyer', acceptedIdpk, 'running'), summary: `Saga del comprador iniciada con ${seller}` }),
  )
  if (outcome === 'settled') {
    steps.push(
      () => emit({ type: 'wallet.event', swapId, idpk: acceptedIdpk, summary: 'swap-settled', payload: { event: 'swap-settled' } }),
      () => emit({ type: 'saga.terminal', swapId, idpk: acceptedIdpk, exec: execution('buyer', acceptedIdpk, 'settled'), summary: `Compra a ${seller} liquidada (${qty} kWh)` }),
    )
  } else {
    steps.push(
      () => emit({ type: 'wallet.event', swapId, idpk: acceptedIdpk, summary: 'swap-rejected: SWAP_NOT_PROPOSED', payload: { event: 'swap-rejected', code: 'SWAP_NOT_PROPOSED' } }),
      () => emit({ type: 'saga.terminal', swapId, idpk: acceptedIdpk, exec: execution('buyer', acceptedIdpk, 'rejected'), summary: `Otra ciudad llegó primero al swap de ${seller}: demanda sin cubrir` }),
    )
  }
  return steps
}

function offerStory() {
  const city = pick(CITIES)
  return [() => emit({ type: 'market.offer_seen', summary: `Oferta de ${city}`, payload: { city, offerId: `${city}-${cycleNum}`, price: rnd(250, 420), remaining: rnd(1000, 40000) } })]
}

function alertStory() {
  const a = pick(ALERTS)
  // Se abre ahora y se resuelve sola entre 20 y 45 s después, como un incidente de New Relic.
  return [
    () => {
      emit({ type: 'alert.fired', severity: 'error', summary: a.summary, payload: { alert: a.alert, state: 'open', value: a.value, threshold: a.threshold, unit: a.unit } })
      setTimeout(() => emit({ type: 'alert.fired', summary: `${a.summary} (resuelta)`, payload: { alert: a.alert, state: 'closed', value: a.threshold, threshold: a.threshold, unit: a.unit } }), rnd(20_000, 45_000))
    },
  ]
}

function registryStory() {
  const sender = pick(CITIES)
  const r = pick([
    { kind: 'duplicate', reason: 'duplicate', severity: 'warn' },
    { kind: 'nack', reason: 'IDENTITY_MISMATCH', severity: 'error' },
    { kind: 'nack', reason: 'MALFORMED_MESSAGE', severity: 'warn' },
  ])
  return [() => emit({ type: 'registry.discarded', severity: r.severity, idpk: randomUUID(), summary: `${r.kind === 'duplicate' ? 'Duplicado' : 'NACK'} ${r.reason} de ${sender}`, payload: { kind: r.kind, reason: r.reason, sourceQueue: pick(['city', 'market']), sender } })]
}

const STORIES = [
  [offerStory, 5], [sellerStory, 3], [buyerStory, 3], [registryStory, 1.5], [alertStory, 1.2],
]
const totalWeight = STORIES.reduce((s, [, w]) => s + w, 0)
function randomStory() {
  let r = Math.random() * totalWeight
  for (const [fn, w] of STORIES) if ((r -= w) <= 0) return fn
  return offerStory
}

// Pasos en curso de varias historias a la vez.
let running = []
function tick() {
  if (running.length < 3 || Math.random() < 0.3) running.push(randomStory()())
  const story = pick(running)
  story.shift()()
  running = running.filter((s) => s.length > 0)
  setTimeout(tick, rnd(RATE_MS * 0.3, RATE_MS * 1.7))
}

// Ciclo nuevo cada 2 min (el real es de 20) para que cycleId cambie en una sesión de prueba.
setInterval(() => { cycleNum += 1 }, 120_000)

function writeEvent(res, ev) {
  res.write(`id: ${ev.id}\nevent: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`)
}

function send(client, ev) {
  if (!client.res.writableEnded) writeEvent(client.res, ev)
}

function cors(req, res) {
  const origin = req.headers.origin
  if (origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Last-Event-ID, Accept')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  }
}

const server = http.createServer((req, res) => {
  cors(req, res)
  const url = new URL(req.url, `http://${req.headers.host}`)
  if (req.method === 'OPTIONS') return res.writeHead(204).end()
  if (url.pathname === '/health') return res.writeHead(200, { 'content-type': 'text/plain' }).end('ok')
  if (url.pathname !== '/api/feed/stream' || req.method !== 'GET') {
    return res.writeHead(404, { 'content-type': 'application/json' }).end(JSON.stringify({ error: 'Not found' }))
  }
  const auth = req.headers.authorization || ''
  if (!/^Bearer \S+$/.test(auth)) {
    return res.writeHead(401, { 'content-type': 'application/json' }).end(JSON.stringify({ error: 'Unauthorized' }))
  }

  res.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
    'x-accel-buffering': 'no',
  })
  res.write(`retry: ${RETRY_MS}\n\n`)

  const rawLast = req.headers['last-event-id'] ?? url.searchParams.get('lastEventId')
  const last = rawLast === undefined || rawLast === null || rawLast === '' ? null : Number(rawLast)
  const oldest = events[0]?.id ?? nextId
  const newest = nextId - 1
  let replay
  if (last === null || !Number.isSafeInteger(last)) {
    replay = events.slice(-BACKLOG)
  } else if (last < oldest - 1 || last > newest) {
    res.write(`event: reset\ndata: ${JSON.stringify({ reason: last > newest ? 'unknown-id' : 'gap', oldestId: oldest, requested: last })}\n\n`)
    replay = events.slice(-BACKLOG)
  } else {
    replay = events.filter((e) => e.id > last)
  }
  for (const ev of replay) writeEvent(res, ev)
  console.log(`[mock-feed] conexión: Last-Event-ID=${rawLast ?? '(ninguno)'} → ${replay.length} eventos de backlog`)

  const client = { res }
  clients.add(client)
  const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS)
  const drop = DROP_MS > 0 ? setTimeout(() => { console.log('[mock-feed] corte programado de la conexión'); res.end() }, DROP_MS) : null
  const cleanup = () => {
    clearInterval(heartbeat)
    if (drop) clearTimeout(drop)
    clients.delete(client)
  }
  req.on('close', cleanup)
  res.on('close', cleanup)
})

// Historial inicial: unas 120 líneas para que la vista no parta vacía.
for (let i = 0; i < 40; i++) {
  if (running.length < 3) running.push(randomStory()())
  const story = pick(running)
  story.shift()()
  running = running.filter((s) => s.length > 0)
}
for (const ev of events) ev.ts = new Date(Date.now() - (nextId - ev.id) * RATE_MS).toISOString()

if (RESET_MS > 0) {
  setInterval(() => {
    console.log('[mock-feed] reinicio de la numeración (simula tabla vaciada)')
    events = []
    nextId = 1
    for (const c of clients) c.res.end()
  }, RESET_MS)
}

server.listen(PORT, () => {
  console.log(`[mock-feed] SSE en http://localhost:${PORT}/api/feed/stream (corte cada ${DROP_MS || '∞'} ms)`)
  setTimeout(tick, RATE_MS)
})
