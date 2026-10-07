import { useEffect, useRef, useState } from 'react'
import { createNegotiation, listCycles, listNegotiations } from '../api/endpoints'
import { useApiClient } from '../api/client'
import { useApiQuery } from '../api/useApiQuery'
import { estimateNextWindow, findOpenCycle, findOpenCycleWithoutStatus } from '../lib/cycles'
import { fmt, fmtCountdown, fmtDate, orDash } from '../lib/format'
import { paymentAmount, validateProposal } from '../lib/negotiation'
import { NEGOTIATION_STATUS, directionLabel, isActiveNegotiation, negotiationStatus, origin } from '../lib/status'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'
import { Pagination } from './ui/Pagination'
import { EmptyState, ErrorState, LoadingState, StaleNotice } from './ui/States'
import { TableCard } from './ui/TableCard'
import { RefreshButton, ViewHeader } from './ui/ViewHeader'
import { btnPrimary, btnSecondary, inputBase, labelBase, td, th, tr } from './ui/classes'

const LIMIT = 25
// DF-015: 3 s solo mientras haya filas que todavía pueden cambiar; el ciclo abierto, cada 30 s.
const ACTIVE_POLL_MS = 3_000
const CYCLES_POLL_MS = 30_000
const EMPTY_FORM = { direction: 'take', quantity: '', pricePerEnergy: '' }

export function NegotiationAdmin() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5_000)
    return () => clearInterval(timer)
  }, [])

  // El backend no tiene "ciclo actual": se deriva de los últimos ciclos (DF-021).
  const cyclesQuery = useApiQuery((api) => listCycles(api, { page: 1, limit: 5 }), null, { pollMs: CYCLES_POLL_MS })
  const recentCycles = cyclesQuery.data?.data ?? []
  const openCycle = findOpenCycle(recentCycles, now)

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const listQuery = useApiQuery(
    (api) => listNegotiations(api, { page, limit: LIMIT, status }),
    { page, status },
    { pollMs: (data) => (data?.data?.some(isActiveNegotiation) ? ACTIVE_POLL_MS : null) },
  )
  const rows = listQuery.data?.data ?? []
  const hasActive = rows.some(isActiveNegotiation)

  function handleCreated(created) {
    cyclesQuery.reload() // el spare del give depende de las negociaciones del ciclo
    if (page !== 1 || status !== '') {
      setPage(1)
      setStatus('')
      return
    }
    listQuery.setData((d) => (d ? { ...d, total: d.total + 1, data: [created, ...d.data.filter((n) => n.id !== created.id)] } : d))
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <ProposalForm cyclesQuery={cyclesQuery} openCycle={openCycle} recentCycles={recentCycles} now={now} onCreated={handleCreated} />

      <ViewHeader
        title="Negociaciones"
        subtitle={hasActive ? `Hay negociaciones en curso: se actualiza cada ${ACTIVE_POLL_MS / 1000} s.` : 'Automáticas y manuales, más reciente primero (RF04).'}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="neg-status-filter" className={labelBase}>Estado</label>
          <select
            id="neg-status-filter"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className={`${inputBase} w-auto`}
          >
            <option value="">Todas</option>
            {Object.entries(NEGOTIATION_STATUS).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <RefreshButton onClick={listQuery.reload} loading={listQuery.loading} />
      </ViewHeader>

      <StaleNotice error={listQuery.data ? listQuery.error : null} />
      <NegotiationsTable query={listQuery} rows={rows} status={status} onPage={setPage} />
    </div>
  )
}

// Cuenta regresiva con su propio intervalo de 1 s, para no re-renderizar toda la vista cada segundo.
function Countdown({ to }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1_000)
    return () => clearInterval(timer)
  }, [])
  return <span className="tabular-nums">{fmtCountdown(to, now) ?? 'cerrando…'}</span>
}

function ProposalForm({ cyclesQuery, openCycle, recentCycles, now, onCreated }) {
  const { apiFetch } = useApiClient()
  const [form, setForm] = useState(EMPTY_FORM)
  const [showErrors, setShowErrors] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [created, setCreated] = useState(null)
  // El estado se actualiza en el próximo render: la ref corta un doble clic que llegue antes (doble POST).
  const inFlight = useRef(false)

  const validation = validateProposal(form, openCycle)
  const energy = openCycle?.statusStatement?.energy
  const disabled = !openCycle || submitting
  // El tope se avisa apenas hay un precio escrito; el resto, al intentar enviar.
  const fieldError = (name) => (showErrors || (name === 'pricePerEnergy' && form.pricePerEnergy !== '') ? validation.errors[name] : null)

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }))
    setSubmitError(null)
    setCreated(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (inFlight.current || !openCycle) return
    if (!validation.ok) {
      setShowErrors(true)
      return
    }
    inFlight.current = true
    setSubmitting(true)
    setSubmitError(null)
    try {
      const negotiation = await createNegotiation(apiFetch, { cycleId: openCycle.cycleId, ...form })
      setCreated(negotiation)
      setForm(EMPTY_FORM)
      setShowErrors(false)
      onCreated(negotiation)
    } catch (err) {
      setSubmitError(err)
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold tracking-tight text-text-h">Crear Propuesta de Negociación</h2>
      <CycleStatus cyclesQuery={cyclesQuery} openCycle={openCycle} recentCycles={recentCycles} now={now} />

      <form onSubmit={handleSubmit} noValidate className="mt-5 grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        <div className="flex flex-col gap-2">
          <label htmlFor="neg-cycle" className={labelBase}>Ciclo</label>
          <input id="neg-cycle" type="text" value={openCycle?.cycleId ?? 'Sin ventana abierta'} readOnly disabled={!openCycle} className={`${inputBase} disabled:opacity-60`} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="neg-direction" className={labelBase}>Dirección</label>
          <select id="neg-direction" value={form.direction} onChange={(e) => update('direction', e.target.value)} disabled={disabled} className={`${inputBase} disabled:opacity-60`}>
            <option value="take">Comprar (Take)</option>
            <option value="give">Vender (Give)</option>
          </select>
        </div>
        <Field
          id="neg-quantity" label="Cantidad" unit="(kWh)" value={form.quantity} disabled={disabled}
          onChange={(v) => update('quantity', v)} error={fieldError('quantity')} warning={validation.warnings.quantity}
          hint={form.direction === 'give' && validation.spare !== null ? `Vendible estimado: ${fmt(validation.spare)} kWh` : null}
        />
        <Field
          id="neg-price" label="Precio" unit="(cr/kWh)" value={form.pricePerEnergy} disabled={disabled} step="0.01"
          onChange={(v) => update('pricePerEnergy', v)} error={fieldError('pricePerEnergy')}
          hint={energy ? `Tope ${fmt(validation.cap)} · ${form.direction === 'take' ? `take liquida a ${fmt(energy.generationCost)}` : `give liquida a ${fmt(validation.cap)}`}` : null}
        />
        <button type="submit" disabled={disabled} className={`${btnPrimary} h-11 sm:mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto`}>
          {submitting ? 'Enviando…' : 'Proponer'}
        </button>
      </form>

      {submitError ? (
        <div role="alert" className="mt-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-text-h">
          <p>
            <span className="font-semibold">No se registró la propuesta{submitError.status ? ` (HTTP ${submitError.status})` : ''}:</span>{' '}
            {submitError.message}
          </p>
        </div>
      ) : null}
      {created ? (
        <p role="status" className="mt-4 text-sm text-success">
          Propuesta #{created.id} registrada para {created.cycleId}. El connector la envía a la central en unos segundos; su estado se actualiza en la tabla.
        </p>
      ) : null}
    </Card>
  )
}

function CycleStatus({ cyclesQuery, openCycle, recentCycles, now }) {
  if (!cyclesQuery.data && cyclesQuery.loading) return <p role="status" className="mt-2 text-sm text-text">Buscando la ventana de negociación…</p>
  if (!cyclesQuery.data && cyclesQuery.error) {
    return (
      <p role="alert" className="mt-2 flex flex-wrap items-center gap-3 text-sm text-danger">
        No se pudo consultar el ciclo abierto: {cyclesQuery.error.message}
        <button type="button" onClick={cyclesQuery.reload} className={btnSecondary}>Reintentar</button>
      </p>
    )
  }
  if (openCycle) {
    return (
      <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text">
        <Badge tone="cyan">Ventana abierta</Badge>
        {openCycle.cycleId} · cierra {fmtDate(openCycle.windowClosesAt)} (en <Countdown to={openCycle.windowClosesAt} />)
      </p>
    )
  }
  const withoutStatus = findOpenCycleWithoutStatus(recentCycles, now)
  const next = estimateNextWindow(recentCycles, now)
  return (
    <p role="status" className="mt-2 text-sm text-text">
      {withoutStatus
        ? `La ventana de ${withoutStatus.cycleId} está abierta, pero todavía no llega su status-statement (sin tope ni capacidad para validar).`
        : 'No hay ventana de negociación abierta.'}{' '}
      {next ? `Próxima estimada: ${fmtDate(next.at)}.` : 'Próxima ventana no estimable con los datos actuales.'}
    </p>
  )
}

function Field({ id, label, unit, value, onChange, disabled, error, warning, hint, step = 'any' }) {
  const describedBy = [error && `${id}-error`, warning && `${id}-warning`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={labelBase}>{label} <span className="normal-case">{unit}</span></label>
      <input
        id={id} type="number" inputMode="decimal" min="0" step={step} value={value} disabled={disabled}
        onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={describedBy}
        className={`${inputBase} tabular-nums disabled:opacity-60 ${error ? 'border-danger' : ''}`}
      />
      {error ? <p id={`${id}-error`} className="text-xs text-danger">{error}</p> : null}
      {warning ? <p id={`${id}-warning`} className="text-xs text-accent">{warning}</p> : null}
      {hint ? <p id={`${id}-hint`} className="text-xs text-text">{hint}</p> : null}
    </div>
  )
}

function NegotiationsTable({ query, rows, status, onPage }) {
  const { data, loading, error, reload, relogin } = query
  if (!data && loading) return <LoadingState label="Cargando negociaciones…" />
  if (!data && error) return <ErrorState error={error} onRetry={reload} onRelogin={relogin} />
  if (rows.length === 0) {
    return <EmptyState icon="handshake" title={status ? `Sin negociaciones "${negotiationStatus(status).label}"` : 'Aún no hay negociaciones'} />
  }
  return (
    <>
      <TableCard>
        <thead>
          <tr>
            <th className={th}>ID / Ciclo</th>
            <th className={th}>Origen</th>
            <th className={th}>Dirección</th>
            <th className={th}>Energía</th>
            <th className={th}>Techo</th>
            <th className={th}>Liquidado</th>
            <th className={th}>Monto pagado</th>
            <th className={th}>Estado</th>
            <th className={th}>Fechas</th>
            <th className={th}>Falla</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((neg) => {
            const st = negotiationStatus(neg.status)
            const org = origin(neg.origin)
            const amount = paymentAmount(neg)
            return (
              <tr key={neg.id} className={tr}>
                <td className={td}>
                  <span className="block font-medium text-text-h tabular-nums">#{neg.id}</span>
                  <span className="block text-xs whitespace-nowrap">{neg.cycleId}</span>
                </td>
                <td className={td}><Badge tone={org.tone}>{org.label}</Badge></td>
                <td className={`${td} font-semibold whitespace-nowrap text-accent`}>{directionLabel(neg.direction)}</td>
                <td className={`${td} whitespace-nowrap tabular-nums`}>{fmt(neg.quantity)} kWh</td>
                <td className={`${td} whitespace-nowrap tabular-nums`}>{fmt(neg.pricePerEnergy)}</td>
                <td className={`${td} whitespace-nowrap tabular-nums`}>{fmt(neg.settledPricePerEnergy)}</td>
                <td className={`${td} whitespace-nowrap tabular-nums`}>
                  {amount === null ? '—' : `${neg.direction === 'give' ? '+' : '−'}${fmt(amount)} cr`}
                </td>
                <td className={td}>
                  <Badge tone={st.tone}>{st.label}</Badge>
                  <span className="mt-1 block text-xs whitespace-nowrap tabular-nums">
                    {neg.status === 'proposed' && neg.attempts === 0 ? 'Registrada, aún no enviada' : `Envíos: ${orDash(neg.attempts)}`}
                  </span>
                </td>
                <td className={`${td} text-xs whitespace-nowrap tabular-nums`}>
                  <span className="block">Propuesta {fmtDate(neg.proposedAt)}</span>
                  <span className="block">Confirmada {fmtDate(neg.confirmedAt)}</span>
                  <span className="block">Pagada {fmtDate(neg.paidAt)}</span>
                </td>
                <td className={`${td} min-w-48 text-xs`}>
                  {neg.failureReason ? (
                    <>
                      <span className="block font-mono text-pink-soft">{neg.failureReason}</span>
                      {neg.failureDetail ? <span className="mt-1 block">{neg.failureDetail}</span> : null}
                    </>
                  ) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </TableCard>
      <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={onPage} disabled={loading} />
    </>
  )
}
