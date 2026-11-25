# S18.3 — Servidor SSE de prueba y proxy de /api/feed

## Objetivo
Poder desarrollar y demostrar la vista sin S17, con un servidor que hable SSE de verdad y el contrato propuesto.

## Contexto
DF-047. Node 20 sin dependencias nuevas. El proxy de Vite ya manda `/api` a master local (:3001).

## Prompt utilizado
```
Podemos hacer DF-046? y el mock de feed? dependo de las tareas de fran?
```
Prompt de la subtarea generado a partir de eso:
```
scripts/mock-feed-server.mjs con node:http: GET /api/feed/stream exige Bearer (401 si no), Last-Event-ID por header
o ?lastEventId, backlog de 100 sin id, reset si el id no está (más viejo que lo retenido o mayor que el último),
retry: 2000, latido ": ping" cada 15 s, corte programado (MOCK_FEED_DROP_MS) y reinicio de numeración opcional.
Historias entrelazadas: oferta vista, saga del vendedor (liquidada/compensada) y del comprador (liquidada/
SWAP_NOT_PROPOSED), bids rechazados, alertas de las 5 del enunciado, descartes RF05. CORS solo para localhost.
npm scripts mock:feed y dev:feed; '/api/feed' antes de '/api' en el proxy con FEED_PROXY_TARGET; VITE_FEED_URL en
.env.example.
```

## Resultado esperado
`curl` muestra 401 sin token, backlog, `reset` ante un id desconocido, corte programado y los 10 tipos.

## Resultado obtenido
- Commit `ce13862`. `vite.config.js` necesitó `import process from 'node:process'` (ESLint con globals de navegador).
- Durante S18.5 se vio que casi no salían alertas: peso de `alertStory` 0,6 → 1,2 y cierre a los 20–45 s en vez del
  paso siguiente. Las correcciones del harness se hicieron antes de commitear, así que ya están en `ce13862`.

## Archivos modificados
- `scripts/mock-feed-server.mjs`, `vite.config.js`, `package.json`, `.env.example`

## Tests ejecutados
`MOCK_FEED_RATE_MS=200 MOCK_FEED_DROP_MS=3000 node scripts/mock-feed-server.mjs` y `curl -sN` con y sin
`Authorization`, con `Last-Event-ID: 100` y `999999`.

## Resultado de los tests
401 sin token; 50 eventos de backlog; `event: reset` con `{"reason":"unknown-id"}`; conexión cerrada a los 3,02 s;
los 10 tipos presentes.

## Decisiones tomadas
- Acepta cualquier `Bearer` — es solo para desarrollo; dicho en la cabecera del archivo y en el README.
- Ciclo nuevo cada 2 min — para ver cambiar `cycleId` en una sesión de prueba.

## Bloqueos
Ninguno.

## Observaciones
Sirve a Francisca como referencia ejecutable del contrato para S17.
