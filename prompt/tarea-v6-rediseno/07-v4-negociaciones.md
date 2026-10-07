# V6R.7 — V4 Negociaciones (`NegotiationAdmin.jsx`)

## Objetivo
Rediseñar la vista V4 (RF04):
- formulario en una card, con inputs y select oscuros y un anillo de foco cian;
- "Proponer" como botón primario;
- tabla de historial con el mismo estilo que V3;
- estado como pill: confirmed/paid en verde, el resto en neutro.

## Contexto
- **Ajuste 6 del plan (aprobado por Esteban):** agregar `id` + `htmlFor` en los 4 pares label/control, sin tocar ningún otro atributo.
- El pedido original indica reemplazar `font-[Arial] text-[13.3333px]` por la tipografía del sistema.
- `useState`, `handleSubmit` y los `onChange` no se tocan.

## Prompt utilizado
```
Sin prompt nuevo de Esteban: esta subtarea ejecuta el paso 8 del plan aprobado, con el ajuste 6
(id + htmlFor en V4). Prompt maestro y aprobación literales en 01-decisiones-y-tokens.md.
```
Prompt de la subtarea generado a partir de eso:
```
NegotiationAdmin.jsx: no tocar nada antes de "return (" (salvo imports). Card con h2 y form en grid
(1 / sm:2 / xl:4 campos + botón). Labels en labelBase con htmlFor; controles con id (neg-cycle,
neg-direction, neg-quantity, neg-price) e inputBase; type, value, onChange, required, min, step y
las option literales. Submit con btnPrimary y type="submit". Tabla en TableCard con th/td/tr;
key={neg.id}; Badge tone={neg.status === 'confirmed' || neg.status === 'paid' ? 'success' :
'neutral'}. Verificar: diff del bloque de lógica, líneas onChange/value/required/option idénticas,
check.sh con id/htmlFor como únicas diferencias (+4 y +4), lint, build, capturas.
```

## Resultado esperado
- Bloque de lógica idéntico.
- Solo `id` y `htmlFor` como atributos nuevos: +4 y +4.
- Lint y build OK.
- Controles del formulario alineados.

## Resultado obtenido
- **Formulario:**
  - grid de 1 columna en móvil, 2 desde `sm` y 4 campos + botón desde `xl`;
  - labels en mayúsculas apagadas, con las unidades en `normal-case` (mismo criterio que en V3): "CANTIDAD (kWh)", "PRECIO (cr)";
  - inputs y select en `panel` con borde fino, `focus:border-accent` y `focus:ring-2 ring-accent/40`;
  - `font-[Arial] text-[13.3333px]` reemplazado por la tipografía del sistema (`text-sm`).
- **Tabla:**
  - el ID en blanco y el ciclo en `text-xs` debajo (el `<br/>` pasa a dos `span` block);
  - tipo en cian semibold;
  - la pill "confirmed" en verde (`success`) y "expired" en neutro.
- **Ajustes durante la subtarea:**
  1. El `select` nativo quedaba más alto que los inputs y el botón más bajo. Se fijó `h-11` en `inputBase` y en el submit; medido con una sonda, los 5 controles miden 44px.
  2. A 360px, "1000 kWh" se partía en dos líneas. Las celdas de cifras pasaron a `whitespace-nowrap` en V4, y también en las 2 celdas numéricas de V3.
- **Capturas:** `v4-1440.png`, `v4-768.png`, `v4-360.png` y `v4-360-tabla.png`.

## Archivos modificados
- `src/components/NegotiationAdmin.jsx`
- `src/components/ui/classes.js` (`h-11` en `inputBase`)
- `src/components/DistanceTable.jsx` (`whitespace-nowrap` en las celdas numéricas)

## Tests ejecutados
```
diff <(git show HEAD:src/components/NegotiationAdmin.jsx | sed -n '/^export function/,/^  return (/p') \
     <(sed -n '/^export function/,/^  return (/p' src/components/NegotiationAdmin.jsx)
diff <(git show HEAD:... | grep -E 'onChange=|value=\{|required|<option') <(grep -E ... src/components/NegotiationAdmin.jsx)
<scratchpad>/check.sh src/components/NegotiationAdmin.jsx 'onSubmit={handleSubmit}' 'onChange=' ... 'id="' 'htmlFor="'
npm run lint ; npm run build
Chrome --headless=new --dump-dom (labels) ; sonda de alturas en iframe 1440 ; capturas 1440/768/360
```

## Resultado de los tests
- Bloque de lógica (estado, `handleSubmit`): **IDÉNTICO**.
- Líneas de `onChange`, `value`, `required` y `<option>`: idénticas.
- `check.sh`, conteos `HEAD → ahora`:
  - `onSubmit={handleSubmit}` 1 → 1;
  - `onChange=` 4 → 4;
  - `value={formData.` 4 → 4;
  - `type="text"` 1 → 1, `type="number"` 2 → 2, `type="submit"` 1 → 1;
  - `required` 3 → 3, `min="1"` 2 → 2, `step="0.01"` 1 → 1;
  - las 2 `option`, `key={neg.id}`, la condición de estado y los 11 textos: 1 → 1;
  - **`id="` 0 → 4 y `htmlFor="` 0 → 4: son las diferencias aprobadas.**
- Expresiones: el ternario de clases del estado pasa a `tone`, con la misma condición. Se agrega `` `${inputBase} tabular-nums` `` (solo clases).
- `--dump-dom`: `<label for="neg-cycle">Ciclo</label>` … `<label for="neg-price">Precio <span>(cr)</span></label>`.
- Alturas: `INPUT=44 SELECT=44 INPUT=44 INPUT=44 BUTTON=44`.
- Lint: sin errores. Build: OK.

## Decisiones tomadas
- **`id` con prefijo `neg-`:** evita colisiones si otra vista agrega un formulario.
- **`h-11` en `inputBase`:** unifica la altura del `select` nativo con la de los inputs en todos los navegadores. Así no hace falta `appearance-none`, que obligaría a dibujar una flecha propia.
- **`tabular-nums` en los inputs numéricos:** alinea las cifras al escribir.

## Bloqueos
Ninguno.

## Observaciones
- **Limitación en móvil, descartada por requerir lógica:** la nav horizontal siempre parte desde el inicio. Estando en Negociaciones o Errores/NACKs, el ítem activo queda fuera de la vista hasta hacer scroll. Llevarlo a la vista automáticamente (`scrollIntoView`) requiere JS.
