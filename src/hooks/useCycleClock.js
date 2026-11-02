import { listCycles } from '../api/endpoints'
import { useApiQuery } from '../api/useApiQuery'
import { cycleClock } from '../lib/cycles'
import { useNow } from './useNow'

// Reloj del ciclo (DF-044): una sola consulta del ciclo más reciente para las variantes de la sidebar y la barra
// del celular, que se montan a la vez. El tick de 1 s solo compara contra los instantes de la central (DF-027).
const POLL_MS = 30_000

export function useCycleClock() {
  const { data } = useApiQuery((api) => listCycles(api, { page: 1, limit: 1 }), { clock: true }, { pollMs: POLL_MS })
  const now = useNow(1000)
  return cycleClock(data?.data?.[0] ?? null, now)
}
