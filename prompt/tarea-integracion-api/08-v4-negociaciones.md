# API.8 — V4: negociaciones contra la API (RF04)

## Objetivo
Listar todas las negociaciones, automáticas y manuales, y permitir proponer una manual solo cuando hay ventana abierta, con validación en el cliente y sin dobles POST.

## Contexto
- El mock generaba `id: Date.now()` e `idpk: crypto.randomUUID()` en el cliente.
- El backend no tiene endpoint de "ciclo actual" ni filtro por ciclo.
- Decisión humana: la capacidad del give solo advierte; el tope bloquea (DF-017).

## Prompt utilizado
Extracto literal del prompt maestro (completo en `01`):
```
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
```
Prompt de la subtarea (extracto literal del plan aprobado, `~/.claude/plans/pasted-content-id-8434-eres-un-jolly-bunny.md`, líneas 115-119):
```
5. **`feat(v4): ...`** `NegotiationAdmin.jsx`:
   - listado paginado con filtro de estado y las columnas pedidas, con `failureReason` y `failureDetail` en `title` o en una línea secundaria;
   - formulario con el ciclo abierto (cuenta regresiva) o deshabilitado con la próxima ventana estimada;
   - validación, botón deshabilitado durante el POST y errores 400/409 visibles;
   - con el 201, la fila se inserta y se activa el polling de 3 s. Se elimina el `Date.now()`/`randomUUID` del mock.
```

## Resultado esperado
Listado y formulario completos según el pedido. Lint y build en verde. El cliente no genera ni id ni idpk.

## Resultado obtenido
- Commit `7d12885`.
- **Polling condicional:**
  - Primer intento: una ref escrita en un efecto y leída en el render para decidir `pollMs`. Se descartó antes del commit: leer refs en el render choca con `react-hooks` 7 y era enrevesado.
  - Solución: `useApiQuery` acepta `pollMs` como función de la data, `(data) => data?.data?.some(isActiveNegotiation) ? 3000 : null`. Al insertar la fila del 201 (`proposed`), el polling se activa solo.
- **Doble POST:** el botón se deshabilita con `submitting`, y además una ref `inFlight` corta un segundo submit que llegue antes del re-render.
- **Cuenta regresiva:** en un componente con su propio intervalo de 1 s. La vista solo re-renderiza cada 5 s para detectar cierres de ventana.
- **Corregido antes del commit:**
  - "Ingresa un número." aparecía bajo Precio sin haber escrito nada; ahora el error del precio solo se ve en vivo si hay un valor.
  - La advertencia de capacidad estaba en naranja (reservado para duplicate, DF-008) y pasó a `text-accent`.
- **Smoke test de render** (API.11) en 4 escenarios:
  - ventana abierta: "Ventana abierta … Tope 68,76 · take liquida a 65,49";
  - ventana cerrada: "No hay ventana de negociación abierta. Próxima estimada: 07-10-26, 02:40:00". Verificado a mano: `2026-10-06T17:40Z + 6×2 h = 05:40Z` = 02:40 en Chile;
  - `loading` y `error-auth`.
- **En el navegador contra producción (Esteban, 3D):** "V4: el listado carga". Esteban estima que la próxima ventana abre ~02:40, lo mismo que calcula el front.

## Archivos modificados
- `src/components/NegotiationAdmin.jsx`
- `src/api/useApiQuery.js` (`pollMs` acepta una función)

## Tests ejecutados
`npm run lint`; `npm run build`; `npm test`; smoke test de render en 4 escenarios; `grep -nE "Date.now\(\)|randomUUID"` sobre la vista (solo quedan los relojes, no la generación de ids).

## Resultado de los tests
- Lint: 0 errores. Build: OK. Tests: 19/19. Smoke test: 4/4.
- **POST real: no probado.**

## Decisiones tomadas
- **Después de un 201:** si el usuario estaba en otra página o con un filtro, se vuelve a la página 1 sin filtro (el refetch trae la fila). Si no, la fila se inserta de inmediato con `setData` y se recarga el ciclo abierto, porque el `spare` depende de sus negociaciones.
- **Ventana abierta sin status-statement:** se dice explícitamente, porque el backend la rechazaría con `NO_STATUS_STATEMENT`.
- **`proposed` con `attempts: 0`** se muestra como "Registrada, aún no enviada" (B.9 del informe).
- **Pista de precio:** "take liquida a generationCost" y "give liquida al tope", según la descripción de `settledPricePerEnergy` en `openapi.yaml`.

## Bloqueos
El POST real está bloqueado por decisión humana: solo con ventana abierta y con el equipo avisado (procedimiento en el AI log).

## Observaciones
—
