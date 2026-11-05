# AI log — S23: integración con la API real

**Fecha:** 2026-11-05
**Integrante:** Esteban
**Herramienta:** Claude Code (Opus 5.5), modo agéntico (edita archivos y corre comandos en el repo)
**Unidad del roadmap:** S23 — integración con la API real y pulido. Prompt literal: "Haz push y abre la PR a main, luego empieza de inmediato con S23, si necesitas que te de algo como valores de la wallet que deberían ir en el .env te los doy"
**Rama:** `feat/e2-s23-api-real`, desde `main` (`573eb3e`, con #10–#15)
**Referencias:** `docs/decisiones-frontend.md` (DF-024..044), backend `master/src/controllers/*` en `main` y en `feat/e-api-detalle-ciclo-p2` (#54), ADR-002 addendum S6
**Detalle por subtarea (prompts literales y resultados):** `prompt/tarea-s23-api-real/`

## Objetivo de la sesión
Dejar las siete vistas leyendo master, sin mocks, antes de la entrega del viernes 6/nov.

## Flujo de trabajo
1. **Comparación de formas.** Antes de S23, en la misma sesión, se cruzaron los controllers del backend con los
   mocks: saldo, swaps, estrategia y métricas coinciden; el libro de S6 no; el detalle de ciclo necesitaba la
   E-API parte 2 (#54 del backend, hecha antes en la sesión).
2. **Docs antes que el código:** DF-045 en su propio commit.
3. Implementación en tres commits (libro, retiro de mocks, estados de bid y detalle).
4. Verificación con un harness temporal contra master real y Postgres sembrado.

## Qué se construyó
- `src/lib/market.js` — `bookRows(book, ownCity)` usa `transportPerEnergy`, `effectivePrice` y `routeEnabled` de
  master; ya no recalcula con la distance-table. `routeTransport` se mantiene para Conectividad.
- `src/components/MarketBook.jsx` — `GET /api/market/book`; sin cuenta regresiva ni columna "Actualizada" (el libro
  real no las trae; el reloj está en la sidebar).
- `src/api/endpoints.js` — una línea por endpoint, sin mocks. Borrados `src/mocks/`, `.env.mocks`, `dev:mocks` y
  `VITE_USE_MOCKS`.
- `src/lib/status.js`, `src/components/cycles/CycleDetail.jsx` — estados de bid `proposed` y `accepting`;
  actualización de oferta "En cola"; "Ruta deshabilitada" solo con `routeEnabled === false`; `trade-recorded` como
  "Transporte registrado".
- `package.json` — `npm test` con el glob sin comillas (Node 20 y 22).
- `README.md` — vistas de la E2 con su endpoint y requisito; sin mocks.

## Hallazgos / Errores encontrados y corregidos
- **`npm test` en Node 20.** El glob entre comillas no se expande en 20.19 → se probó `node --test src/lib/`, que
  falla en Node 22 → glob sin comillas, que expande la shell: 56/56 en ambas.
- **Commit de DF-045 con código.** El borrado de los mocks ya estaba en el stage y entró en el commit de la decisión →
  se rehicieron los commits locales (sin push) para respetar "docs antes que el código".
- **"Transporte cobrado" en un ciclo de venta.** La captura de `cycle-A` mostró esa etiqueta para una fila del ledger
  con delta 0 (el vendedor no paga) → "Transporte registrado".
- **Conectividad sin cifra punitiva.** `/api/distance-table` no exponía `disabledRouteTransportCost` → se agregó en el
  backend (#54).

## Verificación
- `npm run lint` limpio; `npm test` 56/56 (Node 20.19.3 y 22.23.4); `npm run build` OK.
- Harness (no se commitea): Postgres 16 en Docker con las migraciones de la rama de #54, master en `:3001` sin auth,
  Vite con `@auth0/auth0-react` reemplazado por un stub, Chrome headless con `puppeteer-core`:
  - Con datos (ciclos de venta, compra, E1 y uno en curso; libro con ruta caída; NACKs de pares; reconciliación;
    swap en curso; métricas de dos spans): las siete vistas sin errores de consola ni HTTP ≥ 400. Cifras: mejor
    precio efectivo 395,5 (COR = 345,5 + 50), MET 290 + 120,51 punitiva = 410,51; `swp-61` con transporte
    3 000 × 120,5 = 361 500.
  - Estrategia: span 70 rechazado en el formulario; span 30 → `POST /api/strategy` 201 y v2 vigente.
  - Base recién migrada: estados vacíos en todas las vistas. Master caído: estado de error con Reintentar.
  - Claro y oscuro; 1280 y 375 px.
- **No verificado:** login real con Auth0, CORS del API Gateway con las rutas nuevas y la app desplegada en S3 +
  CloudFront; dependen del deploy.

## Pendiente / para coordinar
- **Con Jorge:** deploy de master con #54 y del front (S15); invalidar CloudFront.
- **Con todos:** revisar esta PR y la #54.
- Probar en producción con login real apenas se despliegue.
