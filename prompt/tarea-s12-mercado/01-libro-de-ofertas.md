# S12.1 — Mercado en vivo (RF02): libro de ofertas y tarifa punitiva

## Objetivo
La vista de RF02: libro de ofertas vigente con precio, `remaining`, transporte hasta cada vendedor según la
`distance-table`, precio efectivo y rutas deshabilitadas marcadas. En Conectividad, la tarifa punitiva y que rige
la última tabla.

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
Pregunta del agente: "¿Dónde va el libro de ofertas (RF02)?". Respuesta literal de Esteban:
```
Vista nueva "Mercado" (Recommended)
```

## Resultado esperado
Decisiones primero (DF-038, DF-039), lógica pura con tests, mocks tras `VITE_USE_MOCKS` y la vista.

## Resultado obtenido
- `src/lib/market.js`: `routeTransport`, `bookRows`, `sortRows`, `bestOffer`; 5 tests nuevos (33/33 en total).
- `src/mocks/market.js` y `getMarketOffers` / `getDistanceTable` con mocks en `src/api/endpoints.js`.
- `MarketBook.jsx` (vista "Mercado" en la sidebar) y `DistanceTable.jsx` con la tarifa punitiva.
- Lint y build limpios; capturas headless en claro, oscuro, 1280 px y 375 px (en un iframe de 375 px, porque
  Chrome headless no baja de 500 px de ancho).

## Archivos modificados
- `docs/decisiones-frontend.md`, `.env.example`
- `src/lib/market.js`, `src/lib/market.test.js`, `src/mocks/market.js`, `src/api/endpoints.js`
- `src/components/MarketBook.jsx`, `src/components/DistanceTable.jsx`, `src/components/Sidebar.jsx`,
  `src/components/ui/Icon.jsx`, `src/App.jsx`
