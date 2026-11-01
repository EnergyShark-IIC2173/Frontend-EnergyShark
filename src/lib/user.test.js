import { test } from 'node:test'
import assert from 'node:assert/strict'
import { displayName, initials } from './user.js'

test('displayName prefiere el nombre y evita mostrar el correo (DF-032)', () => {
  assert.equal(displayName({ name: 'Esteban Ortega', nickname: 'esteban' }), 'Esteban Ortega')
  assert.equal(displayName({ name: 'esteban@ejemplo.cl', nickname: 'esteban' }), 'esteban')
  assert.equal(displayName(undefined), 'Tu cuenta')
})

test('initials toma la primera y la última palabra', () => {
  assert.equal(initials('Esteban Ortega Moraga'), 'EM')
  assert.equal(initials('esteban'), 'E')
  assert.equal(initials(''), '?')
})
