import { backoffDelay, createSseParser } from './sse.js'

// Cliente del feed en vivo (DF-046): SSE sobre fetch para poder mandar Authorization y Last-Event-ID.
// Puro respecto de React: recibe fetch, el reloj y el token por parámetro, así se prueba con `node --test`.
//
// Estados (onStatus): connecting · open · reconnecting ({ inMs, attempt }) · auth (hay que volver a iniciar
// sesión; no se reintenta) · stopped.
//
// getToken(force) devuelve el access token; con force=true debe saltarse la caché. Si lanza un error con
// `authRequired`, el cliente se detiene en `auth`.

export const IDLE_MS = 45_000 // 3 latidos de 15 s sin un byte → conexión colgada

export function createFeedClient({
  url,
  getToken,
  onEvent,
  onReset,
  onStatus,
  fetchImpl = (...args) => fetch(...args),
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (t) => clearTimeout(t),
  random = Math.random,
  baseMs = 1000,
  maxMs = 30_000,
  idleMs = IDLE_MS,
}) {
  let lastId = null
  let attempt = 0
  let serverRetry = null
  let controller = null
  let retryTimer = null
  let idleTimer = null
  let stopped = true
  let status = null

  function setStatus(next, detail = {}) {
    status = next
    onStatus?.(next, detail)
  }

  function clearTimers() {
    if (retryTimer) clearTimer(retryTimer)
    if (idleTimer) clearTimer(idleTimer)
    retryTimer = null
    idleTimer = null
  }

  function armIdle() {
    if (idleTimer) clearTimer(idleTimer)
    idleTimer = setTimer(() => controller?.abort(new Error('idle')), idleMs)
  }

  function scheduleRetry() {
    if (stopped) return
    const inMs = backoffDelay(attempt, { baseMs: serverRetry ?? baseMs, maxMs, random })
    attempt += 1
    setStatus('reconnecting', { inMs, attempt })
    retryTimer = setTimer(connect, inMs)
  }

  function handleMessage(msg) {
    if (msg.type === 'reset') {
      lastId = null
      onReset?.(msg.data)
      return
    }
    const id = Number(msg.id)
    if (Number.isSafeInteger(id) && lastId !== null && id <= lastId) return // duplicado tras reconectar
    if (Number.isSafeInteger(id) && id > 0) lastId = id
    onEvent?.(msg)
  }

  async function open(token) {
    const headers = { Accept: 'text/event-stream', Authorization: `Bearer ${token}` }
    if (lastId !== null) headers['Last-Event-ID'] = String(lastId)
    return fetchImpl(url, { headers, signal: controller.signal, cache: 'no-store' })
  }

  async function connect() {
    if (stopped) return
    retryTimer = null
    controller = new AbortController()
    const mine = controller
    setStatus(attempt === 0 ? 'connecting' : 'reconnecting', { inMs: 0, attempt })

    let res
    try {
      let token = await getToken(false)
      res = await open(token)
      if (res.status === 401) {
        token = await getToken(true)
        res = await open(token)
        if (res.status === 401) return stopAuth()
      }
    } catch (err) {
      if (mine !== controller || stopped) return
      if (err?.authRequired) return stopAuth()
      return scheduleRetry()
    }
    if (mine !== controller || stopped) return
    const type = res.headers.get('content-type') || ''
    if (!res.ok || !res.body || !type.includes('text/event-stream')) {
      res.body?.cancel?.().catch(() => {})
      return scheduleRetry()
    }

    setStatus('open', { lastId })
    const parser = createSseParser({ onMessage: handleMessage, onRetry: (ms) => { serverRetry = ms } })
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let gotData = false
    armIdle()
    try {
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        armIdle()
        if (!gotData) {
          gotData = true
          attempt = 0
        }
        parser.push(decoder.decode(value, { stream: true }))
      }
    } catch {
      // Abort (stop, latido vencido) o red caída: se decide abajo.
    }
    if (idleTimer) clearTimer(idleTimer)
    idleTimer = null
    if (mine !== controller || stopped) return
    scheduleRetry()
  }

  function stopAuth() {
    stopped = true
    clearTimers()
    setStatus('auth')
  }

  return {
    start(fromId = null) {
      if (!stopped) return
      stopped = false
      attempt = 0
      if (fromId !== null) lastId = fromId
      connect()
    },
    stop() {
      stopped = true
      clearTimers()
      controller?.abort(new Error('stopped'))
      controller = null
      setStatus('stopped')
    },
    get lastId() { return lastId },
    get status() { return status },
  }
}
