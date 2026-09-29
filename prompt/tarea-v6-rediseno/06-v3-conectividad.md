# V6R.6 — V3 Conectividad (`DistanceTable.jsx`)

## Objetivo
Rediseñar la vista V3 (RF02):
- título y "Última actualización" como subtítulo;
- tabla dentro de `TableCard`, con encabezados en mayúsculas apagadas, divisores finos y hover;
- estado como pill: cian para Habilitado, rosa para Deshabilitado.

## Contexto
- `TableCard`, `Badge` y las clases `th`, `td` y `tr` vienen de V6R.3.
- DF-012: el `thead` va sobre `surface`, no sobre `surface-hover`, por contraste.

## Prompt utilizado
```
Sin prompt nuevo de Esteban: esta subtarea ejecuta el paso 7 del plan aprobado (prompt maestro y
aprobación literales en 01-decisiones-y-tokens.md; la instrucción de continuar está en
05-v2-historial.md).
```
Prompt de la subtarea generado a partir de eso:
```
DistanceTable.jsx: encabezado h2 + subtítulo text-sm text-text con la misma expresión de fecha.
TableCard con th/td/tr de classes.js; key={destination} intacto; celdas numéricas tabular-nums.
Badge tone={data.enabled ? 'cyan' : 'pink'} con el texto {data.enabled ? 'Habilitado' :
'Deshabilitado'} intacto. Verificar con check.sh (expresiones y conteos HEAD vs ahora), lint, build
y capturas a 1440 y 360, incluyendo un destino deshabilitado sin tocar src/mocks.
```

## Resultado esperado
- Única diferencia en las expresiones: el ternario de clases pasa a ternario de `tone`, con la misma condición.
- Textos y columnas intactos.
- La tabla hace scroll dentro de su card a 360px.

## Resultado obtenido
- Tabla con `th` en `text-xs uppercase tracking-widest text-muted`, filas con `border-t` y `hover:bg-surface-hover`, y destino en cian semibold.
- **Hallazgo:** con `uppercase`, "Distancia (m)" se mostraba como "DISTANCIA (M)" y "(cr/kWh\*km)" como "(CR/KWH\*KM)". El texto era el mismo, pero la unidad cambiaba de significado (M = mega).
  - **Corrección:** las unidades van en `<span className="normal-case">` dentro del `th`.
  - `--dump-dom` confirma `Distancia <span>(m)</span>` y `Costo <span>(cr/kWh*km)</span>`.
- **Pill "Deshabilitado":**
  - Ningún destino del mock está deshabilitado.
  - Para verla, el preview (no versionado) pone `distances.TAR.enabled = false` **en memoria** con `?disabled=1`.
  - `git status src/mocks` sigue vacío.
- **Capturas:** `v3-1440.png`, `v3-1440-head.png` y `v3-360.png`. A 360px, la columna Estado queda alcanzable con el scroll de la card y el body no se desborda.

## Archivos modificados
- `src/components/DistanceTable.jsx`

## Tests ejecutados
```
npm run lint
npm run build
<scratchpad>/check.sh src/components/DistanceTable.jsx 'Object.entries(distances).map(([destination, data])' 'key={destination}' 'data.enabled ?' ...
git status --short src/mocks
Chrome --headless=new --dump-dom ...?view=Conectividad | grep '<th'
```
`check.sh` (scratchpad) compara, entre `HEAD` y el archivo actual, las expresiones JSX `{…}` sin contar las constantes de clase, y cuenta ocurrencias de cada patrón.

## Resultado de los tests
- Lint: sin errores. Build: OK.
- Expresiones:
  - ausente: `` {`rounded-sm px-2 py-1 ${data.enabled ? 'bg-warm/15 text-warm' : 'bg-danger/20 text-danger'}`} ``;
  - nueva: `{data.enabled ? 'cyan' : 'pink'}`.

  Es la misma condición y solo cambian los valores de clase.
- Conteos `HEAD → ahora`:
  - `data.enabled ?` 2 → 2;
  - `key={destination}` 1 → 1;
  - `Object.entries(distances).map(...)` 1 → 1;
  - 4 encabezados, 2 textos de estado, título, fecha y los 2 valores de distancia y costo: todos 1 → 1.
  - Las unidades de los 2 encabezados se revisaron con `--dump-dom`, porque después de la corrección van en un `span`.

## Decisiones tomadas
- **Subtítulo en `text-text`, no en `text-muted`:** `text-muted` se reserva para labels en mayúsculas (ajuste 9).
- **Unidades en `normal-case`:** sin eso, las mayúsculas del label cambian lo que significa la unidad. El mismo criterio se aplica a los labels de V4.
- **`tabular-nums` en distancia y costo:** alinea las cifras entre filas.

## Bloqueos
Ninguno.

## Observaciones
- El toggle `?disabled=1` del preview es una forma de ver el estado Deshabilitado sin tocar `src/mocks`. Se borra junto con el preview.
