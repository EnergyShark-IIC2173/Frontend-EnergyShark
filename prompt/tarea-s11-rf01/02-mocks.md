# S11.2 — Mocks de RF01 detrás de `VITE_USE_MOCKS`

## Objetivo
Poder construir y ver RF01 sin el backend de la E2 (DF-025), con la forma de datos de DF-024.

## Contexto
- Decisión humana: "Flag VITE_USE_MOCKS (Recommended)".
- `listCycles` y `getCycle` ya existían en `src/api/endpoints.js` (E1).

## Prompt utilizado
```
Hagamos 1, recuerda dejar todo documentado, preguntame lo que sea necesario y cuando comitees no dejes coautor en los commits durante esta entrega, eso puedes dejarlo en el Claude.md que dejaste fuera de los repos
```
Prompt de la subtarea (escrito por el agente al cierre de la sesión, a partir de lo hecho):
```
src/mocks/cycles.js con tres ciclos: uno en curso como vendedor (mercado abierto hace 4 min), uno cerrado
como comprador (déficit 12 000, multa, ruta deshabilitada, liquidación con cobertura negativa) y uno de la
E1. Instantes calculados desde Date.now(). Montos del "ciclo feliz" del enunciado y saldos coherentes con la
línea de crédito. listCycles y getCycle responden desde los mocks solo con DEV y VITE_USE_MOCKS=true, con
import() dinámico para que no entren al bundle de producción. VITE_USE_MOCKS=false en .env.example.
```

## Resultado esperado
Mocks fuera del bundle de producción y aritmética de los montos verificada.

## Resultado obtenido
- Commit `dcbf671`.
- Primer intento con un saldo inicial de 1 782 073,36 CR en el ciclo comprador: con ese saldo la wallet habría
  rechazado la aceptación de `swp-64` (supera disponible + `creditLine`). Se subió el saldo previo a
  4 782 073,36 CR.
- Saldo final verificado: `4782073.36 − 2409000 − 536112 − 1230000 − 361500 − 1249500 = −1004038.64`.

## Archivos modificados
- `src/mocks/cycles.js` (nuevo)
- `src/api/endpoints.js`
- `.env.example`

## Tests ejecutados
```
npm run build && grep -rl "cycle-9432\|mockListCycles" dist/
```

## Resultado de los tests
Build en verde; el grep no encuentra los mocks en `dist/`.

## Decisiones tomadas
- `.js` en vez de `.json`: los instantes dependen de la hora actual para ver las fases en vivo.
- Solo `listCycles` y `getCycle` usan mocks: el resto de los endpoints sigue yendo a la API.

## Bloqueos
Ninguno.

## Observaciones
- Se borran en S23 (integración con la API real).
