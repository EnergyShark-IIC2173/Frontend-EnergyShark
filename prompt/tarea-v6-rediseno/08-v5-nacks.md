# V6R.8 — V5 Duplicados y NACKs (`RejectedMessages.jsx`)

## Objetivo
Rediseñar la vista V5 (RF05) con el mismo estilo de tabla que V3 y V4. El badge de `kind` va en naranja para duplicate y en rosa para el resto.

## Contexto
- El naranja queda reservado para "duplicate" (ajuste 8 del plan).
- Antes, "duplicate" se veía en amarillo (`caution`) y el resto en rojo (`danger`).

## Prompt utilizado
```
Sin prompt nuevo de Esteban: esta subtarea ejecuta el paso 9 del plan aprobado. Prompt maestro y
aprobación literales en 01-decisiones-y-tokens.md.
```
Prompt de la subtarea generado a partir de eso:
```
RejectedMessages.jsx: h2 igual; TableCard con th/td/tr; key={msg.id};
Badge tone={msg.kind === 'duplicate' ? 'orange' : 'pink'} con {msg.kind.toUpperCase()} intacto;
razón en font-mono text-xs; código y fecha tabular-nums; detalle con ancho mínimo para que no se
comprima; fecha sin partir. Verificar con check.sh, lint, build y capturas a 1440 y 360.
```

## Resultado esperado
- Única diferencia en las expresiones: el ternario de clases pasa a `tone`, con la misma condición.
- Las 5 columnas y sus valores intactos.

## Resultado obtenido
- **Tabla:** mismo estilo que V3 y V4.
- **Badges:** NACK en rosa (`pink-soft` sobre `pink/15`) y DUPLICATE en naranja (`orange-soft` sobre `orange/15`).
- **Celdas:**
  - razón (`IDENTITY_MISMATCH`) en `font-mono`, porque es un código;
  - detalle con `min-w-56`;
  - fecha con `whitespace-nowrap`.
- A 360px la tabla hace scroll dentro de su card.
- **Capturas:** `v5-1440.png` y `v5-360.png`.

## Archivos modificados
- `src/components/RejectedMessages.jsx`

## Tests ejecutados
```
npm run lint ; npm run build
<scratchpad>/check.sh src/components/RejectedMessages.jsx 'rejectedData.map((msg)' 'key={msg.id}' "msg.kind === 'duplicate' ?" ... '>Fecha<'
Chrome --headless=new --force-prefers-reduced-motion --screenshot (1440; 360 vía iframe)
```

## Resultado de los tests
- Lint: sin errores. Build: OK.
- Expresiones: el ternario de clases de `kind` pasa a `{msg.kind === 'duplicate' ? 'orange' : 'pink'}`, con la misma condición.
- Conteos `HEAD → ahora`: 14 de 14 iguales (1 → 1):
  - `map`, `key` y la condición;
  - las 5 expresiones de celda;
  - el título y los 5 encabezados.

## Decisiones tomadas
- **Razón en monoespaciada:** es un código de error de la API y se lee mejor así.
- **`min-w-56` en el detalle:** sin eso, la columna más larga se comprime a pocas palabras por línea antes de que aparezca el scroll horizontal.

## Bloqueos
Ninguno.

## Observaciones
- Con esta vista, ningún componente usa los tokens legado `warm` ni `caution`. Se revisa y se eliminan en V6R.9.
