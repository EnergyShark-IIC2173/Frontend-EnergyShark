# S13.2 — Experimento de span (RF06, AD6)

## Objetivo
Vista "Experimento span" para RF06: por ciclo, span usado, déficit cubierto vía mercado, costo efectivo frente al
baseline y bids rechazados, y el agregado por valor de span (AD6: atribución por el snapshot).

## Contexto
- ADR-006 define `cycle_metrics`. La tabla y `GET /api/metrics/cycles` y `/api/metrics/spans` son de David (S9);
  el cálculo al cierre, de Pedro (S8). No existen.
- Leaderboard: `score = Σ ahorro / Σ |baseline|`.

## Prompt utilizado
```
Sigamos entonces con S13 con mockups
```
Respuesta literal de Esteban a "¿Incluyo también RF06 (experimento de span) con mocks en esta sesión?":
```
Sí, RF04 + RF06 (Recommended)
```
Prompt de la subtarea generado a partir de eso:
```
DF-041 con la forma propuesta para S9: métricas por ciclo paginadas y por span con sumas (los cocientes los
calcula el front para no promediar promedios). src/lib/experiment.js puro con tests (ratio sin ceros inventados,
cycleRow, spanRows, bestSpan con mínimo de 3 ciclos, totals). Mocks de 36 ciclos rotando spans 10/20/40.
SpanExperiment.jsx: indicadores, agregado con medidor de ahorro relativo (una serie, cifra en texto, barra
decorativa) y mejor span destacado, tabla por ciclo paginada con span y versión de config. Recarga cada 60 s.
```

## Resultado esperado
Cocientes correctos y sin ceros inventados en los tests; el agregado destaca el mejor span; cada fila por ciclo
muestra el span de su snapshot y la versión de config.

## Resultado obtenido
- En `dd1d01d` (lógica), `089d1fa` (mocks) y `7de23c0` (vista), junto con S13.1.
- Un test de `totals` falló por un error en la cifra esperada del propio test (38,7 en vez de 39,7 millones de
  ahorro); se corrigió el test, no el código.
- Se cargó la guía de visualización de datos antes de la barra: medidor de una sola serie dentro de la celda, con
  la cifra en texto al lado y la barra `aria-hidden`. Sin paleta categórica, no aplica el validador.

## Archivos modificados
- `src/lib/experiment.js`, `src/lib/experiment.test.js`, `src/mocks/metrics.js`, `src/api/endpoints.js`
- `src/components/SpanExperiment.jsx`, `src/components/Sidebar.jsx`, `src/components/ui/Icon.jsx`, `src/App.jsx`

## Tests ejecutados
```
node --test src/lib/*.test.js
```

## Resultado de los tests
51/51 en total (6 de `experiment.test.js` nuevos).

## Decisiones tomadas
- Sumas por span desde el backend y razones en el front — no se promedian promedios.
- "Mejor span" solo con al menos 3 ciclos — no premia un ciclo suelto.
- Recarga cada 60 s — las métricas cambian una vez por ciclo.

## Bloqueos
S9 (David) para los endpoints y S8 (Pedro) para que `cycle_metrics` tenga filas.

## Observaciones
- Capturas headless en claro y oscuro a 1280 px; la tabla por ciclo se desplaza dentro de su card.
- Pasarle a David la forma de DF-041.
