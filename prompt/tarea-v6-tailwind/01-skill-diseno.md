# V6.1 — Skill de diseño `design-taste-frontend` adaptada a EnergyShark

## Objetivo
Que Claude Code cargue la skill de diseño que Esteban copió al repo y que sus reglas de marca correspondan a EnergyShark, para usarla en el pulido visual de V6.

## Contexto
- La skill estaba en `.claude/skills/SKILL.md` (1.260 líneas), copiada de otro proyecto.
- Claude Code no la listaba: exige la ruta `.claude/skills/<nombre>/SKILL.md`.
- Su sección "Marca StudyLicc (prevalece sobre el resto de este skill)" fijaba otra paleta (crema/verde), otras fuentes (Space Grotesk / Work Sans) y otro stack (Next.js, `next/font`, Server Components).
- El frontend es Vite + React 19 + react-router, con CSS plano en estilos inline. La paleta vivía en `src/index.css` (navy `#111344`, cian `#06bee1`).

## Prompt utilizado
```
Eres capaz de reconocer la skill actual de diseño que copie dentro de la carpeta .claude/skills?
```
Respuestas de Esteban a las preguntas del agente, literales:
```
"¿Qué quieres hacer con la skill de diseño?"="Mover + adaptar marca (Recommended)"
```
(opciones: Mover + adaptar marca / Solo moverla / Mover + quitar marca / Nada por ahora)
```
"¿Qué paleta y tipografía debe fijar la sección de marca de EnergyShark?"="Formalizar la actual (Recommended)"
"¿Qué stack debe asumir la skill para el frontend?"="Permitir agregar libs"
```
(opciones: Formalizar la actual / Proponer una nueva; CSS plano + tokens / Permitir agregar libs)

Prompt de la subtarea generado a partir de eso:
```
Mover .claude/skills/SKILL.md a .claude/skills/design-taste-frontend/SKILL.md. Actualizar la
description para que también aplique a la UI de EnergyShark (src/components, App.jsx, estilos).
Reemplazar las líneas 6-58 ("Marca StudyLicc") por "Marca EnergyShark (prevalece sobre el resto de
este skill)" con: alcance (UI de producto: aplican §6, §8, §9 y §14), tokens de src/index.css con
contraste AA calculado, tipografía system-ui sin next/font, logo tiburon.png, radios actuales, stack
permitido (Tailwind v4 con @theme, motion, Phosphor), movimiento, textos en español de Chile con tú
y las reglas vigentes. Reemplazar las 2 menciones a StudyLicc del resto del cuerpo. No tocar nada
más. Verificar: la skill aparece en la lista, grep -ci studylicc = 0.
```

## Resultado esperado
- La skill aparece en la lista de skills de Claude Code.
- `grep -ci studylicc` devuelve 0.
- El cuerpo del tasteskill (§0–14 y apéndices) queda intacto.

## Resultado obtenido
- Claude Code listó `design-taste-frontend` apenas se movió el archivo.
- La sección de marca de EnergyShark incluye contrastes calculados:
  - `text` 11,4:1 y `accent` 7,9:1 sobre `bg`;
  - `warm` 4,3:1 sobre `surface`, así que se restringe a texto grande;
  - `danger` 3,9:1 sobre `surface-hover`.
- **Intento fallido:** el primer script de Python abrió `SKILL.md` en modo escritura antes de leer el encabezado nuevo desde el scratchpad, que no existía. El archivo quedó en 0 bytes y no estaba en git.
  - Se encontró el original en `licc-cursos-app/.agents/skills/design-taste-frontend/SKILL.md` (mismos 92.189 bytes y estructura) y se restauró desde ahí.
  - Se reaplicó la edición leyendo todo antes de escribir.
- `diff` del cuerpo contra el original: solo las 2 líneas cambiadas a propósito. `grep -ci studylicc` → 0. Queda con 1.269 líneas.

## Archivos modificados
- `.claude/skills/design-taste-frontend/SKILL.md` (movido desde `.claude/skills/SKILL.md` y editado)

## Tests ejecutados
```
grep -ci studylicc .claude/skills/design-taste-frontend/SKILL.md
diff <(sed -n '60,$p' <original>) <(sed -n '69,$p' .claude/skills/design-taste-frontend/SKILL.md)
```

## Resultado de los tests
- `0` coincidencias de StudyLicc.
- `diff` con 2 diferencias, las esperadas: las líneas de tipografía y de "THE LILA RULE".

## Decisiones tomadas
- Renombrar `--success` a `--warm` en la skill: es naranja y no significa "éxito". Se agregan `--ok` y `--danger` como tokens futuros.
- La skill declara que sí aplica a dashboards en este repo, aunque el tasteskill original dice "not dashboards": EnergyShark es UI de producto.

## Bloqueos
Ninguno.

## Observaciones
- Después de esta subtarea, Esteban agregó `.claude` al `.gitignore` (commit `5b9686f`), así que la skill no está versionada. Cada integrante necesita su copia local.
- Lección registrada: nunca abrir un archivo en modo escritura antes de tener listo todo el contenido nuevo.
