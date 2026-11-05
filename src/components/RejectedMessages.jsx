import { useState } from 'react'
import { listRejected } from '../api/endpoints'
import { useApiQuery } from '../api/useApiQuery'
import { fmtDate, orDash, truncId } from '../lib/format'
import { REJECTED_KIND, REJECT_REASONS, SOURCE_QUEUE, rejectedKind } from '../lib/status'
import { Badge } from './ui/Badge'
import { Pager } from './ui/Pager'
import { EmptyState, ErrorState, LoadingState, StaleNotice } from './ui/States'
import { TableCard } from './ui/TableCard'
import { RefreshTimer } from './ui/RefreshTimer'
import { Marker, ViewHeader } from './ui/ViewHeader'
import { btnSecondary, inputBase, labelBase, td, textSecondary, th, tr } from './ui/classes'

const LIMIT = 25
const OTHER = '__other__'
const NO_FILTERS = { kind: '', reason: '', reasonOther: '', sourceQueue: '' }

function Filter({ id, label, value, onChange, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={labelBase}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputBase} w-auto`}>
        {children}
      </select>
    </div>
  )
}

function Origin({ msg }) {
  if (!msg.sourceQueue && !msg.sender) return <span className={textSecondary}>Sin dato</span>
  const queue = SOURCE_QUEUE[msg.sourceQueue]
  return (
    <div className="flex flex-col items-start gap-1">
      {queue ? <Badge tone={queue.tone}>{queue.label}</Badge> : msg.sourceQueue ? <Badge>{msg.sourceQueue}</Badge> : null}
      {msg.sender ? <span className="font-mono text-xs text-ink dark:text-paper">{msg.sender}</span> : null}
    </div>
  )
}
// En la demo el ayudante inyecta un duplicado y hay que verlo aparecer (DF-015).
const POLL_MS = 15_000

export function RejectedMessages() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(NO_FILTERS)
  // Los filtros van a master (DF-042): reason "Otra…" solo se manda cuando tiene texto.
  const reason = filters.reason === OTHER ? filters.reasonOther.trim() : filters.reason
  const query = { kind: filters.kind, reason, sourceQueue: filters.sourceQueue }
  const { data, loading, error, reload, relogin, updatedAt, interval } = useApiQuery(
    (api) => listRejected(api, { page, limit: LIMIT, ...query }),
    { page, ...query },
    { pollMs: POLL_MS },
  )
  const rows = data?.data ?? []
  const filtered = Boolean(query.kind || query.reason || query.sourceQueue)

  function setFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }

  // Mismo paginador que el historial (DF-034): fijo al pie y, al cambiar de página, la vista sube al inicio.
  function goToPage(next) {
    setPage(next)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  let content
  if (!data && loading) content = <LoadingState label="Cargando mensajes rechazados…" />
  else if (!data && error) content = <ErrorState error={error} onRetry={reload} onRelogin={relogin} />
  else if (rows.length === 0) {
    content = (
      <EmptyState icon="alert" title={filtered ? 'Ningún mensaje coincide con los filtros' : 'Aún no hay duplicados, NACKs ni descartados'}>
        {filtered ? 'Prueba quitando algún filtro.' : 'Aparecen aquí en cuanto se registran.'}
      </EmptyState>
    )
  } else {
    content = (
      <>
        <TableCard>
          <thead>
            <tr>
              <th className={th}>Tipo (Kind)</th>
              <th className={th}>Mensaje</th>
              <th className={th}>Origen</th>
              <th className={th}>Razón</th>
              <th className={th}>Código</th>
              <th className={th}>msgId</th>
              <th className={th}>idpk</th>
              <th className={th}>Detalle</th>
              <th className={th}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((msg) => {
              const k = rejectedKind(msg.kind)
              return (
                <tr key={msg.id} className={`${tr} ${msg.reason === 'IDENTITY_MISMATCH' ? 'bg-coral/10' : ''}`}>
                  <td className={td}>
                    <Badge tone={k.tone}>{k.label}</Badge>
                  </td>
                  <td className={`${td} font-mono text-xs whitespace-nowrap text-ink dark:text-paper`}>{orDash(msg.type)}</td>
                  <td className={`${td} whitespace-nowrap`}><Origin msg={msg} /></td>
                  <td className={`${td} font-mono text-xs text-ink dark:text-paper`}>{orDash(msg.reason)}</td>
                  <td className={`${td} whitespace-nowrap tabular-nums`}>{orDash(msg.code)}</td>
                  <td className={`${td} font-mono text-xs whitespace-nowrap`} title={msg.msgId ?? undefined}>{truncId(msg.msgId)}</td>
                  <td className={`${td} font-mono text-xs whitespace-nowrap`} title={msg.idpk ?? undefined}>{truncId(msg.idpk)}</td>
                  <td className={`${td} min-w-56`}>{orDash(msg.detail)}</td>
                  <td className={`${td} whitespace-nowrap tabular-nums`}>{fmtDate(msg.occurredAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </TableCard>
        <Pager label="Paginación de mensajes" noun="mensajes" page={data.page} totalPages={data.totalPages} total={data.total} onChange={goToPage} disabled={loading} />
      </>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <ViewHeader title={<>Registro de duplicados y <Marker>NACKs</Marker></>} subtitle="Duplicados, NACKs y descartados, también los de otras ciudades.">
        <RefreshTimer updatedAt={updatedAt} intervalMs={interval} loading={loading} onRefresh={reload} />
      </ViewHeader>

      <div role="group" aria-label="Filtros" className="flex flex-wrap items-end gap-3">
        <Filter id="rejected-kind" label="Tipo" value={filters.kind} onChange={(v) => setFilter('kind', v)}>
          <option value="">Todos</option>
          {Object.entries(REJECTED_KIND).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
        </Filter>
        <Filter id="rejected-reason" label="Razón" value={filters.reason} onChange={(v) => setFilter('reason', v)}>
          <option value="">Todas</option>
          {REJECT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          <option value={OTHER}>Otra…</option>
        </Filter>
        {filters.reason === OTHER ? (
          <div className="flex flex-col gap-2">
            <label htmlFor="rejected-reason-other" className={labelBase}>Reason exacto</label>
            <input id="rejected-reason-other" value={filters.reasonOther} maxLength={40} placeholder="CYCLE_EXPIRED" onChange={(e) => setFilter('reasonOther', e.target.value.toUpperCase())} className={`${inputBase} w-56 font-mono placeholder:font-sans`} />
          </div>
        ) : null}
        <Filter id="rejected-queue" label="Cola" value={filters.sourceQueue} onChange={(v) => setFilter('sourceQueue', v)}>
          <option value="">Todas</option>
          {Object.entries(SOURCE_QUEUE).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
        </Filter>
        {filtered ? (
          <button type="button" onClick={() => { setFilters(NO_FILTERS); setPage(1) }} className={btnSecondary}>Limpiar filtros</button>
        ) : null}
      </div>

      {data && data.totalPages > 1 ? (
        <p className="-mt-3 self-end text-sm text-sand-600 tabular-nums dark:text-sand-400">
          Página <span className="font-semibold text-ink dark:text-paper">{data.page}</span> de {data.totalPages}
        </p>
      ) : null}
      <StaleNotice error={data ? error : null} />
      {content}
    </div>
  )
}
