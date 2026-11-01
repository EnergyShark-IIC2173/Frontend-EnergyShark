import { test } from 'node:test'
import assert from 'node:assert/strict'
import { wavePath } from './waves.js'

test('wavePath repite el período dos veces y vuelve a la línea media (DF-036)', () => {
  const { d, viewBox, period } = wavePath([[10, 3], [14, 5], [8, 2], [12, 4]], 20)
  assert.equal(period, 44)
  assert.equal(viewBox, '0 0 88 20')
  assert.ok(d.startsWith('M0 10'))
  // 4 crestas × 2 repeticiones; cada curva termina en dy 0 (vuelve a la línea media).
  const curves = d.match(/c[^c]+/g)
  assert.equal(curves.length, 8)
  assert.ok(curves.every((c) => c.trim().endsWith(' 0')))
  // Alterna cresta (dy negativo) y valle (dy positivo).
  assert.ok(curves[0].includes('-3') && !curves[1].includes('-'))
})

test('wavePath con más repeticiones alarga el viewBox', () => {
  const { viewBox, d } = wavePath([[10, 3], [14, 5]], 20, 6)
  assert.equal(viewBox, '0 0 144 20')
  assert.equal(d.match(/c/g).length, 12)
})
