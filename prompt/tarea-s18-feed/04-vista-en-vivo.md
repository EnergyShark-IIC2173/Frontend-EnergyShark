# S18.4 — Vista En vivo, provider del feed y sidebar

## Objetivo
La vista de RF01 de la E3 sobre el cliente de S18.2: feed sin polling, solo con sesión, con reconexión visible.

## Contexto
DF-047 fija el contenido de la vista. Componentes de UI existentes: `Card`, `Badge`, `States`, `ViewHeader`,
`classes.js`. `RELOGIN_ERRORS` vivía sin exportar en `src/api/client.js`.

## Prompt utilizado
```
Podemos hacer DF-046? y el mock de feed? dependo de las tareas de fran?
```
Prompt de la subtarea generado a partir de eso:
```
src/feed/FeedProvider.jsx (useReducer: events, status, detail con at, lastId, received, resets, unseenAlerts,
watching) montado en App bajo el login; getToken con getAccessTokenSilently({cacheMode:'off'}) al forzar y
RELOGIN_ERRORS → authRequired. LiveFeed.jsx: ConnectionStatus (sr-only sin cuenta regresiva), ActiveAlerts con
runbook, chips por grupo con conteo, severidad mínima, búsqueda, pausa con "Reanudar (N nuevos)", lista de
FeedRow con <details> y enlace "Ver ejecución". Sidebar: "En vivo" primero, punto de estado y contador de alertas
nuevas. Vista por defecto: feed. Íconos nuevos de Phosphor. Lint y build.
```

## Resultado esperado
Lint y build limpios; la vista muestra los eventos del servidor de prueba en claro y oscuro, en 1280 y 375 px.

## Resultado obtenido
- Commit `7029603`. `statusText` se movió a `src/lib/feed.js` como `connectionText` (react-refresh pide que un
  archivo de componentes solo exporte componentes).
- La tarjeta de alertas perdió su borde coral: `Card` fija el color del borde.
- Rótulo del buscador acortado a "Buscar" (a 375 px quedaba desalineado con el selector).

## Archivos modificados
- `src/feed/FeedProvider.jsx`, `src/feed/feedContext.js`
- `src/components/LiveFeed.jsx`, `src/components/feed/ConnectionStatus.jsx`, `ActiveAlerts.jsx`, `FeedRow.jsx`
- `src/components/Sidebar.jsx`, `src/components/ui/Icon.jsx`, `src/App.jsx`, `src/api/client.js`

## Tests ejecutados
`npm run lint`, `npm run build`, `npm test`.

## Resultado de los tests
Lint sin errores; build OK (aviso de chunk > 500 kB previo); 85/85.

## Decisiones tomadas
- La conexión vive en un provider de la app — cambiar de vista no corta el feed y la sidebar puede avisar alertas.
- El estado para lectores de pantalla no incluye la cuenta regresiva — evita anunciar cada segundo.
- Vista por defecto "En vivo" — consistente con DF-047.

## Bloqueos
Ninguno.

## Observaciones
Las otras vistas siguen con polling; el requisito "sin polling" es del feed.
