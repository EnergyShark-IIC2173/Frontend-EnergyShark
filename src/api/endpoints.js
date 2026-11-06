// Una función por endpoint de master (openapi.yaml del repo EnergyShark-IIC2173/contratos). Reciben apiFetch (DF-014).
// Los mocks de la E2 (DF-025) se retiraron en S23 (DF-045): todas las vistas leen master.
import { buildQuery } from './client'

export const getHealth = (apiFetch) => apiFetch('/health')

// Listado: solo la cabecera de cada ciclo; el detalle se pide al expandir (DF-024).
export const listCycles = (apiFetch, { page = 1, limit = 10 } = {}) => apiFetch(`/api/cycles${buildQuery({ page, limit })}`)

export const getCycle = (apiFetch, cycleId) => apiFetch(`/api/cycles/${encodeURIComponent(cycleId)}`)

export const getDistanceTable = (apiFetch) => apiFetch('/api/distance-table')

// Libro de ofertas vigente de market.{CODE} con transporte y precio efectivo calculados en master (S6, DF-045).
export const getMarketBook = (apiFetch) => apiFetch('/api/market/book')

// RF05 (DF-042): reason y sourceQueue se filtran en master, no en la página cargada.
export const listRejected = (apiFetch, { page = 1, limit = 25, kind, reason, sourceQueue } = {}) =>
  apiFetch(`/api/messages/rejected${buildQuery({ page, limit, kind, reason, sourceQueue })}`)

// AD5 (DF-043): ledger local y última reconciliación contra la wallet (S5).
export const getBalance = (apiFetch) => apiFetch('/api/balance')

// RF04 (DF-040): estrategia versionada (S9) y swaps en curso (S5).
export const getStrategy = (apiFetch) => apiFetch('/api/strategy')

export const createStrategy = (apiFetch, { params, note }) =>
  apiFetch('/api/strategy', { method: 'POST', body: JSON.stringify(note ? { params, note } : { params }) })

export const listStrategyVersions = (apiFetch, { page = 1, limit = 10 } = {}) =>
  apiFetch(`/api/strategy/versions${buildQuery({ page, limit })}`)

export const listOpenSwaps = (apiFetch) => apiFetch('/api/swaps?status=open')

// RF06 (DF-041): métricas por ciclo y por span (S9, las llena S8 al cierre).
export const listCycleMetrics = (apiFetch, { page = 1, limit = 10 } = {}) =>
  apiFetch(`/api/metrics/cycles${buildQuery({ page, limit })}`)

export const listSpanMetrics = (apiFetch) => apiFetch('/api/metrics/spans')
