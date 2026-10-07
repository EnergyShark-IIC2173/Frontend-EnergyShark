# API.6 — V5: registro de duplicados y NACKs contra la API (RF05)

## Objetivo
Mostrar `GET /api/messages/rejected` paginado y filtrable. Es la vista más simple: valida la cadena completa, del cliente al hook, a la UI y a la API.

## Contexto
- La forma de cada fila es igual a la del mock (`id, kind, type, idpk, msgId, reason, code, detail, occurredAt`), pero la respuesta real viene paginada.
- `discarded` no existía en el mock.

## Prompt utilizado
Extracto literal del prompt maestro (completo en `01`):
```
3. `feat(v5): registro de duplicados y NACKs contra la API` (valida toda la cadena)
   - GET /api/messages/rejected, envoltorio {page,limit,total,totalPages,data}, filtro kind,
     `discarded` con su propio tono, columnas type/msgId/idpk (truncadas, con title),
     null → "—", polling 15-30 s + botón Actualizar.
```
Prompt de la subtarea (extracto literal del plan aprobado, `~/.claude/plans/pasted-content-id-8434-eres-un-jolly-bunny.md`, líneas 105-109):
```
3. **`feat(v5): ...`** `RejectedMessages.jsx`:
   - datos paginados (limit 25) y un select de `kind` que vuelve a la página 1;
   - tonos: duplicate naranja, nack rosa, discarded neutral;
   - columnas type, msgId e idpk con `truncId` y `title`; los null se muestran como "—";
   - polling de 15 s y botón Actualizar.
```

## Resultado esperado
Vista con estados de carga, error, vacío y paginación, sin mocks. Lint y build en verde.

## Resultado obtenido
- Commit `0880814`.
- Tonos: Duplicado en naranja, NACK en rosa y Descartado en neutral.
- El filtro vuelve a la página 1 desde el `onChange`, no desde un efecto.
- Smoke test de render (API.11) en 3 escenarios (datos, `stale`, `error-auth`): fila nack con `type/idpk/msgId` null → "—".
- **En el navegador contra producción (Esteban, 3D):** "V5: 5 registros, del 30-09 al 02-10".

## Archivos modificados
- `src/components/RejectedMessages.jsx`

## Tests ejecutados
`npm run lint`; `npm run build`; smoke test de render (ver API.11); revisión manual de Esteban en `http://localhost:5173`.

## Resultado de los tests
- Lint: 0 errores. Build: OK.
- En el navegador, Esteban vio los 5 registros de producción.
- Conteo de requests por minuto con el polling de 15 s: **no medido**.

## Decisiones tomadas
- Polling de 15 s, el extremo bajo del rango: en la demo el ayudante inyecta un duplicado y hay que verlo aparecer pronto.
- Las etiquetas del kind van en español; el valor del filtro sigue en inglés.

## Bloqueos
Ninguno.

## Observaciones
Con `access-control-max-age: 0` en el Gateway, cada GET va precedido de un OPTIONS: el polling de 15 s produce ~8 requests por minuto, no 4 (hallazgo para Jorge).
