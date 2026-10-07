# API.11 — Pruebas A–E: estáticas, producción sin token, backend local, navegador y procedimiento del POST real

## Objetivo
Verificar la integración en cada nivel posible sin tocar la central. Cada resultado va con su comando y su salida literal.

## Contexto
- 10 commits de implementación sobre `main`.
- Restricciones del humano:
  - sin POST real a producción;
  - POST local solo con datos inválidos (400) o un ciclo inexistente (409);
  - sin secretos en la salida;
  - sin modificar el repo del backend.

## Prompt utilizado
Extracto literal del prompt maestro (completo en `01`): bloque "FASE 3 — PRUEBAS", de "A. Estáticas: …" a "E. POST real a producción: NO lo hagas. … avisando antes al equipo.".

Ajustes literales de Esteban al plan que aplican aquí (puntos 1 y 2 del primer rechazo, completos en `01`):
```
1. En 3C, antes de migrar imprime DB_HOST y DB_NAME y aborta si no son localhost y
   energyshark_tmp.
2. En 3B, interpreta el curl a /api/distance-table: 401 = ruta existe tras el authorizer;
   404 con {"message":"Not Found"} = el Gateway no tiene la ruta (hallazgo para Jorge,
   no se arregla redesplegando master).
```
Mensaje literal de Esteban con los resultados de 3D (los placeholders `<…>` son tal como llegaron):
```
Termine la checklist de 3D. Resultados:
- V2: paginado, 13 páginas, funciona. V4: el listado carga. V5: 5 registros, del 30-09 al 02-10.
- V3: estado vacío ("La central todavía no publica una distance-table"), esperando 5 minutos
  con polling de 60 s. Network: /api/distance-table → <STATUS Y CUERPO QUE VEAS>.
- Conteos de requests por minuto: <LO QUE HAYAS MEDIDO, O "no medido">.
- POST real de V4: no probado (la próxima ventana abre ~02:40; lo haremos con el equipo avisado).
Antes de la Fase 4, prueba el mapeo de V3 con el ejemplo de la tabla de distancias del
contrato (enabled true y false, varios destinos) y reporta el resultado. En el AI log,
V3 va como "verificado: estado vacío contra producción (200, sin datos); no verificado:
render con datos reales de la central", y el POST real y el login en app.tiburonshark.me
en "No verificado". Avisos a Pedro/Jorge en Hallazgos: V3 sin datos, max-age 0 del preflight.
Después sigue con la Fase 4.
```
Prompt de la subtarea (extracto literal del plan aprobado, `~/.claude/plans/pasted-content-id-8434-eres-un-jolly-bunny.md`, líneas 128-154):
```
## Fase 3 — Pruebas (cada una con el comando y el resultado literal)
- **A.** `npm run lint`, `npm run build` y `npm test` (`node --test`).
- **B.** Curl a producción sin token:
  - `/health`;
  - `/api/cycles` (se espera 401);
  - `/api/distance-table` sin token: 401 = la ruta existe detrás del authorizer; 404 `{"message":"Not Found"}` = el Gateway no tiene la ruta, que es un hallazgo para Jorge y no se resuelve redesplegando master. Un 404 HTML de Express sería master sin #20;
  - preflight CORS con `http://localhost:5173` y `https://app.tiburonshark.me`. **Si el segundo falla, te aviso en grande.**
- **C.** `git -C EnergyShark fetch`, y luego `git worktree add ../energyshark-main-tmp origin/main`, que deja el worktree en `E1/E1/energyshark-main-tmp` con HEAD separado y no cambia la rama del backend.
  - Instalo master con `npm ci`.
  - `createdb energyshark_tmp` en el Postgres nativo (antes reviso el acceso con `psql -l`).
  - Las variables `DB_*` van inline, sin `AUTH0_*` ni `NODE_ENV`, y **no escribo `master/.env`**.
  - **Guarda:** imprimo `DB_HOST` y `DB_NAME` y aborto si no son `localhost` y `energyshark_tmp`.
  - Luego `npx sequelize db:migrate` y `PORT=3001 node src/server.js`.
  - Siembro por SQL: ciclos `closed`/`consuming` y uno `negotiating` con la ventana vencida, más `ledger_events`, `pending_operations`, `rejected_messages` y `distance_tables`. No creo ningún ciclo en ventana abierta, así ningún POST válido es posible.
  - El **connector no se levanta**: consumiría la cola real.
  - Curl de todos los endpoints pedidos: `?limit=1`, `?status=paid`, `?status=foo` → 400, `?kind=`, `:id`, y POST inválido (400) más ciclo inexistente (409). Comparo cada forma con lo que lee cada componente.
  - Opcional: front con `VITE_API_BASE_URL= npm run dev`. La variable de shell gana sobre `.env`, así que el proxy funciona sin escribir archivos.
  - Cierre: mato master, `dropdb energyshark_tmp`, `git worktree remove` y `git worktree prune`.
- **D.** `npm run dev` en :5173 contra producción → **ALTO** con la URL y una checklist por vista:
  - 200 con Authorization;
  - estados de carga, error y vacío;
  - paginación;
  - /health;
  - conteo de requests por minuto con el polling activo. En dev, StrictMode duplica la carga inicial; eso es esperado.

  No tengo herramientas de navegador cargadas, así que la revisión es tuya y yo te guío.
- **E.** No hago POST real. Escribo el procedimiento: ventana abierta, aviso al equipo, take con cantidad mínima y `pricePerEnergy = generationCost`, y qué observar.
```

## Resultado esperado
- A: 0 errores.
- B: `/health` 200 y `/api/cycles` 401; CORS informado para ambos orígenes.
- C: formas iguales a las que consume cada vista, POST local solo 400/409, sin filas creadas y limpieza completa.
- D: revisión humana con resultados reportados.
- E: procedimiento escrito.

## Resultado obtenido
**A. Estáticas**
- `npm run lint` → sin salida, `exit=0`.
- `npm test` → `# tests 19 · # pass 19 · # fail 0`.
- `npm run build` → `index-BolQkwMp.js 529.48 kB │ gzip: 157.70 kB`, con el aviso "Some chunks are larger than 500 kB".
  - **Corrección:** en el chat el agente dijo primero que el aviso "ya existía en main", sin haberlo medido. Al medir con un worktree temporal de `main` y `node_modules` enlazado salió 299,53 kB **sin** aviso, lo que contradecía la afirmación.
  - Comparación justa: ese worktree no tiene `.env`, así que también se midió HEAD igual (322,79 kB → +23,26 kB).
  - Por último se compilaron `main` y la rama **en el mismo directorio** (con `.env`): `main` da **506,20 kB, con el aviso**, y la rama 529,48 kB.
  - Conclusión verificada: el aviso ya estaba en `main`; esta rama suma +23,28 kB.

**B. Producción sin token (2026-10-07 03:59 UTC)**
- `curl -i https://api.tiburonshark.me/health` → `HTTP/2 200`, `content-type: text/html; charset=utf-8`, cuerpo `ok`.
- `curl -i …/api/cycles` → `HTTP/2 401`, `{"message":"Unauthorized"}`, con `apigw-requestid` (es el Gateway).
- `curl -i …/api/distance-table` → `HTTP/2 401 {"message":"Unauthorized"}`.
  - Se probaron rutas inventadas: `…/api/ruta-inexistente-xyz` y `…/otra-raiz-xyz` también dan `401`. **El Gateway tiene una ruta catch-all**, así que el 401 solo dice que la ruta cae tras el authorizer. No dice nada de master.
  - No apareció el caso `404 {"message":"Not Found"}`.
- **Preflight CORS:**
  - `Origin: http://localhost:5173` → `HTTP/2 204`, `access-control-allow-origin: http://localhost:5173`.
  - `Origin: https://app.tiburonshark.me` → `HTTP/2 204`, `access-control-allow-origin: https://app.tiburonshark.me`.
  - En ambos: `access-control-allow-methods: GET,POST`, `access-control-allow-headers: authorization,content-type`, **`access-control-max-age: 0`**.

**C. Backend local** (worktree `../energyshark-main-tmp` de `origin/main` `c58ccbd`; Postgres nativo; **datos sintéticos**)
- `git fetch`: `origin/main` sigue en `c58ccbd`. La rama del backend siguió en `main` antes y después.
- **Base de datos:**
  - `createdb energyshark_tmp` OK.
  - La guarda imprimió `DB_HOST=localhost DB_NAME=energyshark_tmp` antes de migrar.
  - `npx sequelize db:migrate` → 12 migraciones.
- **Arranque de master:** log `[auth] sin AUTH0_ISSUER_BASE_URL/AUTH0_AUDIENCE: API SIN autenticación (solo local)` y `Master escuchando en puerto 3001`.
- **Datos sembrados:** 3 ciclos, 3 `ledger_events`, 5 `pending_operations`, 3 `rejected_messages` y 2 `distance_tables`. Ninguno con la ventana abierta.
- **Valores esperados, calculados a mano antes de consultar:**
  - budget `1000000 − 1000×65.49 + 500×68.76 = 968890`;
  - energía `(37831.26 − 12152.44) + (1000 − 500) = 26178.82`.
- **`/api/cycles`:**
  - `GET /api/cycles/cycle-test-a` → `finalBalances {'budget': 968890, 'energy': 26178.82}`, igual a lo calculado, y `lastOp give 15:40:04.181Z` contra `paidAt 15:40:04.184Z`.
  - `GET /api/cycles` → orden `['cycle-test-c', 'cycle-test-b', 'cycle-test-a']` (`createdAt DESC`); `?limit=1` → `page 1 limit 1 total 3 totalPages 3`.
  - `cycle-test-b` → `statusStatement`, `negotiationReportSent`, `finalBalances.*` y `lastOperationApplied` todos `None`.
  - `/api/cycles/no-existe` → `{"error":"cycleId no existe"} [404]`.
- **`/api/negotiations`:**
  - Sin filtro → 5 filas `id DESC`. `?status=paid` → 1, `?status=proposed` → 1 (`requested` con `attempts 0`), `?status=confirmed` → 1.
  - `?status=foo` → `{"error":"status inválido (proposed | confirmed | paid | expired | rejected)"} [400]`.
  - `?limit=2&page=2` → `page=2 limit=2 total=5 totalPages=3`.
  - `/api/negotiations/1` → 200, con la forma completa de Negotiation. `/999` → 404 `negociación no encontrada`; `/abc` → 400 `id inválido (debe ser un número)`.
- **`/api/messages/rejected`:** 3 filas. `?kind=duplicate|nack|discarded` → 1 cada uno. `?kind=foo` → 400.
- **`/api/distance-table`:** devuelve la tabla de `sent_at` más reciente (no la `OLD`).
- **POST local** (solo los casos permitidos):
  - `quantity` como string `"100"` → 400 `quantity debe ser un número positivo`;
  - `quantity 0` → 400;
  - `direction sell` → 400;
  - `pricePerEnergy -1` → 400;
  - `cycleId ""` → 400;
  - `cycle-no-existe` → **409** `el ciclo cycle-no-existe no existe`;
  - JSON malformado → 400.
  - `pending_operations` **antes=5 después=5**.
- **Limpieza:** master detenido (`:3001 libre`), `dropdb energyshark_tmp` OK, `git worktree remove` + `prune`. `git worktree list` muestra solo `EnergyShark c58ccbd [main]`.

**Smoke test de render** (adicional al plan): un script en el scratchpad usa `vite.ssrLoadModule` con `useApiQuery` sustituido por fixtures y `react-dom/server`.
- Escenarios: V2 4, V3 6 (incluido el ejemplo del contrato), V4 4 y V5 3.
- Todos renderizan sin excepción y con los textos y cifras esperados. Detalle en API.6 a API.9.

**D. Navegador** (`npx vite --port 5173 --strictPort` contra producción; login de Esteban)
- Resultados reportados por Esteban (literal arriba): V2 con 13 páginas; V4 carga el listado; V5 con 5 registros del 30-09 al 02-10; V3 en estado vacío durante 5 minutos.
- **No capturado:** status y cuerpo de `/api/distance-table`. Llegó el placeholder sin completar.
- **No medido:** conteo de requests por minuto con el polling. Llegó el placeholder sin completar.
- **Incidente de la sesión:** al comprobar que el servidor de desarrollo leía `VITE_API_BASE_URL`, el agente hizo `curl` a `/src/api/client.js` (transformado por Vite). Así **imprimió en la salida de la terminal** el dominio de Auth0, el client ID y el audience, enmascarando solo la URL.
  - Viola la regla 4 del prompt maestro.
  - No quedó en ningún archivo ni commit. Se informó a Esteban de inmediato.
  - Es un client ID de SPA, que ya viaja en el bundle público, pero la regla lo prohíbe igual. Los valores no se repiten aquí.

**E.** El procedimiento del POST real está en el AI log (sección "Procedimiento propuesto para el POST real").

## Archivos modificados
Ninguno del repo. Solo archivos temporales en el scratchpad de la sesión (seed SQL, harness de render, mapeo de distance-table), no versionados.

## Tests ejecutados
Los listados arriba, con su comando.

## Resultado de los tests
- A: 0 errores, 19/19.
- B: CORS OK en ambos orígenes.
- C: todas las formas coinciden y el POST local dejó 0 filas creadas.
- D: parcial (ver arriba).
- Smoke test: 17/17 escenarios.

## Decisiones tomadas
- **Backend local sin Docker:** el daemon no estaba corriendo. Se usó el Postgres nativo con una BD temporal (decisión humana).
- **El connector no se levantó:** consumiría la cola real del curso.
- **`master/.env` no se escribió:** las variables se pasaron por el entorno de la shell.
- **POST a `cycle-test-c`** (ciclo existente con la ventana vencida, que daría 409 "no está en ventana") **no se hizo**: no es ni "datos inválidos" ni "ciclo inexistente", que es lo único permitido.

## Bloqueos
- POST real: pendiente de una ventana abierta y del aviso al equipo.
- Login en `app.tiburonshark.me`: depende del deploy.

## Observaciones
- Con un catch-all en el Gateway, un 401 sin token nunca prueba si una ruta existe en master. Para eso hace falta un request con token, como el de 3D.
- `access-control-max-age: 0` obliga a un preflight por cada request autenticado.
