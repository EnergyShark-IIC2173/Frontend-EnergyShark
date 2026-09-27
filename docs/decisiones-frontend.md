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
