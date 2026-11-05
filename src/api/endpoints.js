// Una función por endpoint de master (openapi.yaml del repo EnergyShark-IIC2173/contratos). Reciben apiFetch (DF-014).
import { buildQuery } from './client'

// Mocks de RF01 solo en `npm run dev` con VITE_USE_MOCKS=true (DF-025). En build, DEV es false y el
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

export const getDistanceTable = (apiFetch) => apiFetch('/api/distance-table')

export const listRejected = (apiFetch, { page = 1, limit = 25, kind } = {}) =>
  apiFetch(`/api/messages/rejected${buildQuery({ page, limit, kind })}`)
