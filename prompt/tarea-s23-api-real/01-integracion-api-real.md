# S23.1 — Integración del front con la API real y retiro de los mocks

## Objetivo
Que las siete vistas de la E2 lean master en vez de los mocks (DF-025), con estados vacíos y de error, para la
entrega del viernes 6/nov (RF01, RF02, RF04, RF05, RF06, AD5).

## Contexto
Jueves 5/nov. El backend tiene en `main` S5, S6, S7, S8 y S9; la E-API parte 2 (oferta, bids, swaps y transporte
en el detalle de ciclo) está en la PR #54 del backend. El front de la E2 (PRs #10–#15) está en `main` con mocks.
Las formas reales de saldo, swaps, estrategia y métricas coinciden con los mocks; el libro de ofertas de S6 no:
otra ruta y precio efectivo calculado en master. `npm test` fallaba en Node 20.19. El front publicado sigue siendo
el de la E1.

## Prompt utilizado
```
Haz push y abre la PR a main, luego empieza de inmediato con S23, si necesitas que te de algo como valores de la
wallet que deberían ir en el .env te los doy
```
(El agente respondió que el front no necesita valores de la wallet: la API key vive solo en el `.env` del connector.)

Prompt de la subtarea generado a partir de eso:
```
Rama feat/e2-s23-api-real desde main del front. DF-045 primero. RF02: GET /api/market/book; bookRows usa
transportPerEnergy, effectivePrice y routeEnabled de master y solo clasifica la fila (propia por cityId de la
distance-table); quitar cuenta regresiva y columna Actualizada, que el libro real no trae. Borrar src/mocks,
.env.mocks, dev:mocks y VITE_USE_MOCKS. Etiquetas de bid proposed y accepting; "En cola" si sentAt es null;
routeEnabled === false para la ruta deshabilitada; trade-recorded como "Transporte registrado". npm test sin
comillas. Verificar con master de la rama de #54 sobre Postgres sembrado (todas las vistas), con base vacía y con
master caído; harness temporal con Auth0 falso y Chrome headless; claro/oscuro, 1280 y 375. README a la E2.
De paso, en #54: disabledRouteTransportCost en GET /api/distance-table.
```

## Resultado esperado
Lint, tests y build limpios; cada vista con datos reales sin errores de consola ni HTTP ≥ 400 inesperados; estados
vacío y de error visibles; guardar una versión de la estrategia contra master real.

## Resultado obtenido
- Commits: DF-045; libro real; retiro de mocks y `npm test`; estados de bid y bordes del detalle; documentación.
- Intento fallido de `npm test`: `node --test src/lib/` funciona en Node 20 pero en Node 22 da `fail 1`; quedó el glob
  sin comillas, que expande la shell (56/56 en 20.19 y 22.23).
- El borrado de los mocks quedó primero dentro del commit de DF-045 (estaba en el stage); se rehicieron los commits
  locales, sin push, para que la decisión quede sola y antes del código.
- Hallazgo en la prueba: en un ciclo de venta la última operación decía "Transporte cobrado", pero la fila es de
  auditoría (el vendedor no paga); se cambió a "Transporte registrado".
- Backend (#54): `disabledRouteTransportCost` en `/api/distance-table`; Conectividad muestra la cifra punitiva.

## Archivos modificados
- `docs/decisiones-frontend.md`, `README.md`, `.env.example`, `package.json`
- `src/lib/market.js`, `src/lib/market.test.js`, `src/components/MarketBook.jsx`, `src/api/endpoints.js`
- `src/lib/status.js`, `src/components/cycles/CycleDetail.jsx`
- Borrados: `src/mocks/*`, `.env.mocks`
- `docs/ai_docs/2026-11-05-esteban-s23-api-real.md`, `prompt/tarea-s23-api-real/01-integracion-api-real.md`, `prompt/README.md`

## Tests ejecutados
```
npm run lint && npm test && npm run build
npx -p node@22 ... npm test
# Harness (no se commitea): Postgres 16 en Docker, migraciones de feat/e-api-detalle-ciclo-p2, datos sembrados,
# master en :3001 sin auth; Vite con alias de @auth0/auth0-react a un stub; puppeteer-core con Chrome headless
node run.mjs <out> light 1280 | dark 375     # recorre las 7 vistas y abre cycle-A y cycle-B por el buscador
node strategy.mjs <out>                      # span 70 (inválido) y 30 (válido)
```

## Resultado de los tests
- Lint limpio; 56/56 tests; build OK (aviso de chunk > 500 kB, ya existente).
- Con datos: sin errores de consola ni HTTP ≥ 400. Mercado: 5 ofertas, mejor precio efectivo 395,5 (COR), MET con
  120,51 punitiva, SHK "Propia", VLP "Sin ruta". `cycle-A`: oferta con una actualización "En cola", 4 bids, swaps
  y "Última operación" en `swp-77`. `cycle-B`: `swp-61` con transporte 361 500 y "Ruta deshabilitada".
- Estrategia: span 70 frenado en el formulario (sin POST); span 30 → POST 201, v2 vigente y en el historial.
- Base vacía: estados vacíos en las siete vistas (solo los 404 esperados del buscador). Master caído: "No se pudieron
  cargar los datos" con Reintentar (HTTP 502 del proxy).
- 375 px en oscuro: sin problemas; la tabla del libro se desplaza dentro de su tarjeta.

## Decisiones tomadas
- El precio efectivo es el de master — una sola fuente para el número con el que compra S8 (DF-045).
- Un solo estado vacío para "nadie publicó" y "mercado cerrado" — el libro real no distingue los dos casos.
- Sin mocks — para trabajar sin producción se usa master local, como en la E1.

## Bloqueos
Ver la app contra producción necesita el deploy de master con #54 y el del front (pipeline S15 de Jorge).

## Observaciones
- No verificado: login real con Auth0 ni CORS del API Gateway con estas rutas; se prueba cuando esté desplegado.
- Las tablas anchas se desplazan en horizontal a 1280 px (Mercado, Experimento, NACKs), igual que antes de S23.
