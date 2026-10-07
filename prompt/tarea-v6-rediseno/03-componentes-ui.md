# V6R.3 — Componentes UI presentacionales (`src/components/ui/`)

## Objetivo
Crear las piezas visuales compartidas del rediseño (DF-010): card, tabla, badge, stat tile, botones, inputs y nav. Así todas las vistas se ven iguales, sin agregar lógica ni dependencias.

## Contexto
- Tokens disponibles desde V6R.2.
- La regla del pedido es que los componentes nuevos no tengan estado ni lógica. Los íconos van como SVG inline con `aria-hidden="true"`.
- Los `<button>` de navegación se quedan en `App.jsx` (DF-010), así que aquí solo van sus clases.

## Prompt utilizado
```
Sin prompt nuevo de Esteban: esta subtarea ejecuta el paso 3 del plan aprobado. El prompt maestro y
la aprobación del plan están literales en 01-decisiones-y-tokens.md.
```
Prompt de la subtarea generado a partir de eso:
```
Crear src/components/ui/: classes.js (focusRing, btnPrimary, btnSecondary, navItemActive,
navItemInactive, labelBase, inputBase, th, td, tr), Card (as, highlight, padded, className),
Badge (tone: cyan|pink|orange|success|neutral), StatTile (label, value, unit, tone, icon),
TableCard (card sin padding + overflow-x-auto + table) e Icon (SVG inline hechos a mano,
aria-hidden). Sin hooks, sin handlers, sin dependencias. Contraste según DF-012: text-muted nunca
sobre surface-hover; texto de pills en variantes -soft. Lint, build y grep de hooks en ui/.
```

## Resultado esperado
- 6 archivos nuevos.
- Lint y build OK.
- `grep` de hooks y handlers en `ui/` → 0.

## Resultado obtenido
- **`classes.js`:**
  - **Botones:** el primario lleva un degradado `accent-from → accent-to` con texto `panel`; el secundario lleva borde fino y hover `surface-hover`.
  - **Nav:** el indicador cian es un `inset` abajo en móvil y a la izquierda desde `md`.
  - **Inputs:** fondo `panel` y anillo de foco cian.
  - **Tablas:** `th` en mayúsculas `text-muted` sobre `surface`; filas con divisor superior y hover.
  - **Foco:** `focusRing` con `focus-visible` en botones y en la nav.
- **`Card.jsx`:**
  - `rounded-2xl bg-surface shadow-card`, sin borde, como en la imagen.
  - `highlight` agrega una barra superior rosa→magenta.
  - `padded={false}` evita el conflicto entre `p-6` y `p-0` en `TableCard`.
- **`Badge.jsx`:** pill `rounded-full text-xs font-semibold tabular-nums`, con el tono en un mapa de clases.
- **`StatTile.jsx`:**
  - ícono en un cuadro de color, label en mayúsculas y la cifra en `text-xl` blanco con la unidad en `text`;
  - fondo `bg`, donde `text-muted` da 5,21:1.
- **`TableCard.jsx`:** card sin padding con `overflow-x-auto` y `<table className="w-full border-collapse">`.
- **`Icon.jsx`:** 9 íconos de trazo, dibujados a mano (history, network, handshake, alert, pulse, bolt, wallet, battery, plug).

## Archivos modificados
- `src/components/ui/classes.js`, `Card.jsx`, `Badge.jsx`, `StatTile.jsx`, `TableCard.jsx`, `Icon.jsx` (nuevos)

## Tests ejecutados
```
npm run lint
npm run build
grep -rnE "useState|useEffect|useAuth0|onClick|fetch" src/components/ui
```

## Resultado de los tests
- Lint: sin errores.
- Build: OK.
- `grep`: 0 coincidencias ("ui sin hooks ni handlers").

## Decisiones tomadas
- En el tono `violet` de `StatTile`, el ícono va en blanco sobre `violet/25`: `violet` como texto no alcanza AA.
- No se creó un componente `Logo`. El `<img>` de `tiburonImg` queda en `App.jsx` con su `alt` literal, para no mover imports.
- Tailwind v4 detecta las clases en `classes.js` sin configuración, porque escanea `.js` y `.jsx`.

## Bloqueos
Ninguno.

## Observaciones
Nada de esto se ve todavía en pantalla: lo usan los pasos 4 a 9.
