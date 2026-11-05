import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buyerTotals, cycleClock, fmtMmSs, hasLegacyData, marketPhase, matchLastOperation, reportPending } from './cycles.js'

const now = Date.parse('2026-10-06T17:50:00Z')

test('matchLastOperation: give real con appliedAt .181 y paidAt .184 (DF-020)', () => {
  const cycle = {
    lastOperationApplied: { type: 'give', appliedAt: '2026-10-06T17:40:04.181Z' },
    transfersReceived: [{ receivedAt: '2026-10-06T17:40:02.053Z' }],
    demandStatementsApplied: [{ appliedAt: '2026-10-06T17:40:02.089Z' }],
    voluntaryNegotiations: [
      { id: 91, direction: 'give', status: 'paid', paidAt: '2026-10-06T15:40:04.000Z' },
      { id: 92, direction: 'give', status: 'paid', paidAt: '2026-10-06T17:40:04.184Z' },
    ],
  }
  assert.deepEqual(matchLastOperation(cycle), { section: 'negotiations', id: 92 })
})

test('matchLastOperation: transfer y demand por igualdad exacta; sin match → null', () => {
  const base = {
    transfersReceived: [{ receivedAt: '2026-10-06T17:40:02.053Z' }],
    demandStatementsApplied: [{ appliedAt: '2026-10-06T17:40:02.089Z' }],
    voluntaryNegotiations: [],
  }
  assert.deepEqual(matchLastOperation({ ...base, lastOperationApplied: { type: 'transfer', appliedAt: '2026-10-06T17:40:02.053Z' } }), { section: 'transfers', index: 0 })
  assert.deepEqual(matchLastOperation({ ...base, lastOperationApplied: { type: 'demand-statement', appliedAt: '2026-10-06T17:40:02.089Z' } }), { section: 'demands', index: 0 })
  assert.equal(matchLastOperation({ ...base, lastOperationApplied: { type: 'take', appliedAt: '2026-10-06T17:40:02.089Z' } }), null)
  assert.equal(matchLastOperation({ ...base, lastOperationApplied: null }), null)
})

test('reportPending solo mientras la ventana sigue abierta', () => {
  assert.equal(reportPending({ phase: 'negotiating', windowClosesAt: '2026-10-06T18:00:00Z' }, now), true)
  assert.equal(reportPending({ phase: 'consuming', windowClosesAt: '2026-10-06T18:00:00Z' }, now), false)
  assert.equal(reportPending({ phase: 'negotiating', windowClosesAt: null }, now), false)
})

// --- E2 (DF-026, DF-027) ---

const v3 = {
  market: {
    opensAt: '2026-11-01T14:05:00Z',
    closesAt: '2026-11-01T14:15:00Z',
    reportOpensAt: '2026-11-01T14:15:00Z',
  },
  validUntil: '2026-11-01T14:20:00Z',
}

test('marketPhase sigue los instantes del status-statement', () => {
  assert.equal(marketPhase(v3, Date.parse('2026-11-01T14:04:59Z')), 'pending')
  assert.equal(marketPhase(v3, Date.parse('2026-11-01T14:05:00Z')), 'market')
  assert.equal(marketPhase(v3, Date.parse('2026-11-01T14:14:59Z')), 'market')
  assert.equal(marketPhase(v3, Date.parse('2026-11-01T14:15:00Z')), 'closing')
  assert.equal(marketPhase(v3, Date.parse('2026-11-01T14:20:00Z')), 'closed')
  assert.equal(marketPhase({ phase: 'closed' }, now), null)
})

test('reportPending en v3 dura hasta validUntil; en E1 sigue la regla de DF-019', () => {
  assert.equal(reportPending(v3, Date.parse('2026-11-01T14:19:59Z')), true)
  assert.equal(reportPending(v3, Date.parse('2026-11-01T14:20:00Z')), false)
  assert.equal(reportPending({ phase: 'negotiating', windowClosesAt: '2026-10-06T18:00:00Z' }, now), true)
})

test('matchLastOperation v3 marca por referencia exacta', () => {
  const cycle = {
    funding: { msgId: 'm-1' },
    imbalanceSettlement: { settlementId: 's-1' },
    swaps: [{ swapId: 'swp-77' }, { swapId: 'swp-81' }],
  }
  const at = (type, ref) => matchLastOperation({ ...cycle, lastOperationApplied: { type, appliedAt: '2026-11-01T14:06:00Z', ref } })
  assert.deepEqual(at('swap-settled', { swapId: 'swp-81' }), { section: 'swaps', id: 'swp-81' })
  assert.deepEqual(at('trade-recorded', { swapId: 'swp-77' }), { section: 'swaps', id: 'swp-77' })
  assert.deepEqual(at('transfer', { msgId: 'm-1' }), { section: 'funding' })
  assert.deepEqual(at('imbalance-settlement', { msgId: 's-1' }), { section: 'imbalance' })
  // Referencia que no está en el detalle: no se marca nada (la cabecera igual la muestra).
  assert.equal(at('swap-settled', { swapId: 'swp-99' }), null)
  assert.equal(at('transfer', { msgId: 'otro' }), null)
})

test('hasLegacyData solo con flujos E1 no vacíos', () => {
  assert.equal(hasLegacyData({ transfersReceived: [], demandStatementsApplied: [], voluntaryNegotiations: [] }), false)
  assert.equal(hasLegacyData({ demandStatementsApplied: [{}] }), true)
  assert.equal(hasLegacyData(null), false)
})

test('buyerTotals suma solo compras liquidadas', () => {
  const cycle = {
    swaps: [
      { role: 'buyer', status: 'settled', quantity: 7300, amount: 2409000, transport: { total: 536112 } },
      { role: 'buyer', status: 'settled', quantity: 3000, amount: 1230000, transport: { total: 361500 } },
      { role: 'buyer', status: 'expired', quantity: 1700, amount: 510000, transport: null },
      { role: 'seller', status: 'settled', quantity: 500, amount: 165000, transport: null },
    ],
  }
  // 7300 + 3000 = 10300 kWh; 2409000 + 1230000 = 3639000; 536112 + 361500 = 897612
  assert.deepEqual(buyerTotals(cycle), { kwh: 10300, energy: 3639000, transport: 897612 })
  assert.deepEqual(buyerTotals({}), { kwh: 0, energy: 0, transport: 0 })
})

test('nextMilestone devuelve el próximo instante de la central (DF-033)', async () => {
  const { nextMilestone } = await import('./cycles.js')
  const t = Date.parse('2026-11-01T12:00:00Z')
  const cycle = {
    market: { opensAt: '2026-11-01T12:00:00Z', lastOfferAt: '2026-11-01T12:08:30Z', lastBidAt: '2026-11-01T12:09:00Z', closesAt: '2026-11-01T12:10:00Z' },
    validUntil: '2026-11-01T12:15:00Z',
  }
  assert.equal(nextMilestone(cycle, t - 1).key, 'opensAt')
  assert.equal(nextMilestone(cycle, t + 60_000).key, 'lastOfferAt')
  assert.equal(nextMilestone(cycle, t + 9.5 * 60_000).key, 'closesAt')
  assert.equal(nextMilestone(cycle, t + 12 * 60_000).key, 'validUntil')
  assert.equal(nextMilestone(cycle, t + 16 * 60_000), null)
  assert.equal(nextMilestone({ phase: 'closed' }), null)
})

test('cycleProgress va de 0 a 1 entre opensAt y validUntil', async () => {
  const { cycleProgress } = await import('./cycles.js')
  const t = Date.parse('2026-11-01T12:00:00Z')
  const cycle = { market: { opensAt: '2026-11-01T12:00:00Z', closesAt: '2026-11-01T12:10:00Z' }, validUntil: '2026-11-01T12:15:00Z' }
  assert.deepEqual(cycleProgress(cycle, t - 5000), { value: 0, marketEnds: 2 / 3 })
  assert.equal(cycleProgress(cycle, t + 7.5 * 60_000).value, 0.5)
  assert.equal(cycleProgress(cycle, t + 60 * 60_000).value, 1)
  assert.equal(cycleProgress({}), null)
})

test('cycleClock: cuenta al próximo hito, espera tras validUntil y casos sin datos', () => {
  const t0 = Date.parse('2026-10-20T14:05:00Z')
  const cycle = {
    cycleId: 'cycle-9431',
    market: { opensAt: '2026-10-20T14:05:00Z', lastOfferAt: '2026-10-20T14:13:30Z', lastBidAt: '2026-10-20T14:14:00Z', closesAt: '2026-10-20T14:15:00Z' },
    validUntil: '2026-10-20T14:20:00Z',
  }
  const counting = cycleClock(cycle, t0 + 60_000)
  assert.equal(counting.state, 'counting')
  assert.equal(counting.label, 'Última oferta')
  assert.equal(counting.remainingMs, 7.5 * 60_000)
  assert.equal(counting.progress, 1 / 15)

  assert.equal(cycleClock(cycle, t0 + 12 * 60_000).label, 'El reporte vence')
  const waiting = cycleClock(cycle, t0 + 16 * 60_000)
  assert.equal(waiting.state, 'waiting')
  assert.equal(waiting.sinceMs, 60_000)

  assert.equal(cycleClock({ cycleId: 'cycle-8120', phase: 'closed' }).state, 'no-market')
  assert.deepEqual(cycleClock(null), { state: 'empty' })
})

test('fmtMmSs', () => {
  assert.equal(fmtMmSs(252_000), '04:12')
  assert.equal(fmtMmSs(999), '00:01')
  assert.equal(fmtMmSs(3_852_000), '1:04:12')
  assert.equal(fmtMmSs(-5), '00:00')
  assert.equal(fmtMmSs(null), null)
})
