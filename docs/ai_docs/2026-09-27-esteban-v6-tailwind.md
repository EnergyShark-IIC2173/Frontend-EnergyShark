# AI log — V6: skill de diseño y migración del frontend a Tailwind CSS v4

**Fecha:** 2026-09-27
**Integrante:** Esteban
**Herramienta:** Claude Code (Opus 5.5), modo agéntico (edita archivos y corre comandos en el repo), extensión de VS Code, con modo plan y aprobación de Esteban en cada etapa
**Unidad del roadmap:** V6 — Pulido: estados de carga/error, responsive. Esta sesión cubre la base de estilos (Tailwind) y todavía no los estados de carga ni de error. Prompt literal inicial: "Eres capaz de reconocer la skill actual de diseño que copie dentro de la carpeta .claude/skills?"
**Rama:** `v6-deploy`. La sesión empezó en `main` y Esteban cambió a `v6-deploy` a mitad de la sesión (commit `5b9686f feat: ignore claude skills`); los cambios sin commitear siguieron en el working tree.
**Referencias:** `CLAUDE.md` (guía de documentación), `../EnergyShark/docs/E1 Road Map.md` (V1–V6), `docs/decisiones-frontend.md`, `docs/diseno-anterior.md`
**Detalle por subtarea (prompts literales y resultados):** `prompt/tarea-v6-tailwind/`

## Objetivo de la sesión
- Dejar operativa una skill de diseño para el frontend.
- Migrar todos los estilos inline a Tailwind CSS v4 sin cambiar nada visual ni lógico.
- Conservar la referencia del diseño anterior para el equipo.

> Este log y `docs/decisiones-frontend.md` se escribieron al cierre de la sesión, después de implementar (ver "Pendiente").

## Flujo de trabajo
1. **Skill de diseño (V6.1).**
   - El agente detectó por qué no cargaba: estaba en `.claude/skills/SKILL.md` sin carpeta propia, y su marca era de otro proyecto (StudyLicc, Next.js).
   - La movió a `.claude/skills/design-taste-frontend/SKILL.md` y reescribió la sección de marca para EnergyShark.
2. **Decisión humana sobre la skill.**
   - Opciones: mover y adaptar / solo mover / mover y quitar la marca / nada. Esteban eligió "Mover + adaptar marca (Recommended)".
   - Luego eligió "Formalizar la actual (Recommended)" para la paleta y "Permitir agregar libs" para el stack (DF-001).
3. **Migración a Tailwind (V6.2).**
   - Plan aprobado; decisión humana "Igual que hoy (Recommended)" (DF-003).
   - Antes de aprobar, Esteban agregó consideraciones sobre el preflight en `<img>`, `<table>` y `<p>`; quedaron en el plan y en la verificación.
4. **Verificación visual contra `main`.**
   - El agente levantó `main` en un worktree temporal y comparó capturas headless de Chrome.
   - Con eso encontró y corrigió 4 diferencias del preflight (DF-005).
5. **Referencia del diseño anterior (V6.3).**
   - Esteban preguntó si conservar `App.css` alteraba algo. Respuesta: no, porque no se importa.
   - Decisión humana "Doc .md con todo (Recommended)" (DF-006).
6. **Documentación (V6.4).** Esta documentación, según `CLAUDE.md`.

## Qué se construyó
- `.claude/skills/design-taste-frontend/SKILL.md`: skill movida a la ruta correcta; sección "Marca EnergyShark" y 2 menciones a StudyLicc reemplazadas. No versionada (`.gitignore`).
- `package.json`, `package-lock.json`: `tailwindcss` y `@tailwindcss/vite` 4.3.3.
- `vite.config.js`: plugin `tailwindcss()`.
- `src/index.css`:
  - `@import "tailwindcss"`;
  - `@theme` con 10 colores, sombra `card`, fuentes, `--spacing: 4px` y radios en px;
  - `@layer base` para `:root` y `#root`.
- `src/App.jsx`: estilos a `className`; sin `import './App.css'`; constantes `buttonBase`, `tabActive` y `tabInactive`.
- `src/components/{CycleHistory,DistanceTable,NegotiationAdmin,RejectedMessages,LoginButton,LogoutButton}.jsx`: todos los `style={{}}` pasaron a clases Tailwind.
- `src/App.css`: eliminado y después restaurado idéntico a `HEAD`, sin importarlo.
- `docs/diseno-anterior.md`: paleta y estilos anteriores, equivalencia con Tailwind y el `index.css` original literal.
- `docs/decisiones-frontend.md`: DF-001 a DF-007.

## Hallazgos / Errores encontrados y corregidos
- **El agente vació `SKILL.md`.**
  - Causa: un script de Python abrió el archivo en modo escritura antes de leer el encabezado nuevo desde el scratchpad, y ese directorio no existía. El archivo quedó en 0 bytes y no estaba en git.
  - Corrección: se buscó una copia en disco y apareció el original en `licc-cursos-app/.agents/skills/design-taste-frontend/SKILL.md` (mismos 92.189 bytes y misma estructura).
  - Se restauró desde ahí (solo lectura del original) y se reaplicó la edición, esta vez leyendo todo antes de escribir.
  - Se comprobó con `diff` que el cuerpo es idéntico al original, salvo las 2 líneas cambiadas a propósito.
- **Preflight: botones 8px más altos.** El navegador no hereda line-height ni letter-spacing en `button`; el preflight sí. Se corrigió con `leading-[normal] tracking-normal`.
- **Preflight: inputs 1px más altos.** El agente midió los estilos computados en ambas versiones: el original usa Arial a 13,3333px y `content-box`. Se corrigió con `font-[Arial] text-[13.3333px] ... box-content`; el `select` queda en `border-box`, como en el original.
- **Preflight: `hr` de 1px.** El borde nativo es `inset` de 1px por lado, una línea de 2px. Se corrigió con `border [border-style:inset]`.
- **Breakpoint a 1024px exactos.** `max-lg` es `< 1024px` y el original era `max-width: 1024px`. Se corrigió con `max-[1025px]`.
- **rem = 18px.** Como `:root` es 18px, las utilidades en rem habrían escalado 1,125×. Se corrigió con `--spacing: 4px` y radios en px (DF-004).

## Verificación
- `grep -rn "style={{" src` → **0**. `grep -rn "var(--" src/components src/App.jsx` → **0**.
- `npm run lint` → sin errores. `npm run build` → OK. El aviso de chunk > 500 kB es del JS y no depende de este cambio.
- **Revisión del diff:** las únicas líneas cambiadas que no son `style` ni `className` son el import de `App.css` eliminado y las 3 constantes de clases.
- **Comparación visual contra `main`:** capturas de Chrome headless de las dos versiones, levantadas en paralelo (`main` en un worktree temporal):
  - login a 900, 1024, 1025 y 1280px → **idénticas byte a byte**;
  - Historial, Conectividad y NACKs, renderizados con una página de preview temporal → **idénticos**;
  - Negociaciones → misma posición, tamaño y estilos computados en todos los elementos. Difieren **20 píxeles** del badge "expired", **2/255** en un canal, porque Tailwind escribe `bg-white/10` en `oklab` y no en `rgba`.
- **`App.css` restaurado:** hash del CSS generado igual antes y después (`69d21ea…`), y `git diff HEAD -- src/App.css` vacío.
- **Limpieza:** la página de preview, el worktree temporal y los servidores de Vite se eliminaron al terminar.
- **No verificado:**
  - la vista autenticada completa (tabs, "Sesión iniciada como", botón /health), porque requiere login real en Auth0. Las tabs usan las mismas clases base que el botón de login, que sí salió idéntico;
  - Safari y Firefox: solo se probó Chrome;
  - el hover y el `active:scale` de los botones, que no se ven en una captura estática.

## Prompts y decisiones relevantes (resumen por turno)
1. *"Eres capaz de reconocer la skill actual de diseño que copie dentro de la carpeta .claude/skills?"* — diagnóstico de la ruta y de la marca ajena; 3 preguntas de decisión.
2. *"Necesito ahora que instales la ultima version de tailwind al proyecto, y que modifiques el front (…)"* — plan de migración; decisión "Igual que hoy (Recommended)".
3. *(Rechazo del primer plan, con consideraciones sobre `<img>`, `<table>` y `<p>`)* — se agregaron al plan y a la verificación.
4. *"Si no borro App.css, modifica algo los cambios que hiciste (…)"* — `App.css` restaurado y `docs/diseno-anterior.md`.
5. *"Para finalizar este refactor a tailwind, necesito que lo documentemos (…)"* — esta documentación.

Textos literales completos en `prompt/tarea-v6-tailwind/`.

## Pendiente / para coordinar
- **Esteban:** hacer login y revisar las tabs, la barra de sesión y el hover de los botones.
- **Commits:** en el orden de la guía, sobre `v6-deploy`:
  1. `docs: decisiones de frontend y diseno anterior (V6)`
  2. `feat(frontend): V6 - migracion de estilos inline a Tailwind CSS v4`
  3. `docs: AI log y registro de prompts de V6`

  Las decisiones no quedaron commiteadas antes del código: se documentaron al cierre (ver la nota en `docs/decisiones-frontend.md`).
- **PR** hacia `main`, con revisión de al menos 2 compañeros.
- **Con el equipo:**
  - `.claude/` está en `.gitignore`, así que la skill no se comparte por git;
  - quien toque estilos debe usar los tokens de `@theme` y no hex sueltos ni `style={{}}`;
  - `App.css` no se debe importar.

## Fuera de alcance
- Estados de carga y de error, y responsive de las vistas (resto de V6).
- Mejoras visuales de la skill (verde para "Habilitado", `tabular-nums`, focus ring, ARIA en las tabs): descartadas por ahora (DF-003).
- Integración real de V2–V5 con la API (siguen con mocks).
