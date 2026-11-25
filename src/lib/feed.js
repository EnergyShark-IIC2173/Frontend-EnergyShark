// Eventos del feed en vivo (RF01 de la E3, DF-046/047). Puro: sin React ni import.meta, para `node --test`.
// Contrato: { id, ts, type, severity, cycleId, swapId, idpk, execution, summary, payload }, con todas las llaves
// presentes (null si no aplican). Un `type` desconocido se muestra igual (compatibilidad hacia adelante).

export const FEED_GROUPS = {
  market: { label: 'Mercado', icon: 'market', tone: 'active' },
  wallet: { label: 'Wallet', icon: 'wallet', tone: 'category' },
  saga: { label: 'Sagas', icon: 'swap', tone: 'category' },
  alert: { label: 'Alertas', icon: 'warning', tone: 'warning' },
  registry: { label: 'Registro', icon: 'duplicate', tone: 'neutral' },
  other: { label: 'Otros', icon: 'pulse', tone: 'neutral' },
}

export const FEED_TYPES = {
  'market.offer_seen': { label: 'Oferta vista', group: 'market' },
  'market.bid_sent': { label: 'Bid enviado', group: 'market' },
  'market.bid_received': { label: 'Bid recibido', group: 'market' },
  'market.bid_result': { label: 'Resultado del bid', group: 'market' },
  'wallet.event': { label: 'Evento wallet', group: 'wallet' },
  'saga.started': { label: 'Saga iniciada', group: 'saga' },
  'saga.terminal': { label: 'Saga terminada', group: 'saga' },
  'saga.compensated': { label: 'Saga compensada', group: 'saga' },
  'alert.fired': { label: 'Alerta', group: 'alert' },
  'registry.discarded': { label: 'Descarte (RF05)', group: 'registry' },
}

export const SEVERITY = {
  info: { label: 'Info', rank: 0, tone: 'neutral' },
  warn: { label: 'Aviso', rank: 1, tone: 'warning' },
  error: { label: 'Error', rank: 2, tone: 'error' },
}

export const SAGA_ROLE = { seller: 'Vendedor', buyer: 'Comprador' }

export const SAGA_STATUS = {
  running: { label: 'En curso', tone: 'active' },
  settled: { label: 'Liquidado', tone: 'settled' },
  rejected: { label: 'Rechazado', tone: 'warning' },
  compensated: { label: 'Compensado', tone: 'warning' },
  failed: { label: 'Falló', tone: 'error' },
  timed_out: { label: 'Timeout', tone: 'error' },
  aborted: { label: 'Abortado', tone: 'error' },
}

export const BID_RESULT = {
  accepted: { label: 'Aceptado', tone: 'settled' },
  rejected: { label: 'Rechazado', tone: 'warning' },
  expired: { label: 'Expirado', tone: 'neutral' },
}

// Las 5 alertas del enunciado ("Operación"). `anchor` es la entrada en docs/runbook-alertas.md (S24).
export const ALERTS = {
  wallet_slow: { label: 'Wallet lenta', anchor: 'wallet-lenta' },
  consumer_stalled: { label: 'Consumidor detenido o atrasado', anchor: 'consumidor-detenido-o-atrasado' },
  ledger_drift: { label: 'Ledger desviado', anchor: 'ledger-desviado' },
  saga_stuck: { label: 'Saga atascada o fallando', anchor: 'saga-atascada-o-fallando' },
  outbox_lag: { label: 'Outbox con atraso', anchor: 'outbox-con-atraso' },
}

export const RUNBOOK_URL = 'https://github.com/EnergyShark-IIC2173/EnergyShark/blob/main/docs/runbook-alertas.md'

const str = (v) => (v === null || v === undefined || v === '' ? null : String(v))

// De lo que llega por SSE (texto de `data`, `id` y `event` del parser) a un evento con todas las llaves.
// Devuelve null si no se puede usar (JSON inválido o sin id numérico).
export function normalizeFeedEvent(data, { sseId = '', sseType = '' } = {}) {
  let raw
  try {
    raw = typeof data === 'string' ? JSON.parse(data) : data
  } catch {
    return null
  }
  if (!raw || typeof raw !== 'object') return null
  const id = Number(raw.id ?? sseId)
  if (!Number.isSafeInteger(id) || id <= 0) return null
  const type = str(raw.type) ?? (sseType && sseType !== 'message' ? sseType : null) ?? 'unknown'
  const ex = raw.execution && typeof raw.execution === 'object' ? raw.execution : null
  return {
    id,
    ts: str(raw.ts),
    type,
    severity: SEVERITY[raw.severity] ? raw.severity : 'info',
    cycleId: str(raw.cycleId),
    swapId: str(raw.swapId),
    idpk: str(raw.idpk),
    execution: ex
      ? { name: str(ex.name), arn: str(ex.arn), consoleUrl: safeUrl(ex.consoleUrl), role: str(ex.role), status: str(ex.status) }
      : null,
    summary: str(raw.summary) ?? '',
    payload: raw.payload && typeof raw.payload === 'object' ? raw.payload : null,
  }
}

// Solo enlaces https: el valor viene del servidor y termina en un href.
function safeUrl(url) {
  const s = str(url)
  return s && /^https:\/\//i.test(s) ? s : null
}

export function feedType(type) {
  const t = FEED_TYPES[type]
  // El grupo aporta ícono y tono; la etiqueta es la del tipo.
  if (t) return { ...FEED_GROUPS[t.group], group: t.group, label: t.label }
  return { label: type, group: 'other', icon: FEED_GROUPS.other.icon, tone: 'neutral' }
}

export function alertInfo(event) {
  const key = event?.payload?.alert
  const known = ALERTS[key]
  return {
    key: key ?? null,
    label: known?.label ?? key ?? 'Alerta',
    runbookUrl: known ? `${RUNBOOK_URL}#${known.anchor}` : RUNBOOK_URL,
    state: event?.payload?.state === 'closed' ? 'closed' : 'open',
    value: event?.payload?.value ?? null,
    threshold: event?.payload?.threshold ?? null,
  }
}

// Agrega un evento a la lista (más nuevo primero), descartando duplicados por id y con tope de tamaño.
export function appendEvent(list, event, max = 500) {
  if (list.length > 0 && event.id <= list[0].id) {
    // Llegó desordenado: solo si no está ya.
    if (list.some((e) => e.id === event.id)) return list
    const next = [...list, event].sort((a, b) => b.id - a.id)
    return next.length > max ? next.slice(0, max) : next
  }
  const next = [event, ...list]
  return next.length > max ? next.slice(0, max) : next
}

// Filtros locales de la vista (no reabren la conexión).
export function filterEvents(list, { groups = null, minSeverity = 'info', search = '' } = {}) {
  const min = SEVERITY[minSeverity]?.rank ?? 0
  const q = search.trim().toLowerCase()
  return list.filter((e) => {
    if (groups && groups.size > 0 && !groups.has(feedType(e.type).group)) return false
    if ((SEVERITY[e.severity]?.rank ?? 0) < min) return false
    if (q) {
      const hay = [e.cycleId, e.swapId, e.idpk, e.execution?.name].some((v) => v && v.toLowerCase().includes(q))
      if (!hay) return false
    }
    return true
  })
}

export function countByGroup(list) {
  const counts = {}
  for (const e of list) {
    const g = feedType(e.type).group
    counts[g] = (counts[g] ?? 0) + 1
  }
  return counts
}

// Alertas vigentes: la última noticia de cada alerta, si sigue abierta. Más reciente primero.
export function activeAlerts(list) {
  const seen = new Set()
  const out = []
  for (const e of list) {
    if (e.type !== 'alert.fired') continue
    const info = alertInfo(e)
    const key = info.key ?? `id-${e.id}`
    if (seen.has(key)) continue
    seen.add(key)
    if (info.state === 'open') out.push({ event: e, ...info })
  }
  return out
}

// Texto del estado de la conexión; `now` para la cuenta regresiva de la reconexión.
export function connectionText(status, detail, now) {
  if (status === 'open') return 'En vivo'
  if (status === 'connecting') return 'Conectando…'
  if (status === 'reconnecting') {
    // `now` puede venir de un reloj detenido (useNow solo corre durante la reconexión): nunca antes del cambio de estado.
    const ref = Math.max(now ?? 0, detail?.at ?? 0)
    const left = detail?.inMs ? Math.max(0, Math.ceil((detail.at + detail.inMs - ref) / 1000)) : 0
    return left > 0 ? `Reconectando en ${left} s (intento ${detail.attempt})` : `Reconectando (intento ${detail?.attempt ?? 1})…`
  }
  if (status === 'auth') return 'Sesión expirada'
  return 'Detenido'
}
