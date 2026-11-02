import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ACCEPTANCE_POLICIES, OTHER_POLICY, SUGGESTED_PARAMS, apiErrorMessages, describeOffer, formFromParams, policyLabel, validateForm,
} from './strategy.js'

const params = {
  span_seconds: 30,
  offer: { price_mode: 'fixed', price: 330, quantity_mode: 'fixed', quantity: 5000 },
  acceptance_policy: { name: 'highest_quantity_first', params: { min: 500 } },
  selection_policy: { name: 'lowest_effective_price' },
  span_plan: [10, 20, 40],
}

test('ida y vuelta: params → formulario → params sin cambios', () => {
  const form = formFromParams(params)
  assert.equal(form.spanSeconds, '30')
  assert.equal(form.acceptanceParams, '{"min":500}')
  assert.equal(form.spanPlan, '10, 20, 40')
  const { params: back, errors } = validateForm(form)
  assert.deepEqual(errors, {})
  assert.deepEqual(back, params)
})

test('pct_of_imbalance se escribe en porcentaje y se envía como fracción', () => {
  const form = formFromParams(SUGGESTED_PARAMS)
  assert.equal(form.price, '80')
  form.price = '87.5'
  const { params: out } = validateForm(form)
  assert.equal(out.offer.price, 0.875)
  assert.equal(out.offer.quantity, null)
  assert.equal(out.span_plan, null)
})

test('valida rangos como strategy-config.schema.json', () => {
  const form = { ...formFromParams(params), spanSeconds: '4', price: '0', quantity: '1.5', spanPlan: '10, 70' }
  const { params: out, errors } = validateForm(form)
  assert.equal(out, null)
  assert.deepEqual(Object.keys(errors).sort(), ['price', 'quantity', 'spanPlan', 'spanSeconds'])
  assert.equal(validateForm({ ...formFromParams(params), spanSeconds: '60' }).errors.spanSeconds, undefined)
  assert.ok(validateForm({ ...formFromParams(params), spanSeconds: '20.5' }).errors.spanSeconds)
})

test('cantidad solo se exige en modo fixed', () => {
  const form = { ...formFromParams(params), quantityMode: 'all_sellable', quantity: '' }
  const { params: out, errors } = validateForm(form)
  assert.deepEqual(errors, {})
  assert.equal(out.offer.quantity, null)
})

test('política "Otra…" y params JSON inválidos', () => {
  const form = formFromParams({ ...params, acceptance_policy: { name: 'mi_politica' } })
  assert.equal(form.acceptance, OTHER_POLICY)
  assert.equal(form.acceptanceOther, 'mi_politica')
  assert.equal(validateForm(form).params.acceptance_policy.name, 'mi_politica')

  const bad = { ...form, acceptanceOther: ' ', selectionParams: '[1]' }
  const { errors } = validateForm(bad)
  assert.ok(errors.acceptance)
  assert.ok(errors.selectionParams)
})

test('nota vacía va como null; con texto, recortada', () => {
  assert.equal(validateForm({ ...formFromParams(params), note: '  ' }).note, null)
  assert.equal(validateForm({ ...formFromParams(params), note: ' span 40 ' }).note, 'span 40')
})

test('apiErrorMessages junta error y details del 400', () => {
  const error = { message: 'params inválidos', body: { details: [{ path: 'span_seconds', message: 'must be <= 60' }, 'otro'] } }
  assert.deepEqual(apiErrorMessages(error), ['params inválidos', 'span_seconds: must be <= 60', 'otro'])
  assert.deepEqual(apiErrorMessages({ message: 'Error 500' }), ['Error 500'])
})

test('describeOffer y policyLabel', () => {
  assert.deepEqual(describeOffer(SUGGESTED_PARAMS), { price: '80 % de imbalancePrice', quantity: 'Todo lo vendible' })
  assert.deepEqual(describeOffer(params), { price: '330 CR/kWh', quantity: '5000 kWh' })
  assert.equal(policyLabel({ name: 'fifo' }, ACCEPTANCE_POLICIES), 'FIFO: en orden de llegada')
  assert.equal(policyLabel({ name: 'x' }, ACCEPTANCE_POLICIES), 'x')
})
