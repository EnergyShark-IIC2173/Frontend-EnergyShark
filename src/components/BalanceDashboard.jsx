import { getBalance } from '../api/endpoints'
import { useApiQuery } from '../api/useApiQuery'
import { fmt, fmtDate } from '../lib/format'
import { RECONCILIATION_STATE, reconciliationState, signed } from '../lib/balance'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'
import { Icon } from './ui/Icon'
import { RefreshTimer } from './ui/RefreshTimer'
import { StatTile } from './ui/StatTile'
import { EmptyState, ErrorState, LoadingState, StaleNotice } from './ui/States'
import { TableCard } from './ui/TableCard'
import { Marker, ViewHeader } from './ui/ViewHeader'
import { td, textPrimary, textSecondary, th, tr } from './ui/classes'

// AD5 (DF-043, ADR-005): el ledger local es una proyección; la wallet manda. La medida es que la última
// reconciliación cuadre o que su delta se explique (operaciones abiertas). Cada 15 s, como RF05.
const POLL_MS = 15_000

const cr = (value) => fmt(value, 2)
const kwh = (value) => fmt(value, 0)

const EXPLANATION = {
  ok: 'El ledger local coincide con GET /balance de la wallet.',
  explained: 'Hay escrituras a la wallet sin confirmar: el ledger se pone al día cuando llega su evento.',
  unexplained: 'Hay diferencia sin operaciones abiertas. Revisa la nota y los eventos de la wallet del ciclo.',
  none: 'Se reconcilia al validUntil y al imbalance-settlement de cada ciclo.',
}

function DeltaCell({ value, format }) {
  const text = signed(value, format)
  if (text === null) return <span className={textSecondary}>—</span>
  const zero = Number(value) === 0
  return (
    <span className={`inline-flex items-center gap-1 font-semibold ${zero ? 'text-accent-ink dark:text-accent' : 'text-rose-ink dark:text-rose'}`}>
      <Icon name={zero ? 'check' : 'warning'} className="size-4" />
      {text}
    </span>
  )
}

function Reconciliation({ rec }) {
  const state = reconciliationState(rec)
  const meta = RECONCILIATION_STATE[state]
  if (!rec) {
    return (
      <EmptyState icon="wallet" title="Todavía no hay una reconciliación">
        {EXPLANATION.none}
      </EmptyState>
    )
  }
  return (
    <section aria-labelledby="last-reconciliation" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="last-reconciliation" className={`font-display text-base font-bold ${textPrimary}`}>
          Última reconciliación · <span className="font-mono">{rec.cycleId ?? '—'}</span>
        </h3>
        <p className={`text-xs ${textSecondary}`}>{fmtDate(rec.takenAt)}</p>
      </div>
      <Card className="flex flex-wrap items-start gap-3">
        <Badge tone={meta.tone}>{meta.label}</Badge>
        <div className="min-w-0 flex-1">
          <p className={`text-sm ${textPrimary}`}>{EXPLANATION[state]}</p>
          {rec.note ? <p className={`mt-1 text-sm ${textSecondary}`}>Nota: {rec.note}</p> : null}
        </div>
        <p className={`text-sm tabular-nums ${textSecondary}`}>
          Operaciones abiertas: <span className={`font-semibold ${textPrimary}`}>{rec.openOps ?? '—'}</span>
        </p>
      </Card>
      <TableCard>
        <caption className="sr-only">Ledger local frente a la wallet en la última reconciliación</caption>
        <thead>
          <tr>
            <th className={th}><span className="sr-only">Fuente</span></th>
            <th className={th}>Créditos <span className="normal-case">(CR)</span></th>
            <th className={th}>Energía <span className="normal-case">(KWH)</span></th>
          </tr>
        </thead>
        <tbody>
          <tr className={tr}>
            <th scope="row" className={`${td} text-left font-medium ${textPrimary}`}>Ledger local</th>
            <td className={`${td} tabular-nums`}>{cr(rec.ledgerCr)}</td>
            <td className={`${td} tabular-nums`}>{kwh(rec.ledgerKwh)}</td>
          </tr>
          <tr className={tr}>
            <th scope="row" className={`${td} text-left font-medium ${textPrimary}`}>Wallet <span className={`text-xs font-normal ${textSecondary}`}>(manda)</span></th>
            <td className={`${td} tabular-nums`}>{cr(rec.walletCr)}</td>
            <td className={`${td} tabular-nums`}>{kwh(rec.walletKwh)}</td>
          </tr>
          <tr className={tr}>
            <th scope="row" className={`${td} text-left font-medium ${textPrimary}`}>Delta <span className={`text-xs font-normal ${textSecondary}`}>(local − wallet)</span></th>
            <td className={`${td} tabular-nums`}><DeltaCell value={rec.deltaCr} format={cr} /></td>
            <td className={`${td} tabular-nums`}><DeltaCell value={rec.deltaKwh} format={kwh} /></td>
          </tr>
        </tbody>
      </TableCard>
    </section>
  )
}

export function BalanceDashboard() {
  const { data, loading, error, reload, relogin, updatedAt, interval } = useApiQuery(getBalance, null, { pollMs: POLL_MS })
  const notDeployed = error?.status === 404
  const state = reconciliationState(data?.lastReconciliation)

  let content
  if (!data && loading) content = <LoadingState label="Cargando el saldo…" />
  else if (notDeployed) {
    content = (
      <EmptyState icon="wallet" title="Saldo aún no disponible">
        El backend respondió 404 en <code className="font-mono">/api/balance</code>.
      </EmptyState>
    )
  } else if (!data && error) content = <ErrorState error={error} onRetry={reload} onRelogin={relogin} />
  else {
    content = (
      <>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Créditos (ledger local)" value={cr(data.ledger?.cr)} unit="CR" icon="wallet" />
          <StatTile label="Energía (ledger local)" value={kwh(data.ledger?.kwh)} unit="kWh" icon="battery" tone="category" />
          <StatTile label="Reconciliación" value={RECONCILIATION_STATE[state].label} unit="" icon={RECONCILIATION_STATE[state].icon}
            tone={state === 'ok' ? 'active' : state === 'unexplained' ? 'warning' : 'neutral'} />
        </div>
        <p className={`text-xs ${textSecondary}`}>
          El ledger local es una proyección para decidir (ADR-005); la verdad es la wallet. Último movimiento local en{' '}
          <span className="font-mono">{data.ledger?.cycleId ?? '—'}</span>.
        </p>
        <Reconciliation rec={data.lastReconciliation} />
      </>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <ViewHeader title={<><Marker>Saldo</Marker>: local frente a la wallet</>} subtitle="Créditos y energía del ledger local contra GET /balance de la central.">
        <RefreshTimer updatedAt={updatedAt} intervalMs={interval} loading={loading} onRefresh={reload} />
      </ViewHeader>
      <StaleNotice error={data && !notDeployed ? error : null} />
      {content}
    </div>
  )
}
