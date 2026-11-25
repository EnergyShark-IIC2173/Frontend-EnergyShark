# AI log — S18 (E3): panel RF01, feed en vivo por SSE (con servidor de prueba)

**Fecha:** 2026-11-25
**Integrante:** Esteban
**Herramienta:** Claude Code (Opus 5.5), modo agéntico (edita archivos y corre comandos en el repo)
**Unidad del roadmap:** S18 — "Panel RF01 (Esteban, ~8 h)": feed en vivo con filtros por tipo, indicador de reconexión, transiciones de saga con enlace a su ejecución, alertas disparadas, solo autenticado y sin polling; DF-xxx del cliente SSE antes del código. Prompt literal: "Podemos hacer DF-046? y el mock de feed? dependo de las tareas de fran?"
**Rama:** `feat/e3-s18-feed`, desde `main` (`197f3a4`). Independiente: el backend del feed (S17) todavía no existe.
**Referencias:** enunciado E3 ("Operación", "Feed del panel (SSE)", "Requisitos" RF01), `EnergyShark/docs/E3 Road Map.md` (S0, S17, S18, S19), propuesta del contrato del evento del feed que Francisca mandó el 24/nov, DF-045 (retiro de mocks)
**Detalle por subtarea (prompts literales y resultados):** `prompt/tarea-s18-feed/`

## Objetivo de la sesión
Partir S18 sin esperar a S17/S19: fijar el cliente SSE en una decisión, construir la vista contra un servidor de
prueba que hable el contrato propuesto y dejar todo listo para cambiar solo `VITE_FEED_URL` cuando exista el
backend real.

## Flujo de trabajo
1. **Análisis previo (misma sesión, fuera del repo).** Se leyó el enunciado de la E3 y el roadmap; se revisó la
   propuesta de contrato de Francisca y se redactó la respuesta con ajustes: `market.bid_result`,
   `execution.role`/`status`, `payload.alert`, reglas del stream (backlog, `reset`, latido, token vencido) y el
   riesgo de leer `id > last` con transacciones concurrentes. A la fecha de este log la respuesta **no está
   confirmada por Francisca**: el contrato de DF-046 es una propuesta.
2. **Pregunta de Esteban: "¿dependo de las tareas de Fran?".** Respuesta del agente: no para DF-046 ni para el mock;
   sí para integrar (S17 backend, S19 Nginx).
3. **Decisión de cómo mockear.** DF-045 había retirado los mocks del bundle. El agente propuso un servidor SSE
   aparte en vez de reponer `VITE_USE_MOCKS`, porque así se prueban el parser, los headers y la reconexión reales.
   Esteban había pedido "el mock de feed" sin elegir forma; el agente lo decidió y lo dejó escrito en DF-047 como
   decisión del agente.
4. **Docs antes que el código:** DF-046 y DF-047 en `c786aa5`, antes de los tres commits de implementación.
5. Implementación: lógica pura con tests (`f81ef5c`), servidor de prueba y proxy (`ce13862`), vista, provider y
   sidebar (`7029603`).
6. Verificación con tests, lint, build y un harness en Chromium headless (no se commitea).

## Qué se construyó
- `src/lib/sse.js` — parser SSE según la especificación (campos, comentarios, `retry`, BOM, `\r\n` partido entre
  trozos) y `backoffDelay` (exponencial con tope y jitter).
- `src/lib/feedClient.js` — conexión con `fetch`: `Authorization`, `Accept`, `Last-Event-ID`; reconexión con backoff
  (el contador vuelve a cero con el primer dato), `retry:` del servidor, latido vencido a los 45 s, 401 → un
  reintento con token forzado y si no, estado `auth`; `event: reset`; descarta ids repetidos.
- `src/lib/feed.js` — normalización del evento (todas las llaves, `consoleUrl` solo `https`), tipos, grupos,
  severidad, estados de saga y de bid, las 5 alertas con su ancla del runbook, `appendEvent` (dedup, orden, tope
  500), filtros, conteos, alertas abiertas y texto del estado de conexión.
- `src/feed/FeedProvider.jsx` y `feedContext.js` — una conexión para toda la sesión bajo el login; cuenta las
  alertas que llegan mientras se mira otra vista.
- `src/components/LiveFeed.jsx` y `src/components/feed/` — vista "En vivo" (primera de la sidebar y vista por
  defecto): estado de la conexión con cuenta regresiva y "Reconectar ahora", alertas disparadas con valor, umbral y
  runbook, filtros por grupo con conteo, severidad mínima y búsqueda por `swapId`/`cycleId`/`idpk`, pausa con
  contador de nuevos, filas con enlace "Ver ejecución" y payload al abrirlas.
- `src/components/Sidebar.jsx` — ítem "En vivo" con punto de estado y contador de alertas nuevas.
- `scripts/mock-feed-server.mjs` — servidor SSE sin dependencias en `:3002` (ver DF-047); `npm run mock:feed`,
  `npm run dev:feed`; proxy `/api/feed` en `vite.config.js`; `VITE_FEED_URL` en `.env.example`; README.

## Hallazgos / Errores encontrados y corregidos
- **Cuenta regresiva de "47 s" en una espera de 2 s.** `useNow` solo corre durante la reconexión, así que al pasar a
  `reconnecting` la vista usaba la hora de su montaje → `connectionText` ahora cuenta desde el cambio de estado
  (`max(now, at)`). Test de regresión agregado; con la fórmula anterior da 47 s.
- **El proxy de Vite no cierra la conexión del navegador cuando el servidor SSE muere.** Directo a `:3002`, `curl`
  termina en 2 s (código 18); por `:5199` (proxy) queda colgado hasta su timeout de 15 s (código 28). En el
  navegador, el panel siguió en "En vivo" hasta que el latido de 45 s abortó y reconectó (medido: 45 s). Es
  exactamente el caso que cubre el latido de DF-046. **Aviso para S19:** Nginx sí cierra al caerse el upstream,
  pero el latido del servidor tiene que ser ≤ 15 s y `proxy_read_timeout` mayor que eso.
- **El servidor de prueba casi no generaba alertas** (peso bajo y cierre inmediato): en 90 s no apareció ninguna
  abierta. Se subió el peso y el cierre pasó a ocurrir solo 20–45 s después.
- **Borde coral de la tarjeta de alertas no se aplicaba:** `Card` fija su propio color de borde (ya documentado en
  `Card.jsx`). Se quitó la clase en vez de pelear con la especificidad.

## Verificación
- `npm test` (`node --test src/lib/*.test.js`, Node 20.19.3) → **85/85** (58 en `main` + 27 nuevos: 8 del
  parser, 10 del cliente y 9 de `feed.js`).
- `npm run lint` → sin errores. `npm run build` → OK (solo el aviso de chunk > 500 kB que ya existía).
- Servidor de prueba con `curl`: 401 sin `Bearer`; backlog al conectar; `Last-Event-ID` desconocido → `event: reset`
  y backlog; corte programado a los 3 s; 10 tipos de evento presentes.
- Harness (no se commitea): Vite con `@auth0/auth0-react` reemplazado por un stub, proxy al servidor de prueba,
  Chromium headless con `playwright-core`:
  - **Reconexión sin pérdida:** con cortes cada 8 s, el cliente reconectó mandando `Last-Event-ID` 111 y 132; la
    lista quedó con 142 eventos, ids 1..142, **0 huecos y 0 duplicados**.
  - Servidor caído y reiniciado con otra numeración: el cliente recibió `reset`, vació la lista y siguió
    ("1 reinicio del servidor").
  - Latido: conexión colgada detectada a los **45 s**; luego "Reconectando en 2 s (intento 1)".
  - Enlace "Ver ejecución" con la URL de la consola de Step Functions del ARN del evento; filtro "Sagas"; pausa
    congela la lista ("Reanudar (7 nuevos)"); alerta abierta con enlace al runbook; contador "1 alertas nuevas" en
    la sidebar desde otra vista, que vuelve a 0 al entrar a "En vivo".
  - Capturas en claro y oscuro a 1280 px y a 375 px; **0 px** de overflow horizontal a 375.
- **No verificado:**
  - Contra el backend real: S17 (`GET /api/feed/stream`) y S19 (Nginx) no existen todavía.
  - Con Auth0 real: el harness usa un stub. No se probaron el 401 con un token vencido de verdad ni
    `getAccessTokenSilently({ cacheMode: 'off' })` contra el tenant (sí con tests unitarios del cliente).
  - Safari y Firefox (solo Chromium).
  - El contrato: es la propuesta de Francisca con nuestros ajustes, sin confirmar en `contratos/openapi.yaml`.

## Pendiente / para coordinar
- **Con Francisca (S17):** confirmar los ajustes del contrato y dejarlo en `contratos`; el servidor de prueba sirve
  de referencia ejecutable (backlog 100, `reset`, `retry`, latido 15 s). Si cambia algo, se ajusta `src/lib/feed.js`.
- **Con Jorge y Francisca (S19):** `VITE_FEED_URL=https://tiburonshark.me/api/feed/stream` en el build de prod;
  CORS para `https://app.tiburonshark.me` con `Authorization` y `Last-Event-ID` en `Access-Control-Allow-Headers`;
  `proxy_buffering off` y `proxy_read_timeout` mayor que el latido.
- **S24:** el runbook tiene que tener las anclas `#wallet-lenta`, `#consumidor-detenido-o-atrasado`,
  `#ledger-desviado`, `#saga-atascada-o-fallando` y `#outbox-con-atraso` (las usa el enlace "Runbook"). El nombre de
  la alerta en `payload.alert` debe ser uno de `wallet_slow`, `consumer_stalled`, `ledger_drift`, `saga_stuck`,
  `outbox_lag` (S16).
- Push, PR con 2 revisores, deploy del front con `VITE_FEED_URL` y prueba con login real.

## Fuera de alcance
- El backend del feed, la tabla `feed_events` y el webhook de alertas (S17, S16).
- La location de Nginx y el CORS (S19).
