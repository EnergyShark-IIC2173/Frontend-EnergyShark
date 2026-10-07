# API.4 — Cliente con errores tipados y respuestas no JSON

## Objetivo
Que `apiFetch` distinga los errores (400/404/409/401/red) y lea respuestas que no son JSON, como `/health` en texto plano o un 204. Base de todas las vistas.

## Contexto
- El cliente anterior siempre llamaba `res.json()`, así que `/health` fallaba. Lanzaba un string `API 401: {...}` y siempre mandaba `Content-Type`.
- master responde `{error}` (`app.js`, controladores); el Gateway, `{message}`.

## Prompt utilizado
Extracto literal del prompt maestro (completo en `01`):
```
1. `feat(api): cliente con errores tipados y respuestas no JSON`
   - client.js: ApiError(status, message, body), lectura según content-type, soporte 204,
     buildQuery, mensaje desde {error} (master) o {message} (Gateway). Mantén la firma
     useApiClient().apiFetch. Content-Type solo cuando hay body.
   - .env.example con las 4 variables VITE_* y SIN valores.
   - Proxy opcional de Vite hacia el backend local (/api y /health → localhost:3001).
   - Ante login_required/consent_required, permite ofrecer "Volver a iniciar sesión".
```
Prompt de la subtarea (extracto literal del plan aprobado, `~/.claude/plans/pasted-content-id-8434-eres-un-jolly-bunny.md`, líneas 90-94):
```
1. **`feat(api): cliente con errores tipados y respuestas no JSON`**
   - `src/api/client.js`: `ApiError(status,message,body)`, `parseBody` (204, content-type), `buildQuery` y el mensaje de error desde `error ?? message`.
   - Content-Type solo cuando hay body. Los errores de Auth0 se envuelven con `authRequired`. Se mantiene la firma `useApiClient().apiFetch`.
   - `.env.example` con las 4 `VITE_*` vacías.
   - `vite.config.js`: `server.proxy` de `/api` y `/health` → `http://localhost:3001`. Solo actúa si `VITE_API_BASE_URL` está vacío.
```

## Resultado esperado
`npm run lint` y `npm run build` en verde, sin cambiar la firma de `apiFetch`.

## Resultado obtenido
- Commit `08a753a`.
- `ApiError` tiene `status` (0 si no hubo respuesta: red o CORS), `body` y `authRequired`.
- `parseBody` solo parsea JSON si el content-type es `application/json`.
- `buildQuery` omite valores vacíos.
- `.env.example` no está ignorado: `git check-ignore` no devuelve nada.

## Archivos modificados
- `src/api/client.js`
- `.env.example` (nuevo)
- `vite.config.js`

## Tests ejecutados
`npm run lint`; `npm run build`; `git check-ignore -v .env.example`; grep de secretos.

## Resultado de los tests
- Lint: 0 errores.
- Build: OK, con el aviso de chunk > 500 kB. Se verificó después (API.11) que ya ocurría en `main`.
- Grep de secretos: solo nombres de variables (`token`, `getAccessTokenSilently`).

## Decisiones tomadas
- Mantener el estilo del archivo original (comillas dobles y punto y coma), aunque el resto del repo no los usa.
- Envolver un fallo de `fetch` (red o CORS) como `ApiError(0, …)`, para que las vistas muestren un mensaje legible en vez de `TypeError: Failed to fetch`.

## Bloqueos
Ninguno.

## Observaciones
El proxy está siempre en la config, pero solo intercepta rutas relativas. Con `VITE_API_BASE_URL` absoluta no interviene.
