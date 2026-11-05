// Mocks de RF05 (DF-042, DF-025): rechazos con origen (S2) y filtros como los de master (kind, reason,
// sourceQueue). Solo con VITE_USE_MOCKS=true en `npm run dev`. Se borran en S23.

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const MIN = 60_000

const SAMPLES = [
  { kind: 'nack', type: 'bid', reason: 'IDENTITY_MISMATCH', code: 403, detail: 'user_id city.ABC no corresponde al emisor declarado COR', sourceQueue: 'city', sender: 'city.ABC' },
  { kind: 'duplicate', type: 'swap-settled', reason: null, code: null, detail: 'idpk ya aplicado; no se reaplica al ledger', sourceQueue: 'city', sender: 'central' },
  { kind: 'nack', type: 'bid', reason: 'MALFORMED_MESSAGE', code: 422, detail: 'data.offerId requerido', sourceQueue: 'city', sender: 'city.COR' },
  { kind: 'discarded', type: 'offer', reason: 'IDENTITY_MISMATCH', code: null, detail: 'oferta de HGW firmada por city.XYZ', sourceQueue: 'market', sender: 'city.XYZ' },
  { kind: 'duplicate', type: 'bid', reason: null, code: null, detail: 'mismo idpk: no se propone un segundo swap', sourceQueue: 'city', sender: 'city.MET' },
  { kind: 'discarded', type: 'bid', reason: 'NOT_A_MARKET_TYPE', code: null, detail: 'bid recibido por el feed del mercado', sourceQueue: 'market', sender: 'city.TAL' },
  { kind: 'discarded', type: 'demand-statement', reason: 'TYPE_RETIRED', code: null, detail: 'retirado en el protocolo v3; ack enviado, no se aplica', sourceQueue: 'city', sender: 'central' },
]

function all() {
  const now = Date.now()
  return Array.from({ length: 63 }, (_, i) => {
    const s = SAMPLES[i % SAMPLES.length]
    const n = String(63 - i).padStart(12, '0')
    return { id: 63 - i, ...s, idpk: `c0ffee00-0000-4000-8000-${n}`, msgId: `beef0000-0000-4000-8000-${n}`, occurredAt: new Date(now - i * 7 * MIN).toISOString() }
  })
}

export async function mockListRejected({ page = 1, limit = 25, kind, reason, sourceQueue } = {}) {
  await delay(200)
  const rows = all().filter((r) => (!kind || r.kind === kind) && (!reason || r.reason === reason) && (!sourceQueue || r.sourceQueue === sourceQueue))
  const start = (page - 1) * limit
  return { page, limit, total: rows.length, totalPages: Math.max(1, Math.ceil(rows.length / limit)), data: rows.slice(start, start + limit) }
}
