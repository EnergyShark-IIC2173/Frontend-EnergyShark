// Una función por endpoint de master (docs/contracts/openapi.yaml del backend). Reciben apiFetch (DF-014).
import { buildQuery } from './client'

export const getHealth = (apiFetch) => apiFetch('/health')

export const listCycles = (apiFetch, { page = 1, limit = 10 } = {}) =>
  apiFetch(`/api/cycles${buildQuery({ page, limit })}`)

export const getCycle = (apiFetch, cycleId) =>
  apiFetch(`/api/cycles/${encodeURIComponent(cycleId)}`)

export const getDistanceTable = (apiFetch) => apiFetch('/api/distance-table')

export const listNegotiations = (apiFetch, { page = 1, limit = 25, status } = {}) =>
  apiFetch(`/api/negotiations${buildQuery({ page, limit, status })}`)

export const getNegotiation = (apiFetch, id) =>
  apiFetch(`/api/negotiations/${encodeURIComponent(id)}`)

// El cliente no genera id ni idpk: los asigna el backend y el idpk se mantiene en los reintentos.
export const createNegotiation = (apiFetch, { cycleId, direction, quantity, pricePerEnergy }) =>
  apiFetch('/api/negotiations', {
    method: 'POST',
    body: JSON.stringify({ cycleId, direction, quantity: Number(quantity), pricePerEnergy: Number(pricePerEnergy) }),
  })

export const listRejected = (apiFetch, { page = 1, limit = 25, kind } = {}) =>
  apiFetch(`/api/messages/rejected${buildQuery({ page, limit, kind })}`)
