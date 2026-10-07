// Reglas de la propuesta manual (DF-017). La validación final es del backend y del connector
// (connector/src/negotiation.js, localRejection); aquí solo se evitan rechazos obvios.
import { fmt } from './format.js'

// Suficiente para mostrar montos; el backend calcula en NUMERIC.
export function round2(x) {
  const n = Number(x)
  if (!Number.isFinite(n)) return null
  return Math.sign(n) * Math.round((Math.abs(n) + Number.EPSILON) * 100) / 100
}

// cap = round2(1.05 × generationCost), igual que round(1.05 * cost, 2) del connector. Se calcula en
// enteros (costo con hasta 4 decimales) para que 1.05 × 10.1 = 10.605 redondee a 10.61 y no a 10.6.
export function priceCap(generationCost) {
  const cost = Number(generationCost)
  if (generationCost === null || generationCost === undefined || !Number.isFinite(cost) || cost <= 0) return null
  const scaled = Math.round(cost * 10000) * 105 // cap × 1e6
  return Math.floor((scaled + 5000) / 10000) / 100
}

// Monto de un pago: round2(quantity × settledPricePerEnergy).
export function paymentAmount(negotiation) {
  if (!negotiation || negotiation.status !== 'paid' || negotiation.settledPricePerEnergy === null) return null
  return round2(Number(negotiation.quantity) * Number(negotiation.settledPricePerEnergy))
}

const COMMITTING = ['proposed', 'confirmed', 'paid']

// spare ≈ max(0, generación − consumo) − give del ciclo en proposed/confirmed/paid. Más conservador que
// el del connector (que no cuenta 'requested'), por eso solo advierte.
export function giveSpare(cycle) {
  const energy = cycle?.statusStatement?.energy
  if (!energy) return null
  const base = Math.max(0, Number(energy.generationCapacity) - Number(energy.consumption))
  const committed = (cycle.voluntaryNegotiations ?? [])
    .filter((n) => n.direction === 'give' && COMMITTING.includes(n.status))
    .reduce((sum, n) => sum + Number(n.quantity), 0)
  return Math.max(0, round2(base - committed))
}

// '' de un <input type="number"> no es 0.
const toNumber = (v) => (typeof v === 'string' && v.trim() === '' ? NaN : Number(v))

function positiveError(value) {
  const n = toNumber(value)
  if (!Number.isFinite(n)) return 'Ingresa un número.'
  if (n <= 0) return 'Debe ser mayor que 0.'
  return null
}

// Devuelve { ok, errors, warnings, cap, spare }. errors bloquea el envío; warnings no.
export function validateProposal({ direction, quantity, pricePerEnergy }, openCycle) {
  const errors = {}
  const warnings = {}
  const cap = priceCap(openCycle?.statusStatement?.energy?.generationCost)
  const spare = giveSpare(openCycle)

  if (!openCycle) errors.form = 'No hay una ventana de negociación abierta.'
  if (direction !== 'give' && direction !== 'take') errors.direction = 'Elige comprar o vender.'

  const quantityError = positiveError(quantity)
  if (quantityError) errors.quantity = quantityError

  const priceError = positiveError(pricePerEnergy)
  if (priceError) errors.pricePerEnergy = priceError
  else if (cap !== null && toNumber(pricePerEnergy) > cap) {
    errors.pricePerEnergy = `Supera el tope de ${fmt(cap)} cr (1,05 × costo de generación).`
  }

  if (!quantityError && direction === 'give' && spare !== null && toNumber(quantity) > spare) {
    warnings.quantity = `Supera la energía vendible estimada (${fmt(spare)} kWh): podría terminar rechazada por OVER_CAPACITY.`
  }

  return { ok: Object.keys(errors).length === 0, errors, warnings, cap, spare }
}
