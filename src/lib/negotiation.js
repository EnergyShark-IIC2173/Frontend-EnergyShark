// Cálculos de montos de la E1 que RF01 sigue mostrando en los ciclos antiguos (DF-026). La validación de
// propuestas (DF-017) se retiró con la vista de negociaciones (DF-028).

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
