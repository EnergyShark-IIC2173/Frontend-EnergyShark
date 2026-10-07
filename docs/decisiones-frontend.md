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

---

> Las decisiones DF-008 a DF-013 se escribieron el 2026-09-29, **antes** de implementar el rediseño, en su propio commit (RDOC01). Plan aprobado por Esteban con ajustes; detalle en `prompt/tarea-v6-rediseno/`.

## DF-008 — Rediseño visual basado en `docs/design/idea_energyshark.png` (reemplaza a DF-003)

**Fecha:** 2026-09-29 · **Unidad:** V6 · **Decidió:** Esteban (humana: pedido, paleta muestreada y ajustes) + agente (muestreo y cálculo de contraste)

- **Contexto:**
  - La migración 1:1 (DF-003) mantuvo un diseño pobre.
  - Esteban pidió un rediseño completo, basado en una imagen de referencia: dashboard oscuro con topbar, sidebar y cards; navy con acentos cian, rosa, violeta y naranja.
- **Paso 0 (verificación de la imagen):**
  - `idea_energyshark.png` es un AVIF por dentro. Se convirtió con `sips` a un PNG en un directorio temporal y se muestreó por zonas (color dominante).
  - Coincidieron: fondo principal, card, divisor, rosa, naranja y violeta.
  - Se ajustaron, con aprobación de Esteban:
    - `panel`: de `#0a0f2e` a `#0f1739`;
    - topbar en `bg` (no en `panel`), como en la imagen;
    - degradado del marco: `#1492e4 → #00e6f6`;
    - inicio del degradado del botón: `#00e8f8`.
- **Tokens finales (`src/index.css`, `@theme`):**

| Token | Hex | Uso |
|---|---|---|
| `panel` | `#0f1739` | sidebar (con `border-r border-border`), inputs |
| `bg` | `#171d45` | fondo del área principal y de la topbar |
| `surface` | `#1f2550` | cards, `thead` |
| `surface-hover` | `#272e5c` | hover de filas e ítems del sidebar |
| `border` | `#2c3360` | divisores finos |
| `text-h` | `#ffffff` | títulos, cifras |
| `text` | `#aab0cc` | texto secundario, celdas (subido desde `#9aa0bd` para separarlo de `text-muted`) |
| `text-muted` | `#8a90b8` | labels en `text-xs uppercase tracking-widest font-semibold` (el `#5d6389` de la imagen no pasa AA) |
| `accent` | `#00c2ec` | acento primario: nav activa, pills, foco |
| `accent-from` / `accent-to` | `#00e8f8` → `#1e8ae5` | degradado del botón primario (texto `panel`) |
| `frame-from` / `frame-to` | `#1492e4` → `#00e6f6` | fondo del login (sin texto encima) |
| `pink` / `magenta` | `#ff2e6e` / `#b5179e` | decorativo: logo, puntos, barra destacada |
| `pink-soft` | ~~`#ff6b98`~~ `#ff80a8` (ver corrección en DF-012) | texto de pills rosas |
| `violet` | `#6a4fd1` | decorativo: puntos |
| `orange` / `orange-soft` | `#f95521` / `#ff8a5c` | decorativo / texto de la pill "duplicate" |
| `success` | `#34d399` | OK de /health, pill confirmed/paid |
| `danger` | ~~`#ff6b98`~~ `#ff80a8` (ver corrección en DF-012) | Error de /health, "Deshabilitado" |

- **Reglas de uso:**
  - Ningún componente usa hex sueltos.
  - Cian es el acento principal y rosa el secundario; violeta y naranja solo diferencian categorías.
  - El naranja queda reservado para "duplicate" (Presupuesto de V2 va en cian).
  - Ningún texto va directo sobre el degradado del login: el blanco sobre `#00e6f6` da 1,54:1.
- **Alternativa descartada:** mantener el 1:1 de DF-003 y solo pulir detalles. No resolvía el pedido.
- **Dónde vive:** `src/index.css`. La paleta anterior sigue documentada en `docs/diseno-anterior.md`.

## DF-009 — `:root` a 16px y escala por defecto de Tailwind (reemplaza a DF-004)

**Fecha:** 2026-09-29 · **Unidad:** V6 · **Decidió:** agente (propuesta en el plan) + Esteban (aprobación)

- **Contexto:** DF-004 fijó `--spacing: 4px` y radios en px porque `:root` usaba 18px y el objetivo era un 1:1 exacto. Con el rediseño, ese objetivo ya no existe.
- **Decisión:**
  - `:root` a 16px, sin la media query de 1024px ni el `letter-spacing` global.
  - Se quitan los overrides `--spacing` y `--radius-*`: vuelven la escala en rem y los tamaños de texto de Tailwind, cada uno con su line-height.
  - `#root` pierde `width: 1126px` y `text-align: center`, para permitir un app shell a ancho completo.
- **Por qué:** el rem respeta el tamaño de letra que el usuario configura en el navegador (accesibilidad), y ya no hacen falta valores arbitrarios en px.
- **Alternativa descartada:** mantener 18px con `--spacing: 4px`. Obliga a seguir usando tamaños arbitrarios en todos los componentes.

## DF-010 — Componentes UI presentacionales y `classes.js`

**Fecha:** 2026-09-29 · **Unidad:** V6 · **Decidió:** agente (propuesta) + Esteban (aprobación)

- **Decisión:** crear `src/components/ui/` sin estado, sin hooks y sin lógica:
  - `classes.js`: constantes de clases (`btnPrimary`, `btnSecondary`, `navItemActive`, `navItemInactive`, `inputBase`, `labelBase`, `th`, `td`, `focusRing`), que reemplazan `buttonBase`, `tabActive` y `tabInactive` de `App.jsx`;
  - `Card`, `Badge` (`tone`), `StatTile`, `TableCard` e `Icon` (SVG inline con `aria-hidden="true"`, dibujados a mano, sin dependencias).
- **Regla:** las condiciones existentes se copian literales. Solo cambia a qué clase o tono apuntan. Ejemplo: `tone={data.enabled ? 'cyan' : 'pink'}`.
- **Alternativa descartada:**
  - Librerías de componentes o de íconos (Phosphor, Lucide): agregan dependencias, y el pedido las prohíbe sin aprobación.
  - Un componente `NavItem`: los 4 `<button>` quedan en `App.jsx`, para que el diff de sus `onClick` sea nulo.

## DF-011 — App shell y responsive sin estado

**Fecha:** 2026-09-29 · **Unidad:** V6 · **Decidió:** Esteban (humana: layout, ubicación de /health, orden en móvil) + agente (implementación)

- **Decisión:**
  - **Login:** pantalla completa con el degradado del marco y una card central (logo, título, subtítulo y botón). "Cargando Auth0..." usa la misma pantalla.
  - **Shell:**
    - topbar en `bg` con un divisor inferior (logo, "Sesión iniciada como", email y botón de salir);
    - sidebar en `panel` con `border-r` (4 ítems con ícono y la card "Estado de la API");
    - área principal.
  - **Render (decisión humana):** los mensajes `healthStatus` y `error` pasan a la card "Estado de la API", dentro de la rama autenticada. Sus condiciones y expresiones se copian literales.
    - Es equivalente en la práctica: `checkHealth` solo se ejecuta autenticado, y `logout` hace una redirección completa que vuelve a montar `App`.
  - **Responsive (< md):**
    - la nav pasa a ser una fila horizontal con `overflow-x-auto`;
    - la card de API va **al final del contenido** (orden en el DOM: nav → main → API);
    - desde `md`, un grid la ubica al fondo del sidebar.
  - Las tablas hacen scroll dentro de su card.
  - Sin estado nuevo.
- **Descartado (requiere lógica):** menú hamburguesa e indicador de carga de /health, porque necesitan estado nuevo.

## DF-012 — Accesibilidad: contraste AA, foco visible, labels y `lang`

**Fecha:** 2026-09-29 · **Unidad:** V6 · **Decidió:** agente (cálculo) + Esteban (aprobación de atributos)

- **Contraste:** calculado con la fórmula WCAG en un script. Todo el texto normal da ≥ 4,5:1:
  - `text` 6,81 y `text-muted` 4,70 sobre `surface`;
  - sobre `panel`: `text-muted` 5,63 y `text` 8,15;
  - texto del botón (`panel`) 11,56 sobre `#00e8f8` y 4,84 sobre `#1e8ae5`;
  - pills: `accent` 5,21, `pink-soft` 4,78, `orange-soft` 5,40 y `success` 5,66, cada una sobre su fondo al 15 %.
- **Hallazgo del script:** `text-muted` sobre `surface-hover` da 4,14:1 y no pasa. Por eso el `thead` va sobre `surface` con un divisor, y `text-muted` nunca se usa sobre `surface-hover`.
- **Corrección (misma fecha, pasada final V6R.9):** al agregar al script los pares sobre `surface-hover` (hover de filas), la pill rosa daba ~~4,78:1~~ 4,28:1 (`#ff6b98` sobre `pink/15` en una fila con hover) y no pasaba. `pink-soft` y `danger` pasan a `#ff80a8`:
  - 4,88:1 sobre la pill en hover;
  - 5,45:1 sobre la pill normal;
  - 7,41:1 sobre `panel`.
- **`text` / `text-muted`:** se diferencian por tipografía, no solo por color: `text-muted` va en mayúsculas, `text-xs` y `tracking-widest`.
- **Foco:** `focus-visible` con outline cian en los botones y en los ítems del sidebar; anillo cian en inputs y select.
- **Movimiento:** las transiciones usan `motion-reduce:transition-none`.
- **Cambios de atributos aprobados por Esteban:**
  - V4: `id` + `htmlFor` en los 4 pares label/control, sin tocar `type`, `value`, `required`, `min` ni `step`;
  - `index.html`: `lang="es"` y `<title>EnergyShark</title>`.
- **Descartado:** formatear cifras con `toLocaleString` en V2, porque cambia expresiones.

## DF-013 — `App.css` y assets sin uso

**Fecha:** 2026-09-29 · **Unidad:** V6 · **Decidió:** Esteban (humana)

- **`App.css`:** se mantiene según DF-006, sin tocarlo, aunque ningún archivo lo importa (verificado con `grep`).
- **Assets sin referencias** (`grep -rnE` en `src`, `index.html` y `vite.config.js`): `src/assets/hero.png`, `react.svg`, `vite.svg` y `public/icons.svg`.
  - Solo se reportan; no se borran.
  - En uso: `tiburon.png` (`App.jsx`) y `favicon.svg` (`index.html`).

---

> Las decisiones DF-014 a DF-022 se escribieron el 2026-10-07, **antes** de implementar la integración con la API real, en su propio commit (RDOC01). Plan aprobado por Esteban con ajustes; detalle en `prompt/tarea-integracion-api/`. Las formas de las respuestas se verificaron contra el código de `JorgeUribeGo/EnergyShark` en `origin/main` (`c58ccbd`), no solo contra el informe `docs/integracion-backend.md`.

## DF-014 — Hook propio `useApiQuery` y `src/api/endpoints.js`, sin react-query

**Fecha:** 2026-10-07 · **Unidad:** V2–V5 (integración) · **Decidió:** Esteban (restricción: sin dependencias nuevas) + agente (diseño del hook)

- **Contexto:**
  - Las 4 vistas leían `src/mocks/*.json`.
  - `useApiClient().apiFetch` crea una función nueva en cada render. Si se usa directo en un `useEffect`, dispara requests en loop.
  - `eslint-plugin-react-hooks` 7 prohíbe escribir refs durante el render.
- **Decisión:**
  - `src/api/endpoints.js`: una función por endpoint, que recibe `apiFetch`.
  - `src/api/useApiQuery.js` devuelve `{ data, loading, error, reload }`, con `pollMs` y `enabled` opcionales.
  - `apiFetch` y `fetcher` viven en refs que se sincronizan en `useLayoutEffect`.
  - Un contador de requests descarta las respuestas que llegan desordenadas, por ejemplo al cambiar de página rápido.
  - La lógica pura (formatos, tope, capacidad, ventana) va en `src/lib/`, con tests `node --test`.
- **Alternativa descartada:**
  - `@tanstack/react-query` o SWR: dependencia nueva, prohibida sin aprobación.
  - `fetch` suelto en cada componente: repite los estados de carga y error 4 veces y es fácil equivocarse con el cleanup.
- **Dónde vive:** `src/api/endpoints.js`, `src/api/useApiQuery.js`, `src/lib/`.

## DF-015 — Polling e intervalos

**Fecha:** 2026-10-07 · **Unidad:** V2–V5 · **Decidió:** Esteban (rangos del pedido) + agente (valores exactos)

- **Contexto:** el backend no tiene WebSocket ni SSE. RF01, RF02, RF04 y RF05 piden ver los cambios sin recargar la página, y en la demo el ayudante inyecta duplicados.
- **Decisión:**

| Vista | Intervalo | Condición |
|---|---|---|
| V5 rechazados | 15 s | siempre, más el botón "Actualizar" |
| V2 historial | 30 s | solo en la página 1 |
| V4 listado | 3 s | solo si hay filas visibles en `proposed` o `confirmed`; si no, sin polling |
| V4 ciclo abierto del formulario | 30 s | siempre, para habilitar el formulario cuando abre la ventana |
| V3 conectividad | 60 s | siempre, más el botón "Actualizar" |

  - El polling es silencioso: no vuelve a mostrar el estado de carga.
  - Se salta el tick si la pestaña está oculta (`document.hidden`).
  - El intervalo se limpia al desmontar o al cambiar de parámetros.
- **Alternativa descartada:** WebSocket o SSE, que el backend no expone. Un intervalo único global: V4 necesita 3 s y V3 no.
- **Dónde vive:** `src/api/useApiQuery.js` (`pollMs`) y cada vista.

## DF-016 — El 404 de `/api/distance-table` es un estado informativo

**Fecha:** 2026-10-07 · **Unidad:** V3 · **Decidió:** Esteban (pedido) + agente

- **Contexto:** `GET /api/distance-table` está en `main` del backend (PR #20), pero mergeado no es lo mismo que desplegado. Hasta el redeploy del EC2, producción puede responder 404.
- **Decisión:**
  - `error.status === 404` → estado informativo neutro, "Sin datos o endpoint aún no desplegado", no un error rojo.
  - `cityId`/`updatedAt` null o `distances: {}` → estado vacío.
  - Cualquier otro error → `ErrorState` con "Reintentar".
- **Alternativa descartada:** mostrar el 404 como error. En la demo se leería como una falla del frontend.
- **Dónde vive:** `src/components/DistanceTable.jsx`.

## DF-017 — Validación de la propuesta en el cliente

**Fecha:** 2026-10-07 · **Unidad:** V4 · **Decidió:** Esteban (humana: la capacidad solo advierte) + agente (reglas)

- **Contexto:**
  - La validación final es del backend y del connector: `negotiation.js` → `localRejection`.
  - Una propuesta que supera el tope o la capacidad se registra igual (201) y después termina en `rejected`, con `PRICE_ABOVE_CAP` u `OVER_CAPACITY`.
- **Decisión:**
  - `quantity` y `pricePerEnergy` tienen que ser números mayores que 0, y se envían con `Number()`.
  - **El tope bloquea:** `cap = round2(1.05 × generationCost)` del ciclo abierto. Es la misma regla exacta del connector.
  - **La capacidad del give advierte y permite enviar.**
    - `spare ≈ max(0, generationCapacity − consumption) − Σ quantity` de los give del ciclo en `proposed`, `confirmed` o `paid`.
    - Es una estimación más conservadora que la del connector, que no cuenta los `requested` y usa la energía confirmada por la central.
  - **Decisión humana:** "Advertir y permitir (Recommended)".
- **Alternativa descartada:** bloquear también por capacidad. Podría impedir un give válido en un caso borde.
- **Dónde vive:** `src/lib/negotiation.js` (con tests) y `src/components/NegotiationAdmin.jsx`.

## DF-018 — `/health` en texto plano

**Fecha:** 2026-10-07 · **Unidad:** V1 (card de estado) · **Decidió:** Esteban (no parchar el contrato desde el front) + agente

- **Contexto:** master responde `200 ok` en `text/plain` (`app.js`), pero `openapi.yaml` promete JSON `{status, dbConnected, brokerConnected}`. El cliente anterior siempre hacía `res.json()`, así que fallaba.
- **Decisión:**
  - `apiFetch` lee el cuerpo según `content-type`: JSON si es `application/json` y texto en cualquier otro caso. Un 204 o un cuerpo vacío se leen como `null`.
  - La card muestra el texto tal cual, o el JSON serializado si algún día cambia.
  - La discrepancia con el contrato se reporta al backend como hallazgo y no se parcha en el front.
- **Alternativa descartada:** pedirle al backend que cambie `/health` a JSON antes de integrar. Bloquea la integración el día de la entrega.
- **Dónde vive:** `src/api/client.js`, `src/App.jsx` (`checkHealth`).

## DF-019 — Qué se muestra cuando un campo viene null

**Fecha:** 2026-10-07 · **Unidad:** V2–V5 · **Decidió:** Esteban (textos del pedido) + agente

- **Contexto:** varios campos son nullables según el código de master y el contrato.
- **Decisión:**

| Campo | Se muestra |
|---|---|
| `statusStatement` null | "Sin status-statement" (y no hay tope ni capacidad para V4) |
| `negotiationReportSent` null y ciclo en `negotiating` con `windowClosesAt` futuro | "Pendiente" (neutral) |
| `negotiationReportSent` null en cualquier otro caso | "Reporte no enviado" (rosa: implica la multa del próximo budget) |
| `finalBalances.*`, `lastOperationApplied`, `windowOpensAt/ClosesAt`, `settledPricePerEnergy`, `type`, `msgId`, `idpk`, `reason`, `code` null | "—" |

- **Alternativa descartada:** ocultar las secciones vacías. RF01 pide que se vea explícitamente si hubo o no reporte y status-statement.
- **Dónde vive:** `src/lib/format.js`, `src/lib/status.js` y las vistas.

## DF-020 — Layout de V2 y `lastOperationApplied` destacada

**Fecha:** 2026-10-07 · **Unidad:** V2 (RF01) · **Decidió:** Esteban (humana: layout y regla de la cabecera) + agente (heurística)

- **Contexto:**
  - Cada ciclo real tiene 7 bloques. Con `limit=10`, mostrarlos todos abiertos deja una página muy larga.
  - RF01 exige identificar claramente la última operación aplicada.
  - `lastOperationApplied.appliedAt` es la hora del evento del ledger. En give y take **no coincide al milisegundo** con el `paidAt` de la negociación: en un ciclo real, `.181` contra `.184`.
- **Decisión:**
  - **Decisión humana:** "1ª abierta, resto plegable (Recommended)". Se usa `<details>/<summary>` nativo, sin estado nuevo.
  - Secciones separadas:
    - status-statement;
    - fondos por transfer;
    - demand-statements, con signo;
    - negociaciones voluntarias;
    - negotiation-report enviado;
    - balances finales.
  - `lastOperationApplied` va **siempre** visible en la cabecera de cada ciclo, abierto o plegado, con tipo y hora. No depende de ningún emparejamiento.
  - Marcar el ítem en su sección es una **heurística de mejor esfuerzo**:
    - `transfer` y `demand-statement`: igualdad exacta de `appliedAt`/`receivedAt`, porque ambos salen del mismo evento;
    - `give` y `take`: la negociación `paid` de esa dirección con el `paidAt` más cercano.

    Si no hay coincidencia, no se marca nada y la cabecera sigue mostrando la operación.
- **Alternativa descartada:**
  - Todas las tarjetas abiertas.
  - Pedir `GET /api/cycles/:id` al expandir: el listado ya trae el objeto completo.
- **Dónde vive:** `src/components/CycleHistory.jsx`, `src/lib/cycles.js` (`matchLastOperation`, con tests).

## DF-021 — Ciclo abierto y próxima ventana estimada desde los datos

**Fecha:** 2026-10-07 · **Unidad:** V4 (RF04) · **Decidió:** Esteban (nunca hardcodeada) + agente (fórmula)

- **Contexto:** el backend no tiene endpoint de "ciclo actual".
- **Decisión:**
  - **Ciclo abierto:** el primero de `GET /api/cycles?limit=5` con `phase === 'negotiating'`, `windowClosesAt` futuro y `statusStatement` presente.
  - **Si no hay ciclo abierto, el formulario se deshabilita y se muestra la próxima ventana estimada:**
    - período = mediana de las diferencias entre `windowOpensAt` consecutivos de los ciclos listados;
    - próxima = último `windowOpensAt` + k·período, la primera mayor que ahora;
    - con menos de 2 ciclos con ventana, se muestra "no estimable".
- **Alternativa descartada:** hardcodear "cada 2 h a las HH:40 UTC". Se rompe con `CYCLE_TIME_SCALE` en local o si la central cambia el ritmo.
- **Dónde vive:** `src/lib/cycles.js` (`findOpenCycle`, `estimateNextWindow`, con tests).

## DF-022 — `.env.example`, proxy de Vite y volver a iniciar sesión

**Fecha:** 2026-10-07 · **Unidad:** V1–V5 · **Decidió:** Esteban (pedido) + agente

- **Decisión:**
  - **`.env.example`:** las 4 `VITE_*` (`AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_AUDIENCE`, `API_BASE_URL`) **sin valores**.
  - **Proxy de Vite:** `server.proxy` de `/api` y `/health` → `http://localhost:3001` (master local). Solo se usa si `VITE_API_BASE_URL` está vacío. Contra producción no interviene, porque las URLs son absolutas.
  - **Volver a iniciar sesión:** si `getAccessTokenSilently` falla con `login_required` o `consent_required`, `apiFetch` lanza un `ApiError` con `authRequired`. `ErrorState` ofrece entonces "Volver a iniciar sesión", que llama a `loginWithRedirect`.
- **Alternativa descartada:** apuntar el front directo a `https://tiburonshark.me`. Es Nginx → master sin el Gateway y sin CORS.
- **Dónde vive:** `.env.example`, `vite.config.js`, `src/api/client.js`, `src/components/ui/States.jsx`.
