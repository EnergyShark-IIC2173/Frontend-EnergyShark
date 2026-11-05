import { test } from 'node:test'
import assert from 'node:assert/strict'
import { neighbor, pageItems } from './pagination.js'

test('pageItems muestra primera, última y vecinas con elipsis (DF-033)', () => {
  assert.deepEqual(pageItems(6, 12), [1, 'gap', 5, 6, 7, 'gap', 12])
  assert.deepEqual(pageItems(1, 12), [1, 2, 'gap', 12])
  assert.deepEqual(pageItems(3, 5), [1, 2, 3, 4, 5])
  assert.deepEqual(pageItems(1, 1), [1])
  assert.deepEqual(pageItems(1, 0), [])
})

test('neighbor pasa de página en los bordes', () => {
  assert.deepEqual(neighbor(3, 9, 2, 5, 1), { index: 4 })
  assert.deepEqual(neighbor(8, 9, 2, 5, 1), { page: 3, edge: 'first' })
  assert.deepEqual(neighbor(0, 9, 2, 5, -1), { page: 1, edge: 'last' })
  assert.equal(neighbor(0, 9, 1, 5, -1), null)
  assert.equal(neighbor(2, 3, 5, 5, 1), null)
})
