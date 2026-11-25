// Parser de Server-Sent Events según la especificación de WHATWG (DF-046). Puro: sin React ni import.meta, para
// probarlo con `node --test`. Recibe texto ya decodificado (el cliente usa TextDecoder en modo stream) en trozos de
// cualquier tamaño: una línea, o incluso un `\r\n`, puede llegar partida entre dos trozos.
//
// onMessage({ type, data, id, retry }) se llama al terminar cada evento (línea en blanco) que trae `data`.
// onComment(text) se llama por cada comentario (`: ping`, el latido del servidor).
// onRetry(ms) se llama cuando llega un campo `retry` válido.
// `id` es el último id visto en la conexión (la especificación lo arrastra entre eventos).

export function createSseParser({ onMessage, onComment, onRetry } = {}) {
  let buffer = ''
  let skipLf = false // el trozo anterior terminó en \r: si este parte con \n, es el mismo fin de línea
  let first = true // la especificación ignora un BOM al inicio del stream
  let data = []
  let type = ''
  let lastId = ''

  function dispatch() {
    if (data.length > 0) {
      onMessage?.({ type: type || 'message', data: data.join('\n'), id: lastId })
    }
    data = []
    type = ''
  }

  function line(text) {
    if (text === '') return dispatch()
    if (text[0] === ':') return onComment?.(text.slice(1).replace(/^ /, ''))
    const colon = text.indexOf(':')
    const field = colon === -1 ? text : text.slice(0, colon)
    let value = colon === -1 ? '' : text.slice(colon + 1)
    if (value[0] === ' ') value = value.slice(1)
    if (field === 'data') data.push(value)
    else if (field === 'event') type = value
    else if (field === 'id') {
      if (!value.includes('\0')) lastId = value
    } else if (field === 'retry') {
      if (/^\d+$/.test(value)) onRetry?.(Number(value))
    }
    // Campos desconocidos se ignoran.
  }

  function push(chunk) {
    if (!chunk) return
    let text = chunk
    if (first) {
      first = false
      if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
    }
    if (skipLf && text[0] === '\n') text = text.slice(1)
    skipLf = false
    buffer += text
    let start = 0
    for (let i = 0; i < buffer.length; i++) {
      const c = buffer[i]
      if (c !== '\n' && c !== '\r') continue
      line(buffer.slice(start, i))
      if (c === '\r') {
        if (i + 1 < buffer.length) {
          if (buffer[i + 1] === '\n') i++
        } else {
          skipLf = true
        }
      }
      start = i + 1
    }
    buffer = buffer.slice(start)
  }

  // Fin del stream: un evento sin la línea en blanco final no se despacha (así lo pide la especificación).
  function reset() {
    buffer = ''
    skipLf = false
    data = []
    type = ''
  }

  return { push, reset, get lastId() { return lastId } }
}

// Espera antes del intento `attempt` (0 = primero): exponencial con tope y jitter entre 50 % y 100 %.
export function backoffDelay(attempt, { baseMs = 1000, maxMs = 30_000, random = Math.random } = {}) {
  const exp = Math.min(maxMs, baseMs * 2 ** Math.max(0, attempt))
  return Math.round(exp * (0.5 + random() / 2))
}
