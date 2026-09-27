# prompt/ — trazabilidad de las sesiones con IA (frontend)

Registro de cada subtarea ejecutada con IA en el frontend de EnergyShark. Complementa los AI logs de `docs/ai_docs/` (RDOC02) y las decisiones de `docs/decisiones-frontend.md`. Formato según `Claude.md` (el mismo que usa el backend en `../EnergyShark/prompt/`).

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

Tareas **no** ejecutadas:
- El resto de V6: estados de carga y de error, y responsive de las vistas.
- La integración real de V2–V5 con la API, que depende de U9 y U10 del backend.
