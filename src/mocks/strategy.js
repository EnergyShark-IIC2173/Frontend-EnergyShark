// Mocks de RF04 (DF-040, DF-025): estrategia versionada en memoria (el POST agrega una versión, como el
// append-only de ADR-006) y swaps en curso con la forma de GET /api/swaps?status=open (S5). Solo con
// VITE_USE_MOCKS=true en `npm run dev`. Se borran en S23.

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const iso = (ms) => new Date(ms).toISOString()
const HOUR = 3_600_000

const base = Date.now()
const versions = [
  {
    version: 1, createdBy: 'auth0|david', createdAt: iso(base - 30 * HOUR), note: 'Config inicial (addendum ADR-006)',
    params: { span_seconds: 20, offer: { price_mode: 'pct_of_imbalance', price: 0.8, quantity_mode: 'all_sellable', quantity: null }, acceptance_policy: { name: 'fifo' }, selection_policy: { name: 'lowest_effective_price' }, span_plan: null },
  },
  {
    version: 2, createdBy: 'auth0|pedro', createdAt: iso(base - 20 * HOUR), note: 'Experimento RF06: rotar 10/20/40',
    params: { span_seconds: 20, offer: { price_mode: 'pct_of_imbalance', price: 0.75, quantity_mode: 'all_sellable', quantity: null }, acceptance_policy: { name: 'fifo' }, selection_policy: { name: 'lowest_effective_price' }, span_plan: [10, 20, 40] },
  },
  {
    version: 3, createdBy: 'auth0|esteban', createdAt: iso(base - 2 * HOUR), note: 'Precio fijo y bids grandes primero',
    params: { span_seconds: 30, offer: { price_mode: 'fixed', price: 330, quantity_mode: 'fixed', quantity: 15000 }, acceptance_policy: { name: 'highest_quantity_first', params: { min: 500 } }, selection_policy: { name: 'lowest_effective_price' }, span_plan: [10, 20, 40] },
  },
]

const latest = () => versions[versions.length - 1]

export async function mockGetStrategy() {
  await delay(200)
  return structuredClone(latest())
}

export async function mockListStrategyVersions({ page = 1, limit = 10 } = {}) {
  await delay(250)
  const all = [...versions].reverse()
  const start = (page - 1) * limit
  return { page, limit, total: all.length, totalPages: Math.max(1, Math.ceil(all.length / limit)), data: structuredClone(all.slice(start, start + limit)) }
}

// El backend valida otra vez (ADR-006). Aquí solo lo mínimo para ver un 400 de verdad: span fuera de rango.
export async function mockCreateStrategy({ params, note }) {
  await delay(400)
  if (!(params?.span_seconds >= 5 && params?.span_seconds <= 60)) {
    const error = new Error('params inválidos')
    error.status = 400
    error.body = { error: 'params inválidos', details: [{ path: 'span_seconds', message: 'must be between 5 and 60' }] }
    throw error
  }
  const version = { version: latest().version + 1, createdBy: 'auth0|esteban', createdAt: new Date().toISOString(), note: note ?? null, params: structuredClone(params) }
  versions.push(version)
  return structuredClone(version)
}

// Swaps en curso: un ciclo de 45 s en que aparecen y se resuelven, para ver la lista moverse con el polling.
export async function mockListOpenSwaps() {
  await delay(150)
  const now = Date.now()
  const phase = (now % 45_000) / 1000
  const ops = []
  if (phase < 38) {
    const created = now - phase * 1000
    ops.push({
      idpk: 'a1000000-0000-4000-8000-000000000001', kind: 'propose-swap', cycleId: 'cycle-9432', swapId: phase > 2 ? 'swp-81' : null,
      state: phase > 2 ? 'sent' : 'pending', createdAt: iso(created),
      request: { give: { asset: 'KWH', amount: 6000 }, take: { asset: 'CR', amount: 1980000 }, expiresAt: iso(created + 40_000), memo: 'SHK-9432' },
    })
  }
  if (phase > 10 && phase < 30) {
    ops.push({ idpk: 'a1000000-0000-4000-8000-000000000002', kind: 'accept-swap', cycleId: 'cycle-9432', swapId: 'swp-H12', state: phase > 13 ? 'sent' : 'pending', createdAt: iso(now - (phase - 10) * 1000), request: { swapId: 'swp-H12' } })
  }
  if (phase > 20 && phase < 24) {
    ops.push({ idpk: 'a1000000-0000-4000-8000-000000000003', kind: 'cancel-swap', cycleId: 'cycle-9432', swapId: 'swp-79', state: 'pending', createdAt: iso(now - (phase - 20) * 1000), request: { swapId: 'swp-79' } })
  }
  return { data: ops }
}
