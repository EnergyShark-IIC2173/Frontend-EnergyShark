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
| `tarea-fix-rediseno-studylicc/` | Fix propio (fuera de S) — rediseño con la estética de StudyLicc, modo claro y oscuro (DF-030), nulos "Sin dato" (DF-031) | `feat/rediseno-studylicc`, apilada sobre `feat/e2-retiro-negociaciones` (PR pendiente) |
| `tarea-s11-rf01/` | S11 (E2) — RF01 del protocolo v3: resumen en el listado, detalle al expandir y mocks tras `VITE_USE_MOCKS` (01–04); retiro de la vista de negociaciones E1 y transporte por kWh en Conectividad (05–06) | 01–04: `feat/e2-base-rf01` (PR #10); 05–06: `feat/e2-retiro-negociaciones`, apilada sobre la anterior |

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

**Sesión del 2026-11-01 (`tarea-s11-rf01/`, E2):**
- Prompt corto de Esteban (literal en `01`) y tres decisiones humanas por pregunta del agente. Sin modo plan y sin subagentes.
- Las decisiones DF-024 a DF-027 se commitearon antes del código (`71867c0`).
- Los "prompts de subtarea" de `01` a `04` se escribieron **al cierre** de la sesión, a partir de lo hecho en la rama.
- Segunda parte (`05`–`06`): DF-028 y DF-029 antes del código (`632e5f0`); registros escritos al cierre.

**Sesión del 2026-11-01 (`tarea-fix-rediseno-studylicc/`, fix propio):**
- Prompt de Esteban con un bloque pegado (la guía de StudyLicc), literal en `01` junto con sus 4 respuestas y el rechazo del primer plan (papel blanco en vez de crema).
- Modo plan con aprobación. Sin subagentes.
- DF-030 y DF-031 se commitearon antes del código (`fd16998`).
- Los "prompts de subtarea" de `01` a `05` son extractos literales del plan aprobado y el de `06` se escribió durante la sesión. Los registros se escribieron al cierre.
- Segunda vuelta (`07`): pedidos de Esteban tras revisar el primer rediseño; DF-032 antes del código (`2c6f582`) y un commit por pedido. El prompt de subtarea se escribió durante la sesión.
- Tercera vuelta (`08`): intro, grilla con diálogo, navegación y detalle por pestañas; DF-033 antes del código (`ba63560`) y un commit por pedido. El prompt de subtarea se escribió durante la sesión.
- Cuarta vuelta (`09`): TiburonShark, aleta hacia la izquierda, paginador único y reloj; DF-034 antes del código y un commit por pedido.
- Quinta vuelta (`10`): login en movimiento; DF-035 antes del código y un commit por pedido. Esteban eligió el fondo "Mar de olas" entre cuatro opciones.
- Sexta vuelta (`11`): olas más orgánicas y un tiburón ocasional en el login; DF-036 antes del código.
- Séptima vuelta (`12`): el tiburón pasa a easter egg de la aleta del logo y el botón de login pierde el borde animado; DF-037 antes del código.

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
| `tarea-contratos-org/` | RDOC04.fix — referencias al repo de contratos y al `AGENTS.md` org-level | `docs/contratos-org`, apilada sobre `fix/auth0-sesion` |
| `tarea-readme-front/` | Docs — README del frontend y guía de deploy S3 + CloudFront | `docs/readme-front` (fork `Pedr0sit0s`), desde `main` |
| `tarea-s12-mercado/` | S12 — mercado en vivo (RF02): libro de ofertas, precio efectivo y tarifa punitiva | `feat/e2-s12-mercado`, apilada sobre `feat/rediseno-studylicc` |
