// Una función por endpoint de master (openapi.yaml del repo EnergyShark-IIC2173/contratos). Reciben apiFetch (DF-014).
import { buildQuery } from './client'

// Mocks de RF01, RF02, RF04 y RF06 solo en `npm run dev` con VITE_USE_MOCKS=true (DF-025, DF-038, DF-040, DF-041). En build, DEV es false y el
// import() dinámico queda fuera del bundle.
const USE_MOCKS = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true'

export const getHealth = (apiFetch) => apiFetch('/health')

// Listado: solo la cabecera de cada ciclo; el detalle se pide al expandir (DF-024).
export async function listCycles(apiFetch, { page = 1, limit = 10 } = {}) {
  if (USE_MOCKS) return (await import('../mocks/cycles.js')).mockListCycles({ page, limit })
  return apiFetch(`/api/cycles${buildQuery({ page, limit })}`)
}

export async function getCycle(apiFetch, cycleId) {
  if (USE_MOCKS) return (await import('../mocks/cycles.js')).mockGetCycle(cycleId)
  return apiFetch(`/api/cycles/${encodeURIComponent(cycleId)}`)
}

export async function getDistanceTable(apiFetch) {
  if (USE_MOCKS) return (await import('../mocks/market.js')).mockGetDistanceTable()
  return apiFetch('/api/distance-table')
}

// Libro de ofertas vigente de market.{CODE} (S6, forma propuesta en DF-038).
export async function getMarketOffers(apiFetch) {
  if (USE_MOCKS) return (await import('../mocks/market.js')).mockGetMarketOffers()
  return apiFetch('/api/market/offers')
}

export const listRejected = (apiFetch, { page = 1, limit = 25, kind } = {}) =>
  apiFetch(`/api/messages/rejected${buildQuery({ page, limit, kind })}`)

// RF04 (DF-040): estrategia versionada (S9) y swaps en curso (S5).
const strategyMocks = () => import('../mocks/strategy.js')

export async function getStrategy(apiFetch) {
  if (USE_MOCKS) return (await strategyMocks()).mockGetStrategy()
  return apiFetch('/api/strategy')
}

export async function createStrategy(apiFetch, { params, note }) {
  if (USE_MOCKS) return (await strategyMocks()).mockCreateStrategy({ params, note })
  return apiFetch('/api/strategy', { method: 'POST', body: JSON.stringify(note ? { params, note } : { params }) })
}

export async function listStrategyVersions(apiFetch, { page = 1, limit = 10 } = {}) {
  if (USE_MOCKS) return (await strategyMocks()).mockListStrategyVersions({ page, limit })
  return apiFetch(`/api/strategy/versions${buildQuery({ page, limit })}`)
}

export async function listOpenSwaps(apiFetch) {
  if (USE_MOCKS) return (await strategyMocks()).mockListOpenSwaps()
  return apiFetch('/api/swaps?status=open')
}

// RF06 (DF-041): métricas por ciclo y por span (S9).
export async function listCycleMetrics(apiFetch, { page = 1, limit = 10 } = {}) {
  if (USE_MOCKS) return (await import('../mocks/metrics.js')).mockListCycleMetrics({ page, limit })
  return apiFetch(`/api/metrics/cycles${buildQuery({ page, limit })}`)
}

export async function listSpanMetrics(apiFetch) {
  if (USE_MOCKS) return (await import('../mocks/metrics.js')).mockListSpanMetrics()
  return apiFetch('/api/metrics/spans')
}
