# S11.1 — Decisiones previas: carga de RF01, mocks y ciclos de la E1

## Objetivo
Fijar, antes del código, cómo carga la vista de RF01 en la E2, cómo se trabaja sin backend y qué pasa con los
ciclos de la E1 (RDOC01).

## Contexto
- Roadmap E2 (`docs/E2 Road Map.md` del backend, rama `docs/e2-roadmap`): S11 es de Esteban. Incluye la vista RF01
  con mocks y el endpoint de detalle de ciclo en master (asignado en la revisión del roadmap, commit `28f29f2`).
- RF01 en la E2 pide status-statement, financiamiento, oferta y sus actualizaciones, bids enviados y recibidos,
  swaps con estado final, transporte, `imbalance-settlement` y reporte, con la última operación identificada.
- DF-020 (E1) descartó pedir el detalle al expandir porque el listado ya traía todo.
- Los mocks de la E1 se borraron en `e061c1a`. S3, S5, S6 y S7 del backend aún no existen.

## Prompt utilizado
```
Hagamos 1, recuerda dejar todo documentado, preguntame lo que sea necesario y cuando comitees no dejes coautor en los commits durante esta entrega, eso puedes dejarlo en el Claude.md que dejaste fuera de los repos
```
("1" respondía a la propuesta del agente para el día: "S11, RF01 en el front con mocks".)

Respuestas literales de Esteban a las tres preguntas del agente:
```
Resumen + detalle al expandir (Recommended)
Flag VITE_USE_MOCKS (Recommended)
Mostrar solo si traen datos (Recommended)
```
Prompt de la subtarea (escrito por el agente al cierre de la sesión, a partir de lo hecho):
```
Rama feat/e2-base-rf01 desde main. Primer commit, solo docs: DF-024 (resumen en el listado y detalle al
expandir, con la forma propuesta de ambos endpoints), DF-025 (mocks tras VITE_USE_MOCKS, solo en dev),
DF-026 (secciones E1 solo si traen datos) y DF-027 (fase desde los instantes del status-statement y
última operación por referencia exacta).
```

## Resultado esperado
DF-024 a DF-027 en un commit anterior a cualquier código.

## Resultado obtenido
- Commit `71867c0` `docs: decisiones DF-024 a DF-027 previas a S11 (RF01 de la E2)`, primero de la rama.

## Archivos modificados
- `docs/decisiones-frontend.md`

## Tests ejecutados
Ninguno: solo documentación.

## Resultado de los tests
No aplica.

## Decisiones tomadas
- DF-027 (fase y `ref`) la propuso el agente dentro de DF-024: como el endpoint es propio, se pide una referencia
  exacta en `lastOperationApplied` en vez de repetir la heurística de tiempos de DF-020.

## Bloqueos
Ninguno.

## Observaciones
- La forma de los endpoints queda en `src/mocks/cycles.js` hasta escribirla en el `openapi.yaml` (tarea siguiente
  de Esteban, en el repo de contratos y la copia del backend).
