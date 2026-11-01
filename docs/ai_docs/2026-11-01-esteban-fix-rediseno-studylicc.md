# AI log — Fix propio: rediseño con la estética de StudyLicc, modo claro y oscuro

**Fecha:** 2026-11-01
**Integrante:** Esteban
**Herramienta:** Claude Code (Opus 5.5), modo agéntico (edita archivos y corre comandos en el repo), en la extensión de VS Code. Modo plan con aprobación. Sin subagentes.
**Unidad del roadmap:** ninguna. Es un fix visual propio de Esteban, fuera de las tareas S de la E2. Prompt literal en `prompt/tarea-fix-rediseno-studylicc/01-decisiones-y-plan.md`.
**Rama:** `feat/rediseno-studylicc`, apilada sobre `feat/e2-retiro-negociaciones` (PR #11, HEAD `20ee738`), porque Esteban pidió partir "desde la actual (últimos cambios)". El PR va con base `feat/e2-retiro-negociaciones`.
**Referencias:** guía de StudyLicc fuera del repo (`E1/docs/studylicc-design/`: `DESIGN.md`, `globals.css`, `Logo.tsx`); DF-008, DF-010, DF-012, DF-019.
**Detalle por subtarea (prompts literales y resultados):** `prompt/tarea-fix-rediseno-studylicc/`

## Objetivo de la sesión
Cambiar el estilo de neón del rediseño V6 por la estética de StudyLicc (tinta, acento verde, subrayador amarillo,
fondos de cuaderno, bordes cálidos y sin sombras ni degradados), con modo claro y oscuro, sin tocar la lógica de las
vistas.

## Flujo de trabajo
1. **Lectura.** `DESIGN.md`, `globals.css` y `Logo.tsx` de StudyLicc, y todo el front actual (shell, kit `ui/`, las 3
   vistas, `status.js` y `format.js`).
2. **Decisiones humanas (4 preguntas del agente sobre choques entre el prompt de StudyLicc y EnergyShark):**
   - Logo: "Isotipo SVG nuevo, pero no tiene que ser amarillo, que sea del color que mejor estimes conveniente para
     no salirse de la estetica". El agente eligió `accent` con trazo en tinta.
   - Advertencia (lo que era naranja): rose.
   - Nulos y rangos: "Sin dato" y "a" (DF-031, reemplaza la fila "—" de DF-019).
   - Alcance: solo piel y shell. Las vistas mantienen su estructura.
3. **Corrección del plan.** Esteban rechazó el primer plan: el crema de StudyLicc no se ve profesional en un
   dashboard. El claro pasa a un papel casi blanco (`paper` `#fafaf8`, `card` `#ffffff`, `sand-100`/`sand-200` más
   neutros).
4. **Docs antes que el código** (RDOC01): DF-030, DF-031 y `docs/design/sistema-visual.md`, commit `fd16998`.
5. **Implementación:** tokens y tema (`27b4270`), kit `ui/` y logo (`d46520a`), shell y vistas (`2ec7097`), nulos
   (`8acedea`) y ajustes tras revisar capturas (`89b0bbc`).
6. **Verificación:** lint, tests, build, contraste WCAG con un script y capturas en Chrome headless de las 3 vistas y
   el login, en claro y en oscuro, a 1280 y 375 px.

## Qué se construyó
- `docs/decisiones-frontend.md` — DF-030 (rediseño) y DF-031 ("Sin dato" y rangos con "a").
- `docs/design/sistema-visual.md` — guía corta de la estética adaptada a EnergyShark, con checklist.
- `src/index.css` — tokens de StudyLicc con el claro más blanco, bloque `.dark` por rol, variante `dark:` por clase y
  utilidades `focus-ring`, `focus-ring-inset`, `edge-light`, `marker`, `dot-grid`, `ruled-lines` y `grid-lines`, más
  los keyframes.
- `src/lib/theme.js` + script inline en `index.html` — tema claro/oscuro sin parpadeo. Sigue al sistema hasta que eliges
  uno en el switch, y lo guarda en `localStorage` con try/catch.
- `src/main.jsx` — fuentes con `@fontsource` (Space Grotesk 700, Work Sans 400/500/600, Space Mono 400/700).
- `src/components/ui/`:
  - `Logo.jsx` nuevo: aleta sobre una línea de agua más el wordmark;
  - `ThemeSwitch.jsx` nuevo: `role="switch"` con `useSyncExternalStore`;
  - `classes.js` reescrito;
  - `Icon.jsx` con Phosphor bold;
  - `Badge.jsx` con tonos semánticos;
  - `Card`, `StatTile`, `States`, `Pagination`, `ViewHeader` (con `Marker`) y `AuthScreen` con los tokens nuevos.
- `public/favicon.svg` — el isotipo, que reemplaza el favicon por defecto de Vite.
- `src/lib/status.js` — solo los nombres de tono (`active`, `settled`, `error`, `warning`, `category`, `neutral`) y
  el valor nulo.
- `src/lib/format.js` — `EMPTY = 'Sin dato'` (antes `DASH = '—'`), con un test nuevo.
- `src/App.jsx`, `CycleHistory.jsx`, `DistanceTable.jsx`, `RejectedMessages.jsx` — cambian clases y textos; la lógica
  queda igual:
  - un `.marker` por título de vista;
  - ids en Space Mono;
  - el detalle del ciclo entra con `section-in`;
  - rangos con "a".

## Hallazgos / Errores encontrados y corregidos
- **`rose-ink` sobre `rose-soft` da 4,47:1 en claro.** El script de contraste lo detectó antes de escribir los
  componentes. En claro, los chips usan un tinte al 10 % del tono pleno, igual que StudyLicc; los `*-soft` quedan
  solo para el oscuro (DF-030).
- **Punto del `dot-grid`.** `sand-300` daba 1,50:1 sobre el papel blanco, demasiado marcado. Bajó a `#e2e0d9`
  (1,26:1).
- **El bundle pareció subir 246 kB.** Era una comparación mal hecha: el worktree de la base no tenía `.env`, así que
  Vite eliminaba Auth0 como código muerto. Con las mismas condiciones el bundle pasa de 321,7 a 361,5 kB (+40 kB;
  Phosphor aporta 37 kB). Sin el código de Phosphor, los íconos sin usar no entran: se verificó con `grep` de nombres
  y conteo de paths.
- **Revisión de capturas.** Se encontraron y corrigieron tres problemas (`89b0bbc`):
  - el badge de fase heredaba Space Mono del `h3` del `cycleId`;
  - el borde `accent` de la tarjeta destacada perdía contra `border-sand-200`;
  - "Sin dato" se partía en dos líneas en la columna Código.
- **El `summary` "Ver detalle" medía menos de 44 px.** Era el único control bajo el mínimo. Ahora lleva `min-h-11`.

## Verificación
- `npm run lint` → sin errores.
- `npx node@22 --test "src/lib/*.test.js"` → **19/19** (18 anteriores + 1 de DF-031). En Node 20 el glob de `npm test`
  sigue fallando, como ya estaba anotado; no se tocó.
- `npm run build` → en verde. `grep` de `cycle-9432` en `dist/` → sin resultados (los mocks no entran al build).
- Contraste (script WCAG en el scratchpad): todo el texto da al menos 4,5:1 y el foco al menos 3:1 en ambos temas.
  Las cifras están en DF-030.
- Capturas en Chrome headless (`puppeteer-core` con el Chrome instalado). Se usó un harness **fuera del repo** con un
  stub de `@auth0/auth0-react` y respuestas falsas para `/api/distance-table` y `/api/messages/rejected`; los
  ciclos salen de los mocks de DF-025.
  - Login, historial, conectividad y NACKs, en claro y en oscuro, a 1280 y 375 px.
  - Sin errores de página y sin scroll horizontal del body.
- Comportamiento (mismo harness):
  - sin preferencia y con el sistema en oscuro, carga oscuro;
  - el switch cambia a claro, guarda `light` y sigue claro tras recargar;
  - `aria-checked` coincide con el tema;
  - con `prefers-reduced-motion: reduce`, el detalle no anima;
  - el foco con Tab es un outline sólido de 2 px en `accent-ink`;
  - ningún `button` mide menos de 44 px.
- **No verificado:**
  - la vista con el login real de Auth0 y contra la API real (el agente no usa credenciales);
  - Safari y Firefox;
  - el parpadeo del primer paint en un navegador real (el script inline lo evita por diseño, pero no se midió).

## Pendiente / para coordinar
- **Esteban:** revisar en el navegador con su login (`VITE_USE_MOCKS=true npm run dev`). Push y PR solo cuando lo confirme.
- **Con el grupo:** las vistas nuevas de S12 a S14 deben usar `classes.js`, los tonos de `Badge` y
  `docs/design/sistema-visual.md`. Las clases viejas (`text-text-h`, `bg-surface`, `text-pink-soft`…) ya no existen.
- **Merge:** este PR cambia casi todas las líneas de clases de las vistas. Conviene mergearlo después de #10 y #11 y
  antes de abrir S12 a S14, para que no haya conflictos.
- `tiburon.png` y `App.css` quedan en el repo sin importarse (como DF-013).

## Fuera de alcance
- Relayout de las vistas (grillas asimétricas): Esteban eligió solo piel y shell.
- La librería `motion`, el hero y otras piezas de StudyLicc que no aplican a un dashboard.
