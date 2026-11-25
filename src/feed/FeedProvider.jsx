import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { RELOGIN_ERRORS } from '../api/client'
import { appendEvent, normalizeFeedEvent } from '../lib/feed'
import { createFeedClient } from '../lib/feedClient'
import { FeedContext } from './feedContext'

// URL del feed (DF-046): en prod va por Nginx (tiburonshark.me), no por el API Gateway. Vacía = ruta relativa,
// que el proxy de Vite manda a master local o al servidor de prueba (`npm run dev:feed`, DF-047).
const FEED_URL = import.meta.env.VITE_FEED_URL || '/api/feed/stream'
const MAX_EVENTS = 500

const initial = {
  events: [],
  status: 'connecting',
  detail: {},
  lastId: null,
  received: 0,
  resets: 0,
  unseenAlerts: 0,
  watching: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'event': {
      const events = appendEvent(state.events, action.event, MAX_EVENTS)
      if (events === state.events) return state
      const alert = action.event.type === 'alert.fired' && action.event.payload?.state !== 'closed'
      return {
        ...state,
        events,
        lastId: Math.max(state.lastId ?? 0, action.event.id),
        received: state.received + 1,
        unseenAlerts: alert && !state.watching ? state.unseenAlerts + 1 : state.unseenAlerts,
      }
    }
    case 'reset':
      return { ...state, events: [], lastId: null, resets: state.resets + 1 }
    case 'status':
      return { ...state, status: action.status, detail: action.detail ?? {} }
    case 'watching':
      return { ...state, watching: action.value, unseenAlerts: action.value ? 0 : state.unseenAlerts }
    default:
      return state
  }
}

// Una sola conexión para toda la app, montada bajo el login: cambiar de vista no la corta.
export function FeedProvider({ children }) {
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0()
  const [state, dispatch] = useReducer(reducer, initial)
  const tokenRef = useRef(getAccessTokenSilently)
  const clientRef = useRef(null)

  useEffect(() => {
    tokenRef.current = getAccessTokenSilently
  }, [getAccessTokenSilently])

  useEffect(() => {
    const client = createFeedClient({
      url: FEED_URL,
      getToken: async (force) => {
        try {
          return await tokenRef.current(force ? { cacheMode: 'off' } : undefined)
        } catch (err) {
          if (RELOGIN_ERRORS.includes(err?.error)) throw Object.assign(new Error('login'), { authRequired: true })
          throw err
        }
      },
      onEvent: (msg) => {
        const event = normalizeFeedEvent(msg.data, { sseId: msg.id, sseType: msg.type })
        if (event) dispatch({ type: 'event', event })
      },
      onReset: () => dispatch({ type: 'reset' }),
      onStatus: (status, detail) => dispatch({ type: 'status', status, detail: { ...detail, at: Date.now() } }),
    })
    clientRef.current = client
    client.start()
    return () => client.stop()
  }, [])

  const reconnect = useCallback(() => {
    const client = clientRef.current
    if (!client) return
    client.stop()
    client.start()
  }, [])

  const setWatching = useCallback((value) => dispatch({ type: 'watching', value }), [])

  const value = useMemo(
    () => ({ ...state, reconnect, setWatching, relogin: loginWithRedirect }),
    [state, reconnect, setWatching, loginWithRedirect],
  )
  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>
}
