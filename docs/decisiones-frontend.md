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

## DF-023 — Sesión que sobrevive a recargar: refresh tokens en `localStorage`

**Fecha:** 2026-10-07 · **Unidad:** V1 · **Decidió:** Pedro (pedido) + agente, a partir del testeo de punta a punta del backend

- **Problema (verificado en el navegador):** con sesión iniciada, una recarga (F5) devuelve la pantalla de login. El SDK guarda el token solo en memoria y, para recuperarlo, depende de un iframe silencioso con cookies de terceros hacia `auth0.com`. En el testeo, al recargar no salió ninguna petición a Auth0 ni hubo errores en consola: la sesión se pierde en silencio. En la demo, cualquier recarga obliga a loguearse de nuevo.
- **Decisión:**
  - `useRefreshTokens` + `cacheLocation="localstorage"` en el `Auth0Provider`.
  - `useRefreshTokensFallback`: mientras Auth0 no emita refresh tokens, se vuelve al iframe y nada empeora.
  - `invalid_grant` y `missing_refresh_token` se suman a los errores que piden volver a iniciar sesión (DF-022).
- **Costo aceptado:** un XSS podría leer el token de `localStorage`. La app no carga scripts de terceros y React escapa lo que renderiza.
- **Alternativa descartada:** refresh tokens con caché en memoria. Renuevan el token mientras la pestaña vive, pero se pierden igual al recargar, que era el problema.
- **Requiere en Auth0 (Jorge):** *Allow Offline Access* en la API y *Refresh Token Rotation* en la app SPA. Sin eso, Auth0 no emite el refresh token: verificado, el *scope* trae `offline_access` pero no viene `refresh_token`. Opcional: *Allow Skipping User Consent*, para que en `app.tiburonshark.me` no aparezca la pantalla de consentimiento. En `localhost` aparece siempre la primera vez.
- **Dónde vive:** `src/auth/auth0-provider-with-navigate.jsx`, `src/api/client.js`.

---

> **E2.** Desde aquí, decisiones de la Entrega 2 (protocolo v3: wallet, mercado entre ciudades, ciclo de 20 min).
> Roadmap: `docs/E2 Road Map.md` del backend, sesión S11.

## DF-024 — RF01 en la E2: resumen en el listado y detalle al expandir (reemplaza parte de DF-020)

**Fecha:** 2026-11-01 · **Unidad:** S11 (RF01) · **Decidió:** Esteban (humana) + agente (forma de los datos)

- **Contexto:**
  - RF01 en la E2 pide por ciclo: `cycleId`, `status-statement`, financiamiento, oferta y sus actualizaciones, bids enviados y recibidos con su resultado, swaps con estado final, transporte, `imbalance-settlement` y `negotiation-report`, con la última operación aplicada identificada.
  - Con 72 ciclos al día y compradores que pueden inundar de bids, un ciclo puede traer decenas de filas. En la E1 el listado traía cada ciclo completo y DF-020 descartó pedir el detalle al expandir.
  - El endpoint de detalle (`GET /api/cycles/{cycleId}` extendido) es de Esteban (roadmap E2, S11), así que la forma la fija el front.
- **Decisión humana:** "Resumen + detalle al expandir (Recommended)".
  - `GET /api/cycles` trae solo la cabecera de cada ciclo: `cycleId`, `phase`, `market` (instantes), `validUntil`, `lastOperationApplied`, `negotiationReportSent`, `finalBalances` y `counts` (`bidsReceived`, `bidsSent`, `swapsSettled`).
  - `GET /api/cycles/{cycleId}` trae el detalle al abrir la tarjeta: `statusStatement` (con `energy.sellable` y el bloque `market`), `funding` (`quantity`, `penalty`, `balanceAfter`, `creditLine`), `offer` con `updates[]`, `bidsReceived[]`, `bidsSent[]`, `swaps[]` (con `transport`), `imbalanceSettlement`, `negotiationReportSent` y `finalBalances`.
  - Solo la tarjeta abierta del ciclo en curso hace polling (30 s, DF-015); las cerradas no piden nada.
  - La forma completa queda en `src/mocks/cycles.js` hasta que se escriba en el `openapi.yaml` del repo de contratos.
- **Se mantiene de DF-020:** la primera tarjeta abierta y la última operación siempre visible en la cabecera.
- **Alternativa descartada:** extender `CycleSummary` con todo lo v3 en el listado. Menos cambios, pero respuestas grandes cada 30 s.
- **Dónde vive:** `src/components/CycleHistory.jsx`, `src/api/endpoints.js`.

## DF-025 — Mocks detrás de `VITE_USE_MOCKS`, solo en desarrollo

**Fecha:** 2026-11-01 · **Unidad:** S11 · **Decidió:** Esteban (humana) + agente

- **Contexto:** el backend de la E2 (S3, S5, S6, S7) todavía no existe y el roadmap pide armar las vistas con mocks. Los mocks de la E1 se borraron en `e061c1a`.
- **Decisión humana:** "Flag VITE_USE_MOCKS (Recommended)".
  - Con `VITE_USE_MOCKS=true` **y** `npm run dev`, `listCycles` y `getCycle` responden desde `src/mocks/cycles.js`, con una latencia simulada. El resto de los endpoints sigue yendo a la API.
  - En `npm run build` el flag no tiene efecto: la condición incluye `import.meta.env.DEV`, y el `import()` dinámico de los mocks queda fuera del bundle de producción.
  - Los instantes de los mocks se calculan desde la hora actual, para ver las fases del ciclo en vivo.
  - Se borran en S23 (integración con la API real).
- **Alternativa descartada:** fixtures solo en tests. No deja ver la vista mientras el backend no existe.
- **Dónde vive:** `src/api/endpoints.js`, `src/mocks/cycles.js`, `.env.example`.

## DF-026 — Ciclos de la E1 en el historial

**Fecha:** 2026-11-01 · **Unidad:** S11 · **Decidió:** Esteban (humana)

- **Contexto:** la base tiene ciclos de la E1 con `transfersReceived`, `demandStatementsApplied` y `voluntaryNegotiations`, flujos que la v3 retiró.
- **Decisión humana:** "Mostrar solo si traen datos (Recommended)". Las secciones v3 son las principales; las de la E1 aparecen bajo "Protocolo E1" solo en los ciclos que las tengan. Su marcado de la última operación sigue con la heurística de DF-020.
- **Alternativa descartada:** eliminarlas. Los ciclos antiguos se verían vacíos.
- **Dónde vive:** `src/components/CycleHistory.jsx`, `src/lib/cycles.js` (`hasLegacyData`).

## DF-027 — Fase del ciclo v3 y última operación por referencia exacta

**Fecha:** 2026-11-01 · **Unidad:** S11 · **Decidió:** agente (implementación), dentro de DF-024

- **Fase:** se deriva de los instantes del `status-statement` (`market.opensAt`, `closesAt`, `reportOpensAt` y `validUntil`), porque la central es la única autoridad de tiempo y el enunciado prohíbe derivarlos del reloj propio. El reloj del navegador solo se usa para comparar contra esos instantes, igual que en DF-021. Fases: "Mercado abierto", "Periodo de cierre" y "Cerrado". Sin bloque `market` (ciclos E1) se usa `phase` del backend como antes.
- **Reporte pendiente:** en un ciclo v3, mientras no pase `validUntil`; en uno E1, la regla de DF-019.
- **Última operación:** como el endpoint es propio, `lastOperationApplied` trae `ref` (`swapId` o `msgId`) además de `type` y `appliedAt`. El ítem se marca por igualdad exacta de esa referencia, sin heurística de tiempos. Tipos v3: `transfer` (financiamiento), `swap-settled`, `trade-recorded` (transporte), `imbalance-settlement` y `reconciliation`. Si no viene `ref`, se cae a la heurística de DF-020.
- **Dónde vive:** `src/lib/cycles.js` (`marketPhase`, `reportPending`, `matchLastOperation`), con tests.

## DF-028 — Se retira la vista de negociaciones de la E1 (V4) en S11, no en S13

**Fecha:** 2026-11-01 · **Unidad:** S11 · **Decidió:** Esteban (humana)

- **Contexto:**
  - En la v3 la central responde `TYPE_RETIRED` (410) a `negotiation-proposal`, `give` y `take`. La vista "Negociaciones" (RF04 de la E1) solo puede crear propuestas que fallan.
  - El roadmap ponía el retiro en S13, pero S11 y S13 son de Esteban y no dependen de nadie más.
  - DF-024 deja el listado de ciclos sin `statusStatement`, que la vista usaba para encontrar la ventana abierta (DF-021).
- **Decisión humana:** retirarla ahora.
  - Se borran `NegotiationAdmin.jsx` y su pestaña.
  - Se borran las funciones del cliente `createNegotiation`, `listNegotiations` y `getNegotiation`.
  - Se borra la lógica que solo usaba esa vista, con sus tests: `findOpenCycle`, `findOpenCycleWithoutStatus`, `estimateNextWindow` (DF-021), `giveSpare` y `validateProposal` (DF-017), e `isActiveNegotiation`.
  - Se conservan `round2`, `priceCap`, `paymentAmount` y las etiquetas de negociación, que RF01 usa para los ciclos de la E1 (DF-026). `fmtCountdown` también se conserva: es un formato genérico.
- **Fuera de alcance:** `POST /api/negotiations` en master lo retira Francisca en S3. Mientras tanto, el front simplemente deja de llamarlo.
- **Reemplaza:** DF-017 y DF-021. La administración de estrategia (RF04 de la E2) entra en S13 como vista nueva.
- **Dónde vive:** `src/App.jsx`, `src/api/endpoints.js`, `src/lib/cycles.js`, `src/lib/negotiation.js`, `src/lib/status.js`.

## DF-029 — Conectividad: transporte por kWh y rutas deshabilitadas destacadas

**Fecha:** 2026-11-01 · **Unidad:** S11 (base de RF02) · **Decidió:** Esteban (alcance) + agente

- **Contexto:**
  - En la E2 el transporte se cobra al comprador por cada kWh: `round2(distance_km × transportCost)`. El precio efectivo de comprarle a una ciudad es su precio más ese transporte (RF02, anomalía 6).
  - `distance` viaja en metros: el enunciado de la E1 da 62 763 183 → "62.763 km" y 1 kWh ≈ 213 créditos con `transportCost` 0,0034.
  - El endpoint actual ya trae `enabled`. `disabledRouteTransportCost` lo expone S6 (Francisca).
- **Decisión:**
  - Nueva columna "Transporte por kWh" = `round2(distance / 1000 × transportCost)`, calculada en `src/lib/transport.js` con tests.
  - En una ruta deshabilitada, la celda dice "Tarifa punitiva" en vez de la cifra, porque esa tarifa no viene en el endpoint actual.
  - Fila deshabilitada con fondo rosado y un resumen arriba de la tabla: "N rutas deshabilitadas: X, Y".
  - Distancia mostrada en km en vez de metros.
- **Alternativa descartada:** esperar a S6 para tocar la vista. Lo de esta DF no depende de campos nuevos.
- **Dónde vive:** `src/components/DistanceTable.jsx`, `src/lib/transport.js`.

---

> DF-030 y DF-031 se escribieron el 2026-11-01, **antes** de implementar el rediseño, en su propio commit (RDOC01). No es una tarea del roadmap E2: es un fix propio de Esteban (`prompt/tarea-fix-rediseno-studylicc/`), sobre la rama de la PR #11.

## DF-030 — Rediseño con la estética de StudyLicc, modo claro y oscuro (reemplaza la paleta de DF-008 y los íconos de DF-010)

**Fecha:** 2026-11-01 · **Unidad:** fix propio (fuera de S) · **Decidió:** Esteban (humana: estética, logo, color de advertencia, alcance, papel blanco) + agente (adaptación al stack, contrastes)

- **Contexto:**
  - El rediseño V6 (DF-008) dejó un estilo oscuro de neón (degradados cian/rosa, sombras fuertes) sin modo claro.
  - Esteban pidió la estética de su plataforma StudyLicc: tinta, acento verde, subrayador amarillo, fondos de cuaderno, bordes cálidos de 1 px, sin degradados ni sombras pesadas, con modo claro y oscuro.
  - La guía de StudyLicc está pensada para Next.js. Aquí se adapta a Vite + React 19 + Tailwind 4.
- **Decisiones humanas:**
  - **Alcance: solo piel y shell.** Cambian los tokens, las fuentes, los íconos, el tema, el login, el header, el sidebar y el kit `ui/`. Las vistas mantienen su estructura y su lógica, y las grillas de StatTiles se quedan porque son datos, no tarjetas de presentación. Así hay menos conflictos con S12 a S14.
  - **Papel blanco, no crema.** En un dashboard el crema de StudyLicc no se ve profesional. Cambios en el claro:
    - `paper` pasa de `#faf7f0` a `#fafaf8`
    - `card` pasa de `#fffdf8` a `#ffffff`
    - `sand-100` pasa a `#f4f3ef` y `sand-200` a `#e7e5df`, para que tiles, hover y bordes no se vean amarillentos
    - el renglón `--rule` pasa a `#edece8` y el punto `--dot` a `#e2e0d9`
    - el resto de la paleta y el oscuro completo quedan como en StudyLicc
  - **Logo nuevo:** isotipo SVG propio (una aleta sobre una línea de agua) relleno en `accent` con trazo en tinta, más el wordmark "EnergyShark" en Space Grotesk 700. No se usa la marca StudyLicc. `tiburon.png` deja de importarse.
  - **Advertencia en `rose`:** lo que era naranja ("Duplicado", "Periodo de cierre") pasa a `rose`/`rose-ink`. `coral` queda solo para errores (NACK, rechazado, ruta deshabilitada, multa).
- **Adaptaciones al stack (agente):**
  - Fuentes: `@fontsource/space-grotesk` (700), `@fontsource/work-sans` (400/500/600) y `@fontsource/space-mono` (400/700) en vez de `next/font`. Van dentro del bundle y se sirven desde CloudFront, sin pedir nada a Google.
  - Tema: store propio en `src/lib/theme.js` en vez de `next-themes`:
    - guarda `light`, `dark` o `system` en `localStorage`, con try/catch;
    - por defecto sigue al sistema;
    - un script inline en `index.html` pone `.dark` en `<html>` antes del primer paint, para evitar el parpadeo;
    - la variante `dark:` se registra por clase.
  - Íconos: `@phosphor-icons/react`, peso `bold`. `Icon.jsx` conserva su API (`<Icon name="..." />`) y mapea cada nombre a un componente de Phosphor. Reemplaza los SVG dibujados a mano de DF-010; el pedido de StudyLicc trae la aprobación de la dependencia.
  - Movimiento: solo CSS (keyframes `section-in`, `fade-in` y `pop-in`, y rotación del chevron), siempre con `motion-safe:` o `motion-reduce:`. Duraciones de 150 a 300 ms, easing `cubic-bezier(0.22,1,0.36,1)`. No se agrega la librería `motion`.
- **Tokens (`src/index.css`):**
  - Claro: `paper`, `ink`, `card`, `sand-100…900`, `accent` `#2bb699`, `accent-hover`, `accent-ink` `#16715d`, `marker` `#ffd23f`, `coral`/`coral-ink`, `rose`/`rose-ink` y `lavender`/`lavender-ink`.
  - Oscuro (`.dark`): reasigna cada token por su rol, en azul tinta:
    - `ink` es el fondo (`#141822`) y `paper` es el texto (`#e7eaf1`);
    - `sand-900` es la superficie y `sand-800` la superficie elevada, el hover y el borde;
    - `accent` sube a `#4fdcb5`;
    - la elevación se marca por luminosidad, con `edge-light` en las tarjetas.
  - Prohibidas las escalas frías de Tailwind (`zinc`, `slate`, `gray`, `neutral`, `stone`), `white/`, `black/`, `bg-linear-*` y la sombra `shadow-card`.
- **Tonos de `Badge` (los usa `src/lib/status.js`):**

| Tono | Claro | Oscuro | Antes | Uso |
|---|---|---|---|---|
| `active` | `accent/10` + `accent-ink` | `accent-soft` + `accent` | `cyan` | vigente, propuesto, aceptado, habilitado, mercado abierto |
| `settled` | `accent` sólido + `ink` | igual | `success` | liquidado, reporte enviado |
| `error` | `coral/10` + `coral-ink`, ícono | `coral/15` + `coral` | `pink` | NACK, rechazado, ruta deshabilitada, reporte no enviado |
| `warning` | `rose/10` + `rose-ink`, ícono | `rose-soft` + `rose` | `orange` | duplicado, periodo de cierre |
| `category` | `lavender/10` + `lavender-ink` | `lavender-soft` + `lavender` | `violet` | consumo |
| `neutral` | `sand-100` + `sand-600` | `sand-800` + `sand-300` | `neutral` | enviado, expirado, cerrado, pendiente |

- **Contraste (WCAG, script en la sesión):** todo el texto da al menos 4,5:1 y el foco al menos 3:1.
  - Claro:
    - `ink`: 16,62 sobre `paper` y 17,37 sobre `card`
    - `sand-600`: 7,64 sobre `paper` y 6,34 sobre `sand-200`
    - `accent-ink`: 5,65 sobre `paper` y 5,09 sobre `accent-soft`
    - botón (`ink` sobre `accent`): 6,83
    - chips al 10 % sobre `card` / sobre `sand-100`: `coral-ink` 5,17/4,68, `rose-ink` 5,01/4,54, `lavender-ink` 5,20/4,74, `accent-ink` 5,41/4,90
  - Oscuro:
    - `paper`: 14,73 sobre `ink` y 11,37 sobre `sand-800`
    - `sand-400`: 5,95 sobre `sand-800`
    - `accent`: 9,34 sobre `sand-900`
    - botón: 10,34
    - `coral` sobre su chip: 5,37
    - `rose` sobre `rose-soft`: 7,29
    - texto sobre el marker al 34 %: 5,42
  - **Hallazgo:** `rose-ink` sobre `rose-soft` da 4,47:1 en claro. Por eso en claro los chips usan un tinte al 10 % del tono pleno (como hace StudyLicc) y los `*-soft` solo se usan en oscuro. Los chips no van sobre `sand-200`: el hover de las filas es `sand-100`.
- **Alternativas descartadas:**
  - Copiar `DESIGN.md`, `globals.css` y `Logo.tsx` de StudyLicc al repo: son de otra marca. La guía adaptada vive en `docs/design/sistema-visual.md`.
  - Tiburón PNG recoloreado como isotipo: Esteban prefirió un SVG nuevo.
  - Chip amarillo `marker` para advertencias: rompe la regla de que el marker es solo del subrayador y del logo.
- **Dónde vive:** `src/index.css`, `src/main.jsx`, `index.html`, `src/lib/theme.js`, `src/components/ui/` (incluidos `Logo.jsx` y `ThemeSwitch.jsx`), `src/lib/status.js` (tonos), `public/favicon.svg` y las vistas (solo clases).

## DF-031 — Datos nulos como "Sin dato" y rangos con "a" (reemplaza la fila "—" de DF-019)

**Fecha:** 2026-11-01 · **Unidad:** fix propio (fuera de S) · **Decidió:** Esteban (humana)

- **Contexto:** la estética de DF-030 prohíbe el em-dash y el en-dash en los textos. DF-019 mostraba "—" en los campos nulos, y los rangos de la ventana del ciclo usaban "–".
- **Decisión:**
  - Los campos nulos (`fmt`, `fmtDate`, `fmtTime`, `orDash`, `truncId` y la etiqueta de un estado desconocido) muestran **"Sin dato"**. Se lee bien en voz alta con lector de pantalla y no se confunde con un signo negativo en columnas numéricas.
  - Los rangos se escriben con "a": "Mercado 10:00:00 a 10:10:00".
  - El resto de DF-019 (reporte pendiente, no enviado, sin status-statement) sigue igual.
- **Alternativas descartadas:**
  - Guion simple "-": en columnas numéricas parece un signo negativo.
  - Mantener "—" como glifo de dato: contradice la regla del sistema visual.
- **Dónde vive:** `src/lib/format.js` (con tests), `src/lib/status.js` y `src/components/CycleHistory.jsx`.

## DF-032 — Segunda vuelta del rediseño: entrada de ciclos, sidebar fija y plegable, menú de cuenta y un solo ciclo abierto (reemplaza partes de DF-011, DF-020 y DF-030)

**Fecha:** 2026-11-01 · **Unidad:** fix propio (fuera de S) · **Decidió:** Esteban (humana: todos los cambios de comportamiento) + agente (implementación y accesibilidad)

- **Contexto:** Esteban revisó el primer rediseño (DF-030) y pidió una página más seria y minimalista, con un shell como el de los chats de LLM.
- **Decisiones humanas:**
  1. **Entrada de los ciclos:** al cargar, las tarjetas aparecen una tras otra, de arriba hacia abajo. Usan `rise-in` (fade in subiendo 8 px) con 70 ms de retraso entre una y otra. Con "Reducir movimiento" solo hay un fundido corto.
  2. **El primer ciclo parte cerrado.** Ya no se abre solo, a diferencia de DF-020. Sigue destacado con el borde en acento.
  3. **Fondo plano:** se quita el `dot-grid` del área principal, que reemplaza ese punto de DF-030. Las vistas van sobre `paper`/`ink` lisos.
  4. **Sin "Sesión iniciada como" y el correo:** la cuenta se muestra con la foto y el nombre del usuario de Auth0 (`picture`, `name`). Si la foto falla, se muestran las iniciales.
  5. **Sidebar fija y plegable:**
     - queda fija a la altura de la pantalla y solo hace scroll el contenido;
     - un botón la pliega a un riel de íconos, y la animación va hacia el lado al cerrar y al revés al abrir;
     - el estado se recuerda en `localStorage`.
  6. **Pie de la sidebar:** el switch "Modo oscuro" y el botón de cuenta (foto y nombre). Al apretar el botón se abre un menú con "Cerrar sesión", como en los chats de LLM. Se elimina el header superior y el logo pasa a la cabeza de la sidebar.
  7. **Un solo ciclo abierto a la vez:**
     - apretar cualquier parte de una tarjeta cerrada la abre y cierra la que estaba abierta;
     - apretar fuera del ciclo abierto lo cierra;
     - el detalle se sigue montando solo cuando está abierto (DF-024).
  8. **Botón de detalle destacado:**
     - va abajo a la derecha de la tarjeta, como botón primario ("Ver detalle");
     - al abrir, baja al final del detalle y cambia a tinta ("Cerrar detalle").
- **Decisiones del agente:**
  - **Animar el ancho de la sidebar es una excepción documentada** a "solo transform/opacity" (como la de las carpetas en StudyLicc):
    - mover solo el contenido con transform deja un hueco o lo tapa durante la animación;
    - dura 250 ms con easing `cubic-bezier(0.22,1,0.36,1)`, y con "Reducir movimiento" el cambio es instantáneo;
    - los textos se apagan con `opacity`.
  - **En el celular (bajo `md`)** no hay riel. Una barra superior con el logo y un botón de menú abre la sidebar como cajón que entra con `translate-x` sobre un velo. Se cierra con el velo, con Escape o al elegir una sección. Reemplaza la fila horizontal de DF-011.
  - **Sidebar fija con `sticky`** y no con un contenedor de scroll propio: el scroll sigue siendo el de la ventana, así funcionan el scroll al abrir un ciclo y la restauración del navegador.
  - **Clic afuera:** se escucha `pointerdown` en el documento. No cuenta un clic en la barra de scroll (destino `<html>`).
  - **Teclado:** la tarjeta completa se puede apretar solo con mouse o dedo. Para el teclado, el botón "Ver detalle" tiene `aria-expanded` y `aria-controls`, y abrir otro ciclo con el botón también cierra el anterior.
  - **Scroll al abrir o cerrar:** al abrir o cerrar un ciclo, si su borde superior quedó fuera de la pantalla (porque se cerró uno más largo arriba), la página vuelve a su inicio.
  - **Menú de cuenta:**
    - `aria-haspopup="menu"` y `aria-expanded`;
    - se cierra con Escape (vuelve el foco al botón) y al apretar afuera;
    - aparece con `pop-in`.
  - En el riel, cada ítem conserva su nombre accesible (el texto sigue en el DOM con opacidad 0) y lleva `title` como tooltip. "Probar /health" queda como ícono, con un punto de color y texto para lectores de pantalla.
- **Alternativa descartada:** ocultar la sidebar del todo en vez de dejar un riel. Se pierde la navegación por íconos, que es el estándar que pidió Esteban.
- **Dónde vive:**
  - `src/App.jsx` y `src/components/Sidebar.jsx` (nuevo)
  - `src/components/ui/UserMenu.jsx` (nuevo), `src/components/ui/Avatar.jsx` (nuevo), `src/components/ui/ThemeSwitch.jsx`
  - `src/components/CycleHistory.jsx`, `src/index.css`
  - se elimina `src/components/LogoutButton.jsx`

## DF-033 — Intro del tiburón, grilla de tarjetas con diálogo, navegación entre ciclos y detalle por pestañas (reemplaza partes de DF-020, DF-024 y DF-032)

**Fecha:** 2026-11-01 · **Unidad:** fix propio (fuera de S) · **Decidió:** Esteban (humana: los cuatro pedidos) + agente (diseño de cada sistema)

- **Contexto:** Esteban pidió:
  - una entrada divertida después de iniciar sesión;
  - una navegación más fácil (72 ciclos al día y, hasta ahora, el paginador estaba al fondo y no volvía arriba);
  - una grilla que distinga el ciclo actual de los demás, con tarjetas que se abran con animación;
  - una lectura del detalle del ciclo más fácil.
- **1. Intro del tiburón** (reemplaza "Cargando Auth0..."):
  - **Secuencia completa:** la aleta del isotipo entra nadando sobre una ola que corre, con un vaivén leve, y aparece el wordmark. Cuando Auth0 termina, la aleta sale nadando hacia la derecha y la pantalla se funde hacia la vista.
  - **Cuándo se ve:** completa una vez por pestaña (`sessionStorage`) o al volver del login de Auth0 (`code` en la URL). En las recargas siguientes, versión corta: solo un fundido mientras carga.
  - **Movimiento:** solo `transform`, `opacity` y `clip-path`. Con "Reducir movimiento" no nada: solo aparece y se funde.
  - **Lectores de pantalla:** `role="status"` con "Cargando EnergyShark".
- **2. Navegación entre ciclos:**
  - **Paginador arriba de la grilla:** primera, anterior, números con elipsis, siguiente y última; en el celular, anterior, "X de Y" y siguiente. Al cambiar de página la vista sube al título y el foco pasa al título (tabindex -1). Abajo queda un paginador compacto.
  - **Buscar ciclo por ID** (`GET /api/cycles/{cycleId}`, que ya existe): abre el diálogo de ese ciclo aunque no esté en la página. Si no existe, el aviso aparece junto al campo.
  - **"Volver al ciclo actual"** cuando no estás en la página 1.
  - **Dentro del diálogo:** ciclo anterior y siguiente con botones y con ← y →. En el borde de la página carga la página vecina y sigue.
- **3. Grilla de tarjetas:**
  - **Página 1:** el ciclo más reciente es una tarjeta grande a la mitad del ancho (2 columnas × 2 filas desde `xl`), con:
    - fase y una barra del avance mercado/cierre (con `scaleX`);
    - una cuenta regresiva al próximo instante de la central;
    - los contadores en grande y la última operación.
    - Se llama "Ciclo actual" mientras no está cerrado y "Último ciclo" si ya cerró.
  - **Los demás ciclos** son tarjetas chicas: cada tarjeta entera es un `<button>` con `aria-haspopup="dialog"`.
  - **Páginas de 9 ciclos:** en la página 1 caben exactos (grande = 4 celdas + 8 chicas = 3 filas de 4); en las demás, 3 filas de 3.
  - **Diálogo:** al abrir una tarjeta, el detalle se abre en un `<dialog>` modal que crece desde la tarjeta: transform y escala desde su rectángulo, con WAAPI. Al cerrar vuelve a la tarjeta. Se cierra con Escape, con el botón o apretando el velo.
    - Mientras está abierto, la página no hace scroll.
    - En el celular ocupa la pantalla.
    - Con "Reducir movimiento" solo hay un fundido.
  - **Reemplazos:** el diálogo reemplaza el detalle en línea de DF-032 (un solo ciclo abierto, apretar afuera para cerrar, botón que baja al final). El modal resuelve lo mismo por diseño. El detalle se sigue pidiendo solo al abrir (DF-024).
  - **Mocks (DF-025):** generan 40 ciclos históricos más, para ver la grilla y la paginación.
- **4. Detalle del ciclo por pestañas:**
  - **Cabecera fija del diálogo:** id, fase, reporte, ventana, anterior/siguiente y cerrar.
  - **Cifras clave siempre a la vista:** generación, consumo, vendible, costo, créditos y energía al cierre.
  - **Última operación aplicada** con un botón "Ver" que abre su pestaña y marca la fila (DF-027).
  - **Pestañas** (`role="tablist"`, flechas, Home y End), cada una con su contador:
    - **Resumen:** línea de tiempo del mercado (abre, última oferta, último bid, cierre y válido hasta, con pasado o futuro), precios de recompra y desbalance, y financiamiento.
    - **Mercado:** oferta, con una barra de lo que queda y la tabla de actualizaciones, y tablas de bids recibidos y enviados.
    - **Swaps:** tabla con transporte y total de compras.
    - **Cierre:** liquidación de desbalance (en cuenta frente a déficit), reporte y saldos.
    - **E1:** solo si el ciclo trae datos de la E1 (DF-026).
  - **Tablas legibles:** unidades en el encabezado, números alineados a la derecha con `tabular-nums`, `th scope`, caption para lectores de pantalla y scroll horizontal dentro de la tabla.
- **Alternativas descartadas:**
  - Llevar el detalle a una página aparte con su ruta: obliga a introducir el router en las vistas y se pierde la grilla de fondo.
  - Hacer scroll infinito: dificulta llegar a un ciclo concreto, que es lo que pide la demo.
- **Dónde vive:**
  - `src/App.jsx`, `src/components/ui/SharkIntro.jsx`
  - `src/components/CycleHistory.jsx` y `src/components/cycles/` (tarjetas, diálogo, paginador, búsqueda, detalle)
  - `src/components/ui/Tabs.jsx`, `src/hooks/useNow.js`
  - `src/lib/pagination.js` y `src/lib/cycles.js` (con tests)
  - `src/mocks/cycles.js`, `src/index.css`

## DF-034 — Nombre TiburonShark, aleta hacia la izquierda, sin estado de la API, un solo paginador y reloj de actualización (reemplaza partes de DF-011, DF-015 y DF-033)

**Fecha:** 2026-11-01 · **Unidad:** fix propio (fuera de S) · **Decidió:** Esteban (humana: los seis pedidos) + agente (implementación)

- **Decisiones humanas:**
  1. **Nombre:** la app se llama **TiburonShark** en la interfaz (wordmark, intro, `<title>`). Los repos y el código siguen como están.
  2. **Intro:** la aleta nada de derecha a izquierda, que es hacia donde apunta su borde de ataque, así se ve avanzando. La ola corre al revés, hacia la derecha.
  3. **Sin "Estado de la API" en la sidebar.** Se quita la tarjeta de `/health` y su lógica de `App.jsx`. `getHealth` queda en el cliente.
  4. **Un solo paginador, abajo y siempre visible:**
     - va fijo (`sticky`) al pie de la vista, sobre el contenido;
     - arriba solo queda, en la orilla, "Página X de Y";
     - se elimina el paginador superior de DF-033;
     - al cambiar de página la vista sigue subiendo al inicio.
  5. **Sin textos de requisito ni de intervalo en los subtítulos** ("Más reciente primero (RF01)", "se actualiza cada 30 s"). En su lugar va un **reloj de actualización**:
     - un círculo con un ícono de reloj al centro y un anillo que se descuenta hasta 0, cuando llega el poll siguiente;
     - al pasar el mouse o con foco aparece "Actualizar", y apretarlo recarga y reinicia la cuenta;
     - sin polling (páginas 2+ del historial), el anillo queda lleno y solo sirve para actualizar.
     - **Precisión:** `useApiQuery` expone `updatedAt` (la hora del último dato bueno) y una recarga manual reinicia el intervalo del poll, así el anillo y el poll no se desfasan.
     - **Movimiento:** el anillo avanza a saltos de 1 s con `stroke-dashoffset` (excepción ya documentada en StudyLicc para trazos SVG).
  6. **El mismo paginador en "Registro de duplicados y NACKs":** `CyclePager` pasa a `ui/Pager.jsx`, genérico con su sustantivo ("ciclos", "mensajes"). Se retira `ui/Pagination.jsx`.
- **Dónde vive:**
  - `src/components/ui/Logo.jsx`, `SharkIntro.jsx`, `Pager.jsx` (nuevo), `RefreshTimer.jsx` (nuevo), `ViewHeader.jsx`
  - `src/api/useApiQuery.js`, `src/index.css`, `index.html`, `src/App.jsx`
  - `src/components/Sidebar.jsx`, `CycleHistory.jsx`, `DistanceTable.jsx`, `RejectedMessages.jsx`

## DF-035 — Login con movimiento: agua del logo, borde que gira en el botón y mar de olas de fondo (reemplaza el fondo `grid-lines` del login de DF-030)

**Fecha:** 2026-11-01 · **Unidad:** fix propio (fuera de S) · **Decidió:** Esteban (humana: los tres cambios y el fondo "Mar de olas") + agente (implementación)

- **Contexto:** Esteban encontró el login "demasiado fome".
- **Decisiones humanas:**
  1. **Agua del logo en movimiento:** la ola bajo la aleta corre sin parar, hacia la derecha como en la intro (DF-034). La aleta queda quieta.
  2. **Botón "Iniciar sesión" con borde animado:** deja de ser verde lleno. Es una tarjeta clara con un borde de 2 px por donde gira continuamente un tramo verde (`accent`).
  3. **Fondo "Mar de olas"** (elegido entre cuatro opciones; se descartaron burbujas, corrientes diagonales y la cuadrícula que deriva):
     - se quitan los cuadrados;
     - seis líneas de ola, del mismo trazo que el logo y muy tenues, cruzan la pantalla a distintas velocidades: las de abajo más rápidas y marcadas, las de arriba más lentas y tenues.
- **Decisiones del agente:**
  - Todo se mueve solo con `transform`: la ola corre con `translateX` sobre un trazo del doble de ancho, y el tramo del borde es un cuadrado que gira con `rotate` detrás del botón.
  - El tramo del borde es un `conic-gradient`: excepción documentada a "sin degradados", porque es la forma de dibujar un arco que gira, y vive solo en este botón.
  - Con "Reducir movimiento" nada se mueve: el agua y el fondo quedan quietos y el borde del botón queda verde completo.
  - Contraste: el texto del botón queda en tinta sobre `card` (17,37:1). El tramo verde es decorativo; el foco sigue siendo `focus-ring`.
- **Dónde vive:** `src/components/ui/AuthScreen.jsx`, `src/components/ui/SeaBackground.jsx` (nuevo), `src/components/ui/Logo.jsx` (`WaterMark`), `src/components/LoginButton.jsx`, `src/App.jsx`, `src/index.css`.
- **Corrección (misma fecha, al implementar):** ~~el tramo del borde es un cuadrado con `conic-gradient` que gira con `rotate`~~.
  - En un botón ancho el tramo pasaba casi siempre por los bordes cortos, y por momentos no se veía (verificado con capturas pausando la animación en distintos instantes).
  - Se reemplazó por un `rect` SVG con `pathLength=1` y `stroke-dasharray`, animado con `stroke-dashoffset` (la técnica del "dock trace" de StudyLicc, excepción ya documentada para trazos SVG). Recorre el perímetro a velocidad constante y siempre se ve.
  - Ya no hay degradado.

## DF-036 — Olas del login más orgánicas y un tiburón ocasional (amplía DF-035)

**Fecha:** 2026-11-01 · **Unidad:** fix propio (fuera de S) · **Decidió:** Esteban (humana: pedido, "probemos cómo sale") + agente (diseño)

- **Contexto:** las olas de DF-035 eran la misma senoide repetida y se veían mecánicas. Esteban pidió que se sienta más el movimiento y que, muy sutilmente, a veces cruce un tiburón.
- **Olas:**
  - cada capa tiene su propio patrón de crestas irregulares (distinto alto y ancho), generado por `src/lib/waves.js` y repetido dos veces para que correr un 50 % no deje salto;
  - cada capa suma un vaivén vertical lento (`sea-bob`, de 7 a 11 s) al avance horizontal, y una segunda línea más tenue que la acompaña como textura de oleaje;
  - las capas de abajo son más altas, rápidas y marcadas.
- **Tiburón ocasional:**
  - la aleta del isotipo, chica y translúcida (opacidad 0,45), cruza la pantalla de derecha a izquierda (hacia donde apunta, DF-034) sobre la quinta ola (bajo la tarjeta, para que no quede tapado) y se mece con ella;
  - el cruce dura unos 15 s dentro de un ciclo de 48 s; el resto del tiempo no está;
  - aparece y se va con un fundido;
  - es decorativo (`aria-hidden`) y con "Reducir movimiento" no aparece.
- **Movimiento:** solo `transform` y `opacity`.
- **Dónde vive:** `src/lib/waves.js` (con tests), `src/components/ui/SeaBackground.jsx`, `src/index.css`.

## DF-037 — El tiburón pasa a ser un easter egg de la aleta del logo; el botón de login sin borde animado (reemplaza partes de DF-035 y DF-036)

**Fecha:** 2026-11-01 · **Unidad:** fix propio (fuera de S) · **Decidió:** Esteban (humana) + agente (implementación)

- **Decisiones humanas:**
  1. **Tiburón como easter egg:** ya no cruza solo cada 48 s (DF-036). Aparece solo cuando aprietas la aleta del logo del login:
     - la aleta se sumerge y desaparece del logo;
     - el tiburón cruza la página nadando de derecha a izquierda;
     - al terminar, la aleta vuelve a asomar en el logo.
     El tiburón va en un tono parecido al fondo (`sand-300` en claro, `sand-700` en oscuro) para no destacar.
  2. **Botón "Iniciar sesión" sin borde animado:** se quita el trazo que recorría el borde (DF-035). Queda claro, con un borde verde quieto de 2 px.
- **Decisiones del agente:**
  - La aleta es un `<button>` con nombre accesible ("Hacer nadar al tiburón") y 44 px de área. Mientras el tiburón nada no se puede volver a apretar.
  - El estado se comparte con un contexto (`src/hooks/sharkSwim.js`) entre el logo y el fondo.
  - Con "Reducir movimiento" no hay nado: el tiburón aparece y se va con un fundido, quieto.
  - La olas de DF-036 no cambian.
- **Dónde vive:** `src/hooks/sharkSwim.js` (nuevo), `src/components/ui/Logo.jsx` (`WaterMark`), `src/components/ui/SeaBackground.jsx`, `src/components/ui/AuthScreen.jsx`, `src/components/LoginButton.jsx`, `src/index.css`.

## DF-038 — RF02: vista "Mercado" con el libro de ofertas y precio efectivo calculado en el front

**Fecha:** 2026-11-01 · **Unidad:** S12 (RF02) · **Decidió:** Esteban (humana: ubicación) + agente (forma de los datos y cálculo)

- **Contexto:**
  - RF02 pide el libro de ofertas vigente según `market.{CODE}`, con precio, `remaining`, transporte hasta cada vendedor según la `distance-table` y precio efectivo, y las rutas deshabilitadas marcadas. Es la vista de la anomalía 6 (ruta deshabilitada a mitad de mercado).
  - El endpoint del libro es de Francisca (S6) y todavía no existe. La `distance-table` ya tiene endpoint, pero sin `disabledRouteTransportCost`.
  - Referencia API v3: `offer` trae `offerId`, `quantity` y `pricePerEnergy`; `offer-updated` trae `remaining` y puede cambiar `pricePerEnergy`; `offer-withdrawn` la saca; `market-closed` cierra el libro. La tarifa de una ruta deshabilitada es `disabledRouteTransportCost`, por kWh y km. Rige la última `distance-table` recibida.
- **Decisión humana:** "Vista nueva Mercado (Recommended)". Ítem propio en la sidebar, entre el historial y Conectividad. Conectividad se queda como tabla de rutas.
- **Forma propuesta para S6** (`GET /api/market/offers`, la fija el front como en DF-024):
  - `{ cycleId, closesAt, marketClosed, updatedAt, offers: [{ offerId, cityId, pricePerEnergy, quantity, remaining, publishedAt, updatedAt }] }`.
  - Solo ofertas vigentes: las retiradas no vienen. Con `market-closed` llega `marketClosed: true` y `offers` vacío.
  - `remaining` es el último `offer-updated` (o `quantity` si no hubo).
  - `GET /api/distance-table` suma `disabledRouteTransportCost` al nivel de `distances`.
- **Decisiones del agente:**
  - **El precio efectivo se calcula en el front** (`src/lib/market.js`, puro y con tests) cruzando el libro con la `distance-table` que ya expone master. Así hay una sola fuente de la tabla vigente (la que elige el backend, ADR-002 addendum 3) y S6 no tiene que repetir el cálculo.
    - Ruta habilitada: transporte por kWh = `round2(distance_km × transportCost)` (DF-029).
    - Ruta deshabilitada: `round2(distance_km × disabledRouteTransportCost)`. Si el campo todavía no viene, la celda dice "Tarifa punitiva" sin cifra y el precio efectivo queda vacío.
    - Precio efectivo = `round2(pricePerEnergy + transporte por kWh)`.
  - **Filas especiales:** la oferta propia (mismo `cityId` que la tabla) se marca "Propia" y no tiene precio efectivo, porque comprarse a sí mismo es `SELF_TRADE`. Un vendedor sin ruta en la tabla se marca "Sin ruta".
  - **Orden:** por precio efectivo ascendente por defecto, con las filas sin precio efectivo al final. Se puede ordenar por precio, `remaining` y precio efectivo con los encabezados (`aria-sort`).
  - **Polling:** libro cada 5 s y tabla cada 10 s mientras la vista está abierta. Un `offer-updated` o una `distance-table` nueva se ven en segundos (anomalía 6), sin pegarle a master más que eso.
  - **Mocks:** `VITE_USE_MOCKS` (DF-025) también responde el libro y la `distance-table`, con una ruta deshabilitada y la oferta propia, para ver la vista antes de S6. Se borran en S23 junto con los de RF01.
  - **`npm run dev:mocks`** (`vite --mode mocks`): carga `.env.mocks`, que solo trae `VITE_USE_MOCKS=true` y se commitea, así los mocks se prenden sin editar el `.env` local (pedido de Esteban). `npm run dev` sigue contra la API. En ese modo `import.meta.env.DEV` sigue en `true` (verificado), y en build no tiene efecto.
  - Aviso fijo bajo la tabla: el `remaining` que se ve puede estar viejo; la respuesta real la da el vendedor (`QUANTITY_UNAVAILABLE` con `available`).
- **Alternativa descartada:** que S6 devuelva el precio efectivo ya calculado. Repite la lógica de la tabla vigente en dos lugares.
- **Dónde vive:** `src/components/MarketBook.jsx` (nuevo), `src/lib/market.js` (nuevo), `src/mocks/market.js` (nuevo), `src/api/endpoints.js`, `src/components/Sidebar.jsx`, `src/App.jsx`.

## DF-039 — Conectividad muestra la tarifa punitiva y que rige la última tabla (amplía DF-029)

**Fecha:** 2026-11-01 · **Unidad:** S12 · **Decidió:** agente, dentro del alcance de S12 en el roadmap

- **Contexto:** DF-029 dejó "Tarifa punitiva" sin cifra porque `disabledRouteTransportCost` no venía. S6 lo agrega a `GET /api/distance-table` (DF-038).
- **Decisión:**
  - Con el campo presente, una ruta deshabilitada muestra su transporte por kWh calculado con esa tarifa, rotulado "punitiva". Sin el campo, sigue el texto de DF-029.
  - El aviso de rutas deshabilitadas muestra la tarifa (CR/kWh·km) cuando viene.
  - El subtítulo dice que rige la última tabla publicada por la central, con su hora.
  - El cálculo por fila se comparte con el libro de ofertas (`routeTransport` en `src/lib/market.js`).
- **Dónde vive:** `src/components/DistanceTable.jsx`, `src/lib/market.js`.
