# API.9 — V3: conectividad contra la API (RF02)

## Objetivo
Mostrar la distance-table vigente, actualizada sola, y distinguir "endpoint no desplegado" (404), "sin datos" y "error".

## Contexto
- La forma real es igual a la del mock (`cityId`, `updatedAt`, `distances`), pero los dos primeros son nullables.
- Sin tabla recibida, master responde `{"cityId":null,"updatedAt":null,"distances":{}}` (`distanceTableController.js`).
- El endpoint está en `main` del backend (PR #20); el redeploy del EC2 no está confirmado.

## Prompt utilizado
Extracto literal del prompt maestro (completo en `01`):
```
6. `feat(v3): conectividad contra la API` (RF02)
   - GET /api/distance-table (ya está en main del backend). 404 → estado informativo "Sin
     datos o endpoint aún no desplegado" (no error rojo); cityId/updatedAt null y
     distances {} → estado vacío. Polling 60 s + botón Actualizar. Filas ordenadas por destino.
```
Pedido literal posterior de Esteban (extracto del mensaje con los resultados de 3D, completo en `11`):
```
Antes de la Fase 4, prueba el mapeo de V3 con el ejemplo de la tabla de distancias del
contrato (enabled true y false, varios destinos) y reporta el resultado.
```
Prompt de la subtarea (extracto literal del plan aprobado, `~/.claude/plans/pasted-content-id-8434-eres-un-jolly-bunny.md`, líneas 120-123):
```
6. **`feat(v3): ...`** `DistanceTable.jsx`:
   - el 404 se muestra como estado informativo y una tabla null o vacía como estado vacío;
   - filas ordenadas por destino;
   - polling de 60 s y botón Actualizar.
```

## Resultado esperado
Tabla ordenada, estado vacío, estado 404 y error con reintento. El mapeo debe quedar probado con el ejemplo del contrato.

## Resultado obtenido
- Commit `7133ab6`.
- **Smoke test** en 5 escenarios: datos, vacío, 404, carga y `error-auth`.
- **Mapeo con el ejemplo del contrato** (pedido de Esteban):
  - `openapi.yaml` define el schema `DistanceTable`, pero **no trae ejemplo**. El único ejemplo está en el enunciado (`docs/E1-v1.1.md:518-540`): HGW (62763183 m, 0.0034, `enabled: true`) y TAR (94306517 m, 0.0013, `enabled: true`), con "..." entre ambos.
  - Como el ejemplo solo tiene `enabled: true`, se agregaron **2 destinos sintéticos con `enabled: false`**: ZZZ (1500 m, 0.000125) y ANT (120000000 m, 0.01).
  - El envelope pasó por el **`toDistanceTable` real de master** (`origin/main`, con `../models` stubbeado) y su salida se renderizó con V3:
    ```
    Conectividad de COR Última actualización: 05-10-26, 09:00:00 · se revisa cada 60 s.
    ANT 120.000.000 0,01 Deshabilitado
    HGW 62.763.183 0,0034 Habilitado
    TAR 94.306.517 0,0013 Habilitado
    ZZZ 1.500 0,000125 Deshabilitado
    ```
  - Tonos leídos del HTML: ANT `bg-pink/15`, HGW `bg-accent/15`, TAR `bg-accent/15` y ZZZ `bg-pink/15`.
  - Orden de entrada TAR, HGW, ZZZ, ANT → orden mostrado ANT, HGW, TAR, ZZZ.
  - El caso vacío real de master (`toDistanceTable(undefined)`) es `{"cityId":null,"updatedAt":null,"distances":{}}`.
- **En el navegador contra producción (Esteban, 3D):** estado vacío, "La central todavía no publica una distance-table", durante 5 minutos con polling de 60 s.
  - El status y el cuerpo de `/api/distance-table` **no se capturaron**: el campo del mensaje de Esteban quedó con el placeholder `<STATUS Y CUERPO QUE VEAS>`.
  - Que se viera ese estado y no el de 404 implica una respuesta 2xx con `distances` vacío. Es decir, **master en producción ya tiene el endpoint** (#20 desplegado), pero sin datos.

## Archivos modificados
- `src/components/DistanceTable.jsx`

## Tests ejecutados
`npm run lint`; `npm run build`; smoke test de render en 6 escenarios (incluido `distance-contract`); `node map.cjs` (envelope → `toDistanceTable` de master); revisión manual de Esteban.

## Resultado de los tests
- Lint: 0 errores. Build: OK. Smoke test: 6/6. Mapeo del contrato: 4/4 filas con orden, cifras y tono correctos.

## Decisiones tomadas
- `transportCost` con hasta 6 decimales, para que `0.000125` no se redondee a `0`; `distance` sin decimales.
- El aviso de "poll fallido" se oculta cuando el error es el 404 informativo.

## Bloqueos
Ninguno del lado del front. Que haya datos depende de que la central publique una distance-table y de que el connector la persista.

## Observaciones
**Verificado:** el estado vacío contra producción (200, sin datos). **No verificado:** el render con datos reales de la central.
