# API.5 — Endpoints, hook `useApiQuery`, lógica pura en `src/lib/` y estados de UI

## Objetivo
Construir la capa compartida que usan las 4 vistas:
- endpoints;
- hook de datos con polling seguro;
- lógica pura probada (tope, capacidad, ventanas, formatos);
- componentes de carga, error, vacío y paginación.

## Contexto
- `apiFetch` cambia en cada render: usarlo directo en un `useEffect` genera loops.
- `eslint-plugin-react-hooks` 7 prohíbe escribir refs durante el render.
- Node 20.19.3: `node --test` no expande globs (ver API.1).

## Prompt utilizado
Extracto literal del prompt maestro (completo en `01`):
```
2. `feat(api): endpoints y hook useApiQuery`
   - src/api/endpoints.js (una función por endpoint) y src/api/useApiQuery.js con polling
     opcional que SE LIMPIA al desmontar y no genera loops (refs para apiFetch y fetcher).
   - Lógica pura en src/lib/ (round2, cap = round2(1.05*generationCost), spare de un give,
     fmt/fmtDate es-CL, traducción de status) con tests `node --test`; cifras en el log.
   - Componentes ui: Pagination, LoadingState, ErrorState (con Reintentar), EmptyState,
     reutilizando Card/Badge/classes. Respeta el diseño V6 y su accesibilidad.
```
Prompt de la subtarea (extracto literal del plan aprobado, `~/.claude/plans/pasted-content-id-8434-eres-un-jolly-bunny.md`, líneas 95-104):
```
2. **`feat(api): endpoints y hook useApiQuery`**
   - `src/api/endpoints.js`: una función por endpoint. `createNegotiation` manda los números con `Number()` y no genera id ni idpk.
   - `src/api/useApiQuery.js`: `{data,loading,error,reload}`, `pollMs` y `enabled`, con refs para `apiFetch` y `fetcher`, un contador de requests contra las carreras y un cleanup del intervalo.
   - `src/lib/` (puro, sin `import.meta`):
     - `format.js`: `fmt`, `fmtDate` es-CL y `truncId`;
     - `status.js`: traducciones y tonos de estado, kind y tipo de operación;
     - `negotiation.js`: `round2`, `priceCap`, `giveSpare`, `paymentAmount` y `validateProposal`;
     - `cycles.js`: `findOpenCycle`, `estimateNextWindow` y `matchLastOperation`.
   - Tests `src/lib/*.test.js` con `node --test`. Agrego el script `"test": "node --test src/lib"` en `package.json` (ver ajuste 3); no es una dependencia. Si `set-state-in-effect` marca el hook, uso un `eslint-disable-next-line` puntual y comentado (ajuste 7).
   - UI (presentacional, DF-010): `src/components/ui/Pagination.jsx` y `src/components/ui/States.jsx` (`LoadingState`, `ErrorState` con Reintentar y un `onRelogin` opcional, `EmptyState`), sobre `Card`, `Badge` y `classes.js`, con `role="status"`/`aria-live` y foco visible.
```

## Resultado esperado
- Tests de `src/lib/` en verde, con cifras verificadas a mano.
- Lint y build en verde.
- El hook no genera loops y limpia sus intervalos.

## Resultado obtenido
- Commit `ca710c8`.
- **Hook `useApiQuery`:**
  - devuelve `{ data, loading, error, reload, setData, relogin }`;
  - las refs se sincronizan en `useLayoutEffect`;
  - `requestId` descarta respuestas que llegan desordenadas;
  - `params` se serializa con `JSON.stringify` como dependencia del efecto;
  - el polling es silencioso y se salta con `document.hidden`.
- **`priceCap` en aritmética entera:** `round(cost×10⁴)×105` y luego redondeo hacia arriba en la mitad. Así `1.05 × 10.1 = 10.605` da `10.61`, igual que el `round(numeric, 2)` del connector; con floats ingenuos daría `10.6`.
- **Primer intento fallido:** 2 de 19 tests fallaron.
  - `fmt(-1500)` daba `-1.500`: la expectativa era errónea, porque es-CL agrupa 4 dígitos.
  - `fmtDate` daba `2:40:04 p. m.`: ICU usa 12 h para es-CL. Se fijó `hourCycle: 'h23'`.
- **Corrección de una expectativa propia:** un test de `estimateNextWindow` esperaba `17:40`. Con `now = 17:50` lo correcto es `19:40`. Se corrigió antes de correr la suite.
- **Tono `violet` agregado a `Badge`**, para "Confirmada" y la fase "Consumiendo", porque el naranja está reservado para duplicate (DF-008). Contraste WCAG de `text-h` sobre `violet/25`: 11,72:1 en `surface`, 10,65:1 en `surface-hover` y 12,82:1 en `bg`.

## Archivos modificados
- `src/api/endpoints.js`, `src/api/useApiQuery.js` (nuevos)
- `src/lib/format.js`, `status.js`, `negotiation.js`, `cycles.js` y sus `*.test.js` (nuevos)
- `src/components/ui/States.jsx`, `Pagination.jsx`, `ViewHeader.jsx` (nuevos)
- `src/components/ui/Badge.jsx` (tono `violet`)
- `package.json` (script `"test": "node --test src/lib"`)

## Tests ejecutados
`npm test` (`node --test src/lib`); `npm run lint`; `npm run build`; script de contraste WCAG con `node -e` (misma fórmula que DF-012).

## Resultado de los tests
- `# tests 19 · # pass 19 · # fail 0`.
- Cifras verificadas, entre ellas:
  - `priceCap(65.49) = 68.76`, el valor real de la negociación 92 de producción;
  - `25678.82 × 68.76 = 1765675.66`;
  - `giveSpare` = `max(0, 37831.26 − 12152.44) − 25678.82 = 0`;
  - `fmt(119392553.0988) = "119.392.553,1"`;
  - `matchLastOperation` empareja `appliedAt .181` con `paidAt .184`.
- Lint: 0 errores. Build: OK.

## Decisiones tomadas
- **`params` serializable** en lugar de un arreglo de deps con spread: evita el warning de `exhaustive-deps` sin `eslint-disable`.
- **Sin `eslint-disable`:** `react-hooks/set-state-in-effect` no marcó el hook, así que el ajuste 7 no hizo falta.
- **`ViewHeader` y `RefreshButton`**, componentes extra, para no repetir la cabecera con filtros y el botón "Actualizar" en 4 vistas.
- **`StaleNotice`:** si un poll falla y hay datos previos, se muestran los datos con un aviso en vez de vaciar la vista.

## Bloqueos
Ninguno.

## Observaciones
`pollMs` pasó a aceptar también una función de la data en API.8, para V4.
