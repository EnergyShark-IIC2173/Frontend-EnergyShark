// Swaps en curso de RF04 (DF-040) desde GET /api/swaps?status=open (wallet_operations, S5). Puro.

const ACTIONS = {
  'propose-swap': 'Proponemos',
  'accept-swap': 'Aceptamos',
  'cancel-swap': 'Cancelamos',
}
const STATES = {
  pending: { label: 'En cola', tone: 'neutral' },
  sent: { label: 'Enviado a la wallet', tone: 'active' },
}

const time = (iso) => (iso ? new Date(iso).getTime() : NaN)

export function swapRow(op, now = Date.now()) {
  const request = op?.request ?? {}
  const proposing = op?.kind === 'propose-swap'
  const expires = proposing ? time(request.expiresAt) : NaN
  const created = time(op?.createdAt)
  return {
    key: op?.idpk,
    action: ACTIONS[op?.kind] ?? op?.kind ?? '—',
    swapId: op?.swapId ?? request.swapId ?? null,
    cycleId: op?.cycleId ?? null,
    give: proposing ? request.give ?? null : null,
    take: proposing ? request.take ?? null : null,
    memo: proposing ? request.memo ?? null : null,
    state: STATES[op?.state] ?? { label: op?.state ?? '—', tone: 'warning' },
    ageMs: Number.isFinite(created) ? Math.max(0, now - created) : null,
    expiresInMs: Number.isFinite(expires) ? expires - now : null,
  }
}

// "12 s", "3 min 05 s". Para antigüedad y cuenta regresiva (los swaps viven ≤ 60 s).
export function fmtSeconds(ms) {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return null
  const total = Math.max(0, Math.floor(ms / 1000))
  if (total < 60) return `${total} s`
  return `${Math.floor(total / 60)} min ${String(total % 60).padStart(2, '0')} s`
}
