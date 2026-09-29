# Decisiones de frontend

Registro de decisiones del frontend de EnergyShark que no son de arquitectura: estilos, herramientas y convenciones de UI. Las decisiones de arquitectura del sistema viven en los ADRs del repo del backend (`docs/adr/`).

Cada entrada dice qué se decidió, qué se descartó, quién lo decidió y dónde vive en el código. Si una decisión cambia, se agrega una entrada nueva que la reemplaza; no se edita la anterior.

> **Nota de honestidad (RDOC01):** DF-001 a DF-007 se escribieron el 2026-09-27, al cierre de la sesión y **después** de implementar. Las decisiones se tomaron durante la sesión y quedaron registradas en los planes aprobados por Esteban, pero este documento no se commiteó antes del código. Detalle en `docs/ai_docs/2026-09-27-esteban-v6-tailwind.md`.

---

## DF-001 — Skill de diseño `design-taste-frontend` adaptada a EnergyShark

**Fecha:** 2026-09-27 · **Unidad:** V6 · **Decidió:** Esteban (humana) + agente (redacción)

- **Contexto:**
  - Esteban copió a `.claude/skills/SKILL.md` una skill de diseño que venía de otro proyecto (StudyLicc).
  - Claude Code no la cargaba: exige la ruta `.claude/skills/<nombre>/SKILL.md`.
  - Además, su sección de marca "prevalecía" sobre todo y describía otra paleta, otras fuentes y otro stack (Next.js).
- **Decisión:**
  - Mover la skill a `.claude/skills/design-taste-frontend/SKILL.md`.
  - Reemplazar la sección "Marca StudyLicc" por "Marca EnergyShark". Esa sección formaliza la paleta actual (navy + cian), el alcance (UI de dashboard), los radios, el movimiento y los textos en español de Chile.
  - Permitir que la skill recomiende Tailwind v4, `motion` y Phosphor.
- **Opciones presentadas:**
  - Paleta: formalizar la actual / proponer una nueva.
  - Stack: CSS plano / permitir libs.
- **Decisión humana:** "Formalizar la actual (Recommended)" y "Permitir agregar libs".
- **Dónde vive:** `.claude/skills/design-taste-frontend/SKILL.md`. **No está versionada:** `.claude` se agregó a `.gitignore` en el commit `5b9686f`. Cada integrante que la quiera usar necesita su copia local.

## DF-002 — Tailwind CSS v4 con tokens en `@theme`

**Fecha:** 2026-09-27 · **Unidad:** V6 · **Decidió:** Esteban (pedido) + agente (implementación)

- **Contexto:** todo el estilo estaba en objetos `style={{}}` inline que leían variables CSS de `src/index.css`.
- **Decisión:**
  - Instalar `tailwindcss` y `@tailwindcss/vite` 4.3.3 (la última al 2026-09-27) y registrar el plugin en `vite.config.js`.
  - Declarar la paleta como tokens en `@theme` (`src/index.css`), con los mismos valores de antes.
- **Renombres:**
  - `--success` (#dd6e42) pasa a `--color-warm`: es naranja y no significa "éxito".
  - Los hex sueltos en componentes pasan a tokens: `#ff6b6b` → `--color-danger`, `#ffc107` → `--color-caution`.
- **Alternativa descartada:** Tailwind v3 con `tailwind.config.js`. La v4 configura todo desde CSS y es la versión actual.
- **Dónde vive:** `src/index.css`, `vite.config.js`, `package.json`. La equivalencia token viejo → clase nueva está en `docs/diseno-anterior.md`.

## DF-003 — Migración 1:1: la página se ve igual que antes

**Fecha:** 2026-09-27 · **Unidad:** V6 · **Decidió:** Esteban (humana)

- **Opciones presentadas:**
  - "Igual que hoy (Recommended)": traducción 1:1 de los estilos.
  - "Aplicar la skill": además, verde para "Habilitado", `tabular-nums`, focus ring cian y hover en filas.
- **Decisión humana:** "Igual que hoy (Recommended)".
- **Consecuencia:** las mejoras de la skill quedan para después (V6, pulido). Por ahora "Habilitado" sigue en naranja (`text-warm`).

## DF-004 — `--spacing: 4px` y radios en px

**Fecha:** 2026-09-27 · **Unidad:** V6 · **Decidió:** agente

- **Contexto:**
  - `:root` usa `font: 18px/145%`, así que en esta app `1rem = 18px`.
  - Tailwind calcula espaciados y radios en `rem`: `p-4` mediría 18px en vez de 16px.
- **Decisión:** en `@theme`, fijar `--spacing: 4px` y `--radius-sm/md/lg/xl` en 4/6/8/12px.
- **Tamaños de texto:** van con valores arbitrarios en px (`text-[14px]`, `text-[48px]`). Esos valores no fijan line-height, así que heredan los 26,1px de `:root`, como antes.
- **Alternativa descartada:** bajar `:root` a 16px. Eso cambiaba el tamaño de todo el texto.

## DF-005 — Compensar el preflight de Tailwind

**Fecha:** 2026-09-27 · **Unidad:** V6 · **Decidió:** agente, a partir de la comparación de capturas. Las consideraciones de Esteban sobre `<img>`, `<table>` y `<p>` se revisaron y se incorporaron al plan.

El preflight resetea estilos del navegador. Para que nada cambiara:

| Elemento | Síntoma sin ajuste | Ajuste |
|---|---|---|
| `button` | 8px más alto (hereda line-height y letter-spacing) | `leading-[normal] tracking-normal` |
| `input`, `select` | 1px más altos (heredan la fuente de la app) | `font-[Arial] text-[13.3333px] leading-[normal] tracking-normal`; `box-content` en `input` |
| `hr` | línea de 1px en vez de 2px | `border border-border [border-style:inset]` |
| `h2`, `h3`, `h4` | sin márgenes ni tamaños del navegador | `mt-[0.83em]`, `text-[1.17em] mb-[1em]`, `mt-[1.33em]` |
| `h1` a exactamente 1024px | `max-lg` es `< 1024px` y el original era `<= 1024px` | `max-[1025px]:text-[32px]` |
| `table` | — | `border-collapse` explícito (ya lo tenía inline) |
| `img` | — | sin cambio: es un flex item, ya se comportaba como bloque |
| `p` | — | sin cambio: `index.css` ya tenía `p { margin: 0 }` |

## DF-006 — `App.css` se conserva sin importar

**Fecha:** 2026-09-27 · **Unidad:** V6 · **Decidió:** Esteban (humana)

- **Contexto:** el agente eliminó `src/App.css` en la migración. Es CSS del template de Vite y de él solo se usaba `#center`. El equipo quería conservarlo como referencia.
- **Opciones presentadas:**
  - "Doc .md con todo (Recommended)".
  - "Solo restaurar App.css".
  - "ex-app.css + ex-index.css".
- **Decisión humana:** "Doc .md con todo (Recommended)".
- **Qué se hizo:**
  - `App.css` se restauró idéntico a `HEAD`, sin importarlo.
  - `docs/diseno-anterior.md` documenta la paleta y los estilos del `index.css` anterior, que era donde estaban los colores.
- **Advertencia:** si alguien vuelve a importar `App.css`, sus `var(--accent)`, `var(--border)`, etc. no resuelven, porque los tokens ahora se llaman `--color-*`.

## DF-007 — Cambios solo visuales

**Fecha:** 2026-09-27 · **Unidad:** V6 · **Decidió:** Esteban (restricción del pedido)

- **Regla:** no se toca estado, handlers, datos, Auth0 ni la estructura de los elementos.
- **Estilos condicionales:** mantienen exactamente la misma condición, ahora dentro de `className`. Ejemplo: `activeView === 'history' ? tabActive : tabInactive`.
- **Única adición en JS:** tres constantes con cadenas de clases en `src/App.jsx` (`buttonBase`, `tabActive`, `tabInactive`), para no repetir la clase de botón 4 veces.

---

> Las decisiones DF-008 a DF-013 se escribieron el 2026-09-29, **antes** de implementar el rediseño, en su propio commit (RDOC01). Plan aprobado por Esteban con ajustes; detalle en `prompt/tarea-v6-rediseno/`.

## DF-008 — Rediseño visual basado en `docs/design/idea_energyshark.png` (reemplaza a DF-003)

**Fecha:** 2026-09-29 · **Unidad:** V6 · **Decidió:** Esteban (humana: pedido, paleta muestreada y ajustes) + agente (muestreo y cálculo de contraste)

- **Contexto:**
  - La migración 1:1 (DF-003) mantuvo un diseño pobre.
  - Esteban pidió un rediseño completo, basado en una imagen de referencia: dashboard oscuro con topbar, sidebar y cards; navy con acentos cian, rosa, violeta y naranja.
- **Paso 0 (verificación de la imagen):**
  - `idea_energyshark.png` es un AVIF por dentro. Se convirtió con `sips` a un PNG en un directorio temporal y se muestreó por zonas (color dominante).
  - Coincidieron: fondo principal, card, divisor, rosa, naranja y violeta.
  - Se ajustaron, con aprobación de Esteban:
    - `panel`: de `#0a0f2e` a `#0f1739`;
    - topbar en `bg` (no en `panel`), como en la imagen;
    - degradado del marco: `#1492e4 → #00e6f6`;
    - inicio del degradado del botón: `#00e8f8`.
- **Tokens finales (`src/index.css`, `@theme`):**

| Token | Hex | Uso |
|---|---|---|
| `panel` | `#0f1739` | sidebar (con `border-r border-border`), inputs |
| `bg` | `#171d45` | fondo del área principal y de la topbar |
| `surface` | `#1f2550` | cards, `thead` |
| `surface-hover` | `#272e5c` | hover de filas e ítems del sidebar |
| `border` | `#2c3360` | divisores finos |
| `text-h` | `#ffffff` | títulos, cifras |
| `text` | `#aab0cc` | texto secundario, celdas (subido desde `#9aa0bd` para separarlo de `text-muted`) |
| `text-muted` | `#8a90b8` | labels en `text-xs uppercase tracking-widest font-semibold` (el `#5d6389` de la imagen no pasa AA) |
| `accent` | `#00c2ec` | acento primario: nav activa, pills, foco |
| `accent-from` / `accent-to` | `#00e8f8` → `#1e8ae5` | degradado del botón primario (texto `panel`) |
| `frame-from` / `frame-to` | `#1492e4` → `#00e6f6` | fondo del login (sin texto encima) |
| `pink` / `magenta` | `#ff2e6e` / `#b5179e` | decorativo: logo, puntos, barra destacada |
| `pink-soft` | `#ff6b98` | texto de pills rosas |
| `violet` | `#6a4fd1` | decorativo: puntos |
| `orange` / `orange-soft` | `#f95521` / `#ff8a5c` | decorativo / texto de la pill "duplicate" |
| `success` | `#34d399` | OK de /health, pill confirmed/paid |
| `danger` | `#ff6b98` | Error de /health, "Deshabilitado" |

- **Reglas de uso:**
  - Ningún componente usa hex sueltos.
  - Cian es el acento principal y rosa el secundario; violeta y naranja solo diferencian categorías.
  - El naranja queda reservado para "duplicate" (Presupuesto de V2 va en cian).
  - Ningún texto va directo sobre el degradado del login: el blanco sobre `#00e6f6` da 1,54:1.
- **Alternativa descartada:** mantener el 1:1 de DF-003 y solo pulir detalles. No resolvía el pedido.
- **Dónde vive:** `src/index.css`. La paleta anterior sigue documentada en `docs/diseno-anterior.md`.

## DF-009 — `:root` a 16px y escala por defecto de Tailwind (reemplaza a DF-004)

**Fecha:** 2026-09-29 · **Unidad:** V6 · **Decidió:** agente (propuesta en el plan) + Esteban (aprobación)

- **Contexto:** DF-004 fijó `--spacing: 4px` y radios en px porque `:root` usaba 18px y el objetivo era un 1:1 exacto. Con el rediseño, ese objetivo ya no existe.
- **Decisión:**
  - `:root` a 16px, sin la media query de 1024px ni el `letter-spacing` global.
  - Se quitan los overrides `--spacing` y `--radius-*`: vuelven la escala en rem y los tamaños de texto de Tailwind, cada uno con su line-height.
  - `#root` pierde `width: 1126px` y `text-align: center`, para permitir un app shell a ancho completo.
- **Por qué:** el rem respeta el tamaño de letra que el usuario configura en el navegador (accesibilidad), y ya no hacen falta valores arbitrarios en px.
- **Alternativa descartada:** mantener 18px con `--spacing: 4px`. Obliga a seguir usando tamaños arbitrarios en todos los componentes.

## DF-010 — Componentes UI presentacionales y `classes.js`

**Fecha:** 2026-09-29 · **Unidad:** V6 · **Decidió:** agente (propuesta) + Esteban (aprobación)

- **Decisión:** crear `src/components/ui/` sin estado, sin hooks y sin lógica:
  - `classes.js`: constantes de clases (`btnPrimary`, `btnSecondary`, `navItemActive`, `navItemInactive`, `inputBase`, `labelBase`, `th`, `td`, `focusRing`), que reemplazan `buttonBase`, `tabActive` y `tabInactive` de `App.jsx`;
  - `Card`, `Badge` (`tone`), `StatTile`, `TableCard` e `Icon` (SVG inline con `aria-hidden="true"`, dibujados a mano, sin dependencias).
- **Regla:** las condiciones existentes se copian literales. Solo cambia a qué clase o tono apuntan. Ejemplo: `tone={data.enabled ? 'cyan' : 'pink'}`.
- **Alternativa descartada:**
  - Librerías de componentes o de íconos (Phosphor, Lucide): agregan dependencias, y el pedido las prohíbe sin aprobación.
  - Un componente `NavItem`: los 4 `<button>` quedan en `App.jsx`, para que el diff de sus `onClick` sea nulo.

## DF-011 — App shell y responsive sin estado

**Fecha:** 2026-09-29 · **Unidad:** V6 · **Decidió:** Esteban (humana: layout, ubicación de /health, orden en móvil) + agente (implementación)

- **Decisión:**
  - **Login:** pantalla completa con el degradado del marco y una card central (logo, título, subtítulo y botón). "Cargando Auth0..." usa la misma pantalla.
  - **Shell:**
    - topbar en `bg` con un divisor inferior (logo, "Sesión iniciada como", email y botón de salir);
    - sidebar en `panel` con `border-r` (4 ítems con ícono y la card "Estado de la API");
    - área principal.
  - **Render (decisión humana):** los mensajes `healthStatus` y `error` pasan a la card "Estado de la API", dentro de la rama autenticada. Sus condiciones y expresiones se copian literales.
    - Es equivalente en la práctica: `checkHealth` solo se ejecuta autenticado, y `logout` hace una redirección completa que vuelve a montar `App`.
  - **Responsive (< md):**
    - la nav pasa a ser una fila horizontal con `overflow-x-auto`;
    - la card de API va **al final del contenido** (orden en el DOM: nav → main → API);
    - desde `md`, un grid la ubica al fondo del sidebar.
  - Las tablas hacen scroll dentro de su card.
  - Sin estado nuevo.
- **Descartado (requiere lógica):** menú hamburguesa e indicador de carga de /health, porque necesitan estado nuevo.

## DF-012 — Accesibilidad: contraste AA, foco visible, labels y `lang`

**Fecha:** 2026-09-29 · **Unidad:** V6 · **Decidió:** agente (cálculo) + Esteban (aprobación de atributos)

- **Contraste:** calculado con la fórmula WCAG en un script. Todo el texto normal da ≥ 4,5:1:
  - `text` 6,81 y `text-muted` 4,70 sobre `surface`;
  - sobre `panel`: `text-muted` 5,63 y `text` 8,15;
  - texto del botón (`panel`) 11,56 sobre `#00e8f8` y 4,84 sobre `#1e8ae5`;
  - pills: `accent` 5,21, `pink-soft` 4,78, `orange-soft` 5,40 y `success` 5,66, cada una sobre su fondo al 15 %.
- **Hallazgo del script:** `text-muted` sobre `surface-hover` da 4,14:1 y no pasa. Por eso el `thead` va sobre `surface` con un divisor, y `text-muted` nunca se usa sobre `surface-hover`.
- **`text` / `text-muted`:** se diferencian por tipografía, no solo por color: `text-muted` va en mayúsculas, `text-xs` y `tracking-widest`.
- **Foco:** `focus-visible` con outline cian en los botones y en los ítems del sidebar; anillo cian en inputs y select.
- **Movimiento:** las transiciones usan `motion-reduce:transition-none`.
- **Cambios de atributos aprobados por Esteban:**
  - V4: `id` + `htmlFor` en los 4 pares label/control, sin tocar `type`, `value`, `required`, `min` ni `step`;
  - `index.html`: `lang="es"` y `<title>EnergyShark</title>`.
- **Descartado:** formatear cifras con `toLocaleString` en V2, porque cambia expresiones.

## DF-013 — `App.css` y assets sin uso

**Fecha:** 2026-09-29 · **Unidad:** V6 · **Decidió:** Esteban (humana)

- **`App.css`:** se mantiene según DF-006, sin tocarlo, aunque ningún archivo lo importa (verificado con `grep`).
- **Assets sin referencias** (`grep -rnE` en `src`, `index.html` y `vite.config.js`): `src/assets/hero.png`, `react.svg`, `vite.svg` y `public/icons.svg`.
  - Solo se reportan; no se borran.
  - En uso: `tiburon.png` (`App.jsx`) y `favicon.svg` (`index.html`).
