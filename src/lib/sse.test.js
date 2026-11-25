import { test } from 'node:test'
import assert from 'node:assert/strict'
import { backoffDelay, createSseParser } from './sse.js'

function collect() {
  const out = { messages: [], comments: [], retries: [] }
  const parser = createSseParser({
    onMessage: (m) => out.messages.push(m),
    onComment: (c) => out.comments.push(c),
    onRetry: (r) => out.retries.push(r),
  })
  return { parser, out }
}

test('evento completo con id, event y data', () => {
  const { parser, out } = collect()
  parser.push('id: 7\nevent: saga.started\ndata: {"id":7}\n\n')
  assert.deepEqual(out.messages, [{ type: 'saga.started', data: '{"id":7}', id: '7' }])
})

test('data multilínea se une con \\n y el tipo por defecto es message', () => {
  const { parser, out } = collect()
  parser.push('data: a\ndata: b\n\n')
  assert.deepEqual(out.messages, [{ type: 'message', data: 'a\nb', id: '' }])
})

test('trozos partidos en cualquier punto, incluido un \\r\\n', () => {
  const { parser, out } = collect()
  const raw = 'id: 1\r\nevent: x\r\ndata: hola\r\n\r\nid: 2\r\ndata: chao\r\n\r\n'
  for (let i = 0; i < raw.length; i += 3) parser.push(raw.slice(i, i + 3))
  assert.deepEqual(out.messages.map((m) => [m.id, m.type, m.data]), [['1', 'x', 'hola'], ['2', 'message', 'chao']])
})

test('\\r solo también termina línea, aunque quede al final del trozo', () => {
  const { parser, out } = collect()
  parser.push('data: a\r')
  parser.push('\r')
  parser.push('data: b\r\r')
  assert.deepEqual(out.messages.map((m) => m.data), ['a', 'b'])
})

test('comentarios (latido), retry válido e inválido, BOM y campos desconocidos', () => {
  const { parser, out } = collect()
  parser.push('﻿: ping\nretry: 3000\nretry: 3s\nfoo: bar\ndata:sin-espacio\n\n')
  assert.deepEqual(out.comments, ['ping'])
  assert.deepEqual(out.retries, [3000])
  assert.equal(out.messages[0].data, 'sin-espacio')
})

test('el id se arrastra a eventos siguientes y un evento sin data no se despacha', () => {
  const { parser, out } = collect()
  parser.push('id: 41\n\ndata: x\n\n')
  assert.deepEqual(out.messages, [{ type: 'message', data: 'x', id: '41' }])
  assert.equal(parser.lastId, '41')
})

test('evento sin línea en blanco final queda pendiente y reset lo descarta', () => {
  const { parser, out } = collect()
  parser.push('data: incompleto\n')
  parser.reset()
  parser.push('data: nuevo\n\n')
  assert.deepEqual(out.messages.map((m) => m.data), ['nuevo'])
})

test('backoffDelay: exponencial con tope y jitter', () => {
  assert.equal(backoffDelay(0, { random: () => 1 }), 1000)
  assert.equal(backoffDelay(3, { random: () => 1 }), 8000)
  assert.equal(backoffDelay(10, { random: () => 1 }), 30_000)
  assert.equal(backoffDelay(3, { random: () => 0 }), 4000)
  assert.equal(backoffDelay(0, { baseMs: 3000, random: () => 1 }), 3000)
})
