// Libro de ofertas de RF02 (DF-038). Puro, para probarlo con `node --test`.
import { round2 } from './negotiation.js'
import { distanceKm, transportPerKwh } from './transport.js'

const finite = (value) => value != null && Number.isFinite(Number(value))

// Transporte por kWh hasta un destino según la distance-table vigente. Ruta deshabilitada: la tarifa
// disabledRouteTransportCost (por kWh y km) en vez de transportCost; sin ella, perKwh null (DF-029).
export function routeTransport(row, disabledRouteTransportCost) {
  if (!row) return { enabled: null, punitive: false, perKwh: null }
  if (row.enabled !== false) return { enabled: true, punitive: false, perKwh: transportPerKwh(row) }
  const km = distanceKm(row)
  const perKwh = km != null && finite(disabledRouteTransportCost) ? round2(km * Number(disabledRouteTransportCost)) : null
  return { enabled: false, punitive: true, perKwh }
}

// Una fila por oferta, con transporte y precio efectivo. status:
//  - 'own': la oferta propia (comprarse es SELF_TRADE), sin precio efectivo;
//  - 'no-route': el vendedor no está en la tabla;
//  - 'disabled' | 'enabled': según la ruta.
export function bookRows(book, table) {
  const own = table?.cityId ?? null
  const distances = table?.distances ?? {}
  const disabledCost = table?.disabledRouteTransportCost
  return (book?.offers ?? []).map((offer) => {
    const base = { ...offer, transport: null, effectivePrice: null }
    if (own && offer.cityId === own) return { ...base, status: 'own' }
    const row = distances[offer.cityId]
    if (!row) return { ...base, status: 'no-route' }
    const transport = routeTransport(row, disabledCost)
    const effectivePrice = transport.perKwh != null && finite(offer.pricePerEnergy)
      ? round2(Number(offer.pricePerEnergy) + transport.perKwh)
      : null
    return { ...base, status: transport.enabled ? 'enabled' : 'disabled', transport, effectivePrice }
  })
}

export const SORT_KEYS = {
  pricePerEnergy: (r) => r.pricePerEnergy,
  remaining: (r) => r.remaining,
  effectivePrice: (r) => r.effectivePrice,
}

// Orden por una columna; las filas sin valor van siempre al final. Empate: por ciudad.
export function sortRows(rows, key = 'effectivePrice', dir = 'asc') {
  const get = SORT_KEYS[key] ?? SORT_KEYS.effectivePrice
  const sign = dir === 'desc' ? -1 : 1
  return [...rows].sort((a, b) => {
    const va = get(a)
    const vb = get(b)
    const ha = finite(va)
    const hb = finite(vb)
    if (ha !== hb) return ha ? -1 : 1
    if (ha && Number(va) !== Number(vb)) return (Number(va) - Number(vb)) * sign
    return String(a.cityId).localeCompare(String(b.cityId))
  })
}

// La oferta comprable más barata (para el resumen de arriba): la primera con precio efectivo.
export function bestOffer(rows) {
  return sortRows(rows.filter((r) => finite(r.effectivePrice) && Number(r.remaining) > 0))[0] ?? null
}
