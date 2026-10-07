# API.2 — Renombrar `Claude.md` a `CLAUDE.md`

## Objetivo
Que la guía de documentación se cargue sola en cualquier sistema operativo. Claude Code busca `CLAUDE.md` al iniciar la sesión.

## Contexto
- En la verificación de la Fase 1, `git ls-tree main -- CLAUDE.md` salió vacío.
- `git ls-tree --name-only main | grep -i claude` → `Claude.md`, con `core.ignorecase=true` (macOS).
- En macOS el archivo se leía igual como `CLAUDE.md`. En Linux o en CI no se cargaría.
- El agente se detuvo antes de crear la rama, como pedía el tercer ajuste del plan, y propuso no renombrar y anotarlo como hallazgo. Esteban decidió renombrar.

## Prompt utilizado
```
Renombra, en su propio commit antes del de decisiones. Pasos:
1. Crea feat/integracion-api-real desde main (2d6bb05).
2. git mv Claude.md CLAUDE.tmp && git mv CLAUDE.tmp CLAUDE.md
3. Verifica con `git ls-tree --name-only HEAD | grep -i claude` que el nombre trackeado
   sea exactamente CLAUDE.md. Si no, dime qué pasó antes de continuar.
4. Busca con grep referencias literales a "Claude.md" en docs/, prompt/, README.md y
   AGENTS.md (si existe). Actualiza solo las que dicen exactamente "Claude.md". No
   reescribas nada más.
5. Commit: `chore: renombrar Claude.md a CLAUDE.md (carga automatica en Linux)`.
6. Desde ahí, sigue con el commit de decisiones y el resto del plan. AGENTS.md y el AI log
   usan el nombre CLAUDE.md. Registra el rename en "Hallazgos", con la causa: git
   trackeaba Claude.md y core.ignorecase=true de macOS lo ocultaba.
```
El humano escribió directamente los pasos de la subtarea; no hubo un prompt de subtarea aparte.

## Resultado esperado
- `git ls-tree --name-only HEAD | grep -i claude` → exactamente `CLAUDE.md`.
- Referencias al archivo actualizadas, en un commit propio anterior al de decisiones.

## Resultado obtenido
- Commit `b7754b8`. `git ls-tree --name-only HEAD | grep -i claude` → `CLAUDE.md`.
- `grep -rn "Claude\.md" docs/ prompt/ README.md` encontró 7 coincidencias (`AGENTS.md` no existía). Se actualizaron 4 referencias al archivo:
  - `docs/ai_docs/2026-09-27-esteban-v6-tailwind.md:8` y `:34`;
  - `prompt/README.md:3`;
  - `prompt/tarea-v6-tailwind/04-documentacion.md:4`.
- **No se tocaron 3**, aunque dicen exactamente "Claude.md", porque son registros literales (regla 8 del prompt maestro y regla 2 de `CLAUDE.md`):
  - `04-documentacion.md:16`: el prompt literal de Esteban;
  - `04-documentacion.md:20`: el prompt de subtarea literal;
  - `04-documentacion.md:69`: la observación histórica "`Claude.md` está sin trackear".

  El agente lo informó en el chat antes de commitear.

## Archivos modificados
- `Claude.md` → `CLAUDE.md` (rename, contenido sin cambios)
- `docs/ai_docs/2026-09-27-esteban-v6-tailwind.md`
- `prompt/README.md`
- `prompt/tarea-v6-tailwind/04-documentacion.md`

## Tests ejecutados
`git ls-tree --name-only HEAD | grep -i claude`; grep de secretos de `CLAUDE.md` sobre el diff staged.

## Resultado de los tests
`CLAUDE.md`. Grep de secretos: sin coincidencias.

## Decisiones tomadas
- Hacer el rename en dos pasos (`Claude.md` → `CLAUDE.tmp` → `CLAUDE.md`), como pidió Esteban: con `core.ignorecase=true`, un `git mv` directo que solo cambia mayúsculas no se registra bien.
- Mantener literales los prompts y la nota histórica (ver arriba).

## Bloqueos
Ninguno.

## Observaciones
Si otro integrante tiene un clon en macOS con `Claude.md`, al hacer pull git va a reflejar el cambio de mayúsculas. No hay que hacer nada a mano.
