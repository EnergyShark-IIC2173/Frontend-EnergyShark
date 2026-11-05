import { useEffect, useState } from 'react'

// Hora actual que se renueva cada `ms` mientras `enabled` (cuenta regresiva de la tarjeta del ciclo actual, DF-033).
export function useNow(ms = 1000, enabled = true) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!enabled) return undefined
    const timer = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(timer)
  }, [ms, enabled])
  return now
}
