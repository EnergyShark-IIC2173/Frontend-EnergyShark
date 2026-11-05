# S12.1 — Mercado en vivo (RF02): libro de ofertas y tarifa punitiva

## Objetivo
La vista de RF02: libro de ofertas vigente con precio, `remaining`, transporte hasta cada vendedor según la
`distance-table`, precio efectivo y rutas deshabilitadas marcadas (anomalía 6). En Conectividad, la tarifa
punitiva y que rige la última tabla.

## Contexto
- Domingo 1/nov. El endpoint del libro es de Francisca (S6) y no existe; la `distance-table` tiene endpoint pero
  sin `disabledRouteTransportCost`. DF-029 ya había puesto el transporte por kWh en Conectividad.
- Referencia API v3: `offer` (`offerId`, `quantity`, `pricePerEnergy`), `offer-updated` (`remaining`, precio),
  `offer-withdrawn`, `market-closed`; `disabledRouteTransportCost` por kWh y km; rige la última `distance-table`.
- Rama apilada sobre `feat/rediseno-studylicc` (PR #12), porque #10, #11 y #12 esperan su segundo revisor.

## Prompt utilizado
```
Sigamos con la S12 en el frontend
```
(Respondía a la propuesta del agente de seguir con S12 en el front mientras E-API esperaba a S5 y S7.)

Pregunta del agente: "¿Dónde va el libro de ofertas (RF02)?". Respuesta literal de Esteban:
```
Vista nueva "Mercado" (Recommended)
```
Después, al ver el 404 sin mocks:
```
existe un npm run dev con esa flag? para no tener que cambiarla despues?
```
Prompt de la subtarea generado a partir de eso:
```
Rama feat/e2-s12-mercado sobre feat/rediseno-studylicc. Primer commit solo docs: DF-038 (vista Mercado, forma
propuesta de GET /api/market/offers para S6, precio efectivo calculado en el front con la distance-table,
filas propia y sin ruta, orden, polling 5/10 s, mocks) y DF-039 (tarifa punitiva y "rige la última tabla" en
Conectividad). Luego src/lib/market.js puro con tests (routeTransport, bookRows, sortRows, bestOffer), mocks y
endpoint, MarketBook.jsx con estados de carga/404/error/cerrado/vacío, ítem en la sidebar y DistanceTable con la
tarifa. Verificar con lint, node --test, build y capturas headless en claro, oscuro, 1280 y 375 px.
```

## Resultado esperado
DF antes del código; 5 tests nuevos de `market.js` pasando; la vista muestra el libro con una ruta deshabilitada
marcada y su precio efectivo con tarifa punitiva; sin scroll horizontal de la página a 375 px.

## Resultado obtenido
- `91a79a4` DF-038 y DF-039; `75a4059` lógica y tests; `6847e07` endpoint y mocks; `cfcaa97` vista y Conectividad;
  `14c385c` AI log; `d76937a` `npm run dev:mocks`.
- El primer mock abría el mercado "hace 4 min" y la cuenta regresiva no avanzaba: se cambió a un mercado que abre
  en cada múltiplo de 10 min.
- La primera captura a 375 px parecía desbordar: Chrome headless no baja de 500 px (se midió `innerWidth`). Se
  repitió dentro de un iframe de 375 px: sin desborde.

## Archivos modificados
- `docs/decisiones-frontend.md`, `.env.example`, `.env.mocks`, `package.json`
- `src/lib/market.js`, `src/lib/market.test.js`, `src/mocks/market.js`, `src/api/endpoints.js`
- `src/components/MarketBook.jsx`, `src/components/DistanceTable.jsx`, `src/components/Sidebar.jsx`,
  `src/components/ui/Icon.jsx`, `src/App.jsx`

## Tests ejecutados
```
npx eslint src
node --test src/lib/*.test.js
npx vite build
```

## Resultado de los tests
eslint sin errores; 33/33 (5 nuevos); build OK. `npm test` falla en Node 20 por el glob entre comillas (pasa en Node 22).

## Decisiones tomadas
- Precio efectivo calculado en el front — una sola fuente de la tabla vigente (la elige el backend).
- Oferta propia sin precio efectivo — comprarse a sí mismo es `SELF_TRADE`.
- Libro cada 5 s y tabla cada 10 s — la anomalía 6 se ve en segundos sin cargar de más a master.
- `npm run dev:mocks` con `.env.mocks` commiteado — prende los mocks sin editar el `.env` (pedido de Esteban).

## Bloqueos
S6 (Francisca): `GET /api/market/offers` y `disabledRouteTransportCost` en `GET /api/distance-table`. Sin eso la
vista muestra el aviso de 404.

## Observaciones
- Pasarle a Francisca la forma de DF-038 antes de que implemente S6.
- No se probó con login real.
- Este archivo se completó a las 11 secciones de `CLAUDE.md` después de abrir la PR #13 (la primera versión tenía
  menos secciones).
