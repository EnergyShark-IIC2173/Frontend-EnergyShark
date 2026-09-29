# V6R.1 — Decisiones previas y tokens del rediseño (paso 0 y paso 1)

## Objetivo
Dejar escritas y commiteadas las decisiones del rediseño visual (DF-008 a DF-013) **antes** de tocar código (RDOC01), con los tokens finales confirmados contra la imagen de referencia.

## Contexto
- Rama `feat/v6-rediseno`, apilada sobre `v6-deploy`: depende de la migración 1:1 a Tailwind (`2bd6fa5`), que aún no está en `main`.
- DF-003 (1:1 "igual que hoy") y DF-004 (`--spacing: 4px`) quedan reemplazadas por el rediseño.
- El agente planificó en modo plan. Esteban rechazó el primer `ExitPlanMode` con 11 ajustes y después aprobó los ajustes de paleta del paso 0 con 2 precisiones.
- Durante la planificación, Bash y los subagentes estuvieron bloqueados: el clasificador de permisos no daba veredicto. Por eso el plan dejó la imagen y los `grep` de assets como pendientes del paso 0.

## Prompt utilizado
Prompt maestro de Esteban, literal:
```
# Rediseño visual de EnergyShark: Login + Dashboard + vistas V2–V5 (solo capa visual)

## Contexto del proyecto
Este repo es el frontend de EnergyShark (IIC2173, E1): una SPA en React + Vite +
Tailwind CSS v4 con login Auth0. Estructura relevante:

- `src/index.css`: tokens de diseño en `@theme` (Tailwind v4) y estilos base de `:root` y `#root`
- `src/App.jsx`: pantalla de login (no autenticado) y dashboard (autenticado), con
  navegación por pestañas controlada por el estado `activeView`, botón "Probar /health"
  y mensajes de `healthStatus` / `error`
- `src/components/LoginButton.jsx`, `LogoutButton.jsx`
- `src/components/CycleHistory.jsx` (V2, RF01), `DistanceTable.jsx` (V3, RF02),
  `NegotiationAdmin.jsx` (V4, RF04), `RejectedMessages.jsx` (V5, RF05)
- `src/App.css`: boilerplate de Vite que (verifícalo con grep) no se importa en ningún lado

El diseño actual es pobre. Quiero un rediseño completo inspirado en la imagen de
referencia `docs/design/idea_energyshark.png`: un dashboard oscuro, minimalista, con
azul marino profundo y acentos cian, rosa/magenta, violeta y naranja.

## Regla principal: NO se toca la lógica
Está prohibido modificar:
- hooks y su uso (`useState`, `useAuth0`, `useApiClient`), handlers (`checkHealth`,
  `handleSubmit`, los `onChange`), condiciones de render y el flujo de datos
- `src/api/`, `src/auth/`, `src/mocks/`, `main.jsx`, variables de entorno
- valores de estado y de navegación (`'history'`, `'distance'`, `'negotiations'`,
  `'rejected'`), props, keys de listas, atributos de formularios (`type`, `required`,
  `min`, `step`, `value`)
- el contenido informativo: todo dato y todo texto que hoy se muestra debe seguir
  visible (en V2: cycleId, status statement, transferencias, demand statements,
  negociaciones y balances finales; en V3, V4 y V5: todas las columnas actuales)
- ningún estado de UI existente puede desaparecer: "Cargando Auth0...", el resultado
  OK/Error de /health y el email del usuario

Sí está permitido:
- cambiar valores de `className`, incluso dentro de ternarios existentes
  (p. ej. qué color usa el badge de `enabled`), sin cambiar la condición
- reorganizar el JSX de layout: mover los botones de pestañas a un sidebar, crear
  topbar, cards y grids, agrupar datos en contenedores, cambiar h2/h3/p por otras
  etiquetas equivalentes, y reordenar visualmente bloques dentro de una vista
- extraer JSX puramente presentacional a componentes nuevos sin estado ni lógica
  (p. ej. `components/ui/Card.jsx`, `Badge.jsx`, `StatTile.jsx`, `AppShell.jsx`)
- íconos decorativos como SVG inline con `aria-hidden="true"`
- editar `@theme` y `@layer base` en `index.css`, y eliminar `App.css` si confirmas
  que no se usa

No está permitido sin mi aprobación explícita en el plan:
- agregar dependencias (librerías de íconos, de componentes, de gráficos)
- agregar estado nuevo, por ejemplo para un menú hamburguesa. En móvil, resuelve
  el sidebar solo con CSS (ver responsive)

Si algo que quieres lograr visualmente exige tocar lógica, NO lo implementes:
regístralo en el plan como "requiere cambio de lógica, pendiente de aprobación".

## Referencia visual (extraída de la imagen)
Mira tú mismo `docs/design/idea_energyshark.png` y confirma o ajusta estos valores.
Son aproximaciones obtenidas por muestreo de píxeles:

| Rol | Hex aprox. | Dónde aparece en la imagen |
|---|---|---|
| Fondo más profundo (sidebar) | `#0a0f2e` | columna izquierda |
| Fondo del área principal | `#171d45` | panel general |
| Superficie de card | `#1f2550` | cards de la fila superior y paneles |
| Superficie hover / elevada | `#272e5c` | — |
| Borde / divisor | `#2c3360` | separadores del sidebar y de cards |
| Texto principal | `#ffffff` | títulos y cifras |
| Texto secundario | `#9aa0bd` | descripciones |
| Texto apagado / labels | `#5d6389` | "LOREM" del sidebar, subtítulos pequeños |
| Acento primario cian | `#00c2ec` | badges numéricos, toggles, nav activa |
| Acento rosa / magenta | `#ff2e6e` | gauge 51 %, línea del gráfico, logo |
| Acento violeta | `#6a4fd1` | gauge 28 %, barras de progreso |
| Acento naranja | `#f95521` | barras del gráfico |
| Degradado de marco | `#00abec` → `#1e8ae5` | fondo exterior celeste/azul |

Rasgos de estilo a replicar:
- **Layout:** topbar delgada (logo en círculo rosa + nombre, a la derecha
  usuario/acciones) + sidebar izquierdo oscuro con ítems ícono + texto separados por
  divisores finos, con un label de sección en mayúsculas pequeñas y apagadas +
  área principal con grid de cards.
- **Cards:** superficie apenas más clara que el fondo, bordes redondeados (~12–16px),
  sombras suaves y difusas en lugar de bordes marcados, mucho padding.
- **Stat tiles:** la fila superior de la imagen (ícono, título, subtítulo y un badge
  "pill" cian con la cifra) sirve de modelo para mostrar números clave.
- **Badges:** forma pill (`rounded-full`), cifras en tamaño pequeño y peso semibold.
- **Tipografía:** sans limpia, títulos semibold blancos, subtítulos pequeños en gris
  azulado, labels de sección en uppercase con tracking amplio. Números con
  `tabular-nums`.
- **Acentos con moderación:** el cian es el acento principal y el rosa el
  secundario; violeta y naranja solo para diferenciar categorías o estados.
- **Degradados** (cian→azul, rosa→magenta) solo en detalles puntuales: fondo del
  login, borde o barra superior de una card destacada, botón primario.

## Decisiones de diseño por pantalla

### Tokens (`src/index.css`)
- Redefine los tokens existentes (`bg`, `surface`, `surface-hover`, `border`, `text`,
  `text-h`, `accent`, `warm`, `danger`, `caution`) con la paleta nueva. Así se
  conserva la compatibilidad mientras migras.
- Agrega tokens semánticos nuevos: `panel`, `text-muted`, `pink`, `violet`,
  `success`, y los colores del degradado. Ningún componente debe usar hex sueltos.
- Corrige `#root`: quita `width: 1126px` y `text-align: center` para permitir un app
  shell a ancho completo. Evalúa si mantener `font-size: 18px` en `:root` o bajarlo
  a 16px, y justifícalo en el plan.

### Login (rama `!isAuthenticated` de `App.jsx`)
- Pantalla completa con el degradado cian→azul de fondo y una card central azul
  marino (como el panel de la imagen).
- Dentro de la card: `tiburon.png` en un círculo con acento rosa, "EnergyShark"
  como título, una línea de subtítulo breve y `LoginButton` como botón primario de
  ancho completo.
- El estado "Cargando Auth0..." debe verse centrado y con el mismo estilo (no un
  `<p>` suelto).

### Dashboard (rama `isAuthenticated` de `App.jsx`)
- **App shell:** topbar + sidebar + área principal.
- **Sidebar:** los 4 botones actuales (Historial de Ciclos, Conectividad,
  Negociaciones, Errores/NACKs) se convierten en ítems del sidebar, cada uno con un
  ícono SVG. Conservan sus `onClick` y la comparación con `activeView` intactos.
  Estado activo: fondo levemente más claro, texto blanco e indicador cian.
- **Topbar:** logo y nombre a la izquierda; a la derecha, el email del usuario
  (hoy "Sesión iniciada como...") y `LogoutButton` como botón secundario.
- **Salud de la API:** el botón "Probar /health con token" y los mensajes
  OK/Error van a una card compacta de "Estado de la API" al fondo del sidebar
  (equivale al widget circular de la imagen), o a la topbar si no calza. El
  resultado OK en cian o verde, el error en rosa o rojo.

### V2 — Historial de Ciclos (`CycleHistory.jsx`)
- Una card por ciclo; en el encabezado, `cycleId` + badge.
- Status Statement y Balances Finales como stat tiles (Generación, Consumo, Costo
  base, Presupuesto, Energía) con la cifra en badge pill o en número grande.
- "Operaciones" como lista de filas con un punto de color por tipo: transferencia
  en cian, demand statement en violeta, negociación en rosa. El estado de la
  negociación va como badge.

### V3 — Conectividad (`DistanceTable.jsx`)
- Encabezado con título y "Última actualización" como subtítulo apagado.
- Tabla dentro de una card con contenedor `overflow-x-auto`, encabezados en
  uppercase pequeño y apagado, filas separadas por divisores finos y hover sutil.
- `Habilitado` como pill cian y `Deshabilitado` como pill rosa (solo cambian las
  clases del ternario).

### V4 — Negociaciones (`NegotiationAdmin.jsx`)
- Formulario en una card: inputs y select oscuros (`bg` o `panel`) con borde fino y
  anillo de foco cian. Reemplaza `font-[Arial] text-[13.3333px]` por la tipografía
  del sistema.
- "Proponer" como botón primario cian.
- Tabla de historial con el mismo estilo que V3 y el estado como pill:
  confirmed/paid en cian o verde; el resto, neutro.

### V5 — Duplicados y NACKs (`RejectedMessages.jsx`)
- Mismo estilo de tabla que V3 y V4. Badge de `kind`: duplicate en naranja, el
  resto en rosa.

### Transversal (V6)
- **Responsive:** bajo `md`, el sidebar pasa a ser una barra horizontal
  desplazable arriba del contenido, solo con clases de Tailwind y sin estado
  nuevo. Las tablas anchas hacen scroll dentro de su propia card, nunca el body.
  Los grids de stat tiles bajan de columnas en pantallas angostas.
- **Accesibilidad:** contraste AA como mínimo en texto y `focus-visible` visible
  en todos los botones, ítems del sidebar e inputs.
- **Consistencia:** card, tabla, badge, botón primario, botón secundario e input
  deben verse iguales en todas las vistas.

## Fase 1 — Descubrimiento (plan mode, sin editar)
1. Lee `CLAUDE.md` completo, en especial la sección y el formato de documentación.
2. Lee todos los archivos listados en "Contexto" y la imagen de referencia.
3. Confirma con grep si `App.css` y los assets `hero.png`, `react.svg` y `vite.svg`
   se usan.

## Fase 2 — Plan (entrégalo y espera mi aprobación)
El plan debe incluir:
- **Tokens:** la tabla final de tokens con sus hex, ajustados tras mirar la imagen.
- **Componentes UI nuevos:** qué componentes presentacionales vas a crear y sus
  props visuales.
- **Orden de archivos:** `index.css` → componentes UI nuevos → `LoginButton` /
  `LogoutButton` → `App.jsx` (login + shell) → V2 → V3 → V4 → V5 → pasada de
  responsive y accesibilidad. Para cada archivo, qué cambia visualmente.
- **Diagrama del layout:** un boceto ASCII del dashboard y del login.
- **Pendientes y riesgos:** los puntos "pendientes de aprobación" y cualquier
  riesgo de romper lógica.

No edites ningún archivo hasta que apruebe el plan.

## Fase 3 — Ejecución archivo por archivo
Por cada archivo:
1. Aplica solo lo planificado.
2. Ejecuta `npm run build` (y `npm run lint` si existe); no avances si falla.
3. Revisa el `git diff` del archivo: cualquier cambio que no sea clases, markup de
   layout o componentes presentacionales se revierte. En particular, verifica que
   no cambió ningún handler, condición, key ni atributo de formulario.
4. Documenta el cambio antes de pasar al siguiente archivo.
5. Detente y muéstrame el resultado después de `App.jsx`, para validar la
   dirección visual antes de seguir con V2–V5.

## Documentación
Documenta todos los cambios siguiendo EXACTAMENTE el formato de documentación que
existe en `CLAUDE.md`: misma estructura de secciones, encabezados, estilo de
entradas y nivel de detalle. Incluye la tabla final de tokens, los componentes UI
creados, la lista de archivos modificados con qué cambió en cada uno, y los
archivos eliminados, si los hubo. Si algún tipo de cambio no calza en el formato
existente, pregúntame antes de crear una sección nueva.

## Cierre
Entrega un resumen con:
- los archivos tocados, creados y eliminados
- la confirmación de que `npm run build` pasa
- la confirmación de que no cambió lógica, con el comando de diff que usaste para
  verificarlo
- la lista de mejoras descartadas por requerir lógica
```
Respuesta de Esteban al plan (rechazo de `ExitPlanMode` con ajustes), literal:
```
Apruebo el plan con estos ajustes:

1. Imagen: ya dejé docs/design/idea_energyshark.png (PNG real). Úsala en el paso 0
   para confirmar o ajustar los tokens y repórtame las diferencias antes de seguir.
2. Bash: ya habilité los permisos. Si algún comando se vuelve a bloquear, detente y
   avísame; no des por verificado nada que no hayas podido ejecutar.
3. Pendiente #1 (healthStatus/error dentro de la card "Estado de la API"): aprobado,
   copiando las condiciones y expresiones literales.
4. App.css: se mantiene según DF-006; no se toca.
5. Assets sin uso: solo se reportan.
6. Apruebo agregar id + htmlFor a los labels e inputs de V4 (solo esos atributos, sin
   tocar los demás) y cambiar index.html a lang="es" con <title>EnergyShark</title>.
   Documenta ambos en DF-012.
7. toLocaleString, menú hamburguesa e indicador de carga de /health: siguen descartados.
8. Presupuesto en V2 con tono cyan (el naranja queda reservado para "duplicate").
9. text-muted y text: diferéncialos por tamaño, mayúsculas y tracking, no solo por
   color. Si puedes, sube un poco el contraste de text para separarlos, manteniendo AA.
10. En móvil (< md), la card "Estado de la API" va al final del contenido, no arriba.
11. El Auth0Context del preview debe incluir un getAccessTokenSilently simulado, para
    que el botón /health se vea en las capturas. El preview no se commitea.

Orden de commits y branch: aprobados como los propones. Pide mi OK antes de cada commit.
Recuerda el ALTO después de App.jsx con capturas.
```
Respuesta de Esteban al reporte del paso 0 (el agente propuso 4 ajustes: `panel #0f1739`, topbar en `bg`, degradado del marco `#1492e4 → #00e6f6`, mantener `accent #00c2ec` y usar `#00e8f8` solo en el botón), literal:
```
Apruebo los ajustes 1 a 4, con dos precisiones:

1. Sidebar (panel #0f1739): agrégale border-r border-border. Contra bg #171d45 el
   contraste es de solo 1,08:1 y, con la topbar en bg-bg, sin divisor se funde con el
   área principal.
2. Login: ningún texto va directo sobre el degradado #1492e4 → #00e6f6 (el blanco
   sobre #00e6f6 da 1,5:1). Todo el texto va dentro de la card.

Agrega al script de contraste estos pares y confirma que pasan:
- text-muted y text sobre panel #0f1739
- texto del botón (#0f1739) sobre #00e8f8 y sobre #1e8ae5

Registra en DF-008 los valores finales tal como quedaron después del paso 0.
OK para crear la rama feat/v6-rediseno y seguir con el paso 1 (DF-008 a DF-013 y
prompt/tarea-v6-rediseno/01). Pídeme autorización antes del commit.
```
Prompt de la subtarea generado a partir de eso:
```
Paso 0: convertir docs/design/idea_energyshark.png (AVIF por dentro) a PNG en el scratchpad con
sips, mirarla y muestrear color dominante por zona con un script sin dependencias. Comparar contra la
tabla de Esteban y reportar diferencias; esperar su OK.
Paso 1: crear la rama feat/v6-rediseno desde v6-deploy. Script de contraste WCAG (node) con los pares
de texto/fondo del plan más los que pidió Esteban (text y text-muted sobre panel; texto del botón
#0f1739 sobre #00e8f8 y #1e8ae5). grep de App.css y assets en src, index.html y vite.config.js.
Agregar al final de docs/decisiones-frontend.md DF-008..DF-013 (sin editar DF-001..007), con los
tokens finales del paso 0 en DF-008. Escribir este registro. No tocar código. Pedir autorización
antes del commit.
```

## Resultado esperado
- Los tokens confirmados contra la imagen, con las diferencias reportadas.
- Todos los pares de texto con contraste ≥ 4,5:1.
- DF-008 a DF-013 escritas, sin cambios en el código.

## Resultado obtenido
- **Imagen:** `idea_energyshark.png` resultó ser AVIF (`file` → "ISO Media, AVIF Image"). Convertida con `sips` a 740×493 px en el scratchpad; el archivo del repo no se tocó.
- **Muestreo por zonas:**
  - Coinciden: fondo principal (`#181d48` ≈ `#171d45`), card, divisor, rosa (`#f82868`), naranja (`#f85800`) y violeta (entre `#8038f8` y `#5848a8`).
  - Difieren:
    - sidebar: `#141c40` a `#0c1838`, así que `panel` pasa a `#0f1739`;
    - topbar: del color del área principal, así que va en `bg`;
    - marco: `#1492e4 → #00e6f6`;
    - badges cian: `#00e8f8`, más brillantes.
  - Esteban aprobó los 4 ajustes y agregó `border-r border-border` al sidebar y la regla de no poner texto sobre el degradado.
- **Contraste (primera corrida):**
  - 25 de 26 pares OK.
  - **Falla:** `text-muted` sobre `surface-hover` da 4,14:1. Se decide que el `thead` va sobre `surface` y que `text-muted` nunca va sobre `surface-hover` (DF-012).
  - Pares pedidos por Esteban:
    - `text-muted` / `panel` 5,63;
    - `text` / `panel` 8,15;
    - botón `#0f1739` / `#00e8f8` 11,56;
    - botón `#0f1739` / `#1e8ae5` 4,84.
- **Assets:**
  - Sin referencias: `hero.png`, `react.svg`, `vite.svg` y `public/icons.svg`.
  - `App.css` sin imports.
  - En uso: `tiburon.png` y `favicon.svg`.
- **Documentación:** DF-008 a DF-013 agregadas al final de `docs/decisiones-frontend.md`.

## Archivos modificados
- `docs/decisiones-frontend.md` (DF-008 a DF-013 agregadas)
- `prompt/tarea-v6-rediseno/01-decisiones-y-tokens.md` (nuevo)

## Tests ejecutados
```
file docs/design/idea_energyshark.png
sips -s format png docs/design/idea_energyshark.png --out <scratchpad>/idea.png
python3 <scratchpad>/regions.py <scratchpad>/sample.py <scratchpad>/idea.png   # color dominante por zona
node <scratchpad>/contrast.mjs                                                  # 26 pares WCAG
grep -rnE "App\.css|hero\.png|react\.svg|vite\.svg|icons\.svg|favicon" src index.html vite.config.js
```

## Resultado de los tests
- Contraste: 25/26 en la primera corrida. El par que falla (`text-muted` sobre `surface-hover`) se resuelve por regla de uso, sin cambiar el token.
- `grep`: una sola coincidencia (`index.html:5`, `favicon.svg`).

## Decisiones tomadas
- `accent` se mantiene en `#00c2ec` y no en el `#00e8f8` de la imagen: 6,90:1 como texto sobre `surface`. `#00e8f8` queda solo como inicio del degradado del botón.
- Tokens de degradado del botón con nombre `accent-from` / `accent-to`.
- El `thead` va sobre `surface` con un divisor, no sobre `surface-hover`, por contraste.

## Bloqueos
Ninguno. El bloqueo de Bash durante la planificación se resolvió al habilitar Esteban los permisos.

## Observaciones
- ~~Si el equipo quiere un PNG real en `docs/design/`, puede convertirlo con `sips -s format png`. Hoy el archivo es AVIF con extensión `.png`.~~
  **Corrección (misma fecha):** a pedido de Esteban, antes del commit `da7269d` se sobrescribió `docs/design/idea_energyshark.png` con la conversión. `file` → "PNG image data, 740 x 493". Ver `02-index-css.md`.
- Esta subtarea se registró **durante** la sesión, antes de su commit.
