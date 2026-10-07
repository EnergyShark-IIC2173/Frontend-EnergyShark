# API.10 — `/health` en texto plano y eliminación de los mocks

## Objetivo
Que la card "Estado de la API" no falle con el `ok` en texto plano, y eliminar `src/mocks/` cuando ya no tenga consumidores.

## Contexto
- `curl -i https://api.tiburonshark.me/health` → `HTTP/2 200`, `content-type: text/html; charset=utf-8`, cuerpo `ok`.
- `openapi.yaml` promete JSON `{status, dbConnected, brokerConnected}`. Es un hallazgo para el backend; no se parcha en el front.

## Prompt utilizado
Extracto literal del prompt maestro (completo en `01`):
```
7. `fix(app): health tolera texto plano` y `chore: eliminar mocks`
   - /health devuelve "ok" en texto plano. Borra src/mocks/ solo cuando
     `grep -r "mocks/" src` no devuelva nada.
```
Prompt de la subtarea (extracto literal del plan aprobado, `~/.claude/plans/pasted-content-id-8434-eres-un-jolly-bunny.md`, líneas 124-126):
```
7. **`fix(app): health tolera texto plano`** (`App.jsx`, solo `checkHealth`), luego **`chore: eliminar mocks`** (`git rm -r src/mocks`, solo cuando `grep -r "mocks/" src` esté vacío).

No toco `src/auth/`, `main.jsx`, `.env` ni `.claude/`.
```

## Resultado esperado
- La card muestra `OK: ok`.
- `grep -r "mocks/" src` no devuelve nada y `src/mocks/` queda eliminado.
- Lint y build en verde.

## Resultado obtenido
- Commit `227a900`: `checkHealth` usa `getHealth` y muestra el texto tal cual, o el JSON serializado si algún día cambia.
- `grep -rn "mocks/" src` → sin salida, `exit=1`.
- Commit `e061c1a`: `git rm -r src/mocks` (4 archivos).

## Archivos modificados
- `src/App.jsx` (solo `checkHealth` y un import)
- `src/mocks/cycles.json`, `distance.json`, `negotiation.json`, `rejected.json` (eliminados)

## Tests ejecutados
`grep -rn "mocks/" src`; `grep -rn "mocks" src index.html vite.config.js`; `npm run lint`; `npm run build`.

## Resultado de los tests
- Ambos grep sin coincidencias. Lint: 0 errores. Build: OK.
- La card en el navegador no se reportó en 3D: no hay evidencia directa de `OK: ok` en la UI. El curl sí confirma el `ok` en texto plano.

## Decisiones tomadas
Para no perder información si el backend cumple el contrato, se mostró el JSON serializado como alternativa, en vez de comparar con `'ok'`.

## Bloqueos
Ninguno.

## Observaciones
`/health` no exige token, pero pasa por `apiFetch`, que pide uno. Se dejó así porque el botón dice "Probar /health con token".
