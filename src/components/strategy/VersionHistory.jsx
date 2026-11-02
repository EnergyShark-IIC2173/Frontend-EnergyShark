import { fmtDate } from '../../lib/format'
import { ACCEPTANCE_POLICIES, SELECTION_POLICIES, describeOffer, policyLabel } from '../../lib/strategy'
import { Badge } from '../ui/Badge'
import { Pager } from '../ui/Pager'
import { TableCard } from '../ui/TableCard'
import { btnSecondary, sectionTitle, td, textSecondary, th, tr } from '../ui/classes'

// Historial append-only de strategy_configs (DF-040). "Usar como base" carga una versión en el formulario.
export function VersionHistory({ data, current, onUse, onPage, loading }) {
  if (!data?.data?.length) return null
  return (
    <section aria-labelledby="strategy-history" className="flex flex-col gap-3">
      <h3 id="strategy-history" className={sectionTitle}>Historial de versiones</h3>
      <TableCard>
        <thead>
          <tr>
            <th className={th}>Versión</th>
            <th className={th}>Creada</th>
            <th className={th}>Span</th>
            <th className={th}>Oferta</th>
            <th className={th}>Políticas</th>
            <th className={th}>Nota</th>
            <th className={th}><span className="sr-only">Acción</span></th>
          </tr>
        </thead>
        <tbody>
          {data.data.map((v) => {
            const offer = describeOffer(v.params)
            return (
              <tr key={v.version} className={tr}>
                <td className={`${td} whitespace-nowrap`}>
                  <span className="font-mono font-bold text-ink dark:text-paper">v{v.version}</span>
                  {v.version === current ? <Badge tone="active" className="ml-2">Vigente</Badge> : null}
                </td>
                <td className={`${td} whitespace-nowrap ${textSecondary}`}>
                  {fmtDate(v.createdAt)}
                  <span className="block text-xs">{v.createdBy}</span>
                </td>
                <td className={`${td} whitespace-nowrap tabular-nums`}>
                  {v.params?.span_seconds} s
                  {v.params?.span_plan?.length ? <span className={`block text-xs ${textSecondary}`}>plan {v.params.span_plan.join(' / ')}</span> : null}
                </td>
                <td className={`${td} whitespace-nowrap`}>
                  {offer.price}
                  <span className={`block text-xs ${textSecondary}`}>{offer.quantity}</span>
                </td>
                <td className={`${td} whitespace-nowrap`}>
                  {policyLabel(v.params?.acceptance_policy, ACCEPTANCE_POLICIES)}
                  <span className={`block text-xs ${textSecondary}`}>{policyLabel(v.params?.selection_policy, SELECTION_POLICIES)}</span>
                </td>
                <td className={`${td} max-w-56 ${textSecondary}`}>{v.note || '—'}</td>
                <td className={td}>
                  <button type="button" onClick={() => onUse(v)} className={`${btnSecondary} min-h-9 px-3 py-1 text-xs whitespace-nowrap`} aria-label={`Usar v${v.version} como base del formulario`}>
                    Usar como base
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </TableCard>
      {data.totalPages > 1 ? (
        <Pager label="Paginación de versiones" noun="versiones" page={data.page} totalPages={data.totalPages} total={data.total} onChange={onPage} disabled={loading} />
      ) : null}
    </section>
  )
}
