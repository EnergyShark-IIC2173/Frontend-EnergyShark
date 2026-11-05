# AI log — S12: mercado en vivo (RF02)

**Fecha:** 2026-11-01
**Integrante:** Esteban
**Herramienta:** Claude Code (Opus 5.5), modo agéntico (edita archivos y corre comandos en el repo), en la extensión de VS Code. Sin subagentes.
**Unidad del roadmap:** S12 — "Mercado en vivo, RF02" (`docs/E2 Road Map.md` del backend). Integra con S6 (Francisca), que aún no existe. Prompt literal: "Sigamos con la S12 en el frontend"
**Rama:** `feat/e2-s12-mercado`, apilada sobre `feat/rediseno-studylicc` (PR #12).
**Referencias:** enunciado E2 (RF02, anomalía 6 y "Referencia API v3": `offer`, `offer-updated`, `offer-withdrawn`, `market-closed`, `distance-table` extendida), DF-024, DF-025, DF-029.
**Detalle (prompt literal y resultado):** `prompt/tarea-s12-mercado/01-libro-de-ofertas.md`

## Objetivo de la sesión
La vista de RF02 sin esperar a S6: el libro de ofertas con transporte y precio efectivo, las rutas deshabilitadas
marcadas, y la tarifa punitiva en Conectividad.

## Flujo de trabajo
1. **Lectura:** schemas v3 de `offer*` y `market-closed`, ejemplos y reglas de la Referencia API v3 (PDF),
   `DistanceTable.jsx`, `transport.js`, `useApiQuery`, el kit `ui/`.
2. **Decisión humana:** ubicación del libro. Esteban eligió "Vista nueva Mercado (Recommended)" frente a juntarla
   con Conectividad en pestañas.
3. **Docs antes que el código** (RDOC01): DF-038 (vista, forma propuesta de `GET /api/market/offers`, cálculo en el
   front, filas especiales, polling, mocks) y DF-039 (Conectividad), commit `91a79a4`.
4. **Implementación:** lógica con tests (`75a4059`), endpoint y mocks (`6847e07`), vista y Conectividad (`cfcaa97`).
5. **Verificación:** lint, tests, build y capturas headless con un harness temporal (no se commitea).

## Qué se construyó
- **Precio efectivo en el front** (`src/lib/market.js`): cruza el libro con la `distance-table` que ya expone
  master. Ruta habilitada: `round2(km × transportCost)`; deshabilitada: `round2(km × disabledRouteTransportCost)`,
  o "Tarifa punitiva" sin cifra si el campo no viene. Precio efectivo = precio + transporte por kWh.
- **Filas especiales:** la oferta propia ("Propia", sin precio efectivo: sería `SELF_TRADE`) y vendedores sin ruta
  en la tabla ("Sin ruta").
- **Vista "Mercado"**: ciclo y cuenta regresiva al cierre, tres indicadores (ofertas vigentes, mejor precio
  efectivo, rutas deshabilitadas), tabla ordenable por precio, `remaining` y precio efectivo (`aria-sort`), fila
  rosada en rutas deshabilitadas, estados de carga, 404 (S6 sin desplegar), error, mercado cerrado y libro vacío.
  Polling: libro 5 s, tabla 10 s.
- **Conectividad:** transporte de las rutas deshabilitadas con la tarifa punitiva, la tarifa en el aviso y "Rige la
  última tabla publicada por la central".
- **Mocks** tras `VITE_USE_MOCKS`: seis vendedores (uno propio y uno con ruta deshabilitada) con `remaining` que baja
  durante un mercado de 10 min.

## Verificación
- `npx eslint src` sin errores; `vite build` OK.
- `node --test src/lib/*.test.js`: 33/33 (5 nuevos de `market.test.js`). `npm test` sigue fallando en Node 20 por el
  glob entre comillas (conocido; pasa en Node 22).
- Capturas headless con mocks: Mercado y Conectividad en claro y oscuro a 1280 px; Mercado a 375 px dentro de un
  iframe (Chrome headless no baja de 500 px de viewport, lo que al principio pareció un desborde). Sin scroll
  horizontal de la página; la tabla se desplaza dentro de su card (DF-011).
- **No se probó con login real ni contra S6**, que no existe.

## Decisiones y correcciones de la IA
- El mock abría el mercado "hace 4 min" respecto de ahora, así que la cuenta regresiva no avanzaba. Se cambió a un
  mercado que abre en cada múltiplo de 10 min.
- El primer desborde a 375 px venía de la captura, no de la vista: se midió `innerWidth` (500) antes de tocar CSS.

## Pendiente / dependencias
- S6 (Francisca): `GET /api/market/offers` con la forma de DF-038 y `disabledRouteTransportCost` en
  `GET /api/distance-table`. Avisar antes de que lo implemente.
- Quitar los mocks en S23.
