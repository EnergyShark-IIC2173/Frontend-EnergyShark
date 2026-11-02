// Mock del saldo (DF-043, DF-025): forma de GET /api/balance (S5). Cada 30 s alterna entre una reconciliación
// con delta explicado por una operación abierta y una que cuadra. Solo con VITE_USE_MOCKS=true. Se borra en S23.

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function mockGetBalance() {
  await delay(200)
  const now = Date.now()
  const pending = Math.floor(now / 30_000) % 2 === 0
  return {
    ledger: { cr: pending ? 2374450.25 : 394450.25, kwh: pending ? 6000 : 0, cycleId: 'cycle-9432' },
    lastReconciliation: {
      cycleId: 'cycle-9432',
      ledgerCr: pending ? 2374450.25 : 394450.25,
      walletCr: 394450.25,
      deltaCr: pending ? 1980000 : 0,
      ledgerKwh: pending ? 0 : 0,
      walletKwh: pending ? 6000 : 0,
      deltaKwh: pending ? -6000 : 0,
      openOps: pending ? 1 : 0,
      note: pending ? 'swap swp-81 propuesto: la wallet retiene 6 000 kWh hasta que se liquide o expire' : null,
      takenAt: new Date(now - (now % 30_000)).toISOString(),
    },
  }
}
