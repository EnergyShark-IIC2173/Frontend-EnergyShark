// Mocks de RF06 (DF-041, DF-025): forma propuesta de GET /api/metrics/cycles y /api/metrics/spans (S9).
// 36 ciclos que rotan spans 10, 20 y 40 como un span_plan; el span largo cubre más y le rechazan menos bids.
// Solo con VITE_USE_MOCKS=true en `npm run dev`. Se borran en S23.

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const SPANS = [10, 20, 40]
const IMBALANCE = 735

function metric(k) {
  const span = SPANS[k % 3]
  const deficit = 6000 + ((k * 1370) % 8000)
  const coverage = Math.min(1, ({ 10: 0.55, 20: 0.72, 40: 0.86 })[span] + ((k * 7) % 10) / 100 - 0.05)
  const covered = Math.round(deficit * coverage)
  const unitCost = 330 + ((k * 17) % 90) + ({ 10: 70, 20: 60, 40: 55 })[span]
  const effective = Math.round((covered * unitCost + (deficit - covered) * IMBALANCE) * 100) / 100
  return {
    cycleId: `cycle-${9431 - k}`,
    spanSeconds: span,
    configVersion: k < 30 ? 2 : 1,
    deficitKwh: deficit,
    coveredKwh: covered,
    effectiveCost: effective,
    baselineCost: deficit * IMBALANCE,
    bidsRejected: ({ 10: 3, 20: 2, 40: 1 })[span] + (k % 2),
    computedAt: new Date(Date.now() - (k + 1) * 20 * 60_000 + 11 * 60_000).toISOString(),
  }
}

const all = () => Array.from({ length: 36 }, (_, k) => metric(k))

export async function mockListCycleMetrics({ page = 1, limit = 10 } = {}) {
  await delay(250)
  const rows = all()
  const start = (page - 1) * limit
  return { page, limit, total: rows.length, totalPages: Math.ceil(rows.length / limit), data: rows.slice(start, start + limit) }
}

export async function mockListSpanMetrics() {
  await delay(250)
  const sums = new Map()
  for (const m of all()) {
    const s = sums.get(m.spanSeconds) ?? { spanSeconds: m.spanSeconds, cycles: 0, deficitKwh: 0, coveredKwh: 0, effectiveCost: 0, baselineCost: 0, bidsRejected: 0 }
    s.cycles += 1
    s.deficitKwh += m.deficitKwh
    s.coveredKwh += m.coveredKwh
    s.effectiveCost = Math.round((s.effectiveCost + m.effectiveCost) * 100) / 100
    s.baselineCost += m.baselineCost
    s.bidsRejected += m.bidsRejected
    sums.set(m.spanSeconds, s)
  }
  return { data: [...sums.values()] }
}
