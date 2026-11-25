import { useEffect, useMemo, useState } from 'react'
import { useFeed } from '../feed/feedContext'
import { FEED_GROUPS, SEVERITY, activeAlerts, countByGroup, filterEvents } from '../lib/feed'
import { ActiveAlerts } from './feed/ActiveAlerts'
import { ConnectionStatus } from './feed/ConnectionStatus'
import { FeedRow } from './feed/FeedRow'
import { Card } from './ui/Card'
import { Icon } from './ui/Icon'
import { EmptyState, ErrorState, LoadingState } from './ui/States'
import { Marker, ViewHeader } from './ui/ViewHeader'
import { btnSecondary, inputBase, labelBase, textPrimary, textSecondary } from './ui/classes'

const GROUP_ORDER = ['market', 'wallet', 'saga', 'alert', 'registry', 'other']
const chip = 'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors focus-ring motion-reduce:transition-none'
const chipOn = `${chip} border-accent bg-accent/10 ${textPrimary} dark:bg-accent-soft/10`
const chipOff = `${chip} border-sand-200 bg-card ${textSecondary} hover:bg-sand-100 dark:border-sand-800 dark:bg-sand-900 dark:hover:bg-sand-800`

// RF01 de la E3 (DF-046/047): feed en tiempo real por SSE. Sin polling: los eventos llegan por la conexión que
// mantiene <FeedProvider>. Los filtros y la pausa son locales y no tocan la conexión.
export function LiveFeed() {
  const feed = useFeed()
  const { events, status, setWatching } = feed
  const [groups, setGroups] = useState(() => new Set())
  const [minSeverity, setMinSeverity] = useState('info')
  const [search, setSearch] = useState('')
  const [pausedAt, setPausedAt] = useState(null) // id del evento más nuevo al pausar
  const [freshFrom] = useState(() => feed.lastId ?? 0)

  // Mientras se mira esta vista, las alertas no se cuentan como "nuevas" en la sidebar.
  useEffect(() => {
    setWatching(true)
    return () => setWatching(false)
  }, [setWatching])

  const visible = useMemo(() => (pausedAt === null ? events : events.filter((e) => e.id <= pausedAt)), [events, pausedAt])
  const waiting = pausedAt === null ? 0 : events.length - visible.length
  const counts = useMemo(() => countByGroup(visible), [visible])
  const rows = useMemo(() => filterEvents(visible, { groups, minSeverity, search }), [visible, groups, minSeverity, search])
  const alerts = useMemo(() => activeAlerts(events), [events])
  const filtered = groups.size > 0 || minSeverity !== 'info' || search.trim() !== ''

  function toggleGroup(g) {
    setGroups((prev) => {
      const next = new Set(prev)
      if (next.has(g)) next.delete(g)
      else next.add(g)
      return next
    })
  }

  function clearFilters() {
    setGroups(new Set())
    setMinSeverity('info')
    setSearch('')
  }

  let content
  if (events.length === 0 && status === 'auth') {
    content = <ErrorState title="El feed necesita una sesión válida" error={{ message: 'La sesión expiró. Vuelve a iniciar sesión.', authRequired: true }} onRelogin={feed.relogin} />
  } else if (events.length === 0 && (status === 'connecting' || status === 'reconnecting')) {
    content = <LoadingState label={status === 'connecting' ? 'Conectando al feed…' : 'Esperando al servidor del feed…'} />
  } else if (events.length === 0) {
    content = (
      <EmptyState icon="live" title="Todavía no llegan eventos">
        Aparecen aquí en cuanto el nodo ve una oferta, recibe un bid, avanza una saga o suena una alerta.
      </EmptyState>
    )
  } else if (rows.length === 0) {
    content = (
      <EmptyState icon="search" title="Ningún evento coincide con los filtros">
        Prueba quitando algún filtro.
      </EmptyState>
    )
  } else {
    content = (
      <Card padded={false}>
        <ul aria-label="Eventos del feed">
          {rows.map((e) => <FeedRow key={e.id} event={e} fresh={e.id > freshFrom} />)}
        </ul>
      </Card>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <ViewHeader title={<>Feed <Marker>en vivo</Marker></>} subtitle="Mercado, wallet, sagas, alertas y descartes del nodo, a medida que ocurren.">
        <button type="button" onClick={() => setPausedAt(pausedAt === null ? (events[0]?.id ?? 0) : null)} className={btnSecondary} aria-pressed={pausedAt !== null}>
          <Icon name={pausedAt === null ? 'pause' : 'play'} />
          {pausedAt === null ? 'Pausar' : waiting > 0 ? `Reanudar (${waiting} nuevos)` : 'Reanudar'}
        </button>
      </ViewHeader>

      <ConnectionStatus
        status={status}
        detail={feed.detail}
        lastId={feed.lastId}
        received={feed.received}
        resets={feed.resets}
        onReconnect={feed.reconnect}
        onRelogin={feed.relogin}
      />

      <ActiveAlerts alerts={alerts} />

      <div role="group" aria-label="Filtros" className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {GROUP_ORDER.filter((g) => g !== 'other' || counts.other).map((g) => {
            const info = FEED_GROUPS[g]
            const on = groups.has(g)
            return (
              <button key={g} type="button" onClick={() => toggleGroup(g)} aria-pressed={on} className={on ? chipOn : chipOff}>
                <Icon name={info.icon} className="size-4" />
                {info.label}
                <span className="font-mono text-xs tabular-nums">{counts[g] ?? 0}</span>
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="feed-severity" className={labelBase}>Severidad mínima</label>
            <select id="feed-severity" value={minSeverity} onChange={(e) => setMinSeverity(e.target.value)} className={`${inputBase} w-auto`}>
              {Object.entries(SEVERITY).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-sm">
            <label htmlFor="feed-search" className={labelBase}>Buscar</label>
            <input id="feed-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="swapId, cycleId o idpk" className={`${inputBase} font-mono placeholder:font-sans`} />
          </div>
          {filtered ? <button type="button" onClick={clearFilters} className={btnSecondary}>Limpiar filtros</button> : null}
        </div>
        {events.length > 0 ? (
          <p className={`text-xs tabular-nums ${textSecondary}`}>
            Mostrando {rows.length} de {visible.length} eventos en memoria (máx. 500){pausedAt !== null ? ' · lista en pausa' : ''}
          </p>
        ) : null}
      </div>

      {content}
    </div>
  )
}
