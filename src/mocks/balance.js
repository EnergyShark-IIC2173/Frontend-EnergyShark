// Mock del saldo (DF-043, DF-025): forma de GET /api/balance (S5). Cada 30 s alterna entre una reconciliación
// con delta explicado por una operación abierta y una que cuadra. Solo con VITE_USE_MOCKS=true. Se borra en S23.

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function mockGetBalance() {
  await delay(200)
  const now = Date.now()
  const pending = Math.floor(now / 30_000) % 2 === 0
  // Con la operación abierta, la wallet ya liquidó swp-81 y el evento swap-settled aún no se aplica al ledger:
  // el ledger va atrasado (ADR-005), no adelantado.
  const ledgerCr = 394450.25
  const ledgerKwh = 6000
  return {
    ledger: { cr: pending ? ledgerCr : ledgerCr + 1980000, kwh: pending ? ledgerKwh : 0, cycleId: 'cycle-9432' },
    lastReconciliation: {
      cycleId: 'cycle-9432',
      ledgerCr: pending ? ledgerCr : ledgerCr + 1980000,
      walletCr: ledgerCr + 1980000,
      deltaCr: pending ? -1980000 : 0,
      ledgerKwh: pending ? ledgerKwh : 0,
      walletKwh: 0,
      deltaKwh: pending ? ledgerKwh : 0,
      openOps: pending ? 1 : 0,
      note: pending ? 'swp-81 ya liquidado en la wallet; el swap-settled todavía no se aplica al ledger local' : null,
      takenAt: new Date(now - (now % 30_000)).toISOString(),
    },
  }
}
