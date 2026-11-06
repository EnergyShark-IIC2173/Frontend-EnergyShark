// Estrategia de mercado de RF04 (DF-040, ADR-006). Puro, para probarlo con `node --test`.
import { fmt } from './format.js'
// El formulario trabaja con strings (lo que hay en los inputs); validateForm arma los `params` de
// strategy-config.schema.json o devuelve los errores por campo.

export const SPAN_MIN = 5
export const SPAN_MAX = 60

// Nombres registrados en ADR-006. "Otra…" permite escribir uno nuevo (agregarlo exige un despliegue del connector).
export const ACCEPTANCE_POLICIES = [
  { name: 'fifo', label: 'FIFO: en orden de llegada' },
  { name: 'highest_quantity_first', label: 'Mayor cantidad primero' },
]
export const SELECTION_POLICIES = [
  { name: 'lowest_effective_price', label: 'Menor precio efectivo' },
]
export const OTHER_POLICY = '__other__'

// Sugerida cuando todavía no hay ninguna versión (la config por defecto del backend la fija el addendum de ADR-006).
export const SUGGESTED_PARAMS = {
  span_seconds: 20,
  offer: { price_mode: 'pct_of_imbalance', price: 0.8, quantity_mode: 'all_sellable', quantity: null },
  acceptance_policy: { name: 'fifo' },
  selection_policy: { name: 'lowest_effective_price' },
  span_plan: null,
}

const str = (value) => (value === null || value === undefined ? '' : String(value))
const known = (list, name) => list.some((p) => p.name === name)
// 0.8 → "80"; 0.875 → "87.5". Evita 80.00000000000001.
const toPercent = (fraction) => str(Math.round(Number(fraction) * 100 * 1e6) / 1e6)

export function formFromParams(params = SUGGESTED_PARAMS) {
  const offer = params?.offer ?? {}
  const pct = offer.price_mode === 'pct_of_imbalance'
  const acceptance = params?.acceptance_policy?.name ?? ''
  const selection = params?.selection_policy?.name ?? ''
  const json = (p) => (p && Object.keys(p).length ? JSON.stringify(p) : '')
  return {
    spanSeconds: str(params?.span_seconds),
    priceMode: offer.price_mode ?? 'fixed',
    price: pct ? toPercent(offer.price) : str(offer.price),
    quantityMode: offer.quantity_mode ?? 'all_sellable',
    quantity: str(offer.quantity),
    acceptance: known(ACCEPTANCE_POLICIES, acceptance) ? acceptance : OTHER_POLICY,
    acceptanceOther: known(ACCEPTANCE_POLICIES, acceptance) ? '' : acceptance,
    acceptanceParams: json(params?.acceptance_policy?.params),
    selection: known(SELECTION_POLICIES, selection) ? selection : OTHER_POLICY,
    selectionOther: known(SELECTION_POLICIES, selection) ? '' : selection,
    selectionParams: json(params?.selection_policy?.params),
    spanPlan: (params?.span_plan ?? []).join(', '),
    note: '',
  }
}

const isInt = (text) => /^-?\d+$/.test(text.trim())
const inSpan = (n) => n >= SPAN_MIN && n <= SPAN_MAX

function parsePolicy(choice, other, paramsText, field, errors) {
  const name = (choice === OTHER_POLICY ? other : choice).trim()
  if (!name) errors[field] = 'Elige una política o escribe su nombre.'
  const policy = { name }
  if (paramsText.trim()) {
    try {
      const parsed = JSON.parse(paramsText)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('no es objeto')
      policy.params = parsed
    } catch {
      errors[`${field}Params`] = 'Debe ser un objeto JSON, por ejemplo {"min": 500}.'
    }
  }
  return policy
}

// { params, note, errors }. params es null si hay algún error.
export function validateForm(form) {
  const errors = {}

  const span = form.spanSeconds.trim()
  if (!isInt(span) || !inSpan(Number(span))) errors.spanSeconds = `Entero entre ${SPAN_MIN} y ${SPAN_MAX} segundos.`

  const pct = form.priceMode === 'pct_of_imbalance'
  const priceValue = Number(form.price)
  if (!form.price.trim() || !Number.isFinite(priceValue) || priceValue <= 0) {
    errors.price = pct ? 'Porcentaje mayor que 0.' : 'Precio mayor que 0.'
  } else if (pct && priceValue > 100) {
    // strategy-config.schema.json: con price_mode pct_of_imbalance, price <= 1 (100 %).
    errors.price = 'Porcentaje de 100 o menos: no se puede ofertar sobre el imbalancePrice.'
  }

  const fixedQuantity = form.quantityMode === 'fixed'
  if (fixedQuantity && (!isInt(form.quantity) || Number(form.quantity) < 1)) errors.quantity = 'Entero mayor o igual a 1 (kWh).'

  const acceptance = parsePolicy(form.acceptance, form.acceptanceOther, form.acceptanceParams, 'acceptance', errors)
  const selection = parsePolicy(form.selection, form.selectionOther, form.selectionParams, 'selection', errors)

  let spanPlan = null
  if (form.spanPlan.trim()) {
    const parts = form.spanPlan.split(/[\s,;]+/).filter(Boolean)
    if (!parts.every((p) => isInt(p) && inSpan(Number(p)))) {
      errors.spanPlan = `Lista de enteros entre ${SPAN_MIN} y ${SPAN_MAX}, separados por comas.`
    } else spanPlan = parts.map(Number)
  }

  if (Object.keys(errors).length) return { params: null, note: null, errors }
  return {
    params: {
      span_seconds: Number(span),
      offer: {
        price_mode: form.priceMode,
        price: pct ? Math.round((priceValue / 100) * 1e6) / 1e6 : priceValue,
        quantity_mode: form.quantityMode,
        quantity: fixedQuantity ? Number(form.quantity) : null,
      },
      acceptance_policy: acceptance,
      selection_policy: selection,
      span_plan: spanPlan,
    },
    note: form.note.trim() || null,
    errors,
  }
}

// Mensajes de un 400 del backend: `error` y, si viene, `details` ([{ path, message }], forma propuesta en DF-040).
export function apiErrorMessages(error) {
  const body = error?.body
  const details = Array.isArray(body?.details)
    ? body.details.map((d) => (typeof d === 'string' ? d : [d?.path, d?.message].filter(Boolean).join(': ')))
    : []
  const head = error?.message ? [error.message] : []
  return [...head, ...details.filter(Boolean)]
}

// Textos cortos para la versión vigente y el historial.
export function describeOffer(params) {
  const offer = params?.offer
  if (!offer) return { price: '—', quantity: '—' }
  const price = offer.price_mode === 'pct_of_imbalance' ? `${toPercent(offer.price)} % de imbalancePrice` : `${fmt(offer.price)} CR/kWh`
  const quantity = offer.quantity_mode === 'fixed' ? `${fmt(offer.quantity, 0)} kWh` : 'Todo lo vendible'
  return { price, quantity }
}

export function policyLabel(policy, list) {
  if (!policy?.name) return '—'
  return list.find((p) => p.name === policy.name)?.label ?? policy.name
}
