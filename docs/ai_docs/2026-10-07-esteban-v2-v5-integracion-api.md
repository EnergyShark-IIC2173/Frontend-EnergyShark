# AI log — V2–V5: integración del frontend con la API real

**Fecha:** 2026-10-07. La sesión empezó el 2026-10-06 por la noche y terminó el 2026-10-07.
**Integrante:** Esteban
**Herramienta:** Claude Code (Opus 5.5), modo agéntico (edita archivos y corre comandos en el repo), en la extensión de VS Code.
- Modo plan con aprobación: el plan fue rechazado 3 veces con ajustes antes de aprobarse.
- Hubo un ALTO para la prueba en el navegador.
- Sin subagentes.

**Unidad del roadmap:** V2–V5. Reemplazar los mocks por la API real (RF01, RF02, RF04, RF05), con estados de carga, error y vacío (parte pendiente de V6). Prompt literal: el prompt maestro completo está en `prompt/tarea-integracion-api/01-reconocimiento-y-plan.md`.
**Rama:** `feat/integracion-api-real`, desde `main` (`2d6bb05`).
- Esteban cambió la base durante la planificación: V6 ya estaba mergeado en `main` (PR #4).
- Antes de crear la rama se verificó `git merge-base --is-ancestor ada97fb main` → `0`.

**Referencias:**
- Front: `CLAUDE.md`, `docs/decisiones-frontend.md` (DF-014 a DF-022) y `docs/integracion-backend.md` (informe de otro agente, sin trackear, usado como hipótesis).
- Backend `JorgeUribeGo/EnergyShark` en `origin/main` `c58ccbd`:
  - `master/src/controllers/*`;
  - `connector/src/db/ledgerRepo.js`, `negotiationsRepo.js` y `connector/src/negotiation.js`;
  - `docs/contracts/openapi.yaml`, `AGENTS.md`, `docs/ai_docs/README.md`.

**Detalle por subtarea (prompts literales y resultados):** `prompt/tarea-integracion-api/` (01 a 12)

> **Nota de honestidad (RDOC01/RDOC02):**
> - Este AI log, `AGENTS.md` y los registros `prompt/tarea-integracion-api/` se escribieron **después** de implementar, al cierre de la sesión. Solo las decisiones DF-014 a DF-022 se commitearon antes del código (`bc56b59`).
> - Los "prompts de subtarea" de `03` a `12` son extractos literales del plan aprobado, que se escribió durante la sesión. El de `01` está **reconstruido** al cierre.

## Prompt de la sesión
El prompt maestro de Esteban está literal y completo en `prompt/tarea-integracion-api/01-reconocimiento-y-plan.md`, junto con sus 3 rechazos del plan. Los mensajes posteriores (rename y resultados de 3D) están literales en `02` y `11`.

## Objetivo de la sesión
Conectar las 4 vistas a la API de master a través del API Gateway, sin dependencias nuevas, con paginación, polling y estados de carga, error y vacío, sin romper el diseño V6. Dejar todo probado contra producción (sin token), contra un backend local y en el navegador, sin crear propuestas reales en la central.

## Flujo de trabajo
1. **Reconocimiento en modo plan** (API.1).
   - El backend se leyó con `git show origin/main:…`: el modo plan no permite crear el worktree.
   - Se verificaron contra el código las afirmaciones críticas del informe.
2. **Decisiones humanas** (AskUserQuestion): layout de V2, capacidad del give y forma de correr el backend local. Luego 3 rechazos del plan, con 8 ajustes, el cambio de base a `main` y verificaciones previas a la rama.
3. **Rename** de `Claude.md` → `CLAUDE.md` (API.2, `b7754b8`). El agente se detuvo al ver que no calzaba y Esteban decidió renombrar.
4. **Docs antes que el código** (RDOC01): DF-014 a DF-022, commit `bc56b59`.
5. **Implementación**, un commit por paso (API.4 a API.10), con lint y build en verde y el grep de secretos antes de cada commit.
6. **Pruebas A–E** (API.11):
   - estáticas;
   - curl a producción sin token;
   - backend local con datos sintéticos;
   - smoke test de render;
   - ALTO para el navegador, con login de Esteban.
7. **Documentación** (API.12): `AGENTS.md` (`644fe2a`), este log y los prompts.

## Decisión humana
- **V2:** "1ª abierta, resto plegable (Recommended)", con `<details>` nativo (DF-020).
- **V4, capacidad del give:** "Advertir y permitir (Recommended)". El tope sí bloquea (DF-017).
- **3C:** "Postgres nativo, BD temporal (Recommended)".
- **Ajustes al plan:**
  - guarda de BD en 3C;
  - interpretación del 401/404 de distance-table;
  - script de test: el glob pedido no funciona en Node 20 (ver Hallazgos);
  - `lastOperationApplied` siempre en la cabecera;
  - datos sintéticos declarados;
  - confirmar DF-013;
  - `eslint-disable` puntual si hacía falta (no hizo falta);
  - hallazgos del compose y de JWT.
- **Base `main`** en vez de `feat/connect-front-back`.
- **Renombrar `Claude.md`** en un commit propio, antes de DF.
- **POST real:** no hacerlo. Se hará con el equipo avisado, en una ventana abierta.

## Qué se construyó
- **`src/api/client.js`:**
  - `ApiError(status, message, body, {authRequired})` y `buildQuery`;
  - lectura según content-type (texto plano de `/health`, 204);
  - Content-Type solo con body;
  - `login_required`/`consent_required` → `authRequired`.
- **`src/api/endpoints.js`:** una función por endpoint. `createNegotiation` manda `Number()` y no genera id ni idpk.
- **`src/api/useApiQuery.js`:**
  - devuelve `{data, loading, error, reload, setData, relogin}`;
  - refs para `apiFetch` y `fetcher`, descarte de respuestas desordenadas;
  - polling silencioso que se limpia al desmontar y se salta con la pestaña oculta;
  - `pollMs` fijo o como función de la data.
- **`src/lib/`** (puro, 19 tests):
  - `format` (es-CL, 24 h);
  - `status` (traducciones y tonos);
  - `negotiation` (`round2`, `priceCap` en aritmética entera, `giveSpare`, `paymentAmount`, `validateProposal`);
  - `cycles` (`findOpenCycle`, `estimateNextWindow`, `matchLastOperation`, `reportPending`).
- **`src/components/ui/`:**
  - `States.jsx` (`LoadingState`, `ErrorState` con Reintentar y "Volver a iniciar sesión", `EmptyState`, `StaleNotice`);
  - `Pagination.jsx`, `ViewHeader.jsx`;
  - tono `violet` en `Badge` (11,72:1 sobre `surface`) e ícono `chevron`.
- **V5 `RejectedMessages.jsx`:** paginado, filtro `kind`, discarded en neutral, `type/msgId/idpk` truncados con `title`, polling de 15 s.
- **V2 `CycleHistory.jsx`:**
  - limit 10, paginador y polling de 30 s solo en la página 1;
  - cabecera con `lastOperationApplied` siempre visible;
  - 6 secciones separadas dentro de `<details>`.
- **V4 `NegotiationAdmin.jsx`:**
  - listado con filtro y polling de 3 s solo con filas activas;
  - formulario con el ciclo abierto derivado y su cuenta regresiva, o la próxima ventana estimada;
  - validación, guarda de doble POST y errores 400/409 visibles.
- **V3 `DistanceTable.jsx`:** 404 → estado informativo; vacío; filas ordenadas; polling de 60 s.
- **Resto de archivos:**
  - `App.jsx`: `checkHealth` tolera texto plano;
  - `src/mocks/` eliminado;
  - `.env.example` sin valores;
  - proxy de Vite a `:3001`;
  - `package.json` con `"test": "node --test src/lib"`;
  - `AGENTS.md` en la raíz.

## Hallazgos / Errores encontrados y corregidos
**Del repo del front**
- **`Claude.md` trackeado con mayúsculas incorrectas.** `git ls-tree main -- CLAUDE.md` salía vacío.
  - **Causa:** git trackeaba `Claude.md`, y `core.ignorecase=true` de macOS lo ocultaba (se leía igual como `CLAUDE.md`). En Linux o CI, Claude Code no lo cargaría.
  - **Corrección:** rename en dos pasos, commit `b7754b8`. Se actualizaron 4 referencias; 3 citas literales se dejaron intactas (ver API.2).
- **El aviso de chunk > 500 kB ya estaba en `main`.**
  - El agente lo afirmó primero sin medirlo.
  - La primera medición con un worktree sin `.env` (299,53 kB, sin aviso) parecía contradecirlo.
  - Medido en el mismo directorio: `main` 506,20 kB con el aviso; la rama, 529,48 kB (+23,28 kB). Avisar al equipo del front; no es urgente (code-splitting).

**Del backend (avisar a Pedro y Jorge)**
- **`AGENTS.md` del backend dice "Las rutas de la API no validan JWT por sí mismas: lo hace el API Gateway".** Es falso desde #24: `master/src/app.js` aplica `requireAuth()` a todo menos `/health`. → **Pedro** (autor de #23).
- **`AGENTS.md` describe un docker compose local que no funciona (RDOC03).** Documenta `docker compose up --build`, pero:
  - `master/Dockerfile` fija `ENV NODE_ENV=production`, y con eso `requireAuth` lanza un error sin `AUTH0_*`. Contradice el comentario de `master/.env.example`: "En local, vacías = API sin auth";
  - `master/package.json` no tiene script `start`;
  - el servicio `db` del compose no publica su puerto, así que no sirve para correr master fuera de Docker.

  → **Pedro y Jorge**. En esta sesión se corrió con Postgres nativo y `node src/server.js`.
- **`/health` responde `text/plain` `ok`** (en producción: `content-type: text/html; charset=utf-8`), pero `openapi.yaml` promete JSON `{status, dbConnected, brokerConnected}`. El front tolera ambos (DF-018). → **Pedro/Jorge**: actualizar el contrato o el endpoint.
- **V3 sin datos en producción.** `/api/distance-table` responde 2xx con `distances` vacío: el estado vacío se mantuvo 5 min con polling de 60 s.
  - Indica que master tiene #20 desplegado, pero `distance_tables` está vacía: la central no publicó o el connector no la persistió.
  - El status y el cuerpo literales no se capturaron.
  - → **Pedro/Jorge**: revisar logs del connector y `SELECT count(*) FROM distance_tables` en el EC2. RF02 depende de esto.
- **El Gateway responde `access-control-max-age: 0`.** Cada request autenticado (`Authorization` no es un header "simple") lleva un OPTIONS previo: el polling duplica los requests. → **Jorge**: subir el max-age (p. ej. 600 s).
- **El Gateway tiene una ruta catch-all.** Sin token, cualquier ruta (`/api/ruta-inexistente-xyz`, `/otra-raiz-xyz`) da `401 {"message":"Unauthorized"}`. Un 401 sin token no prueba que una ruta exista. → **Jorge** (informativo).
- **`lastOperationApplied.appliedAt` de give/take ≠ `paidAt`, por milisegundos** (`.181` contra `.184` en un ciclo real, y lo mismo con los datos locales). El front empareja con tolerancia de 60 s (DF-020). Informativo para el backend.

**Del proceso**
- **El glob del script de test no funciona en Node 20.19.3.** El ajuste pedía `node --test "src/lib/**/*.test.js"`, pero `node --test "src/api/clien?.js"` → `Could not find '…/clien?.js'` (los globs existen desde Node 21). Se usó `node --test src/lib`.
- **Prompts de subtarea no literales**, corregido: los de `03` y `04` se escribieron primero de memoria y se rotularon "extracto literal". Se reemplazaron por el texto exacto del plan, insertado por script (ver API.12).
- **Incidente: valores de Auth0 en la salida de la terminal.** Al comprobar que el dev server leía `VITE_API_BASE_URL`, el agente hizo `curl` al módulo transformado `/src/api/client.js` y se imprimieron el dominio de Auth0, el client ID y el audience.
  - Viola la regla 4 del prompt maestro.
  - Quedó solo en la salida de la sesión: en ningún archivo ni commit.
  - Se informó a Esteban en el momento. Es un client ID público de SPA (viaja en el bundle), pero la regla lo prohíbe igual.
  - Corrección de práctica: no inspeccionar módulos transformados por Vite.

## Verificación
**Verificado** (comando → resultado):
- `npm run lint` → `exit=0`, 0 errores.
- `npm test` (`node --test src/lib`) → **19/19**.
  - Cifras verificadas a mano: `priceCap(65.49)=68.76`, `priceCap(10.1)=10.61`, `25678.82×68.76=1765675.66`, `giveSpare=0` con los datos reales del ciclo `cycle-248793`, y `fmt(119392553.0988)="119.392.553,1"`.
- `npm run build` → OK, 529,48 kB (el aviso de > 500 kB ya estaba en `main`, ver Hallazgos).
- **Producción sin token:**
  - `/health` → `200 ok`;
  - `/api/cycles` → `401 {"message":"Unauthorized"}`;
  - preflight CORS de `http://localhost:5173` **y** `https://app.tiburonshark.me` → `204` con su propio `access-control-allow-origin`. **CORS no bloquea el deploy.**
- **Backend local** (`origin/main` `c58ccbd`, Postgres nativo, BD `energyshark_tmp` borrada al final; **datos sintéticos sembrados por SQL, no de la central**):
  - todas las formas coinciden con lo que consume cada vista;
  - `finalBalances` = `{budget: 968890, energy: 26178.82}`, igual a lo calculado a mano: `1000000 − 1000×65.49 + 500×68.76` y `(37831.26 − 12152.44) + 500`;
  - `?status=foo` y `?kind=foo` → 400; `:id` inexistente → 404;
  - POST local: 6 casos inválidos → 400, `cycle-no-existe` → 409. `pending_operations` antes=5 después=5;
  - limpieza: `:3001` libre, `dropdb`, worktree eliminado. La rama del backend siguió en `main`.
- **Smoke test de render** (`vite.ssrLoadModule` + `react-dom/server`, `useApiQuery` con fixtures): **17/17 escenarios** (V2 4, V3 6, V4 4, V5 3), incluidos los casos con todo null y los errores con relogin.
- **Mapeo de V3 con el ejemplo del contrato:**
  - `openapi.yaml` no trae ejemplo, así que se usó el del enunciado (HGW, TAR, `enabled: true`) más 2 destinos sintéticos con `enabled: false`;
  - el envelope pasó por el `toDistanceTable` real de master;
  - 4/4 filas con orden (ANT, HGW, TAR, ZZZ), cifras es-CL y tono correctos (cian = habilitado, rosa = deshabilitado).
- **Navegador contra producción** (login de Esteban, `localhost:5173`):
  - V2 paginado con 13 páginas;
  - V4 carga el listado;
  - V5 con 5 registros del 30-09 al 02-10;
  - **V3: verificado el estado vacío contra producción (200, sin datos)**.

**No verificado:**
- **V3, render con datos reales de la central:** en producción no hay distance-table.
- **V3, status y cuerpo literales de `/api/distance-table` en producción:** no se capturaron. El 2xx se infiere de que la vista mostró el estado vacío y no el de 404.
- **Conteo de requests por minuto con el polling activo:** no medido, así que la ausencia de loops en el navegador no está medida. El código limpia los intervalos y el smoke test no lo cubre.
- **POST real contra la central** (V4, RF04): no probado por decisión humana. Procedimiento abajo.
- **Login real en `https://app.tiburonshark.me`:** depende del deploy en CloudFront. Tampoco se verificaron las URLs de callback/logout/origins de Auth0 para ese dominio.
- **Card `/health` en la UI:** Esteban no la reportó en 3D. Solo está verificado el `ok` por curl.
- **409 "no está en ventana de negociación"** (ciclo existente con la ventana vencida): no se probó en local, porque no está entre los casos permitidos (datos inválidos o ciclo inexistente).
- **"Volver a iniciar sesión" con un `login_required` real:** solo se probó en el smoke test, con un `ApiError` simulado.

## Procedimiento propuesto para el POST real (decide Esteban)
1. **Avisar al equipo** antes (canal del grupo): hora, ciclo, `take` de 1 kWh y quién lo hace.
2. **Abrir V4** con la ventana abierta: badge "Ventana abierta" y cuenta regresiva de **más de 5 min**. El connector reintenta hasta 5 veces cada 30 s (~2,5 min).
3. **Llenar el formulario:**
   - Dirección: **Comprar (Take)**;
   - Cantidad: **1**;
   - Precio: el `generationCost` del ciclo, que es el valor de la pista "take liquida a X". Queda bajo el tope, que se muestra al lado. Costo esperado: `round2(1 × generationCost)` créditos.
4. **"Proponer" una sola vez.** Esperado:
   - mensaje "Propuesta #N registrada" y la fila arriba como "Propuesta · Registrada, aún no enviada" (`attempts 0`);
   - en ≤ 5 s, `Envíos: 1`;
   - en 2–3 s más, normalmente "Confirmada" y luego "Pagada", con "Liquidado" igual a `generationCost`.
5. **Verificar en V2** que el ciclo muestra la negociación `manual`, el egreso `−round2(1 × generationCost)` y, si fue lo último aplicado, "Última operación aplicada: Compra (take)".
6. **Si termina en "Rechazada" o "Expirada":** anotar `failureReason`/`failureDetail` y avisar al backend. `TIMEOUT` o `WINDOW_CLOSED` indican que la central no respondió.
7. **Evidencia para el log:** id de la negociación, captura de V4 y V2, y el status 201 en Network (**sin copiar el header Authorization**).

## Estado final frente al pedido original
- **Fases 0–2:** completas (12 commits locales, sin push).
- **Fase 3:**
  - A, B y C: completas;
  - D: parcial (sin conteo de requests ni status/cuerpo de distance-table);
  - E: procedimiento escrito, sin ejecutar (por decisión).
- **Fase 4:** completa con este commit. El PR a `main` lo abre Esteban.

## Prompts y decisiones relevantes (resumen por turno)
1. *Prompt maestro* (literal en `01`) → reconocimiento, 3 preguntas y plan.
2. *"Plan aprobado con estos ajustes: 1. En 3C, antes de migrar imprime DB_HOST…"* → 8 ajustes. El agente verificó que el glob del ajuste 3 falla en Node 20 y propuso `node --test src/lib`.
3. *"Cambio de base: V6 ya está mergeado en main…"* → base `main` con guardas.
4. *"Plan aprobado con un añadido en la Fase 1…"* → verificaciones en `main`. El agente se detuvo por `Claude.md`.
5. *"Renombra, en su propio commit antes del de decisiones. Pasos: …"* → `b7754b8`. Después, DF e implementación.
6. *"Termine la checklist de 3D. Resultados: …"* → prueba del mapeo de V3 con el ejemplo del contrato y Fase 4.

## Pendiente / dependencias
- **Esteban + equipo:** POST real según el procedimiento, en una ventana abierta. Revisar 2 compañeros y abrir el PR `feat/integracion-api-real` → `main`.
- **Esteban:** medir los requests por minuto con el polling (Network, 1 min por vista) y anotarlos aquí como corrección.
- **Pedro:** corregir en `AGENTS.md` del backend la frase sobre JWT y la guía de entorno local (compose, `NODE_ENV`, script `start`, puerto de `db`).
- **Jorge:** subir `access-control-max-age` en el Gateway. Para el deploy del front: `VITE_*` en build time, el dominio `app.tiburonshark.me` en Auth0 (callbacks, logout, web origins) y fallback a `index.html` en CloudFront.
- **Pedro/Jorge:** por qué `distance_tables` está vacía en producción (RF02). Decidir si `/health` cumple el contrato o se corrige el contrato.
- **Front (cualquiera):** code-splitting si el aviso de > 500 kB molesta (ya estaba en `main`).

## Fuera de alcance
- Cambios en el backend, el contrato o el Gateway: solo se reportan.
- Deploy a S3 + CloudFront.
- Code-splitting del bundle.
- Tests de componentes con una librería de testing (requerirían dependencias nuevas).
