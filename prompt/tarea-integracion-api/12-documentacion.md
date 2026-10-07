# API.12 — Documentación y cierre (RDOC02, RDOC04)

## Objetivo
Dejar trazabilidad completa de la sesión:
- `AGENTS.md` del front que remite al del backend;
- el AI log;
- un registro de prompt por etapa y la fila en el índice.

## Contexto
- La plantilla de AI log del backend (`docs/ai_docs/README.md`, PR #23) agrega "Prompt de la sesión" y "Pendiente / dependencias".
- La plantilla 4.3 de `CLAUDE.md` pide encabezado completo, "Qué se construyó", "Verificación" con "No verificado" y "Pendiente".
- El `AGENTS.md` del backend contiene una frase obsoleta sobre JWT.

## Prompt utilizado
Extracto literal del prompt maestro (completo en `01`): bloque "FASE 4 — DOCUMENTACIÓN Y CIERRE (según CLAUDE.md)".

Extractos literales posteriores:
- Del prompt de API.2: "AGENTS.md y el AI log usan el nombre CLAUDE.md. Registra el rename en "Hallazgos", con la causa: git trackeaba Claude.md y core.ignorecase=true de macOS lo ocultaba."
- Del mensaje de 3D (completo en `11`):
  ```
  En el AI log,
  V3 va como "verificado: estado vacío contra producción (200, sin datos); no verificado:
  render con datos reales de la central", y el POST real y el login en app.tiburonshark.me
  en "No verificado". Avisos a Pedro/Jorge en Hallazgos: V3 sin datos, max-age 0 del preflight.
  Después sigue con la Fase 4.
  ```

Prompt de la subtarea (extracto literal del plan aprobado, `~/.claude/plans/pasted-content-id-8434-eres-un-jolly-bunny.md`, líneas 156-173):
```
## Fase 4 — Documentación y cierre
- `AGENTS.md` en la raíz del front: referencia a `JorgeUribeGo/EnergyShark/AGENTS.md` y un resumen del flujo del front, sin copiarlo (RDOC04).
- AI log `docs/ai_docs/2026-10-07-esteban-v2-v5-integracion-api.md`:
  - formato: la unión de las dos plantillas;
  - contenido: Verificado (con cifras), No verificado, Hallazgos (con a quién avisar) y Pendiente;
  - nota: la documentación se escribió después del código, salvo DF;
  - los datos de 3C son **sintéticos**, sembrados por SQL, no de la central;
  - la desviación del script de test.

  En "Hallazgos" van los 5 del reconocimiento, incluidos el compose local roto de `AGENTS.md` (RDOC03) y la frase falsa sobre JWT, con aviso a Pedro y a Jorge.
- `prompt/tarea-integracion-api/01..11-*.md`, uno por etapa, con 11 secciones y tu prompt literal más el prompt de subtarea: reconocimiento, decisiones, cliente, endpoints/hook/lib/ui, v5, v2, v4, v3, health y mocks, pruebas, documentación. También agrego la fila en `prompt/README.md`.

  Commit: `docs: AI log y registro de prompts de la integracion con la API real`.
- Comprobaciones finales:
  - `git log --oneline` para confirmar que el commit de DF va antes del código;
  - `git diff --stat main..` sin mocks residuales ni archivos fuera de alcance;
  - grep de secretos. **Sin push.**
- Al cerrar te entrego: los commits, los resultados de A a D, lo no verificado y los 3 riesgos del deploy.
```

## Resultado esperado
- `AGENTS.md` en un commit propio.
- AI log y prompts `01` a `12` con sus 11 secciones, más la fila en `prompt/README.md`, en un commit.
- El commit de DF queda antes del código. Sin secretos.

## Resultado obtenido
- Commit `644fe2a`: `AGENTS.md` (referencia al del backend, resumen del flujo del front y aviso de la frase obsoleta sobre JWT).
- AI log `docs/ai_docs/2026-10-07-esteban-v2-v5-integracion-api.md`, en la unión de ambas plantillas.
- `prompt/tarea-integracion-api/01..12`. Son 12 y no 11 como decía el plan, porque el rename de `CLAUDE.md` se agregó como etapa propia (API.2).
- **Corrección durante la redacción:** los "prompts de subtarea" de `03` y `04` se escribieron primero de memoria y se rotularon como "extracto literal del plan" **sin serlo**. El agente lo detectó al comparar con el plan y los reemplazó por el texto exacto, insertado por script desde el archivo del plan por número de línea. El de `01` se rotuló como **reconstruido**.

## Archivos modificados
- `AGENTS.md` (nuevo, commit propio)
- `docs/ai_docs/2026-10-07-esteban-v2-v5-integracion-api.md` (nuevo)
- `prompt/tarea-integracion-api/01..12-*.md` (nuevos)
- `prompt/README.md`

## Tests ejecutados
- `grep -cE '@@PLAN [0-9]+-[0-9]+@@' *.md` (marcadores sin reemplazar; debe dar 0 en todos).
- Conteo de las 11 secciones por archivo.
- `git log --oneline main..HEAD` y `git diff --stat main..HEAD`.
- Grep de secretos de `CLAUDE.md`.

## Resultado de los tests
Ver la sección "Verificación" del AI log y el cierre en el chat.

## Decisiones tomadas
- **`AGENTS.md` en un commit propio**, antes del de log y prompts, para que el cambio de RDOC04 sea revisable por separado.
- **Nombre del AI log:** se usó el que pidió Esteban (`…-esteban-v2-v5-integracion-api.md`, con slug), en vez del corto `AAAA-MM-DD-<integrante>-<unidad>.md` de la plantilla del backend.

## Bloqueos
Ninguno.

## Observaciones
—
