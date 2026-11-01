// Transporte de la E2 (DF-029). Puro, para probarlo con `node --test`.
import { round2 } from './negotiation.js'

// distance viaja en metros (E1: 62 763 183 → "62.763 km"). Transporte por kWh = round2(distance_km × transportCost).
export function transportPerKwh(row) {
  const distance = Number(row?.distance)
  const cost = Number(row?.transportCost)
  if (row?.distance == null || row?.transportCost == null || !Number.isFinite(distance) || !Number.isFinite(cost)) return null
  return round2((distance / 1000) * cost)
}

export const distanceKm = (row) => (Number.isFinite(Number(row?.distance)) && row?.distance != null ? Number(row.distance) / 1000 : null)

// Destinos con enabled: false, en orden alfabético.
export function disabledRoutes(distances) {
  return Object.entries(distances ?? {})
    .filter(([, row]) => row?.enabled === false)
    .map(([destination]) => destination)
    .sort((a, b) => a.localeCompare(b))
}
