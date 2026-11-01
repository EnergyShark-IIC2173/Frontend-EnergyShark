# S11.3 — Fase v3, última operación por referencia y totales de compra

## Objetivo
Lógica pura y probada para la vista (DF-026, DF-027).

## Contexto
- `src/lib/cycles.js` tenía `matchLastOperation` (heurística de DF-020) y `reportPending` (DF-019).
- El enunciado: "La central es la única autoridad de tiempo: los instantes exactos viajan en el status-statement".

## Prompt utilizado
```
Hagamos 1, recuerda dejar todo documentado, preguntame lo que sea necesario y cuando comitees no dejes coautor en los commits durante esta entrega, eso puedes dejarlo en el Claude.md que dejaste fuera de los repos
```
Prompt de la subtarea (escrito por el agente al cierre de la sesión, a partir de lo hecho):
```
En src/lib/cycles.js: marketPhase (pending, market, closing, closed desde opensAt, closesAt, reportOpensAt y
validUntil), reportPending v3 hasta validUntil, matchLastOperation por ref exacta (swapId o msgId) con caída
a la heurística E1, hasLegacyData y buyerTotals. En src/lib/status.js: etiquetas de fases, estados de swap y
bid, roles y los tipos de operación v3. Tests con node --test, con los valores esperados calculados a mano.
```

## Resultado esperado
Tests nuevos en verde y los existentes sin cambios.

## Resultado obtenido
- Commit `e2c9a39`. 5 tests nuevos; suite total 24/24.

## Archivos modificados
- `src/lib/cycles.js`
- `src/lib/cycles.test.js`
- `src/lib/status.js`

## Tests ejecutados
```
node --test src/lib/*.test.js
```

## Resultado de los tests
24/24 OK.

## Decisiones tomadas
- `buyerTotals` suma solo swaps `settled` con rol `buyer`: `7300 + 3000 = 10300` kWh,
  `2409000 + 1230000 = 3639000` CR y transporte `536112 + 361500 = 897612` CR.
- Una referencia que no está en el detalle no marca nada; la cabecera igual muestra la operación (como DF-020).

## Bloqueos
Ninguno.

## Observaciones
- **`npm test` falla en Node 20** (también en `main`): el glob entre comillas `"src/lib/*.test.js"` solo lo expande
  Node 21+. Con Node 20 hay que usar `node --test src/lib/*.test.js`. No se tocó `package.json`.
