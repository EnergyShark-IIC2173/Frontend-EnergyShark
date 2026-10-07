# API.7 — V2: historial de ciclos contra la API (RF01)

## Objetivo
Mostrar cada ciclo con todo lo que exige RF01. `lastOperationApplied` va claramente identificada.

## Contexto
- El mock tenía otra forma: `transfers[]` con `type`, `report` y estados en español.
- La real es `CycleSummary`: `transfersReceived` (solo fondos), `demandStatementsApplied`, `voluntaryNegotiations`, `negotiationReportSent`, `finalBalances` y `lastOperationApplied`, todos nullables según `cyclesController.js`.
- Decisión humana: la primera tarjeta va abierta y el resto plegable (DF-020).

## Prompt utilizado
Extracto literal del prompt maestro (completo en `01`):
```
4. `feat(v2): historial de ciclos contra la API` (RF01, la que más puntúa)
   - Mapeo de B.5 del informe, verificado contra el código.
   - Debe mostrar: cycleId, fase y ventana, status-statement (null → "Sin status-statement"),
     fondos por transfer, demand-statements con signo, negociaciones voluntarias (estados
     traducidos solo al mostrar), negotiation-report enviado (null → "Reporte no enviado" o
     "Pendiente" si sigue en ventana) y balances finales como secciones SEPARADAS, y
     lastOperationApplied DESTACADA (RF01 lo exige).
   - limit=10, paginador, polling suave solo en página 1.
```
Ajuste literal de Esteban que aplica aquí (punto 4 del primer rechazo del plan):
```
4. lastOperationApplied siempre visible en la cabecera sin depender del emparejamiento;
   marcar el ítem es mejor esfuerzo y DF-020 lo declara como heurística.
```
Prompt de la subtarea (extracto literal del plan aprobado, `~/.claude/plans/pasted-content-id-8434-eres-un-jolly-bunny.md`, líneas 110-114):
```
4. **`feat(v2): ...`** `CycleHistory.jsx`:
   - limit 10 y paginador;
   - secciones separadas: status-statement con `validUntil`, fondos por transfer, demand-statements con signo (entrega o retiro), negociaciones con estado traducido, origin, precio liquidado y monto pagado, reporte enviado y balances finales;
   - `lastOperationApplied` destacada;
   - fase y ventana en la cabecera.
```

## Resultado esperado
Las 6 secciones separadas, una cabecera con `lastOperationApplied` siempre visible, estados de carga, error y vacío, y paginación. Lint y build en verde.

## Resultado obtenido
- Commit `f818823`.
- La cabecera (fuera de `<summary>`, que en HTML solo admite contenido de frase o un único heading) muestra:
  - `cycleId`, fase y ventana;
  - reporte enviado, pendiente o no enviado;
  - budget final;
  - una franja destacada "Última operación aplicada" con tipo y hora.
- **Smoke test de render** (API.11), con el ciclo real `cycle-248793` más uno con todos los campos null. Cifras verificadas a mano:
  - demand: `12395.49 × 65.49 = 811780.64` → "budget -811.780,64 cr";
  - pago: `25678.82 × 68.76 = 1765675.66` → "ingreso +1.765.675,66 cr";
  - tope: "Tope de precio 68,76";
  - el ítem #92 marcado como "Última operación" (`.181` contra `.184`);
  - en el ciclo null: "Sin status-statement", "Reporte no enviado", "Ninguna todavía" y "—".
- Arreglado antes del commit: el badge decía "Budget final — cr" con budget null; ahora muestra "—" sin la unidad.
- **En el navegador contra producción (Esteban, 3D):** "V2: paginado, 13 páginas, funciona".

## Archivos modificados
- `src/components/CycleHistory.jsx`
- `src/components/ui/Icon.jsx` (ícono `chevron`)

## Tests ejecutados
`npm run lint`; `npm run build`; smoke test de render en 4 escenarios (`cycles-real`, `cycles-empty`, `loading`, `error-auth`); revisión manual de Esteban.

## Resultado de los tests
- Lint: 0 errores. Build: OK. Smoke test: 4/4 renderizan sin excepción y con los textos esperados.
- Navegador: 13 páginas con paginación.
- Conteo de requests con el polling de 30 s: **no medido**.

## Decisiones tomadas
- El `<details>` va **debajo** de la cabecera, no envolviéndola: así `lastOperationApplied` queda visible con la tarjeta plegada y el HTML es válido.
- La tarjeta abierta por defecto es la primera de cada página (`i === 0`).
- El monto de cada pago (`round2(q × settled)`) se muestra en la sección de negociaciones, con signo: give = ingreso, take = egreso.

## Bloqueos
Ninguno.

## Observaciones
Si llega un ciclo nuevo mientras la página 1 está abierta, la tarjeta antes primera se pliega: cambia su prop `open`. Es aceptable, porque el ciclo nuevo pasa a ser el que importa.
