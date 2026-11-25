import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createFeedClient } from './feedClient.js'

// Respuesta SSE controlable: write() empuja texto, close() termina el stream, fail() lo corta con error.
function sseResponse({ status = 200, type = 'text/event-stream' } = {}) {
  let ctrl
  const body = new ReadableStream({ start(c) { ctrl = c } })
  const enc = new TextEncoder()
  return {
    res: new Response(status === 200 ? body : null, { status, headers: { 'content-type': type } }),
    write: (text) => ctrl.enqueue(enc.encode(text)),
    close: () => ctrl.close(),
    fail: () => ctrl.error(new Error('net')),
  }
}

// Reloj falso: los timers solo corren con tick().
function fakeTimers() {
  const timers = new Map()
  let n = 0
  return {
    setTimer: (fn, ms) => { timers.set(++n, { fn, ms }); return n },
    clearTimer: (id) => timers.delete(id),
    pending: () => [...timers.values()],
    run(filter = () => true) {
      for (const [id, t] of [...timers]) if (filter(t)) { timers.delete(id); t.fn() }
    },
  }
}

const flush = () => new Promise((r) => setTimeout(r, 5))

function setup({ responses, tokens = ['t1', 't2', 't3', 't4'] }) {
  const calls = []
  const events = []
  const statuses = []
  const resets = []
  const timers = fakeTimers()
  let tokenIdx = 0
  const client = createFeedClient({
    url: 'https://feed.test/api/feed/stream',
    getToken: async (force) => {
      const t = tokens[tokenIdx++]
      if (t instanceof Error) throw t
      return force ? `${t}-fresh` : t
    },
    fetchImpl: async (url, init) => {
      calls.push({ url, headers: init.headers })
      const next = responses.shift()
      if (next instanceof Error) throw next
      init.signal.addEventListener('abort', () => next.fail?.())
      return next.res
    },
    onEvent: (m) => events.push(m),
    onReset: (d) => resets.push(d),
    onStatus: (s, d) => statuses.push([s, d]),
    setTimer: timers.setTimer,
    clearTimer: timers.clearTimer,
    random: () => 1,
  })
  return { client, calls, events, statuses, resets, timers }
}

test('manda Authorization y Accept; sin Last-Event-ID en la primera conexión', async () => {
  const a = sseResponse()
  const { client, calls, events, statuses } = setup({ responses: [a] })
  client.start()
  await flush()
  a.write('id: 5\nevent: saga.started\ndata: {"id":5}\n\n')
  await flush()
  assert.equal(calls[0].headers.Authorization, 'Bearer t1')
  assert.equal(calls[0].headers.Accept, 'text/event-stream')
  assert.equal(calls[0].headers['Last-Event-ID'], undefined)
  assert.deepEqual(events.map((e) => e.id), ['5'])
  assert.equal(statuses.at(-1)[0], 'open')
  client.stop()
})

test('al cortarse reconecta con backoff, Last-Event-ID y token nuevo, y descarta repetidos', async () => {
  const a = sseResponse()
  const b = sseResponse()
  const { client, calls, events, statuses, timers } = setup({ responses: [a, b] })
  client.start()
  await flush()
  a.write('id: 7\ndata: {"id":7}\n\nid: 8\ndata: {"id":8}\n\n')
  await flush()
  a.close()
  await flush()
  assert.deepEqual(statuses.at(-1), ['reconnecting', { inMs: 1000, attempt: 1 }])
  timers.run((t) => t.ms === 1000)
  await flush()
  assert.equal(calls[1].headers['Last-Event-ID'], '8')
  assert.equal(calls[1].headers.Authorization, 'Bearer t2')
  b.write('id: 8\ndata: {"id":8}\n\nid: 9\ndata: {"id":9}\n\n')
  await flush()
  assert.deepEqual(events.map((e) => e.id), ['7', '8', '9'])
  client.stop()
})

test('backoff crece mientras falla y vuelve a 1 s cuando llegan datos', async () => {
  const ok = sseResponse()
  const { client, statuses, timers } = setup({ responses: [new Error('down'), new Error('down'), ok] })
  client.start()
  await flush()
  assert.deepEqual(statuses.at(-1), ['reconnecting', { inMs: 1000, attempt: 1 }])
  timers.run()
  await flush()
  assert.deepEqual(statuses.at(-1), ['reconnecting', { inMs: 2000, attempt: 2 }])
  timers.run((t) => t.ms === 2000)
  await flush()
  ok.write(': ping\n\n')
  ok.close()
  await flush()
  assert.deepEqual(statuses.at(-1), ['reconnecting', { inMs: 1000, attempt: 1 }])
  client.stop()
})

test('retry: del servidor reemplaza la base del backoff', async () => {
  const a = sseResponse()
  const { client, statuses } = setup({ responses: [a] })
  client.start()
  await flush()
  a.write('retry: 3000\n\n')
  a.close()
  await flush()
  assert.deepEqual(statuses.at(-1), ['reconnecting', { inMs: 3000, attempt: 1 }])
  client.stop()
})

test('401: reintenta una vez con token forzado; si vuelve a fallar, queda en auth sin reintentar', async () => {
  const ok = sseResponse()
  const first = setup({ responses: [sseResponse({ status: 401 }), ok] })
  first.client.start()
  await flush()
  assert.equal(first.calls[1].headers.Authorization, 'Bearer t2-fresh')
  assert.equal(first.statuses.at(-1)[0], 'open')
  first.client.stop()

  const second = setup({ responses: [sseResponse({ status: 401 }), sseResponse({ status: 401 })] })
  second.client.start()
  await flush()
  assert.equal(second.statuses.at(-1)[0], 'auth')
  assert.equal(second.timers.pending().length, 0)
})

test('Auth0 pide login: se detiene en auth', async () => {
  const err = Object.assign(new Error('login'), { authRequired: true })
  const { client, statuses, calls } = setup({ responses: [], tokens: [err] })
  client.start()
  await flush()
  assert.equal(statuses.at(-1)[0], 'auth')
  assert.equal(calls.length, 0)
})

test('respuesta que no es text/event-stream o 5xx: reintenta', async () => {
  const { client, statuses } = setup({ responses: [sseResponse({ type: 'text/html' })] })
  client.start()
  await flush()
  assert.equal(statuses.at(-1)[0], 'reconnecting')
  client.stop()
})

test('event: reset olvida el último id y avisa', async () => {
  const a = sseResponse()
  const b = sseResponse()
  const { client, resets, events, calls, timers } = setup({ responses: [a, b] })
  client.start()
  await flush()
  a.write('id: 50\ndata: {"id":50}\n\nevent: reset\ndata: {"reason":"gap"}\n\nid: 3\ndata: {"id":3}\n\n')
  await flush()
  assert.deepEqual(resets, ['{"reason":"gap"}'])
  assert.deepEqual(events.map((e) => e.id), ['50', '3'])
  a.close()
  await flush()
  timers.run((t) => t.ms === 1000)
  await flush()
  assert.equal(calls[1].headers['Last-Event-ID'], '3')
  client.stop()
})

test('latido vencido: aborta la conexión colgada y reconecta', async () => {
  const a = sseResponse()
  const { client, statuses, timers } = setup({ responses: [a] })
  client.start()
  await flush()
  timers.run((t) => t.ms === 45_000)
  await flush()
  assert.equal(statuses.at(-1)[0], 'reconnecting')
  client.stop()
})

test('stop: no deja timers ni reconecta', async () => {
  const a = sseResponse()
  const { client, statuses, timers } = setup({ responses: [a] })
  client.start()
  await flush()
  client.stop()
  await flush()
  assert.equal(statuses.at(-1)[0], 'stopped')
  assert.equal(timers.pending().length, 0)
})
