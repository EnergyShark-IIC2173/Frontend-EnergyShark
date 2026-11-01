# S11.4 — Vista RF01 y verificación

## Objetivo
`CycleHistory.jsx` con todo lo que pide RF01 en la E2, cargando el detalle al expandir (DF-024).

## Contexto
- La cabecera (fase, ventana, reporte, saldo y última operación) sale del listado; el detalle, de `getCycle`.
- Decisión humana: secciones E1 solo si traen datos (DF-026).

## Prompt utilizado
```
Hagamos 1, recuerda dejar todo documentado, preguntame lo que sea necesario y cuando comitees no dejes coautor en los commits durante esta entrega, eso puedes dejarlo en el Claude.md que dejaste fuera de los repos
```
Respuesta literal de Esteban a la prueba en el navegador:
```
Se ve bien
```
Prompt de la subtarea (escrito por el agente al cierre de la sesión, a partir de lo hecho):
```
CycleCard con estado open y <details> controlado; CycleDetail se monta solo abierto y pide getCycle, con
polling de 30 s solo en la primera tarjeta de la página 1. Secciones v3: status-statement con sellable,
precios, minBid e instantes; financiamiento con multa, saldo y línea de crédito; oferta con
actualizaciones; bids recibidos y enviados con razón de rechazo y available; swaps con estado final,
transporte y ruta deshabilitada; totales de compra; imbalance-settlement; reporte; saldos al cierre. Bloque
"Protocolo E1" solo si hasLegacyData. Verificar con lint, tests, build y una prueba en el navegador con
VITE_USE_MOCKS=true (login de Esteban).
```

## Resultado esperado
Las secciones de RF01 visibles con mocks y la última operación marcada en su ítem.

## Resultado obtenido
- Commit `30d95e3`.
- Prueba en el navegador por Esteban (`VITE_USE_MOCKS=true npm run dev`, login propio): "Se ve bien".

## Archivos modificados
- `src/components/CycleHistory.jsx`

## Tests ejecutados
```
npm run lint
node --test src/lib/*.test.js
npm run build
```

## Resultado de los tests
Lint sin errores, 24/24 y build en verde (con el aviso de chunk > 500 kB).

## Decisiones tomadas
- Un ciclo es v3 si trae `market` o `statusStatement.market`; si no, se muestra como E1.
- Las unidades pasan a `CR` (créditos de la wallet); las secciones E1 conservan `cr` y `budget`.

## Bloqueos
Ninguno.

## Observaciones
- Contra el backend actual (E1), `GET /api/cycles` y `GET /api/cycles/{id}` traen la forma de la E1: la vista
  los muestra como ciclos E1. No se probó contra ese backend en esta sesión.
