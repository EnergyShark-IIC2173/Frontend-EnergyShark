# V6R.2 — Tokens y estilos base en `src/index.css`

## Objetivo
Llevar la paleta de DF-008 y la base de DF-009 a `src/index.css` (`@theme` y `@layer base`), sin tocar componentes.

## Contexto
- Commit previo con la documentación: `da7269d` (DF-008 a DF-013, registro 01 e imagen de referencia).
- Antes de ese commit, a pedido de Esteban, `docs/design/idea_energyshark.png` (AVIF por dentro) se sobrescribió con la conversión a PNG real.
  - `file` → "PNG image data, 740 x 493, 8-bit/color RGB".
  - `docs/design/idea_energyshark.jpg` ya no existía y nada de `docs/design/` estaba versionado, así que no hubo que tocar nada más.
  - Se guardó una copia del AVIF original en el scratchpad de la sesión (no versionada).
- Los componentes todavía usan los tokens del 1:1. Esta subtarea solo cambia el CSS.

## Prompt utilizado
```
Autorizo el commit, con la imagen, pero como PNG real:

1. Sobrescribe docs/design/idea_energyshark.png con tu conversión (sips -s format png)
   y confirma con `file` que dice "PNG image data".
2. Revisa con git status si docs/design/idea_energyshark.jpg existe y si está versionado.
   Si está sin versionar, no lo agregues; si está versionado, avísame antes de tocarlo.
3. Commit: "docs: decisiones de frontend del rediseno visual (V6)", con
   docs/decisiones-frontend.md, prompt/tarea-v6-rediseno/01-decisiones-y-tokens.md
   y docs/design/idea_energyshark.png.

Después sigue con el paso 2 (src/index.css).
```
Prompt de la subtarea generado a partir de eso:
```
Reescribir src/index.css: @theme con los tokens finales de DF-008 (panel, bg, surface,
surface-hover, border, text-h, text, muted, accent, accent-from/to, frame-from/to, pink, pink-soft,
magenta, violet, orange, orange-soft, success, danger) y warm/caution como legado temporal con los
valores nuevos; --shadow-card difusa; quitar --spacing y --radius-* (DF-009). @layer base: :root a
16px (default del navegador) con line-height 1.5, sin letter-spacing ni media query de 1024px, con
color-scheme: dark; #root sin width 1126px ni text-align center. Correr lint y build; revisar el
diff de solo este archivo. No tocar componentes.
```

## Resultado esperado
- `npm run lint` y `npm run build` pasan.
- El diff solo toca `src/index.css`.

## Resultado obtenido
- `src/index.css` reescrito: 32 inserciones y 27 borrados.
- El token de label se llama `--color-muted`, así que la clase es `text-muted`. Si se hubiera llamado `--color-text-muted`, la clase habría sido `text-text-muted`.
- **Mientras no se migren los componentes, la página cambia de aspecto:**
  - los espaciados y radios vuelven a rem;
  - los colores legado apuntan a la paleta nueva.

  Es esperable, porque los componentes se rediseñan en los pasos siguientes.

## Archivos modificados
- `src/index.css`
- `prompt/tarea-v6-rediseno/01-decisiones-y-tokens.md`: la observación del AVIF quedó tachada y con su corrección.

## Tests ejecutados
```
file docs/design/idea_energyshark.png
npm run lint
npm run build
git diff --stat
```

## Resultado de los tests
- Lint: sin errores.
- Build: OK. El aviso de chunk JS > 500 kB ya estaba antes y no depende de este cambio.
- `git diff --stat`: solo `src/index.css`.

## Decisiones tomadas
- `color-scheme: dark` en `:root`: el `<select>` nativo, sus opciones y las barras de scroll se ven oscuros, sin CSS adicional.
- No se fija `font-size` en `:root`: se usa el tamaño del navegador (16px por defecto), para respetar la configuración del usuario (DF-009).
- `warm` y `caution` se mantienen como legado con los valores nuevos, hasta la pasada final (paso 10).

## Bloqueos
Ninguno.

## Observaciones
Ninguna.
