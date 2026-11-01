// Mocks de RF01 en la E2 (DF-024, DF-025): forma propuesta de GET /api/cycles y GET /api/cycles/{cycleId}.
// Solo se cargan con VITE_USE_MOCKS=true en `npm run dev`. Se borran en S23.
// Los instantes salen de la hora actual para ver las fases en vivo (ciclo de 20 min: 5 consumo,
// 10 mercado, 5 cierre). Los montos siguen el "ciclo feliz" del enunciado.

const MIN = 60_000
const iso = (ms) => new Date(ms).toISOString()

function market(opensAt) {
  return {
    buybackPrice: 220.5,
    imbalancePrice: 735,
    minBid: 500,
    opensAt: iso(opensAt),
    lastOfferAt: iso(opensAt + 8.5 * MIN),
    lastBidAt: iso(opensAt + 9 * MIN),
    closesAt: iso(opensAt + 10 * MIN),
    reportOpensAt: iso(opensAt + 10 * MIN),
    limits: { marketOpsPerMinute: 60, walletWritesPerMinute: 120, walletReadsPerMinute: 300 },
  }
}

// Ciclo en curso, como vendedor: mercado abierto hace 4 min.
function sellerCycle(now) {
  const t0 = now - 4 * MIN
  const m = market(t0)
  const at = (min) => iso(t0 + min * MIN)
  return {
    cycleId: 'cycle-9432',
    phase: 'negotiating',
    market: { opensAt: m.opensAt, lastOfferAt: m.lastOfferAt, lastBidAt: m.lastBidAt, closesAt: m.closesAt, reportOpensAt: m.reportOpensAt },
    validUntil: at(15),
    statusStatement: {
      energy: { generationCapacity: 1254512, consumption: 1234512, generationCost: 210, sellable: 20000 },
      market: m,
      validUntil: at(15),
    },
    funding: { msgId: 'f1d0c0de-0000-4000-8000-000000009432', quantity: 180000, penalty: null, balanceAfter: 1412073.36, creditLine: 360000, receivedAt: at(0.3) },
    offer: {
      offerId: 'OWN-9432',
      quantity: 20000,
      pricePerEnergy: 330,
      remaining: 12700,
      status: 'active',
      publishedAt: at(0.7),
      updates: [
        { type: 'offer-updated', remaining: 12700, pricePerEnergy: 330, sentAt: at(1.25) },
      ],
    },
    bidsReceived: [
      { idpk: 'b1000000-0000-4000-8000-000000000001', buyer: 'COR', offerId: 'OWN-9432', quantity: 7300, state: 'settled', rejectReason: null, available: null, swapId: 'swp-77', receivedAt: at(1.15), resolvedAt: at(1.23) },
      { idpk: 'b1000000-0000-4000-8000-000000000002', buyer: 'TAL', offerId: 'OWN-9432', quantity: 14000, state: 'rejected', rejectReason: 'QUANTITY_UNAVAILABLE', available: 12700, swapId: null, receivedAt: at(1.16), resolvedAt: at(1.17) },
      { idpk: 'b1000000-0000-4000-8000-000000000003', buyer: 'MET', offerId: 'OWN-9432', quantity: 6000, state: 'accepted', rejectReason: null, available: null, swapId: 'swp-81', receivedAt: at(3.5), resolvedAt: null },
      { idpk: 'b1000000-0000-4000-8000-000000000004', buyer: 'HGW', offerId: 'OWN-9432', quantity: 200, state: 'rejected', rejectReason: 'BID_TOO_SMALL', available: null, swapId: null, receivedAt: at(3.6), resolvedAt: at(3.6) },
    ],
    bidsSent: [],
    swaps: [
      { swapId: 'swp-77', role: 'seller', counterparty: 'COR', offerId: 'OWN-9432', quantity: 7300, pricePerEnergy: 330, amount: 2409000, status: 'settled', reason: null, transport: null, settledAt: at(1.23), updatedAt: at(1.23) },
      { swapId: 'swp-81', role: 'seller', counterparty: 'MET', offerId: 'OWN-9432', quantity: 6000, pricePerEnergy: 330, amount: 1980000, status: 'proposed', reason: null, transport: null, settledAt: null, updatedAt: at(3.55) },
    ],
    imbalanceSettlement: null,
    negotiationReportSent: null,
    finalBalances: { budget: 3821073.36, energy: 12700 },
    lastOperationApplied: { type: 'swap-settled', appliedAt: at(1.23), ref: { swapId: 'swp-77' } },
  }
}

// Ciclo anterior, cerrado, como comprador con déficit de 12 000 kWh.
function buyerCycle(now) {
  const t0 = now - 24 * MIN
  const m = market(t0)
  const at = (min) => iso(t0 + min * MIN)
  return {
    cycleId: 'cycle-9431',
    phase: 'closed',
    market: { opensAt: m.opensAt, lastOfferAt: m.lastOfferAt, lastBidAt: m.lastBidAt, closesAt: m.closesAt, reportOpensAt: m.reportOpensAt },
    validUntil: at(15),
    statusStatement: {
      energy: { generationCapacity: 1222512, consumption: 1234512, generationCost: 245, sellable: 0 },
      market: m,
      validUntil: at(15),
    },
    funding: { msgId: 'f1d0c0de-0000-4000-8000-000000009431', quantity: 550000, penalty: { amount: 50000, forCycleId: 'cycle-9430' }, balanceAfter: 4782073.36, creditLine: 1200000, receivedAt: at(0.4) },
    offer: null,
    bidsReceived: [],
    bidsSent: [
      { idpk: 'b2000000-0000-4000-8000-000000000001', seller: 'HGW', offerId: 'HGW-9431', quantity: 7300, state: 'settled', rejectReason: null, available: null, swapId: 'swp-61', sentAt: at(1.1), resolvedAt: at(1.24) },
      { idpk: 'b2000000-0000-4000-8000-000000000002', seller: 'MET', offerId: 'MET-9431', quantity: 4700, state: 'rejected', rejectReason: 'QUANTITY_UNAVAILABLE', available: 3000, swapId: null, sentAt: at(2), resolvedAt: at(2.05) },
      { idpk: 'b2000000-0000-4000-8000-000000000003', seller: 'MET', offerId: 'MET-9431', quantity: 3000, state: 'settled', rejectReason: null, available: null, swapId: 'swp-64', sentAt: at(2.1), resolvedAt: at(2.4) },
    ],
    swaps: [
      { swapId: 'swp-61', role: 'buyer', counterparty: 'HGW', offerId: 'HGW-9431', quantity: 7300, pricePerEnergy: 330, amount: 2409000, status: 'settled', reason: null, transport: { perEnergy: 73.44, total: 536112, routeEnabled: true }, settledAt: at(1.24), updatedAt: at(1.3) },
      { swapId: 'swp-64', role: 'buyer', counterparty: 'MET', offerId: 'MET-9431', quantity: 3000, pricePerEnergy: 410, amount: 1230000, status: 'settled', reason: null, transport: { perEnergy: 120.5, total: 361500, routeEnabled: false }, settledAt: at(2.4), updatedAt: at(2.45) },
      { swapId: 'swp-66', role: 'buyer', counterparty: 'COR', offerId: 'COR-9431', quantity: 1700, pricePerEnergy: 300, amount: 510000, status: 'expired', reason: null, transport: null, settledAt: null, updatedAt: at(4) },
    ],
    imbalanceSettlement: { kwhHeld: 10300, deficit: 12000, coverage: -1700, pricePerEnergy: 735, total: -1249500, balanceAfter: -1004038.64, settlementId: 'a7000000-0000-4000-8000-000000009431', settledAt: at(10.1) },
    negotiationReportSent: { budgetBalance: -1004038.64, energyBalance: 0, sentAt: at(10.6) },
    finalBalances: { budget: -1004038.64, energy: 0 },
    lastOperationApplied: { type: 'imbalance-settlement', appliedAt: at(10.1), ref: { msgId: 'a7000000-0000-4000-8000-000000009431' } },
  }
}

// Ciclo de la E1, para ver las secciones antiguas (DF-026).
function legacyCycle() {
  return {
    cycleId: 'cycle-8120',
    phase: 'closed',
    windowOpensAt: '2026-10-07T13:40:00.000Z',
    windowClosesAt: '2026-10-07T14:00:00.000Z',
    statusStatement: { energy: { generationCapacity: 1000, consumption: 1200, generationCost: 210 }, validUntil: '2026-10-07T14:00:00.000Z' },
    transfersReceived: [{ msgId: 'c3000000-0000-4000-8000-000000000001', quantity: 600000, becauseOf: null, receivedAt: '2026-10-07T13:40:05.000Z' }],
    demandStatementsApplied: [{ msgId: 'c3000000-0000-4000-8000-000000000002', quantity: 200, valuePerKwh: 230, appliedAt: '2026-10-07T13:55:00.000Z' }],
    voluntaryNegotiations: [],
    negotiationReportSent: { budgetBalance: 554000, energyBalance: 0, sentAt: '2026-10-07T13:58:00.000Z' },
    finalBalances: { budget: 554000, energy: 0 },
    lastOperationApplied: { type: 'demand-statement', appliedAt: '2026-10-07T13:55:00.000Z' },
  }
}

const SUMMARY_KEYS = ['cycleId', 'phase', 'market', 'validUntil', 'windowOpensAt', 'windowClosesAt', 'lastOperationApplied', 'negotiationReportSent', 'finalBalances']

function toSummary(cycle) {
  const summary = Object.fromEntries(SUMMARY_KEYS.filter((k) => k in cycle).map((k) => [k, cycle[k]]))
  summary.counts = {
    bidsReceived: cycle.bidsReceived?.length ?? 0,
    bidsSent: cycle.bidsSent?.length ?? 0,
    swapsSettled: (cycle.swaps ?? []).filter((s) => s.status === 'settled').length,
  }
  return summary
}

const all = () => {
  const now = Date.now()
  return [sellerCycle(now), buyerCycle(now), legacyCycle()]
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function mockListCycles({ page = 1, limit = 10 } = {}) {
  await delay(250)
  const cycles = all()
  const start = (page - 1) * limit
  return {
    page,
    limit,
    total: cycles.length,
    totalPages: Math.max(1, Math.ceil(cycles.length / limit)),
    data: cycles.slice(start, start + limit).map(toSummary),
  }
}

export async function mockGetCycle(cycleId) {
  await delay(350)
  const cycle = all().find((c) => c.cycleId === cycleId)
  if (!cycle) {
    const error = new Error('Ciclo no encontrado')
    error.status = 404
    throw error
  }
  return cycle
}
