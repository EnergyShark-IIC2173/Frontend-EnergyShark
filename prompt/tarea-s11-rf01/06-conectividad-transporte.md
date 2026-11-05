# S11.6 — Conectividad: transporte por kWh y rutas deshabilitadas

## Objetivo
Adelantar la parte de RF02 que no depende de S6: transporte por kWh y rutas deshabilitadas destacadas (DF-029).

## Contexto
- La vista ya mostraba `enabled` con un badge.
- `distance` viaja en metros: el enunciado de la E1 da 62 763 183 → "62.763 km" y 1 kWh ≈ 213 créditos con 0,0034.
- `disabledRouteTransportCost` lo expone Francisca en S6: no se usa.

## Prompt utilizado
```
Partamos con 1 y 2, no me interesa por ahora arreglar lo de node 20, es algo que como grupo debemos debatir antes de hacer
```
Respuesta literal de Esteban a la prueba en el navegador:
```
Se ve bien
```
Prompt de la subtarea (escrito por el agente al cierre de la sesión, a partir de lo hecho):
```
src/lib/transport.js con transportPerKwh = round2(distance/1000 × transportCost), distanceKm y
disabledRoutes, con tests usando el ejemplo del enunciado. DistanceTable: distancia en km, columna
"Transporte (CR/kWh)", "Tarifa punitiva" en rutas deshabilitadas, fila rosada y aviso con la lista de
rutas caídas. Probar en el navegador contra la API del .env (solo GET).
```

## Resultado esperado
`transportPerKwh({ distance: 62763183, transportCost: 0.0034 }) = 213.39`; vista con la columna nueva.

## Resultado obtenido
- Commit `bb15339`.
- `62763.183 × 0.0034 = 213.3948 → 213.39` y `94306.517 × 0.0013 = 122.5984721 → 122.6`, verificados en tests.
- Prueba en el navegador por Esteban: "Se ve bien".

## Archivos modificados
- `src/lib/transport.js` (nuevo)
- `src/lib/transport.test.js` (nuevo)
- `src/components/DistanceTable.jsx`

## Tests ejecutados
```
npm run lint
node --test src/lib/*.test.js
npm run build
```

## Resultado de los tests
Lint sin errores, 18/18 y build en verde.

## Decisiones tomadas
- En una ruta deshabilitada no se muestra cifra: la tarifa punitiva no viene en el endpoint actual.
- `transport.js` reutiliza `round2` de `negotiation.js` en vez de duplicarlo.

## Bloqueos
Ninguno.

## Observaciones
- No consta si en la prueba había alguna ruta deshabilitada: el aviso rosado no se vio confirmado con datos reales.
- En S6, cuando Francisca exponga `disabledRouteTransportCost`, "Tarifa punitiva" puede pasar a mostrar la cifra.
