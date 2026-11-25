# S18.2 — Parser SSE, cliente del feed y tipos de evento

## Objetivo
La lógica del feed sin React y con tests: parsear SSE, mantener la conexión con reconexión desde `Last-Event-ID` y
normalizar los eventos del contrato.

## Contexto
DF-046 en `main` de la rama (`c786aa5`). Los tests del front corren con `node --test src/lib/*.test.js`, así que la
lógica va en `src/lib/` sin `import.meta` ni React; `fetch`, los timers y el token se inyectan.

## Prompt utilizado
```
Podemos hacer DF-046? y el mock de feed? dependo de las tareas de fran?
```
Prompt de la subtarea generado a partir de eso:
```
src/lib/sse.js: createSseParser({onMessage,onComment,onRetry}) con push(chunk)/reset(), \n \r\n \r (también \r\n
partido), BOM, comentarios, retry solo dígitos, id arrastrado, sin despachar data vacía; backoffDelay(attempt).
src/lib/feedClient.js: createFeedClient({url,getToken,onEvent,onReset,onStatus,fetchImpl,setTimer,clearTimer,
random}) con start/stop; estados connecting/open/reconnecting{inMs,attempt}/auth/stopped; 401 → getToken(true) una
vez; error authRequired → auth; content-type distinto de text/event-stream → reintento; latido 45 s con abort;
dedup id <= lastId; reset → lastId null. src/lib/feed.js: normalizeFeedEvent, FEED_TYPES/GROUPS, SEVERITY,
SAGA_STATUS, BID_RESULT, ALERTS con anclas del runbook, appendEvent (tope 500), filterEvents, countByGroup,
activeAlerts. Tests de cada uno, incluido el cliente con ReadableStream y reloj falsos.
```

## Resultado esperado
Tests verdes de parser, cliente y normalización; el cliente reconecta mandando el último id y no duplica.

## Resultado obtenido
- Commit `f81ef5c`. Al mover `connectionText` desde el componente (regla de react-refresh) se agregó su test; el
  arreglo de la cuenta regresiva (S18.5) se hizo antes de commitear y está en `f81ef5c`.

## Archivos modificados
- `src/lib/sse.js`, `src/lib/sse.test.js`
- `src/lib/feedClient.js`, `src/lib/feedClient.test.js`
- `src/lib/feed.js`, `src/lib/feed.test.js`

## Tests ejecutados
`node --test src/lib/sse.test.js src/lib/feed.test.js src/lib/feedClient.test.js` y `npm test`.

## Resultado de los tests
8/8 parser; 18/18 feed + cliente en la primera corrida; `npm test` 85/85 al cierre.

## Decisiones tomadas
- `consoleUrl` solo si empieza con `https://` — el valor llega del servidor y termina en un `href`.
- Evento que llega desordenado se inserta en su lugar en vez de descartarse — con `id <= último` el cliente ya
  descarta los repetidos de la reconexión; el orden lo mantiene la lista.
- Tipo desconocido → grupo "Otros" con tono neutro — compatibilidad si S17 agrega tipos.

## Bloqueos
Ninguno.

## Observaciones
El cliente no conoce React: se puede reusar en otra vista o probar contra cualquier servidor SSE.
