# Fix.5 — Nulos "Sin dato" y rangos con "a" (DF-031)

## Objetivo
Sacar el em-dash y el en-dash de la UI según la decisión de Esteban.

## Contexto
`format.js` exportaba `DASH = '—'` (DF-019); `status.js` y `CycleHistory.jsx` tenían "—" literales y la ventana usaba "–".

## Prompt utilizado
```
'Sin dato' + 'a' (Recomendado)
```
(Respondía a la pregunta del agente: "La regla es 'sin em-dash', pero DF-019 usa '—' como marcador de dato nulo
(fmt/orDash, con tests) y la línea de la ventana del ciclo usa '–' en los rangos. ¿Cómo lo resuelvo?")

Prompt de la subtarea (extracto literal del plan aprobado):
```
src/lib/format.js: DASH = 'Sin dato' (renombrar a EMPTY) y lo usan orDash, fmt, fmtDate, fmtTime y truncId.
src/lib/status.js: fallback usa el mismo valor. Actualizar src/lib/format.test.js. CycleHistory.jsx: "Créditos
al cierre" usa EMPTY en vez del '—' literal.
```

## Resultado esperado
Ningún "—" ni "–" en textos de la UI. Tests en verde, con uno nuevo que fija el valor.

## Resultado obtenido
- `DASH` pasa a llamarse `EMPTY`: no había otros usos fuera de `format.js` y su test. `orDash` conserva el nombre para no tocar más archivos.
- "Mercado de 10:00:00 a 10:10:00" y "Ventana: de … a …".
- Commit `8acedea`.

## Archivos modificados
- `src/lib/format.js`, `src/lib/format.test.js`, `src/lib/status.js`, `src/components/CycleHistory.jsx`

## Tests ejecutados
`npx -y node@22 --test "src/lib/*.test.js"`

## Resultado de los tests
19/19 (18 anteriores + 1 nuevo).

## Decisiones tomadas
- `status.js` importa `EMPTY` de `format.js`, para que haya una sola fuente.

## Bloqueos
Ninguno.

## Observaciones
Los comentarios del código conservan sus guiones: la regla es para los textos de la UI.
