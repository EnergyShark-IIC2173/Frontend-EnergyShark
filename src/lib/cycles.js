// Derivaciones sobre CycleSummary (GET /api/cycles). El backend no tiene endpoint de "ciclo actual".

const time = (iso) => (iso ? new Date(iso).getTime() : NaN)

// El ciclo donde hoy se puede proponer (DF-021): en ventana, con cierre futuro y con status-statement.
export function findOpenCycle(cycles, now = Date.now()) {
  return (cycles ?? []).find((c) =>
    c.phase === 'negotiating' && c.statusStatement && time(c.windowClosesAt) > now,
  ) ?? null
}

// Ventana abierta pero todavía sin status-statement: no se puede proponer (NO_STATUS_STATEMENT).
export function findOpenCycleWithoutStatus(cycles, now = Date.now()) {
  return (cycles ?? []).find((c) =>
    c.phase === 'negotiating' && !c.statusStatement && time(c.windowClosesAt) > now,
  ) ?? null
}

// Próxima ventana estimada desde los datos, nunca hardcodeada (DF-021): período = mediana de las
// diferencias entre windowOpensAt; próxima = último + k·período, la primera posterior a now.
export function estimateNextWindow(cycles, now = Date.now()) {
  const opens = [...new Set((cycles ?? []).map((c) => time(c.windowOpensAt)).filter(Number.isFinite))]
    .sort((a, b) => a - b)
  if (opens.length < 2) return null

  const diffs = opens.slice(1).map((t, i) => t - opens[i]).sort((a, b) => a - b)
  const mid = Math.floor(diffs.length / 2)
  const period = diffs.length % 2 ? diffs[mid] : (diffs[mid - 1] + diffs[mid]) / 2
  if (!(period > 0)) return null

  const last = opens[opens.length - 1]
  const k = Math.max(1, Math.floor((now - last) / period) + 1)
  return { at: new Date(last + k * period), periodMs: period }
}

// Tolerancia para give/take: el evento del ledger y paidAt difieren en milisegundos (DF-020).
const NEGOTIATION_TOLERANCE_MS = 60_000

// Heurística de mejor esfuerzo (DF-020): qué ítem de la tarjeta corresponde a lastOperationApplied.
// Devuelve { section: 'transfers' | 'demands', index } o { section: 'negotiations', id }, o null.
export function matchLastOperation(cycle) {
  const last = cycle?.lastOperationApplied
  if (!last) return null
  const t = time(last.appliedAt)
  if (!Number.isFinite(t)) return null

  if (last.type === 'transfer') {
    const index = (cycle.transfersReceived ?? []).findIndex((x) => time(x.receivedAt) === t)
    return index >= 0 ? { section: 'transfers', index } : null
  }
  if (last.type === 'demand-statement') {
    const index = (cycle.demandStatementsApplied ?? []).findIndex((x) => time(x.appliedAt) === t)
    return index >= 0 ? { section: 'demands', index } : null
  }
  if (last.type === 'give' || last.type === 'take') {
    let best = null
    for (const n of cycle.voluntaryNegotiations ?? []) {
      if (n.direction !== last.type || n.status !== 'paid') continue
      const diff = Math.abs(time(n.paidAt) - t)
      if (diff <= NEGOTIATION_TOLERANCE_MS && (!best || diff < best.diff)) best = { id: n.id, diff }
    }
    return best ? { section: 'negotiations', id: best.id } : null
  }
  return null
}

// "Pendiente" mientras la ventana sigue abierta; si no, el reporte no se envió (DF-019).
export function reportPending(cycle, now = Date.now()) {
  return cycle?.phase === 'negotiating' && time(cycle.windowClosesAt) > now
}
