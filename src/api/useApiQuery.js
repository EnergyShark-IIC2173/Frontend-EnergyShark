import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useApiClient } from './client'

// Datos de un endpoint con carga, error y polling opcional (DF-014, DF-015).
// - fetcher(apiFetch) arma el request; `params` (serializable) dispara un nuevo request al cambiar.
// - apiFetch cambia en cada render: vive en una ref para no generar loops de requests.
// - requestId descarta respuestas que llegan desordenadas (p. ej. al cambiar de página rápido).
// - El polling es silencioso (no vuelve a "cargando"), se salta con la pestaña oculta y se limpia al
//   desmontar o al cambiar pollMs.
export function useApiQuery(fetcher, params = null, { pollMs = null, enabled = true } = {}) {
  const { apiFetch } = useApiClient()
  const { loginWithRedirect } = useAuth0()
  const [state, setState] = useState({ data: null, loading: enabled, error: null })
  const apiRef = useRef(apiFetch)
  const fetcherRef = useRef(fetcher)
  const requestId = useRef(0)

  useLayoutEffect(() => {
    apiRef.current = apiFetch
    fetcherRef.current = fetcher
  })

  const run = useCallback(async ({ silent = false } = {}) => {
    const id = ++requestId.current
    if (!silent) setState((s) => ({ ...s, loading: true }))
    try {
      const data = await fetcherRef.current(apiRef.current)
      if (id === requestId.current) setState({ data, loading: false, error: null })
    } catch (error) {
      // Se conserva la última data buena: un poll fallido no vacía la vista.
      if (id === requestId.current) setState((s) => ({ ...s, loading: false, error }))
    }
  }, [])

  const key = JSON.stringify(params)
  useEffect(() => {
    if (enabled) run()
  }, [enabled, run, key])

  useEffect(() => {
    if (!enabled || !pollMs) return undefined
    const timer = setInterval(() => {
      if (!document.hidden) run({ silent: true })
    }, pollMs)
    return () => clearInterval(timer)
  }, [enabled, pollMs, run])

  const reload = useCallback(() => run(), [run])
  // Para insertar de inmediato lo que devolvió un POST, sin esperar el próximo poll.
  const setData = useCallback((updater) => setState((s) => ({ ...s, data: updater(s.data) })), [])

  return { ...state, reload, setData, relogin: loginWithRedirect }
}
