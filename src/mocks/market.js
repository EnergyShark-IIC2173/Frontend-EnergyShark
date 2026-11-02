// Mocks de RF02 (DF-038, DF-025): forma propuesta de GET /api/market/offers y la distance-table con
// disabledRouteTransportCost (S6). Solo con VITE_USE_MOCKS=true en `npm run dev`. Se borran en S23.
// El libro se mueve con el reloj: los remaining bajan a lo largo del mercado, para ver el polling en vivo.

const MIN = 60_000
const OWN = 'SHK'
const iso = (ms) => new Date(ms).toISOString()
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Mercado de 10 min que abre en cada múltiplo de 10 min: siempre hay uno abierto y la cuenta regresiva avanza.
const opensAt = (now) => now - (now % (10 * MIN))

const SELLERS = [
  { cityId: 'HGW', pricePerEnergy: 330, quantity: 20000 },
  { cityId: 'MET', pricePerEnergy: 290, quantity: 9000 },
  { cityId: 'COR', pricePerEnergy: 345.5, quantity: 6400 },
  { cityId: 'TAL', pricePerEnergy: 362, quantity: 15000 },
  { cityId: 'VLP', pricePerEnergy: 318, quantity: 2600 },
  { cityId: OWN, pricePerEnergy: 340, quantity: 4000 },
]

export async function mockGetMarketOffers() {
  await delay(200)
  const now = Date.now()
  const t0 = opensAt(now)
  const elapsed = Math.min(1, (now - t0) / (10 * MIN))
  return {
    cycleId: 'cycle-9432',
    closesAt: iso(t0 + 10 * MIN),
    marketClosed: false,
    updatedAt: iso(now - 1500),
    offers: SELLERS.map((s, i) => {
      const sold = Math.round(s.quantity * elapsed * (0.3 + 0.1 * i))
      return {
        offerId: `${s.cityId}-9432`,
        cityId: s.cityId,
        pricePerEnergy: s.pricePerEnergy,
        quantity: s.quantity,
        remaining: Math.max(0, s.quantity - sold),
        publishedAt: iso(t0 + (20 + i * 7) * 1000),
        updatedAt: iso(now - (i + 1) * 4000),
      }
    }),
  }
}

export async function mockGetDistanceTable() {
  await delay(200)
  const now = Date.now()
  return {
    cityId: OWN,
    updatedAt: iso(opensAt(now) - 20_000),
    disabledRouteTransportCost: 0.0089,
    distances: {
      COR: { distance: 5000000, transportCost: 0.01, enabled: true },
      HGW: { distance: 21600000, transportCost: 0.0034, enabled: true },
      MET: { distance: 13540000, transportCost: 0.0021, enabled: false },
      TAL: { distance: 8800000, transportCost: 0.0052, enabled: true },
      VLP: { distance: 30120000, transportCost: 0.0019, enabled: true },
    },
  }
}
