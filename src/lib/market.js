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

// Una fila por oferta del libro real (GET /api/market/book, S6). master ya calcula transportPerEnergy,
// effectivePrice y routeEnabled con la distance-table vigente (ADR-002, addendum S6): el front no los
// recalcula, así el número es el mismo que usa el comprador (S8). status:
//  - 'own': la oferta propia (comprarse es SELF_TRADE), sin precio efectivo; ownCity sale de la distance-table;
//  - 'no-route': el vendedor no está en la tabla (routeEnabled null);
//  - 'disabled' | 'enabled': según la ruta.
export function bookRows(book, ownCity = null) {
  return (book?.offers ?? []).map((offer) => {
    const base = { ...offer, transport: null, effectivePrice: null }
    if (ownCity && offer.cityId === ownCity) return { ...base, status: 'own' }
    if (offer.routeEnabled == null) return { ...base, status: 'no-route' }
    const enabled = offer.routeEnabled !== false
    const transport = { enabled, punitive: !enabled, perKwh: finite(offer.transportPerEnergy) ? Number(offer.transportPerEnergy) : null }
    const effectivePrice = finite(offer.effectivePrice) ? Number(offer.effectivePrice) : null
    return { ...base, status: enabled ? 'enabled' : 'disabled', transport, effectivePrice }
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
