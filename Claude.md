# Cómo documentar el trabajo con IA en EnergyShark (guía para agentes)

**Lector:** un agente de IA (Claude Code u otro) que trabaja en este repositorio en nombre de un
integrante del equipo.
**Cuándo leerlo:** al inicio de **cada** sesión de trabajo, antes de tocar código.
**Fuente:** esta guía no inventa un formato. Describe el que Pedro y David ya usan en `docs/adr/`,
`docs/ai_docs/` y `prompt/` (ver sección 9, "Archivos de referencia"). Si esta guía y esos archivos
difieren en algo, gana lo que está en el repo, y hay que avisarle al humano.

---

## 0. Por qué existe esta guía

El enunciado de la E1 (`docs/E1-v1.1.md`) evalúa el **proceso**, no solo el código:

| Requisito | Qué exige | Qué implica para el agente |
|---|---|---|
| RDOC01 (6 ptos) | ADRs con alternativas y tradeoffs, **commiteados antes** de la implementación. Un post-mortem honesto después de la demo puntúa completo. | Todo cambio de diseño parte con un addendum/ADR en **su propio commit**, antes del código. |
| RDOC02 (3 ptos) | Spec, milestones y **AI logs acordes al uso real**, por integrante. | Cada sesión deja un AI log y el registro literal de sus prompts. |
| Del uso de AI | Con programación agéntica son obligatorios: spec, milestones, ADRs, logs, PRs con revisión de al menos 2 compañeros, `main` protegido. El uso de AI no reflejado en los logs se sanciona según el reglamento. | Nada que haga el agente puede quedar sin registrar. |
| Demo y defensa individual | El ayudante induce anomalías y pregunta "¿por qué existe esto?, ¿qué se rompe si desaparece?". | La documentación tiene que dejar claro **por qué** se decidió cada cosa y dónde vive en el código. |
| Meta | Prohibido subir `.env` (−0,5) o `.pem` (no se corrige). | Nunca escribir credenciales en ningún archivo versionado. |

---

## 1. Reglas de oro (no negociables)

1. **Documentación antes que código.** Si la unidad requiere una decisión que los ADRs no cubren,
   se escribe un addendum (o ADR nuevo) y se commitea **solo, como primer commit de la rama**,
   antes de cualquier migración o código. El historial de git es la evidencia de RDOC01.
2. **Prompts literales.** En "Prompt utilizado" va **exactamente** lo que escribió el humano, aunque
   sea corto ("Ejecuta la opción A", "Automática + manuales") o tenga errores de tipeo. Después va el
   prompt de subtarea que el agente generó a partir de eso, también literal. Nunca se parafrasea.
3. **Las decisiones de diseño son del humano.** Si hay más de una opción razonable, el agente
   presenta opciones con tradeoffs y una recomendación, **espera la elección** y la registra como
   "Decisión humana". Las decisiones menores de implementación las toma el agente, pero igual las
   registra en "Decisiones tomadas" con su justificación.
4. **Honestidad sobre lo verificado.** Siempre separar tres cosas: lo verificado (con cifras y
   comandos), lo **no verificado** (y por qué) y lo pendiente. Nunca escribir "funciona" sin
   evidencia. Si algo que se documentó resultó falso, se tacha y se corrige; no se borra.
5. **Sin secretos.** Nunca escribir vhost, usuario AMQP, contraseñas, URLs con credenciales, tokens,
   `.env` o `.pem`. Usar placeholders: `city.{CODE}`, `city.TEST`, `<TENANT>`. Tampoco subir el PDF
   del enunciado (existe transcrito en `docs/E1-v1.1.md`).
6. **Documentar al cerrar cada sesión**, no reconstruir al final de la entrega. La reconstrucción
   retroactiva es exactamente lo que RDOC01/RDOC02 penalizan.
7. **No tocar el trabajo de otros sin preguntar.** No se modifican ramas de otros integrantes. Si un
   cambio propio rompe algo de otro, se busca un arreglo del lado propio o se pregunta antes. Si un
   addendum propio corrige una línea de un addendum ajeno, se dice explícitamente y se deja aviso.
8. **Nunca ensuciar el broker del curso.** Las pruebas con mensajes falsos (duplicados,
   malformados, cortes) se hacen en una réplica aislada (RabbitMQ local con TLS, Postgres aparte,
   central simulada). No se desactiva la verificación TLS ni se declara topología en el broker real.

---

## 2. Flujo de trabajo de una unidad, paso a paso

Las unidades son las del roadmap (`docs/E1 Road Map.md`): U1…U11, V1…V6, I1…I9, INT1…INT3. Un fix
fuera del roadmap se trata igual, con una carpeta `tarea-fix-<slug>/` o `tarea-fixes-<tema>/`.

### Paso 1 — Leer antes de proponer
Leer, en este orden:
1. `docs/E1-v1.1.md` — las secciones del enunciado que toca la unidad.
2. `docs/E1 Road Map.md` — la definición literal de la unidad y sus dependencias.
3. `docs/00-decisiones-fundacionales.md` y `docs/adr/ADR-001..003`, **incluidos todos sus addendums**.
4. `docs/contracts/` (schemas y `openapi.yaml`).
5. El código de las unidades de las que depende, y los AI logs de esas unidades en `docs/ai_docs/`.
6. `prompt/README.md`, para saber qué está hecho, en qué rama y qué quedó pendiente.

### Paso 2 — Planificar sin tocar código
En modo plan: definir el alcance exacto frente a las unidades vecinas (qué es de esta unidad y qué
es de la siguiente), dependencias, riesgos y qué queda explícitamente fuera. El humano aprueba o
corrige el plan. Registrar sus correcciones: suelen ser la información más valiosa del log (en U1,
la topología real del broker salió de ahí).

### Paso 3 — Resolver decisiones abiertas con el humano
Si hay opciones, presentarlas con el formato de la sección 3.2 y esperar. La elección se registra
en el AI log ("Decisión humana") y en el archivo de prompt de la subtarea que la ejecuta.

### Paso 4 — Elegir la base de la rama y justificarla
- Desde `main` si la unidad es independiente.
- **Apilada** sobre otra rama si depende de código aún no mergeado (ej.: U9 sobre `feat/u3-u4-u7-ledger`;
  U6 sobre U5 con merge de U10). Dejar escrito el porqué en el AI log.
- Nombres: `feat/uN-<slug>` (ej. `feat/u8-distance-table`), `fix/<slug>`.

### Paso 5 — Addendum/ADR en su propio commit
Plantilla en la sección 4.1. Commit: `docs(adr): addendum ADR-00X con precisiones previas a UN (...)`.
Si lo que cambia es un contrato (`docs/contracts/`) o una decisión fundacional, también va en un
commit propio antes del código.

### Paso 6 — Subtareas numeradas
Dividir la unidad en subtareas (`UN.1`, `UN.2`…). El patrón habitual:
1. `01-addendum-adrXXX` — la documentación previa.
2. `02..0k` — implementación (migraciones, repositorio, integración, endpoints…).
3. `0k+1-tests` — tests unitarios y de integración contra Postgres real.
4. `0k+2-verificacion-e2e` — prueba de punta a punta con datos reales y números verificados a mano.

Para cada subtarea se escribe el prompt de subtarea (que después se copia literal al registro).

### Paso 7 — Verificar de verdad
- Tests: dar las cifras (`29/29`, `19 passed + 10 skipped`), el comando y el modo (con DB / sin DB).
- Migraciones: `db:migrate` → `db:migrate:undo:all` (o `undo`) → `db:migrate`, y revisar la DDL con `\d`.
- Endpoints: `curl` contra la API levantada, casos felices y de error (400/404/409).
- Números del ledger: calcular a mano el valor esperado **antes** y compararlo
  (ej.: `508145 − 1500×215 = 185645`).
- Regresiones: el test nuevo **debe fallar sin el arreglo** y pasar con él. Comprobarlo.
- Si hay ramas de otros integrantes que dependen de la propia: simular el merge
  (`git merge-tree` o un worktree) y correr su suite completa.
- Lo que no se pudo verificar (Docker sin daemon, broker del curso, New Relic…) se anota como
  "No verificado".

### Paso 8 — Commits de implementación
`feat(<servicio>): UN - <qué hace>` (sección 4.6).

### Paso 9 — AI log
Crear `docs/ai_docs/AAAA-MM-DD-<integrante>-<unidad>-<slug>.md` (plantilla 4.3).
Commit: `docs: AI log de UN` (o `docs: AI log y registro de prompts de UN` si va junto con el paso 10).

### Paso 10 — Registro de prompts
Un archivo por subtarea en `prompt/tarea-uN/NN-<slug>.md` (plantilla 4.4) y actualizar
`prompt/README.md` (plantilla 4.5). Commit: `docs(prompt): registro de prompts de UN`.

### Paso 11 — Pull request
PR hacia `main` (o hacia la rama base si está apilada) con la descripción de la sección 4.7.
Requiere revisión de **al menos 2 compañeros**; el agente nunca mergea a `main` por su cuenta.

### Paso 12 — Revisión del PR y fixes posteriores
Si la revisión (compañeros o Copilot) detecta un problema de diseño:
1. Addendum nuevo ("Addendum 2 — …") commiteado **antes** del arreglo, citando el comentario de revisión.
2. Commit del arreglo con sufijo `(revision PR #n)`.
3. Nuevo archivo de prompt en la misma carpeta de la unidad, con el número siguiente
   (ej. `prompt/tarea-u4-u7/04-fix-status-statement-duplicado.md`).
4. Si el hallazgo aparece después de implementar, agregar al ADR una "Nota posterior a la
   implementación" (post-mortem, sección 4.1). Es lo que RDOC01 premia.

**Orden de commits esperado en una rama (ejemplo real, U10):**
```
9893100 docs(adr): addendum ADR-003 para negociaciones manuales (U10, opcion A)
017531d feat(master): U10 - POST/GET /api/negotiations y GET /api/negotiations/:id (RF04, lado api)
dd37e32 docs: AI log y registro de prompts de U10
ed2ac26 docs(prompt): indice con tarea-u10
```

---

## 3. Cómo tomar decisiones

### 3.1 Criterios que el equipo aplica siempre
1. **Anclar cada decisión a un requisito** del enunciado: `G0x`, `RFxx`, `RNFxx`, `ADx`, o una
   anomalía de la demo (`#1` duplicado, `#2` malformado, `#3` corte de broker, `#4` caída de
   contenedor, `#5` lectura del monitoreo). Ej.: "Automática + manuales: RF03 pide el flujo voluntario
   operando de forma autónoma".
2. **Evidencia empírica por sobre relectura teórica.** Si la prueba contra el sistema real contradice
   lo supuesto, se corrige el diseño y se documenta el hallazgo (caso U1: el chequeo de `user_id` al
   consumir hacía NACK del 100 % del tráfico real y se eliminó).
3. **Si el enunciado es inconsistente, documentarlo y decidir de forma tolerante.** Ej.:
   `PRICE_ABOVE_CAP` figura como `error` en el texto y como `nack` en el ejemplo; se aceptaron ambos
   en el contrato y quedó escrito por qué.
4. **Lo más simple que cumple, sin tecnología nueva.** El stack está fijado en
   `00-decisiones-fundacionales.md` §2; no se agrega Redis, otro ORM, otro lenguaje, etc.
5. **Respetar los ADRs vigentes.** Si una unidad necesita cruzar una frontera de ADR-001 (ej.: que
   `api` publique al broker), se busca una opción que no la rompa o se escribe un addendum.
6. **Contratos: solo cambios aditivos** en `openapi.yaml` y schemas, y siempre en un commit previo.
7. **Migraciones ya pusheadas no se editan**: se crea una migración nueva.
8. **Aritmética de dinero y energía en `NUMERIC`** (SQL), no en floats de JS.
9. **Idempotencia por `idpk`**, según `00-decisiones-fundacionales.md` §4. Cualquier decisión que
   toque reintentos debe decir cómo garantiza "nunca se aplica dos veces".
10. **Honrar lo que la central ya ejecutó** (confirmaciones o pagos tardíos) y registrar los
    duplicados en `rejected_messages` (RF05) en vez de aplicarlos de nuevo.

### 3.2 Formato para presentar opciones al humano
```markdown
Hay que decidir <qué>. Opciones:

| Opción | Qué implica | A favor | En contra |
|---|---|---|---|
| A — <nombre corto> | ... | ... | ... |
| B — <nombre corto> | ... | ... | ... |

Recomiendo **A** porque <requisito o ADR que lo justifica>.
¿Cuál prefieres?
```
Después de la respuesta:
- En el AI log: sección "Decisión humana" (quién eligió qué y por qué).
- En el ADR/addendum: la opción elegida, **la alternativa descartada** y el tradeoff.
- En el archivo de prompt: la respuesta literal del humano en "Prompt utilizado".

### 3.3 Qué decide el agente solo (y registra)
Detalles de implementación que no cambian contratos ni ADRs: nombres internos, índices extra,
defaults razonables, estructura de tests. Van en "Decisiones tomadas", una línea cada uno con su
porqué. Ej.: "`cycles.phase` con default `'negotiating'` (el ADR no lo fijaba; es la fase en que un
ciclo nace)".

---

## 4. Plantillas exactas

### 4.1 Addendum de ADR (se agrega **al final** del ADR, nunca se edita su cuerpo)

```markdown
### Addendum — <tema> (AAAA-MM-DD, <Integrante>)

Escrito antes de implementar UN. <Qué deja abierto el ADR y por qué hay que fijarlo ahora; si viene
de una revisión, citarla: "a partir de la revisión del PR #n">.

1. **<Precisión 1>.** <Decisión>. <Justificación anclada a un requisito o a otro ADR>.
2. **<Precisión 2>.** ...

**Alternativa descartada:** <opción> — <por qué no>.

<Si corresponde:> Esto corrige lo que dice el addendum de UX ("<cita textual>"): <cómo queda ahora>.
```
Variantes de título que ya existen: `### Addendum 2 — …` cuando hay más de uno del mismo autor sobre
el mismo tema; `(… , Pedro + David)` cuando la decisión fue conjunta.

**Nota posterior a la implementación (post-mortem):** también al final del ADR, cuando la realidad
contradice o precisa lo escrito:
```markdown
**Nota posterior a la implementación de UN (AAAA-MM-DD, <Integrante>).** <N> hallazgos al probar:
- <Qué decía el ADR> pero <qué pasó en la práctica>. <Cómo se corrigió y dónde (migración, archivo)>.
- <Comportamiento inesperado>. Es inofensivo / no lo es porque <razón> (verificado con <prueba>).
```

### 4.2 ADR nuevo completo (formato Nygard + alternativas)

```markdown
# ADR-00N: <Título>

**Estado:** Propuesto | Aceptado | Reemplazado por ADR-00M
**Fecha:** AAAA-MM-DD (borrador previo a implementación — commitear ANTES del código de UN)
**Requisito que satisface:** ADx / RNFxx

## Contexto
<Qué exige el enunciado (con referencias), qué existe hoy, qué anomalías de la demo toca.>

## Decisión
<La decisión, con el SQL/estructura concreta si aplica.>

## Alternativas consideradas
| Alternativa | Por qué se descarta |
|---|---|
| ... | ... |

## Consecuencias
**Positivas:**
- ...

**Negativas / tradeoffs aceptados:**
- ...

## Notas de implementación para UN
- ...
```

### 4.3 AI log — `docs/ai_docs/AAAA-MM-DD-<integrante>-<unidad>-<slug>.md`

Ejemplos de nombre: `2026-09-25-pedro-u9-endpoints-lectura.md`,
`2026-09-26-david-fix-healthcheck.md`, `2026-09-27-esteban-u8-distance-table.md`.
Integrante en minúsculas, sin tildes; la fecha es la de la sesión.

```markdown
# AI log — UN: <título de la unidad>

**Fecha:** AAAA-MM-DD
**Integrante:** <Nombre>
**Herramienta:** Claude Code (<modelo>), modo agéntico (edita archivos y corre comandos en el repo)
**Unidad del roadmap:** UN — <definición del roadmap>. Prompt literal: "<prompt inicial del humano>"
**Rama:** `feat/uN-<slug>`, <desde main | apilada sobre `<rama>` porque ...>
**Referencias:** `docs/E1-v1.1.md` (<secciones>), `docs/adr/ADR-00X...`, <código de otras unidades>
**Detalle por subtarea (prompts literales y resultados):** `prompt/tarea-uN/`

## Objetivo de la sesión
<1–3 frases.>

## Cómo se detectó            <!-- solo en fixes -->
<Qué se observó, en qué entorno, qué regla (ADR/enunciado) se incumplía.>

## Flujo de trabajo
1. **<Etapa>.** <Qué se hizo y qué se leyó.>
2. **Decisión humana sobre <tema>.** El agente presentó <A/B/C>. <Integrante> eligió <X> porque <...>.
3. **Docs antes que el código** (RDOC01): <addendum>, commit `<hash>`.
4. Implementación, tests, verificación <dónde>.

## Qué se construyó
- `ruta/archivo.js` — <qué hace, en una línea; detalles en sub-viñetas si hace falta>.

## Hallazgos / Errores encontrados y corregidos
- **<Título corto>.** <Síntoma> → <causa> → <corrección> (<dónde quedó anotado>).

## Verificación
- `<servicio>`: `<comando>` → **N/N** (<con DB / sin DB>).
- <Prueba e2e: pasos y números verificados a mano.>
- **No verificado:** <qué y por qué>.

## Estado final frente al pedido original   <!-- recomendado en unidades grandes -->
- **<Parte del pedido>:** completo / parcial (<qué falta y de quién es>).

## Prompts y decisiones relevantes (resumen por turno)   <!-- recomendado en sesiones largas -->
1. *"<prompt literal del humano>"* — <qué provocó>.
2. ...

## Pendiente / para coordinar
- **Con <Integrante>:** <qué debe saber o hacer>.

## Fuera de alcance
- <Lo que se dejó explícitamente para otra unidad.>
```

**Secciones obligatorias:** encabezado completo, "Qué se construyó", "Verificación" (con
"No verificado") y "Pendiente". Una sesión corta puede quedarse en eso (como los logs de U9 y U10
de Pedro). **Obligatorias según el caso:** "Decisión humana" si hubo elección, "Cómo se detectó" en
fixes, "Hallazgos/Errores" si los hubo. Las sesiones largas o con muchas idas y vueltas usan la
versión completa (como U1 y U6 de David).

### 4.4 Registro de prompt — `prompt/tarea-uN/NN-<slug>.md`

Una unidad = una carpeta (`tarea-u8/`, `tarea-u4-u7/` si se hicieron juntas, `tarea-fixes-robustez/`).
Un archivo por subtarea, numerado `01`, `02`… en orden de ejecución. **Las 11 secciones van
siempre, en este orden.** Si una no aplica se escribe `No aplica.`, `—` o `Ninguno.`; nunca se omite.

````markdown
# UN.k — <Título de la subtarea>

## Objetivo
<Qué se busca y para qué requisito.>

## Contexto
<Estado previo relevante: qué existe, qué dice el ADR, qué decidió el humano, qué restricción hay.>

## Prompt utilizado
```
<texto LITERAL que escribió el humano>
```
Prompt de la subtarea generado a partir de eso:
```
<texto LITERAL del prompt que el agente se dio a sí mismo para esta subtarea: archivos a leer,
qué construir, qué verificar y cómo>
```

## Resultado esperado
<Criterio de éxito verificable, con números si aplica.>

## Resultado obtenido
- <Commit `hash`, cifras, lo que pasó; incluir los intentos fallidos y por qué se cambiaron.>

## Archivos modificados
- `ruta/archivo`

## Tests ejecutados
<Comandos exactos.>

## Resultado de los tests
<N/N OK, o qué falló.>

## Decisiones tomadas
- <Decisión> — <por qué>.

## Bloqueos
<Ninguno | qué bloquea y de quién depende.>

## Observaciones
<Avisos para compañeros, cómo reproducir, hallazgos laterales.>
````

Notas:
- Si el humano escribió directamente el prompt completo de la subtarea, va un solo bloque y se omite
  la línea "Prompt de la subtarea generado a partir de eso:".
- Si el prompt del humano es una respuesta a una pregunta del agente ("Ejecuta la opción A"), se
  agrega entre paréntesis la propuesta a la que respondía, como en `prompt/tarea-u10/01-addendum-adr003.md`.
- En los prompts de subtarea, nombrar las secciones del enunciado por su nombre ("Sobre la
  negociación"), sin el símbolo `§`.

### 4.5 Índice — `prompt/README.md`
Cada integrante tiene su sección. Si no existe, se agrega al final:

```markdown
## <Integrante>

<Cómo se generó: modelo, modo agéntico o no, si hubo prompt maestro o una sesión por unidad, y si los
prompts de subtarea se escribieron durante la sesión o después a partir de lo hecho en la rama.>

| Carpeta | Unidad | Rama / PR |
|---|---|---|
| `tarea-uN/` | UN — <título corto> | `feat/uN-<slug>` (#PR, <apilado sobre ...>) |

Tareas **no** ejecutadas: <qué quedó fuera y de quién depende>.
```
Si los prompts de subtarea se reconstruyeron después de la sesión y no durante ella, decirlo aquí
(como hace David). Es parte de la honestidad que pide RDOC02.

### 4.6 Mensajes de commit
Conventional Commits en español, en minúsculas y sin tildes en el asunto.

| Tipo | Formato | Ejemplo real |
|---|---|---|
| ADR/addendum | `docs(adr): addendum ADR-00X con precisiones previas a UN (<tema>)` | `docs(adr): addendum ADR-001 con precisiones previas a U2 (respuestas y outbox)` |
| Contrato | `docs(contracts): <cambio> (<razón>), previo a UN` | `docs(contracts): PRICE_ABOVE_CAP tambien como nack (inconsistencia del enunciado), previo a U6` |
| Implementación | `feat(<servicio>): UN - <qué hace>` | `feat(master): U9 - endpoints de lectura GET /api/cycles, ...` |
| Fix | `fix(<servicio>): <síntoma corregido>` | `fix(connector): listener de error en el pool de pg para no caer si Postgres se reinicia` |
| AI log | `docs: AI log de UN` | `docs: AI log del fix del healthcheck` |
| Prompts | `docs(prompt): registro de prompts de UN` | `docs(prompt): registro de prompts de U5 y de los fixes de robustez` |
| Merge | `merge: <qué se integra> en <dónde>` | `merge: U10 (negociaciones manuales, lado api) en la base de U6` |
| Post-revisión | `<tipo>(<scope>): ... (revision PR #n)` | `docs(adr): addendum 2 ADR-002 - idempotencia de status-statement (revision PR #2)` |

Scopes usados: `connector`, `master`, `docker`, `adr`, `contracts`, `prompt`. Terminar cada commit
con la línea de coautoría que indique la configuración del agente.

### 4.7 Descripción del PR
```markdown
## Resumen
UN — <qué hace>. Rama <desde main | apilada sobre #PR>.

## Orden de commits (RDOC01)
1. `<hash>` docs(adr): ... ← documentación previa
2. `<hash>` feat(...): ...
3. `<hash>` docs: AI log ... / docs(prompt): ...

## Decisiones
- **Humana:** <opción elegida y por qué>.
- <Decisiones de implementación relevantes.>

## Verificación
- <comando> → N/N
- <e2e>

## No verificado
- <qué y por qué>

## Pendiente / avisos
- @<compañero>: <qué le afecta>.

## Documentación
- AI log: `docs/ai_docs/...`
- Prompts: `prompt/tarea-uN/`
```
Pedir revisión a **2 compañeros** como mínimo.

---

## 5. Estilo de redacción

- **Idioma:** español. Identificadores, rutas, comandos, tipos de mensaje y nombres de columna en
  `backticks` y tal como aparecen en el código.
- **Conciso y concreto:** frases cortas, viñetas. Una idea por viñeta.
- **Números siempre:** `29/29`, `123/123 en dos corridas seguidas`, `reconexión en ~1,2 s`,
  `3.337 × 210.33 = 701.87`. "Los tests pasan" no basta.
- **Causa → efecto → corrección** en cada hallazgo, y a qué anomalía de la demo o requisito afecta.
- **Referencias cruzadas:** a ADRs y addendums ("addendum U6 §4"), a AI logs de otros, a hashes de
  commit.
- **Correcciones visibles:** si algo documentado resultó falso, no se borra; se tacha con `~~...~~` y
  se agrega "**Corrección (misma fecha):** …" (ver `2026-09-26-david-fix-healthcheck.md`).
- **Atribución:** "Decisión humana", "<Integrante> eligió…", "El agente presentó…". Tiene que quedar
  claro qué decidió la persona y qué hizo la IA.

---

## 6. Ejemplo completo de referencia: fix de `status-statement` duplicado

Así se ve una iteración bien documentada, de principio a fin:

1. **Origen:** comentario de Copilot en el PR #2: reenviar un `status-statement` anterior a una
   corrección lo volvía a aplicar (anomalía #1).
2. **Prompt humano (literal, con el error de tipeo incluido):** "Hace los arreglos y sigue con el
   flujo de trabajo, haciendo prs. pregunta que decision tomar en caso de".
3. **Prompt de subtarea generado:** arreglar sin tocar líneas que David modificó en sus ramas;
   addendum primero; tabla append-only con `UNIQUE(idpk)`; test de regresión que falle sin el
   arreglo; simular el merge con las 3 ramas de David y correr su suite; preguntar antes de tocar
   sus ramas.
4. **Addendum 2 de ADR-002** (commit `32499ee`) con la decisión y la **alternativa descartada**
   (arreglo `UUID[]` en `cycles`).
5. **Arreglo** (commit `6ad9ca4`). Test de regresión: falla sin el arreglo, pasa con él.
6. **Primer intento fallido documentado:** con una FK, 62 tests de David fallaban por `TRUNCATE`.
   Se quitó la FK y se explicó el criterio.
7. **Verificación:** 30/30 en la rama y 124/124 en U6 + arreglo, con merge limpio.
8. **Registro:** `prompt/tarea-u4-u7/04-fix-status-statement-duplicado.md`, con las 11 secciones.

---

## 7. Checklist de cierre de sesión

Antes de dar la sesión por terminada, el agente verifica y le informa al humano cada punto:

- [ ] El addendum/ADR está en un commit **anterior** a los de implementación (`git log --oneline`).
- [ ] Los tests corren y sus cifras están anotadas, con el comando.
- [ ] Lo no verificado está escrito explícitamente.
- [ ] Existe `docs/ai_docs/AAAA-MM-DD-<integrante>-<unidad>-<slug>.md`.
- [ ] Existe un `prompt/tarea-uN/NN-<slug>.md` por subtarea, con las 11 secciones y los prompts literales.
- [ ] `prompt/README.md` tiene la fila de la unidad en la sección del integrante.
- [ ] Si el cambio toca la API, `docs/contracts/openapi.yaml` está actualizado (cambio aditivo).
- [ ] No hay secretos en lo que se va a commitear:
      `git diff --cached | grep -inE 'amqps?://[^ ]*@|password|secret|token|BEGIN .*PRIVATE KEY'`
      no devuelve nada, y no hay `.env` ni `.pem` en `git status`.
- [ ] Se dejaron avisos para los compañeros afectados (en el log y en el PR).
- [ ] El PR está abierto con revisión pedida a 2 compañeros (o se le dijo al humano que falta).

---

## 8. Antipatrones (no hacer)

- Commitear el ADR junto con el código o después de él.
- Editar el cuerpo de un ADR "Aceptado" en vez de agregar un addendum o una nota posterior.
- Resumir o "mejorar" el prompt del humano en vez de citarlo literal.
- Escribir el AI log días después, de memoria.
- Omitir secciones de la plantilla de prompt porque "no aplican".
- Decir "funciona" o "listo" sin cifras, o esconder lo que no se pudo probar.
- Tomar una decisión de diseño con alternativas reales sin preguntarle al humano.
- Borrar una afirmación equivocada de un log en vez de tacharla y corregirla.
- Escribir credenciales, valores reales del broker, `.env`, `.pem` o el PDF del enunciado en el repo.
- Probar anomalías con mensajes falsos contra el broker del curso.
- Modificar ramas de otros integrantes sin preguntar.

---

## 9. Archivos de referencia (leerlos si hay dudas de formato)

| Qué | Archivo |
|---|---|
| Registro de prompt, versión breve | `prompt/tarea-u10/01-addendum-adr003.md` |
| Registro de prompt, con verificación detallada | `prompt/tarea-u10/02-api-negociaciones.md`, `prompt/tarea-u9/03-verificacion-e2e.md` |
| Registro de un fix post-revisión | `prompt/tarea-u4-u7/04-fix-status-statement-duplicado.md` |
| AI log corto | `docs/ai_docs/2026-09-25-pedro-u10-negociacion-manual.md` |
| AI log largo, con prompts por turno | `docs/ai_docs/2026-09-23-david-u1-conexion-broker.md` |
| AI log de unidad compleja | `docs/ai_docs/2026-09-27-david-u6-negociacion-voluntaria.md` (rama `feat/u6-negociacion`) |
| AI log de un fix | `docs/ai_docs/2026-09-26-david-fix-healthcheck.md` (rama `feat/u5-scheduler-ciclo`) |
| Addendums de ADR | `docs/adr/ADR-002-persistencia-ledger.md` (addendum y addendum 2), `docs/adr/ADR-003-timeouts-negociacion.md` |
| Índice de prompts | `prompt/README.md` |

Nota: `docs/00-decisiones-fundacionales.md` §7 proponía `/docs/ai-logs/<nombre>.md`, pero el
equipo terminó usando `docs/ai_docs/` (un archivo por sesión) más `prompt/` (un archivo por
subtarea). Esta guía sigue lo que se usa en la práctica.
