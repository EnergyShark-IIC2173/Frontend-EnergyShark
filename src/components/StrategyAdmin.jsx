import { useState } from 'react'
import { useApiClient } from '../api/client'
import { createStrategy, getStrategy, listStrategyVersions } from '../api/endpoints'
import { useApiQuery } from '../api/useApiQuery'
import { fmtDate } from '../lib/format'
import {
  ACCEPTANCE_POLICIES, SELECTION_POLICIES, SUGGESTED_PARAMS, apiErrorMessages, describeOffer, formFromParams, policyLabel, validateForm,
} from '../lib/strategy'
import { OpenSwaps } from './strategy/OpenSwaps'
import { StrategyForm } from './strategy/StrategyForm'
import { VersionHistory } from './strategy/VersionHistory'
import { Card } from './ui/Card'
import { Icon } from './ui/Icon'
import { ErrorState, LoadingState } from './ui/States'
import { Marker, ViewHeader } from './ui/ViewHeader'
import { labelBase, textAccent, textError, textPrimary, textSecondary } from './ui/classes'

// RF04 de la E2 (DF-040, ADR-006): estrategia versionada. Un cambio crea una versión nueva y aplica desde el
// siguiente ciclo, porque cada ciclo congela su snapshot al llegar el status-statement.
const VERSIONS_LIMIT = 5

function Summary({ label, value, detail }) {
  return (
    <div className="min-w-0">
      <p className={labelBase}>{label}</p>
      <p className={`mt-1 font-semibold ${textPrimary}`}>{value}</p>
      {detail ? <p className={`text-xs ${textSecondary}`}>{detail}</p> : null}
    </div>
  )
}

function CurrentVersion({ strategy }) {
  const p = strategy.params
  const offer = describeOffer(p)
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className={`font-display text-lg font-bold ${textPrimary}`}>
          Versión vigente <span className="font-mono">v{strategy.version}</span>
        </p>
        <p className={`text-xs ${textSecondary}`}>{fmtDate(strategy.createdAt)} · {strategy.createdBy}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Summary label="Span" value={`${p.span_seconds} s`} detail={p.span_plan?.length ? `Plan ${p.span_plan.join(' / ')} s` : 'Sin plan de rotación'} />
        <Summary label="Precio de la oferta" value={offer.price} />
        <Summary label="Cantidad" value={offer.quantity} />
        <Summary label="Políticas" value={policyLabel(p.acceptance_policy, ACCEPTANCE_POLICIES)} detail={policyLabel(p.selection_policy, SELECTION_POLICIES)} />
      </div>
      {strategy.note ? <p className={`text-sm ${textSecondary}`}>“{strategy.note}”</p> : null}
    </Card>
  )
}

export function StrategyAdmin() {
  const { apiFetch } = useApiClient()
  const current = useApiQuery(getStrategy)
  const [page, setPage] = useState(1)
  const versions = useApiQuery((api) => listStrategyVersions(api, { page, limit: VERSIONS_LIMIT }), { page })

  const noVersion = current.error?.status === 404
  const baseParams = current.data?.params ?? (noVersion ? SUGGESTED_PARAMS : null)
  const [form, setForm] = useState(null)
  const [baseKey, setBaseKey] = useState(null)
  const [errors, setErrors] = useState({})
  const [save, setSave] = useState({ saving: false, messages: null, saved: null })

  // El formulario parte de la vigente (o de la sugerida) y no se pisa con un reload mientras se edita: solo se
  // reinicia cuando cambia la versión. Se ajusta durante el render (patrón de React), no en un effect.
  const key = current.data ? `v${current.data.version}` : noVersion ? 'suggested' : null
  if (key && key !== baseKey) {
    setForm(formFromParams(baseParams))
    setBaseKey(key)
    setErrors({})
  }

  const pristine = baseParams ? formFromParams(baseParams) : null
  const dirty = Boolean(form && pristine && JSON.stringify(form) !== JSON.stringify(pristine))

  async function submit() {
    const result = validateForm(form)
    setErrors(result.errors)
    if (!result.params) {
      setSave({ saving: false, messages: ['Revisa los campos marcados.'], saved: null })
      return
    }
    setSave({ saving: true, messages: null, saved: null })
    try {
      const created = await createStrategy(apiFetch, { params: result.params, note: result.note })
      setSave({ saving: false, messages: null, saved: created })
      current.setData(() => created)
      setPage(1)
      versions.reload()
    } catch (error) {
      setSave({ saving: false, messages: apiErrorMessages(error), saved: null })
    }
  }

  function loadVersion(v) {
    setForm({ ...formFromParams(v.params), note: `Basada en v${v.version}` })
    setErrors({})
    setSave({ saving: false, messages: null, saved: null })
    document.getElementById('strategy-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  let body
  if (!current.data && !noVersion && current.loading) body = <LoadingState label="Cargando la estrategia vigente…" />
  else if (!current.data && !noVersion && current.error) body = <ErrorState error={current.error} onRetry={current.reload} onRelogin={current.relogin} />
  else if (form) {
    body = (
      <>
        {current.data ? <CurrentVersion strategy={current.data} /> : (
          <Card>
            <p className={`font-semibold ${textPrimary}`}>Todavía no hay ninguna versión guardada</p>
            <p className={`mt-1 text-sm ${textSecondary}`}>El formulario trae valores sugeridos. Al guardar se crea la versión 1.</p>
          </Card>
        )}
        <div id="strategy-form" className="scroll-mt-6">
          <StrategyForm
            form={form}
            errors={errors}
            onChange={setForm}
            onSubmit={submit}
            onReset={() => { setForm(pristine); setErrors({}); setSave({ saving: false, messages: null, saved: null }) }}
            saving={save.saving}
            dirty={dirty}
          >
            {save.messages ? (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm dark:bg-coral/15">
                <Icon name="alert" className={`mt-0.5 size-4 ${textError}`} />
                <ul className={textPrimary}>{save.messages.map((m) => <li key={m}>{m}</li>)}</ul>
              </div>
            ) : null}
            {save.saved ? (
              <p role="status" className="flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm dark:bg-accent-soft">
                <Icon name="check" className={`size-4 ${textAccent}`} />
                <span className={textPrimary}>Versión <span className="font-mono font-semibold">v{save.saved.version}</span> guardada. Aplica desde el siguiente ciclo.</span>
              </p>
            ) : null}
          </StrategyForm>
        </div>
      </>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <ViewHeader title={<><Marker>Estrategia</Marker> de mercado</>} subtitle="Precio y cantidad de la oferta, políticas y span. Sin redeploy." />
      <p className="flex items-start gap-2 rounded-xl border border-lavender/40 bg-lavender/10 px-4 py-3 text-sm dark:bg-lavender-soft">
        <Icon name="clock" className="mt-0.5 size-4 text-lavender-ink dark:text-lavender" />
        <span className={textPrimary}>
          Un cambio aplica desde el <strong>siguiente ciclo</strong>: el ciclo en curso termina con la estrategia que congeló al recibir su status-statement.
        </span>
      </p>
      {body}
      <OpenSwaps />
      <VersionHistory data={versions.data} current={current.data?.version} onUse={loadVersion} onPage={setPage} loading={versions.loading} />
    </div>
  )
}
