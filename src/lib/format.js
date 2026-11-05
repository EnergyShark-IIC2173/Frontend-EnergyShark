// Formatos de pantalla (DF-019, DF-031). Puro: sin React ni import.meta, para probarlo con `node --test`.

// Lo que se muestra en un campo nulo. Texto y no un guion: el sistema visual no usa em-dash (DF-031).
export const EMPTY = 'Sin dato'

const isBlank = (v) => v === null || v === undefined || v === ''

export function orDash(value) {
  return isBlank(value) ? EMPTY : value
}

// Cifras en es-CL: 119392553.0988 → "119.392.553,1".
export function fmt(value, digits = 2) {
  if (isBlank(value) || !Number.isFinite(Number(value))) return EMPTY
  return Number(value).toLocaleString('es-CL', { maximumFractionDigits: digits })
}

function toDate(iso) {
  if (isBlank(iso)) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

// timeZone solo para los tests; en el navegador se usa la zona del usuario.
export function fmtDate(iso, { timeZone } = {}) {
  const d = toDate(iso)
  if (!d) return EMPTY
  return d.toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'medium', hourCycle: 'h23', ...(timeZone ? { timeZone } : {}) })
}

export function fmtTime(iso, { timeZone } = {}) {
  const d = toDate(iso)
  if (!d) return EMPTY
  return d.toLocaleTimeString('es-CL', { timeStyle: 'medium', hourCycle: 'h23', ...(timeZone ? { timeZone } : {}) })
}

// Hora corta "14:05", para las tarjetas chicas de la grilla (DF-033).
export function fmtClock(iso, { timeZone } = {}) {
  const d = toDate(iso)
  if (!d) return EMPTY
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', ...(timeZone ? { timeZone } : {}) })
}

// Fecha corta "01-11-26".
export function fmtDay(iso, { timeZone } = {}) {
  const d = toDate(iso)
  if (!d) return EMPTY
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit', ...(timeZone ? { timeZone } : {}) })
}

// "en 12 min 05 s" hasta una fecha futura; null si ya pasó.
export function fmtCountdown(iso, now = Date.now()) {
  const d = toDate(iso)
  if (!d) return null
  const ms = d.getTime() - now
  if (ms <= 0) return null
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = String(total % 60).padStart(2, '0')
  return h > 0 ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min ${s} s`
}

// UUIDs largos en tablas: los primeros 8 caracteres (el completo va en `title`).
export function truncId(id, length = 8) {
  if (isBlank(id)) return EMPTY
  return id.length > length ? `${id.slice(0, length)}…` : id
}
