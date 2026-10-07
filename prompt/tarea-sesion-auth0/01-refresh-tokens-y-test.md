# V1.fix — Sesión que sobrevive a recargar y `npm test`

## Objetivo
Que recargar la página no cierre la sesión (V1, demo) y que `npm test` corra los tests.

## Contexto
Testeo de punta a punta del sistema (Pedro, 2026-10-07, en local: backend en Docker y front con
`npm run dev`, login real con Auth0 desde `localhost:5173`):
- **F2:** con `main`, F5 vuelve a la pantalla de login. No sale ninguna petición a `auth0.com` y no
  hay errores en consola.
- **F1:** `npm test` falla con "Cannot find module …/src/lib": `node --test src/lib` recibe un
  directorio, y Node 22/24 lo trata como módulo. Los tests están bien: con los archivos explícitos pasan 19/19.
- El repo es de Francisca y Esteban; Pedro no tiene permiso de escritura, así que el PR sale desde un fork.

## Prompt utilizado
```
todas las cosas que podamos arreglar nosotros, arreglemolas. menos lo del UML. todo los temas de
codigo si, solo hace PRs luego. tambien si es de backend las PRs van a david (empanadaz o algo asi es
su usuario) y esteban. frontend es francisca y esteban.
```
Subtarea derivada: "Decisión DF-023 antes del código. Aplica el parche de refresh tokens
(useRefreshTokens, useRefreshTokensFallback, cacheLocation localstorage, invalid_grant y
missing_refresh_token como relogin). Arregla el script de test con un glob. Verifica lint, tests,
build y, en el navegador, la recarga con y sin el parche y la expiración del token."

## Resultado esperado
Con el parche, la sesión sobrevive a F5; `npm test` pasa 19/19.

## Resultado obtenido
- **`main`:** F5 → login (sesión perdida).
- **Con el parche:**
  - F5 → sigue logueado, y `/api/cycles` da 200 contra un master que exige JWT.
  - El token queda en `localStorage` con *scope* `openid profile email offline_access`.
  - **Auth0 no emite refresh token** (configuración del tenant, ver DF-023).
- **Token vencido a mano**, con `expiresAt` en el pasado: vuelve al login de forma limpia, sin errores. Sin refresh token no puede renovar. El access token dura 24 h.
- **Consentimiento:** al pedir `offline_access` desde `localhost`, Auth0 muestra "Authorize EnergyShark" una vez. Pedro lo aceptó.
- **`npm test`:** 19/19.

## Archivos modificados
- `docs/decisiones-frontend.md` (DF-023, commit previo)
- `src/auth/auth0-provider-with-navigate.jsx`, `src/api/client.js`
- `package.json` (`scripts.test`)

## Tests ejecutados
`npm run lint`, `npm test`, `npm run build`. En el navegador (Claude in Chrome): login, F5 y token vencido, con y sin el parche.

## Resultado de los tests
lint OK, 19/19, build OK. Navegador: según "Resultado obtenido".

## Decisiones tomadas
- `useRefreshTokensFallback`, para no empeorar nada mientras Auth0 no emita refresh tokens.
- Glob entre comillas en el script, para que lo expanda `node --test` y no la shell (funciona igual en Windows).

## Bloqueos
La renovación real del token requiere que Jorge active en Auth0 *Allow Offline Access* (API) y *Refresh Token Rotation* (SPA).

## Observaciones
Pendiente opcional: un aviso de "la sesión expiró" al volver al login. Con refresh tokens activos casi no ocurre.
