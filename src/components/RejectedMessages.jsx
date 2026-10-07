import { useState } from 'react'
import { listRejected } from '../api/endpoints'
import { useApiQuery } from '../api/useApiQuery'
import { fmtDate, orDash, truncId } from '../lib/format'
import { REJECTED_KIND, rejectedKind } from '../lib/status'
import { Badge } from './ui/Badge'
import { Pagination } from './ui/Pagination'
import { EmptyState, ErrorState, LoadingState, StaleNotice } from './ui/States'
import { TableCard } from './ui/TableCard'
import { RefreshButton, ViewHeader } from './ui/ViewHeader'
import { inputBase, labelBase, td, th, tr } from './ui/classes'

const LIMIT = 25
// En la demo el ayudante inyecta un duplicado y hay que verlo aparecer (DF-015).
const POLL_MS = 15_000

export function RejectedMessages() {
  const [page, setPage] = useState(1)
  const [kind, setKind] = useState('')
  const { data, loading, error, reload, relogin } = useApiQuery(
    (api) => listRejected(api, { page, limit: LIMIT, kind }),
    { page, kind },
    { pollMs: POLL_MS },
  )
  const rows = data?.data ?? []

  let content
  if (!data && loading) content = <LoadingState label="Cargando mensajes rechazados…" />
  else if (!data && error) content = <ErrorState error={error} onRetry={reload} onRelogin={relogin} />
  else if (rows.length === 0) {
    content = (
      <EmptyState icon="alert" title={kind ? `Sin mensajes de tipo "${rejectedKind(kind).label}"` : 'Aún no hay duplicados, NACKs ni descartados'}>
        Se revisa de nuevo cada {POLL_MS / 1000} s.
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
                <tr key={msg.id} className={tr}>
                  <td className={td}>
                    <Badge tone={k.tone}>{k.label}</Badge>
                  </td>
                  <td className={`${td} font-mono text-xs whitespace-nowrap text-text-h`}>{orDash(msg.type)}</td>
                  <td className={`${td} font-mono text-xs text-text-h`}>{orDash(msg.reason)}</td>
                  <td className={`${td} tabular-nums`}>{orDash(msg.code)}</td>
                  <td className={`${td} font-mono text-xs whitespace-nowrap`} title={msg.msgId ?? undefined}>{truncId(msg.msgId)}</td>
                  <td className={`${td} font-mono text-xs whitespace-nowrap`} title={msg.idpk ?? undefined}>{truncId(msg.idpk)}</td>
                  <td className={`${td} min-w-56`}>{orDash(msg.detail)}</td>
                  <td className={`${td} whitespace-nowrap tabular-nums`}>{fmtDate(msg.occurredAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </TableCard>
        <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={setPage} disabled={loading} />
      </>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <ViewHeader title="Registro de Duplicados y NACKs" subtitle={`Duplicados, NACKs y mensajes descartados (RF05). Se actualiza cada ${POLL_MS / 1000} s.`}>
        <div className="flex flex-col gap-2">
          <label htmlFor="rejected-kind" className={labelBase}>Tipo</label>
          <select
            id="rejected-kind"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value)
              setPage(1)
            }}
            className={`${inputBase} w-auto`}
          >
            <option value="">Todos</option>
            {Object.entries(REJECTED_KIND).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <RefreshButton onClick={reload} loading={loading} />
      </ViewHeader>

      <StaleNotice error={data ? error : null} />
      {content}
    </div>
  )
}
