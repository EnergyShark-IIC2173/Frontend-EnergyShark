# Fix.3 — Kit `ui/`, logo SVG, íconos Phosphor y switch de tema

## Objetivo
Concentrar la estética en el kit compartido para que las vistas solo cambien clases.

## Contexto
`classes.js`, `Card`, `Badge`, `StatTile`, `Icon` (SVG a mano, DF-010) y `AuthScreen` (degradado, `LogoMark` con `tiburon.png`).

## Prompt utilizado
```
(Plan aprobado por Esteban; mismo prompt de 01.)
```
Prompt de la subtarea (extracto literal del plan aprobado):
```
Kit src/components/ui/: classes.js con los tokens nuevos (textPrimary, textSecondary, surface, sectionTitle);
Card sin sombra con edge-light; Badge con tonos semánticos (active, settled, error, warning, category, neutral)
y se actualizan los tone en src/lib/status.js; StatTile; ViewHeader con title como nodo para .marker;
Logo nuevo: isotipo SVG simple (aleta de tiburón sobre una línea de agua), relleno accent con trazo ink, más el
wordmark EnergyShark en Space Grotesk 700; public/favicon.svg repite el path; AuthScreen con grid-lines sin
degradado; ThemeSwitch: role="switch", "Modo oscuro", aria-checked desde useSyncExternalStore, 44 px.
```

## Resultado esperado
Kit sin clases viejas, con el logo nuevo renderizado bien en ambos temas.

## Resultado obtenido
- El isotipo se renderizó con `qlmanage` sobre fondo claro y oscuro antes de usarlo. La onda se ajustó para que fuera simétrica.
- Commit `d46520a`.
- Tonos en `status.js`: duplicado y periodo de cierre → `warning`; NACK, rechazado y ruta deshabilitada → `error`;
  liquidado → `settled`.

## Archivos modificados
- `src/components/ui/*` (nuevos `Logo.jsx` y `ThemeSwitch.jsx`), `src/lib/status.js`, `public/favicon.svg`

## Tests ejecutados
`npx eslint src`

## Resultado de los tests
Sin errores.

## Decisiones tomadas
- `Icon.jsx` mantiene su API `name` y mapea a Phosphor, así las vistas no cambian sus llamadas.
- `error` y `warning` llevan ícono dentro del badge: un estado nunca depende solo del color.
- El favicon cambia el color de la onda con `prefers-color-scheme`.

## Bloqueos
Ninguno.

## Observaciones
`tiburon.png` deja de importarse pero no se borra (criterio de DF-013).
