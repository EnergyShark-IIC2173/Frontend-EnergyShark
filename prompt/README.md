# prompt/ — trazabilidad de las sesiones con IA (frontend)

Registro de cada subtarea ejecutada con IA en el frontend de EnergyShark. Complementa los AI logs de `docs/ai_docs/` (RDOC02) y las decisiones de `docs/decisiones-frontend.md`. Formato según `CLAUDE.md` (el mismo que usa el backend en `../EnergyShark/prompt/`).

## Esteban

**Cómo se generó:**
- Una sesión de Claude Code (Opus 5.5, agéntico: edita archivos y corre comandos) en la extensión de VS Code, el 2026-09-27.
- No hubo prompt maestro: Esteban fue dando un prompt por etapa.
- El agente trabajó en modo plan: presentaba opciones, Esteban elegía y aprobaba el plan, y recién ahí se ejecutaba. En V6.2 Esteban rechazó el primer plan con correcciones.
- Sin subagentes.
- El texto de Esteban en "Prompt utilizado" es literal.
- Los "prompts de subtarea" y estos registros se escribieron **al cierre de la sesión**, a partir de los planes aprobados y de lo hecho en la rama, no durante cada subtarea.

| Carpeta | Unidad | Rama / PR |
|---|---|---|
| `tarea-v6-tailwind/` | V6 — skill de diseño y migración de estilos a Tailwind CSS v4 | `v6-deploy` (PR pendiente) |
| `tarea-v6-rediseno/` | V6 — rediseño visual: login, app shell y vistas V2–V5 (solo capa visual) | `feat/v6-rediseno`, apilada sobre `v6-deploy` (PR pendiente) |
| `tarea-integracion-api/` | V2–V5 — integración con la API real: cliente, hook `useApiQuery`, estados de carga/error/vacío, paginación y polling; elimina los mocks | `feat/integracion-api-real`, desde `main` (PR pendiente) |

**Sesión del 2026-09-29 (`tarea-v6-rediseno/`):**
- A diferencia de la anterior, **hubo prompt maestro** de Esteban, que está literal en `01`.
- Plan aprobado con 11 ajustes y ALTO de validación visual después de `App.jsx`.
- Sin subagentes: Bash y los subagentes estuvieron bloqueados durante la planificación.
- Los registros `01` a `09` se escribieron **durante** la sesión, cada uno al terminar su archivo y antes de pasar al siguiente. Las decisiones DF-008 a DF-013 se commitearon antes del código (`da7269d`).

**Sesión del 2026-10-06/07 (`tarea-integracion-api/`):**
- **Hubo prompt maestro** de Esteban, literal en `01` junto con sus 3 rechazos del plan; los mensajes posteriores están literales en `02` y `11`.
- Modo plan con aprobación y un ALTO para la prueba en el navegador. Sin subagentes.
- Solo las decisiones DF-014 a DF-022 se commitearon antes del código (`bc56b59`).
- Los registros `01` a `12` y el AI log se escribieron **al cierre** de la sesión.
- Los "prompts de subtarea" de `03` a `12` son extractos literales del plan aprobado, escrito durante la sesión; el de `01` está reconstruido.

Tareas **no** ejecutadas:
- ~~El resto de V6: estados de carga y de error, y responsive de las vistas.~~ **Corrección (2026-09-29):** el responsive quedó hecho en `tarea-v6-rediseno/`. Siguen pendientes los estados de carga y de error por vista, porque requieren estado nuevo.
- ~~La integración real de V2–V5 con la API, que depende de U9 y U10 del backend.~~ **Corrección (2026-10-07):** hecha en `tarea-integracion-api/`. Quedan pendientes el POST real contra la central y el render de V3 con datos reales (ver el AI log `2026-10-07-esteban-v2-v5-integracion-api.md`).

## Pedro

Sesión de Claude Code (Opus 5.5, agéntico) del 2026-10-07, durante el testeo de punta a punta del
sistema. El prompt de subtarea se escribió durante la sesión. El login de prueba lo hizo Pedro: el
agente no escribió credenciales.

| Carpeta | Unidad | Rama / PR |
|---|---|---|
| `tarea-sesion-auth0/` | V1.fix — sesión que sobrevive a recargar (refresh tokens) y `npm test` | `fix/auth0-sesion` (fork `Pedr0sit0s`), desde `main` |
