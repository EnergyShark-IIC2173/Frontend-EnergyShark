import { useId } from 'react'
import { ACCEPTANCE_POLICIES, OTHER_POLICY, SELECTION_POLICIES, SPAN_MAX, SPAN_MIN } from '../../lib/strategy'
import { Card } from '../ui/Card'
import { btnPrimary, btnSecondary, inputBase, labelBase, sectionTitle, textError, textSecondary } from '../ui/classes'

// Formulario de una versión nueva de la estrategia (DF-040). Controlado desde StrategyAdmin: aquí solo se pinta.

function Field({ label, hint, error, children, className = '' }) {
  const id = useId()
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className={labelBase}>{label}</label>
      {children({ id, describedBy, invalid: error ? true : undefined })}
      {hint ? <p id={`${id}-hint`} className={`text-xs ${textSecondary}`}>{hint}</p> : null}
      {error ? <p id={`${id}-error`} className={`text-xs font-medium ${textError}`}>{error}</p> : null}
    </div>
  )
}

const input = (invalid) => `${inputBase} ${invalid ? 'border-coral dark:border-coral' : ''}`

function Segmented({ legend, name, value, options, onChange }) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className={`${labelBase} mb-1.5`}>{legend}</legend>
      <div className="inline-flex flex-wrap gap-1 self-start rounded-xl bg-sand-100 p-1 dark:bg-sand-800">
        {options.map((o) => (
          <label key={o.value} className={`min-h-9 cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors has-focus-visible:ring-2 has-focus-visible:ring-accent ${value === o.value ? 'bg-card text-ink shadow-xs dark:bg-sand-900 dark:text-paper' : textSecondary}`}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function PolicyField({ label, list, choice, other, params, errors, field, set }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={label} error={errors[field]}>
        {({ id, describedBy, invalid }) => (
          <select id={id} aria-describedby={describedBy} aria-invalid={invalid} value={choice} onChange={(e) => set(field, e.target.value)} className={input(invalid)}>
            {list.map((p) => <option key={p.name} value={p.name}>{p.label}</option>)}
            <option value={OTHER_POLICY}>Otra…</option>
          </select>
        )}
      </Field>
      {choice === OTHER_POLICY ? (
        <Field label="Nombre registrado" hint="Debe existir en el registro del connector." error={null}>
          {({ id, describedBy }) => (
            <input id={id} aria-describedby={describedBy} value={other} onChange={(e) => set(`${field}Other`, e.target.value)} className={`${inputBase} font-mono`} />
          )}
        </Field>
      ) : null}
      <Field label="Parámetros (JSON, opcional)" error={errors[`${field}Params`]} className="sm:col-span-2">
        {({ id, describedBy, invalid }) => (
          <input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={params} placeholder='{"min": 500}' onChange={(e) => set(`${field}Params`, e.target.value)} className={`${input(invalid)} font-mono placeholder:font-sans`} />
        )}
      </Field>
    </div>
  )
}

export function StrategyForm({ form, errors, onChange, onSubmit, onReset, saving, dirty, children }) {
  const set = (key, value) => onChange({ ...form, [key]: value })
  const pct = form.priceMode === 'pct_of_imbalance'

  return (
    <Card as="form" onSubmit={(e) => { e.preventDefault(); onSubmit() }} noValidate className="flex flex-col gap-6">
      <div>
        <h3 className={sectionTitle}>Nueva versión</h3>
        <p className={`mt-1 text-sm ${textSecondary}`}>Guardar crea una versión nueva; la vigente no se edita.</p>
      </div>

      <section aria-label="Oferta" className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Segmented legend="Precio de la oferta" name="priceMode" value={form.priceMode} onChange={(v) => set('priceMode', v)}
            options={[{ value: 'pct_of_imbalance', label: '% de imbalancePrice' }, { value: 'fixed', label: 'Fijo' }]} />
          <Field label={pct ? 'Porcentaje (%)' : 'Precio (CR/kWh)'} hint={pct ? 'Se envía como fracción: 80 → 0.8.' : null} error={errors.price}>
            {({ id, describedBy, invalid }) => (
              <input id={id} inputMode="decimal" aria-describedby={describedBy} aria-invalid={invalid} value={form.price} onChange={(e) => set('price', e.target.value)} className={`${input(invalid)} tabular-nums`} />
            )}
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Segmented legend="Cantidad ofrecida" name="quantityMode" value={form.quantityMode} onChange={(v) => set('quantityMode', v)}
            options={[{ value: 'all_sellable', label: 'Todo lo vendible' }, { value: 'fixed', label: 'Fija' }]} />
          {form.quantityMode === 'fixed' ? (
            <Field label="Cantidad (kWh)" error={errors.quantity}>
              {({ id, describedBy, invalid }) => (
                <input id={id} inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} value={form.quantity} onChange={(e) => set('quantity', e.target.value)} className={`${input(invalid)} tabular-nums`} />
              )}
            </Field>
          ) : null}
        </div>
      </section>

      <section aria-label="Políticas" className="flex flex-col gap-4 border-t border-sand-200 pt-6 dark:border-sand-800">
        <PolicyField label="Política de aceptación de bids" list={ACCEPTANCE_POLICIES} choice={form.acceptance} other={form.acceptanceOther} params={form.acceptanceParams} errors={errors} field="acceptance" set={set} />
        <PolicyField label="Política de selección de ofertas" list={SELECTION_POLICIES} choice={form.selection} other={form.selectionOther} params={form.selectionParams} errors={errors} field="selection" set={set} />
      </section>

      <section aria-label="Span" className="grid gap-4 border-t border-sand-200 pt-6 sm:grid-cols-2 dark:border-sand-800">
        <Field label="Span (segundos)" hint={`Espera del comprador por un bid aceptado, de ${SPAN_MIN} a ${SPAN_MAX} s.`} error={errors.spanSeconds}>
          {({ id, describedBy, invalid }) => (
            <input id={id} inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} value={form.spanSeconds} onChange={(e) => set('spanSeconds', e.target.value)} className={`${input(invalid)} tabular-nums`} />
          )}
        </Field>
        <Field label="Plan de span (opcional)" hint="Rotación por ciclo para RF06, por ejemplo 10, 20, 40. Vacío: siempre el span de arriba." error={errors.spanPlan}>
          {({ id, describedBy, invalid }) => (
            <input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={form.spanPlan} placeholder="10, 20, 40" onChange={(e) => set('spanPlan', e.target.value)} className={`${input(invalid)} tabular-nums`} />
          )}
        </Field>
        <Field label="Nota (opcional)" className="sm:col-span-2" error={null}>
          {({ id, describedBy }) => (
            <input id={id} aria-describedby={describedBy} value={form.note} placeholder="Por qué cambia" onChange={(e) => set('note', e.target.value)} className={inputBase} />
          )}
        </Field>
      </section>

      {children}

      <div className="flex flex-wrap items-center gap-3 border-t border-sand-200 pt-6 dark:border-sand-800">
        <button type="submit" disabled={saving} className={`${btnPrimary} disabled:cursor-wait disabled:opacity-60`}>
          {saving ? 'Guardando…' : 'Guardar versión nueva'}
        </button>
        <button type="button" onClick={onReset} disabled={saving || !dirty} className={`${btnSecondary} disabled:cursor-not-allowed disabled:opacity-50`}>
          Descartar cambios
        </button>
        <p className={`text-xs ${textSecondary}`}>Aplica desde el siguiente ciclo.</p>
      </div>
    </Card>
  )
}
