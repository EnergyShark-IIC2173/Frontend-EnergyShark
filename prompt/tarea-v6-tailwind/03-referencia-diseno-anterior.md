# V6.3 — Conservar `App.css` y documentar el diseño anterior

## Objetivo
Que el equipo tenga a mano los colores y detalles del diseño anterior sin afectar la migración a Tailwind.

## Contexto
- En V6.2 se eliminó `src/App.css` y se reescribió `src/index.css`.
- `App.css` es CSS del template de Vite (`.hero`, `#next-steps`, `.counter`...) y no define colores.
- La paleta y los estilos globales estaban en el `index.css` anterior.

## Prompt utilizado
```
Si no borro App.css, modifica algo los cambios que hiciste, queriamos mantenerlo como equipo para tener a la mano los colores y detalles, puedo no borrarlo sin tocar las nuevas clases de tailwind definidas? si es que si lo modifica, puede ser un .md que tenga lo que habia antes, o hasta cambiar el nombre a "ex-app.css"
```
Respuesta de Esteban a la pregunta del agente, literal:
```
"¿Qué quieren conservar como referencia del diseño anterior?"="Doc .md con todo (Recommended)"
```
(opciones: Doc .md con todo / Solo restaurar App.css / ex-app.css + ex-index.css)

Prompt de la subtarea generado a partir de eso:
```
Restaurar src/App.css idéntico a HEAD (git restore --staged --worktree) sin volver a importarlo.
Crear docs/diseno-anterior.md con: aviso de que App.css no se importa y por qué se rompería si se
importa; tabla token viejo -> valor -> clase Tailwind; sombra, fuentes y tipografía base; estilos
globales anteriores (h1, h2, button, code) con su clase equivalente; notas del preflight; el
index.css de HEAD literal. Verificar que el hash del CSS generado no cambie, que App.css sea igual a
HEAD y que no haya imports.
```

## Resultado esperado
- `App.css` en el repo, sin efecto en el build.
- Documento de referencia completo.

## Resultado obtenido
- **Respuesta a la pregunta:** conservar `App.css` no cambia nada. Vite solo empaqueta el CSS importado y Tailwind v4 no escanea `.css`.
- **Advertencia:** si alguien vuelve a importar `App.css`, sus `var(--accent)` y `var(--border)` no resuelven, porque ahora los tokens son `--color-*`.
- **`App.css`:** restaurado, con `git diff HEAD -- src/App.css` vacío.
- **Build:** hash del CSS generado igual antes y después de restaurar (`69d21eaa…`).
- **`docs/diseno-anterior.md`:** creado. Su bloque CSS es idéntico al `index.css` de `HEAD`, salvo el salto de línea final.

## Archivos modificados
- `src/App.css` (restaurado)
- `docs/diseno-anterior.md` (nuevo)

## Tests ejecutados
```
npm run build   # antes y después de restaurar; shasum dist/assets/*.css
git diff HEAD --stat -- src/App.css
grep -rn "App.css" src
diff <(git show HEAD:src/index.css) <(awk '/^```css$/{f=1;next} /^```$/{f=0} f' docs/diseno-anterior.md)
npm run lint
```

## Resultado de los tests
- Hash del CSS idéntico.
- `App.css` sin diferencias con `HEAD` y sin imports.
- Bloque CSS del documento idéntico al original.
- Lint sin errores.

## Decisiones tomadas
- `App.css` no lleva comentario de cabecera, para que quede idéntico al original. La advertencia va en el `.md`.
- El documento de referencia se basa en `index.css`, no en `App.css`, porque ahí estaban los colores que el equipo quería conservar.

## Bloqueos
Ninguno.

## Observaciones
Ninguna.
