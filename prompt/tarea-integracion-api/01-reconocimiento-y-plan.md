# API.1 — Reconocimiento y plan de la integración con la API real

## Objetivo
Entender el estado real del front y del backend antes de tocar código, y verificar contra el código las afirmaciones del informe `docs/integracion-backend.md`. Con eso, entregar un plan corto para reemplazar los 4 mocks de V2–V5 (RF01, RF02, RF04, RF05).

## Contexto
- El front estaba en `feat/connect-front-back` (`ada97fb`, con el rediseño V6). Las vistas V2–V5 leían `src/mocks/*.json`.
- `docs/integracion-backend.md` es un informe de otro agente, sin trackear y anterior al merge de los PRs #20–#25 del backend. Se tomó como hipótesis.
- Backend `JorgeUribeGo/EnergyShark`: `origin/main` en `c58ccbd`, con #20–#25 mergeados.
- Plazo: entrega el 2026-10-07 a las 23:59.

## Prompt utilizado
Prompt maestro de Esteban (literal, completo):
```
Eres un ingeniero senior trabajando en el repo del FRONTEND de EnergyShark
(energyshark-frontend/). Tu misión: reemplazar los 4 mocks por llamadas reales a la API
del backend, con estados de carga/error/vacío y paginación, dejando todo probado y
documentado según CLAUDE.md. Plazo duro: la entrega cierra el miércoles 23:59. Prioriza
lo que puntúa: V2 (RF01) y V5 (RF05) primero, luego V4 (RF04), luego V3 (RF02).

══════════ REGLAS DURAS (no negociables) ══════════
1. NO hagas push, NO abras PR, NO toques remotos. Solo commits locales en una rama nueva.
2. NO modifiques el repo del backend (EnergyShark/) ni cambies su rama actual. Lectura sí.
   Para leer o ejecutar el backend usa `git worktree add` en un directorio temporal fuera
   de ambos repos, a partir de origin/main, y elimínalo al terminar.
3. NO hagas POST /api/negotiations contra producción sin mi autorización explícita en el
   chat: crea una propuesta REAL contra la central. Contra un backend local, solo con
   datos inválidos (400) o ciclo inexistente (409), que no llegan a la central.
4. Cero secretos en commits, logs o salida: ni .env, ni tokens, ni client IDs. Si necesitas
   un token, te lo pediré por chat para esa sesión y NO lo escribes en ningún archivo.
   Antes de cada commit corre el grep de secretos de CLAUDE.md.
5. NO agregues dependencias npm sin preguntarme (fetch + un hook propio alcanzan). Para
   lógica pura usa `node --test`.
6. NO toques auth/, main.jsx ni .env. NO elimines .claude/.
7. NO uses `git clean`, `git stash -u` ni nada que borre archivos sin trackear:
   docs/integracion-backend.md está sin trackear y lo necesito.
8. Mis prompts van literales (con mis errores de tipeo) en los registros de prompts.
9. Di la verdad: todo lo que no pudiste probar va en "No verificado". Nunca escribas
   "funciona" sin la evidencia (comando + resultado).

══════════ FASE 0 — RECONOCIMIENTO (modo plan, sin escribir código) ══════════
Lee, en este orden:
a) CLAUDE.md del frontend completo (es el contrato de documentación) y
   docs/decisiones-frontend.md (para seguir la numeración DF-xxx).
b) docs/integracion-backend.md. Es un informe generado por otro agente, sin trackear:
   tómalo como HIPÓTESIS DE ALTA CALIDAD, no como verdad. IMPORTANTE: se generó ANTES de
   mergear los PRs del backend. Ignora su Parte A. En la Parte B sigue valiendo todo salvo:
   (1) /api/distance-table ya existe en main, aunque puede seguir dando 404 en producción
   hasta que se redespliegue; (2) master local ya no corre sin auth por defecto (ver Fase
   3C); (3) las rutas de master pueden exigir JWT.
   Verifica sus afirmaciones críticas contra el código real. Si hay contradicción, gana el
   código y la anotas. Verifica en particular:
   - cómo se distinguen las transferencias de un ciclo (becauseOf) y si transfersReceived
     incluye solo fondos del ciclo o también pagos de negociación;
   - orden por defecto de GET /api/cycles;
   - forma exacta de las respuestas de cycles, negotiations, rejected y distance-table.
c) src/: App.jsx, api/client.js, los 4 componentes con mock, components/ui/*, mocks/*.json.
d) Backend: haz `git fetch` y crea un worktree TEMPORAL de origin/main fuera de los repos
   (git worktree add ../energyshark-main-tmp origin/main). Lee ahí el código de master,
   docker-compose.yml, AGENTS.md, docs/deploy.md y docs/monitoreo.md si existen, y
   docs/contracts/openapi.yaml. Con `git log` comprueba qué PRs están en main (#20
   distance-table, #21, #22, #23, #24 JWT, #25 compose/ECR). Mergeado en main no es lo
   mismo que desplegado en el EC2: no lo asumas.
e) `git status` y `git log --oneline -15` del frontend.

Entrega un PLAN corto (archivos a tocar, orden, decisiones DF a registrar, cómo probarás
cada cosa, dudas) y ESPERA mi aprobación antes de la Fase 1.

══════════ FASE 1 — RAMA Y DECISIONES (antes del código) ══════════
- Verifica que el árbol esté limpio. Crea `feat/integracion-api-real` desde la rama actual
  (la que contiene el rediseño V6).
- Primer commit, SOLO documentación (RDOC01): entradas DF nuevas en
  docs/decisiones-frontend.md, cada una con contexto → decisión → alternativa descartada →
  quién decidió (humana/agente) → dónde vive. Como mínimo: hook propio `useApiQuery` sin
  react-query; polling e intervalos; 404 de distance-table mostrado como "sin datos o
  endpoint aún no desplegado"; validación de tope de precio en cliente; /health en texto
  plano; qué se muestra cuando statusStatement o negotiationReportSent son null.
  Commit: `docs: decisiones de frontend para la integracion con la API real`.

══════════ FASE 2 — IMPLEMENTACIÓN (un commit por paso, lint+build verdes antes de cada uno) ══════════
Commits convencionales en español, en este orden:

1. `feat(api): cliente con errores tipados y respuestas no JSON`
   - client.js: ApiError(status, message, body), lectura según content-type, soporte 204,
     buildQuery, mensaje desde {error} (master) o {message} (Gateway). Mantén la firma
     useApiClient().apiFetch. Content-Type solo cuando hay body.
   - .env.example con las 4 variables VITE_* y SIN valores.
   - Proxy opcional de Vite hacia el backend local (/api y /health → localhost:3001).
   - Ante login_required/consent_required, permite ofrecer "Volver a iniciar sesión".

2. `feat(api): endpoints y hook useApiQuery`
   - src/api/endpoints.js (una función por endpoint) y src/api/useApiQuery.js con polling
     opcional que SE LIMPIA al desmontar y no genera loops (refs para apiFetch y fetcher).
   - Lógica pura en src/lib/ (round2, cap = round2(1.05*generationCost), spare de un give,
     fmt/fmtDate es-CL, traducción de status) con tests `node --test`; cifras en el log.
   - Componentes ui: Pagination, LoadingState, ErrorState (con Reintentar), EmptyState,
     reutilizando Card/Badge/classes. Respeta el diseño V6 y su accesibilidad.

3. `feat(v5): registro de duplicados y NACKs contra la API` (valida toda la cadena)
   - GET /api/messages/rejected, envoltorio {page,limit,total,totalPages,data}, filtro kind,
     `discarded` con su propio tono, columnas type/msgId/idpk (truncadas, con title),
     null → "—", polling 15-30 s + botón Actualizar.

4. `feat(v2): historial de ciclos contra la API` (RF01, la que más puntúa)
   - Mapeo de B.5 del informe, verificado contra el código.
   - Debe mostrar: cycleId, fase y ventana, status-statement (null → "Sin status-statement"),
     fondos por transfer, demand-statements con signo, negociaciones voluntarias (estados
     traducidos solo al mostrar), negotiation-report enviado (null → "Reporte no enviado" o
     "Pendiente" si sigue en ventana) y balances finales como secciones SEPARADAS, y
     lastOperationApplied DESTACADA (RF01 lo exige).
   - limit=10, paginador, polling suave solo en página 1.

5. `feat(v4): negociaciones contra la API` (RF04)
   - Listado paginado con filtro de estado; polling cada 3 s SOLO si hay filas
     proposed/confirmed. Muestra origin, attempts, settledPricePerEnergy, fechas y
     failureReason/failureDetail.
   - Formulario: el ciclo abierto se deriva del listado (phase 'negotiating', windowClosesAt
     futuro, con statusStatement). Si no hay, formulario deshabilitado con la próxima
     ventana estimada, CALCULADA desde datos, nunca hardcodeada. Validación de cliente:
     números > 0, tope de precio, capacidad en give. Body con Number(); el cliente NO genera
     id ni idpk (elimina esa lógica del mock). Botón deshabilitado mientras el POST está en
     vuelo (evita doble POST). Errores 400/409 con el mensaje del backend visible. Tras el
     201, insertar la fila devuelta y activar el polling.

6. `feat(v3): conectividad contra la API` (RF02)
   - GET /api/distance-table (ya está en main del backend). 404 → estado informativo "Sin
     datos o endpoint aún no desplegado" (no error rojo); cityId/updatedAt null y
     distances {} → estado vacío. Polling 60 s + botón Actualizar. Filas ordenadas por destino.

7. `fix(app): health tolera texto plano` y `chore: eliminar mocks`
   - /health devuelve "ok" en texto plano. Borra src/mocks/ solo cuando
     `grep -r "mocks/" src` no devuelva nada.

══════════ FASE 3 — PRUEBAS (reporta cada una con comando y resultado literal) ══════════
A. Estáticas: `npm run lint`, `npm run build`, `node --test`. Cero errores.

B. Contra producción SIN token (sin riesgo):
   - `curl -i https://api.tiburonshark.me/health` → 200 "ok".
   - `curl -i https://api.tiburonshark.me/api/cycles` sin token → 401 {"message":"Unauthorized"}.
   - Preflight CORS con DOS orígenes, http://localhost:5173 y https://app.tiburonshark.me:
     `curl -si -X OPTIONS https://api.tiburonshark.me/api/cycles -H "Origin: <origen>"
      -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: authorization,content-type"`
     Informa si cada origen devuelve access-control-allow-origin. Si app.tiburonshark.me
     falla, avísame en grande: bloquea el deploy y debo pasárselo a Jorge.

C. Backend LOCAL, desde el worktree de origin/main. El compose cambió (imágenes de ECR) y
   la imagen fija NODE_ENV=production, así que master ya no arranca sin AUTH0_* en ese modo.
   Lee docker-compose.yml y AGENTS.md para ver cómo se levanta ahora. Opciones, en orden:
   1) Si hay una forma documentada de correr local, úsala.
   2) Si no, corre master con `npm start` en master/ (fuera de Docker y sin
      NODE_ENV=production) y Postgres con `docker compose up db`. Sin AUTH0_* corre sin
      auth, así que curl no necesita token. Si falta master/.env, usa master/.env.example y
      dime qué falta.
   3) Si prefieres Docker completo, necesitas AUTH0_ISSUER_BASE_URL (termina en "/") y
      AUTH0_AUDIENCE en master/.env (valores públicos, los mismos del front); entonces curl
      exige un token que te daré yo por chat.
   Si nada funciona, no pierdas tiempo: dilo, déjalo en "No verificado" y sigue con B y D.
   Con el backend arriba, verifica con curl y compara la forma con lo que consume cada
   componente: /api/cycles (+ ?limit=1), /api/cycles/:cycleId, /api/negotiations (+
   ?status=paid y ?status=foo → 400), /api/negotiations/:id, /api/messages/rejected
   (+ ?kind=), /api/distance-table. POST /api/negotiations local: solo con datos inválidos
   (400) y con un ciclo inexistente (409).
   Al terminar, baja los contenedores y elimina el worktree.

D. Navegador (necesitas mi login: Auth0 no se puede automatizar). Levanta `npm run dev` y
   haz un ALTO claro: dime la URL y qué revisar en cada vista. Si tienes herramientas de
   navegador, úsalas para revisar consola y Network DESPUÉS de que yo inicie sesión.
   Revisa: 200 con Authorization en cada vista, estados loading/error/vacío, paginación,
   /health sin fallar, y que no haya requests en loop (cuenta requests por minuto con el
   polling activo).

E. POST real a producción: NO lo hagas. Al final, escribe el procedimiento para que yo lo
   decida: ventana abierta, cantidad mínima, take con pricePerEnergy = generationCost,
   avisando antes al equipo.

══════════ FASE 4 — DOCUMENTACIÓN Y CIERRE (según CLAUDE.md) ══════════
- Lee el AGENTS.md del backend y alinea el formato de AI logs con su plantilla, por si #23
  la cambió. Crea AGENTS.md en la raíz del frontend (o actualiza CLAUDE.md) con una
  referencia al AGENTS.md del backend (JorgeUribeGo/EnergyShark/AGENTS.md) y un resumen del
  flujo de trabajo del front. No lo copies entero (RDOC04).
- Commit `docs: AI log y registro de prompts de la integracion con la API real`:
  docs/ai_docs/AAAA-MM-DD-esteban-v2-v5-integracion-api.md en el formato de la plantilla,
  prompt/tarea-integracion-api/NN-*.md (uno por etapa, 11 secciones, mi prompt literal y el
  prompt de subtarea que derivaste) y la fila en prompt/README.md. Anota que la
  documentación se escribió DESPUÉS de implementar, salvo el commit de decisiones.
- Incluye siempre: Verificado (con cifras), No verificado, Hallazgos, Pendiente. Casos
  esperados en "No verificado": login real en app.tiburonshark.me, POST real contra la
  central, distance-table en producción (depende del redeploy del EC2).
- Las discrepancias entre contrato y realidad (ej. /health) van en "Hallazgos" con a quién
  avisar; NO las parches en el front.
- Verifica con git log que el commit de decisiones es anterior al código. `git diff --stat`
  sin mocks residuales ni archivos fuera de alcance. Sin .env ni tokens en el diff.
- No hagas push. Termina con: lista de commits, resultados de las pruebas A-D, lista de "No
  verificado", y los 3 riesgos principales que ves para el deploy de mañana.
```
Respuestas de Esteban a las preguntas del agente durante la planificación (opciones elegidas, literales):
```
"V2 (RF01): cada ciclo real tiene 7 secciones. [...] ¿Cómo las muestro?"="1ª abierta, resto plegable (Recommended)"
"V4: si un give supera la energía vendible estimada (spare), ¿lo bloqueo o solo advierto? [...]"="Advertir y permitir (Recommended)"
"Fase 3C (backend local): Docker no está corriendo y hay un Postgres nativo en :5432. [...]"="Postgres nativo, BD temporal (Recommended)"
```
Primer rechazo del plan (literal):
```
Plan aprobado con estos ajustes:
1. En 3C, antes de migrar imprime DB_HOST y DB_NAME y aborta si no son localhost y
   energyshark_tmp.
2. En 3B, interpreta el curl a /api/distance-table: 401 = ruta existe tras el authorizer;
   404 con {"message":"Not Found"} = el Gateway no tiene la ruta (hallazgo para Jorge,
   no se arregla redesplegando master).
3. Script de test: "node --test \"src/lib/**/*.test.js\"".
4. lastOperationApplied siempre visible en la cabecera sin depender del emparejamiento;
   marcar el ítem es mejor esfuerzo y DF-020 lo declara como heurística.
5. El AI log declara que los datos sembrados en 3C son sintéticos.
6. Confirma que la última DF existente es DF-013 antes de numerar.
7. Si react-hooks/set-state-in-effect molesta, usa un eslint-disable puntual y comentado.
8. En "Hallazgos" incluye: AGENTS.md describe un docker compose local que no funciona
   (NODE_ENV=production fijo, sin script start, db sin puerto publicado; afecta RDOC03) y la
   frase falsa sobre JWT; avisar a Pedro y Jorge.
```
Segundo rechazo (literal):
```
Cambio de base: V6 ya está mergeado en main. En la Fase 1, antes de crear la rama haz
`git switch main && git pull` y crea feat/integracion-api-real desde main (los dos archivos
sin trackear de docs/ no se pierden al cambiar de rama; no uses git clean ni stash -u).
Donde el plan compara contra feat/connect-front-back (git diff --stat), compara contra
main. La PR final será hacia main.
```
Tercer rechazo (literal):
```
Plan aprobado con un añadido en la Fase 1, después del pull y de la guarda de V6:
verifica en main que existan CLAUDE.md y docs/decisiones-frontend.md, y que la última
entrada DF siga siendo DF-013 (renumera desde ahí si no). Ejecuta además
`git merge-base --is-ancestor ada97fb main` y repórtame el resultado. Si algo no calza,
detente y avísame antes de crear la rama.
```
Prompt de la subtarea: **reconstruido al cierre de la sesión** a partir de lo hecho. Durante el reconocimiento no se escribió como texto aparte; el plan aprobado, que sí es literal, se cita en API.3 a API.12.
```
Modo plan, solo lectura. Leer CLAUDE.md, docs/decisiones-frontend.md, docs/integracion-backend.md
(Parte B como hipótesis), src/ completo y, del backend, origin/main con `git show` (sin worktree:
el modo plan prohíbe escrituras): master/src/app.js, controllers (cycles, negotiations, rejected,
distanceTable, pagination), routes, connector/src/db/ledgerRepo.js y negotiationsRepo.js,
connector/src/negotiation.js, docker-compose.yml, master/Dockerfile, master/package.json,
master/.env.example (solo nombres), AGENTS.md, docs/ai_docs/README.md, docs/deploy.md y
openapi.yaml. Verificar contra el código: becauseOf/transfersReceived, orden de /api/cycles,
formas de las 4 respuestas, tope y spare, signo de demand. Preguntar al humano lo que es suyo
(layout V2, capacidad en V4, cómo correr el backend local). Escribir el plan en
~/.claude/plans/ y pedir aprobación con ExitPlanMode; incorporar cada ajuste del humano.
```

## Resultado esperado
Un plan aprobado con archivos, orden de commits, entradas DF, forma de probar cada paso y dudas. Además, cada afirmación crítica del informe marcada como confirmada o contradicha por el código, con la línea donde se ve.

## Resultado obtenido
- **Confirmado contra el código** (`origin/main` `c58ccbd`):
  - `transfersReceived` trae solo los fondos del ciclo: `ledgerRepo.js:87-92` ignora los transfer con `becauseOf`, y los pagos se registran como eventos `give`/`take`.
  - `/api/cycles` ordena por `createdAt DESC`; negociaciones y rechazados ordenan por `id DESC`.
  - Las formas de las 4 respuestas coinciden con el informe.
  - Tope `round(1.05×cost, 2)` (`negotiation.js:62`).
  - Signo de demand (`ledgerRepo.js:13-17`).
- **Contradicho o precisado:**
  - El `lastOperationApplied.appliedAt` de give/take no coincide al milisegundo con `paidAt`.
  - `spare` no cuenta `requested`.
- **Hallazgos del backend:**
  - `AGENTS.md` con la frase obsoleta sobre JWT.
  - El compose local no levanta master: `NODE_ENV=production` fijo, sin script `start` y `db` sin puerto publicado.
  - `/health` en texto plano, distinto del contrato.
- **Decisiones humanas:** las 3 respuestas de arriba, más 8 ajustes, el cambio de base a `main` y las verificaciones de la Fase 1.
- **Desviación del ajuste 3, verificada antes de aprobar:** Node 20.19.3 no expande globs en `node --test`.
  - `node --test "src/api/clien?.js"` → `Could not find '…/clien?.js'`.
  - Se usó `node --test src/lib`; `node --test src/api` → `# tests 0`, sin error.
- **Fase 1 en `main`:**
  - `git pull --ff-only` OK. `git log` muestra `2d6bb05 Merge pull request #4 from franigoat/v6-deploy`.
  - `git merge-base --is-ancestor ada97fb main` → `exit=0`; última DF = DF-013 (línea 219).
  - `git ls-tree main -- CLAUDE.md` → **vacío**: git trackeaba `Claude.md`. El agente se detuvo y avisó (ver API.2).

## Archivos modificados
Ninguno en el repo; solo el plan en `~/.claude/plans/` (fuera del repo).

## Tests ejecutados
`node --test "src/api/clien?.js"` y `node --test src/api` (para verificar el ajuste 3); `git merge-base --is-ancestor ada97fb main; echo $?`.

## Resultado de los tests
Ver "Resultado obtenido".

## Decisiones tomadas
- Leer el backend con `git show origin/main:<ruta>` en vez de crear el worktree en la Fase 0. El modo plan prohíbe escrituras, y `git worktree add` escribe en `.git/`. El worktree se creó recién en la Fase 3C.
- No usar subagentes: todo el reconocimiento lo hizo un solo agente.

## Bloqueos
Ninguno.

## Observaciones
- El último fetch del front antes del pull (2026-10-06 15:48) todavía mostraba `main` sin V6. Por eso la guarda posterior al pull era necesaria.
- `docs/arquitectura-analisis.md` también estaba sin trackear. No se tocó.
