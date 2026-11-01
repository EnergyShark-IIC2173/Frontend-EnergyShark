# AI log — Fix propio: rediseño con la estética de StudyLicc, modo claro y oscuro

**Fecha:** 2026-11-01
**Integrante:** Esteban
**Herramienta:** Claude Code (Opus 5.5), modo agéntico (edita archivos y corre comandos en el repo), en la extensión de VS Code. Modo plan con aprobación. Sin subagentes.
**Unidad del roadmap:** ninguna. Es un fix visual propio de Esteban, fuera de las tareas S de la E2. Prompt literal en `prompt/tarea-fix-rediseno-studylicc/01-decisiones-y-plan.md`.
**Rama:** `feat/rediseno-studylicc`, apilada sobre `feat/e2-retiro-negociaciones` (PR #11, HEAD `20ee738`), porque Esteban pidió partir "desde la actual (últimos cambios)". El PR va con base `feat/e2-retiro-negociaciones`.
**Referencias:** guía de StudyLicc fuera del repo (`E1/docs/studylicc-design/`: `DESIGN.md`, `globals.css`, `Logo.tsx`); DF-008, DF-010, DF-012, DF-019.
**Detalle por subtarea (prompts literales y resultados):** `prompt/tarea-fix-rediseno-studylicc/`

## Objetivo de la sesión
Cambiar el estilo de neón del rediseño V6 por la estética de StudyLicc (tinta, acento verde, subrayador amarillo,
fondos de cuaderno, bordes cálidos y sin sombras ni degradados), con modo claro y oscuro, sin tocar la lógica de las
vistas.

## Flujo de trabajo
1. **Lectura.** `DESIGN.md`, `globals.css` y `Logo.tsx` de StudyLicc, y todo el front actual (shell, kit `ui/`, las 3
   vistas, `status.js` y `format.js`).
2. **Decisiones humanas (4 preguntas del agente sobre choques entre el prompt de StudyLicc y EnergyShark):**
   - Logo: "Isotipo SVG nuevo, pero no tiene que ser amarillo, que sea del color que mejor estimes conveniente para
     no salirse de la estetica". El agente eligió `accent` con trazo en tinta.
   - Advertencia (lo que era naranja): rose.
   - Nulos y rangos: "Sin dato" y "a" (DF-031, reemplaza la fila "—" de DF-019).
   - Alcance: solo piel y shell. Las vistas mantienen su estructura.
3. **Corrección del plan.** Esteban rechazó el primer plan: el crema de StudyLicc no se ve profesional en un
   dashboard. El claro pasa a un papel casi blanco (`paper` `#fafaf8`, `card` `#ffffff`, `sand-100`/`sand-200` más
   neutros).
4. **Docs antes que el código** (RDOC01): DF-030, DF-031 y `docs/design/sistema-visual.md`, commit `fd16998`.
5. **Implementación:** tokens y tema (`27b4270`), kit `ui/` y logo (`d46520a`), shell y vistas (`2ec7097`), nulos
   (`8acedea`) y ajustes tras revisar capturas (`89b0bbc`).
6. **Verificación:** lint, tests, build, contraste WCAG con un script y capturas en Chrome headless de las 3 vistas y
   el login, en claro y en oscuro, a 1280 y 375 px.

## Qué se construyó
- `docs/decisiones-frontend.md` — DF-030 (rediseño) y DF-031 ("Sin dato" y rangos con "a").
- `docs/design/sistema-visual.md` — guía corta de la estética adaptada a EnergyShark, con checklist.
- `src/index.css` — tokens de StudyLicc con el claro más blanco, bloque `.dark` por rol, variante `dark:` por clase y
  utilidades `focus-ring`, `focus-ring-inset`, `edge-light`, `marker`, `dot-grid`, `ruled-lines` y `grid-lines`, más
  los keyframes.
- `src/lib/theme.js` + script inline en `index.html` — tema claro/oscuro sin parpadeo. Sigue al sistema hasta que eliges
  uno en el switch, y lo guarda en `localStorage` con try/catch.
- `src/main.jsx` — fuentes con `@fontsource` (Space Grotesk 700, Work Sans 400/500/600, Space Mono 400/700).
- `src/components/ui/`:
  - `Logo.jsx` nuevo: aleta sobre una línea de agua más el wordmark;
  - `ThemeSwitch.jsx` nuevo: `role="switch"` con `useSyncExternalStore`;
  - `classes.js` reescrito;
  - `Icon.jsx` con Phosphor bold;
  - `Badge.jsx` con tonos semánticos;
  - `Card`, `StatTile`, `States`, `Pagination`, `ViewHeader` (con `Marker`) y `AuthScreen` con los tokens nuevos.
- `public/favicon.svg` — el isotipo, que reemplaza el favicon por defecto de Vite.
- `src/lib/status.js` — solo los nombres de tono (`active`, `settled`, `error`, `warning`, `category`, `neutral`) y
  el valor nulo.
- `src/lib/format.js` — `EMPTY = 'Sin dato'` (antes `DASH = '—'`), con un test nuevo.
- `src/App.jsx`, `CycleHistory.jsx`, `DistanceTable.jsx`, `RejectedMessages.jsx` — cambian clases y textos; la lógica
  queda igual:
  - un `.marker` por título de vista;
  - ids en Space Mono;
  - el detalle del ciclo entra con `section-in`;
  - rangos con "a".

## Hallazgos / Errores encontrados y corregidos
- **`rose-ink` sobre `rose-soft` da 4,47:1 en claro.** El script de contraste lo detectó antes de escribir los
  componentes. En claro, los chips usan un tinte al 10 % del tono pleno, igual que StudyLicc; los `*-soft` quedan
  solo para el oscuro (DF-030).
- **Punto del `dot-grid`.** `sand-300` daba 1,50:1 sobre el papel blanco, demasiado marcado. Bajó a `#e2e0d9`
  (1,26:1).
- **El bundle pareció subir 246 kB.** Era una comparación mal hecha: el worktree de la base no tenía `.env`, así que
  Vite eliminaba Auth0 como código muerto. Con las mismas condiciones el bundle pasa de 321,7 a 361,5 kB (+40 kB;
  Phosphor aporta 37 kB). Sin el código de Phosphor, los íconos sin usar no entran: se verificó con `grep` de nombres
  y conteo de paths.
- **Revisión de capturas.** Se encontraron y corrigieron tres problemas (`89b0bbc`):
  - el badge de fase heredaba Space Mono del `h3` del `cycleId`;
  - el borde `accent` de la tarjeta destacada perdía contra `border-sand-200`;
  - "Sin dato" se partía en dos líneas en la columna Código.
- **El `summary` "Ver detalle" medía menos de 44 px.** Era el único control bajo el mínimo. Ahora lleva `min-h-11`.

## Verificación
- `npm run lint` → sin errores.
- `npx node@22 --test "src/lib/*.test.js"` → **19/19** (18 anteriores + 1 de DF-031). En Node 20 el glob de `npm test`
  sigue fallando, como ya estaba anotado; no se tocó.
- `npm run build` → en verde. `grep` de `cycle-9432` en `dist/` → sin resultados (los mocks no entran al build).
- Contraste (script WCAG en el scratchpad): todo el texto da al menos 4,5:1 y el foco al menos 3:1 en ambos temas.
  Las cifras están en DF-030.
- Capturas en Chrome headless (`puppeteer-core` con el Chrome instalado). Se usó un harness **fuera del repo** con un
  stub de `@auth0/auth0-react` y respuestas falsas para `/api/distance-table` y `/api/messages/rejected`; los
  ciclos salen de los mocks de DF-025.
  - Login, historial, conectividad y NACKs, en claro y en oscuro, a 1280 y 375 px.
  - Sin errores de página y sin scroll horizontal del body.
- Comportamiento (mismo harness):
  - sin preferencia y con el sistema en oscuro, carga oscuro;
  - el switch cambia a claro, guarda `light` y sigue claro tras recargar;
  - `aria-checked` coincide con el tema;
  - con `prefers-reduced-motion: reduce`, el detalle no anima;
  - el foco con Tab es un outline sólido de 2 px en `accent-ink`;
  - ningún `button` mide menos de 44 px.
- **No verificado:**
  - la vista con el login real de Auth0 y contra la API real (el agente no usa credenciales);
  - Safari y Firefox;
  - el parpadeo del primer paint en un navegador real (el script inline lo evita por diseño, pero no se midió).

## Pendiente / para coordinar
- **Esteban:** revisar en el navegador con su login (`VITE_USE_MOCKS=true npm run dev`). Push y PR solo cuando lo confirme.
- **Con el grupo:** las vistas nuevas de S12 a S14 deben usar `classes.js`, los tonos de `Badge` y
  `docs/design/sistema-visual.md`. Las clases viejas (`text-text-h`, `bg-surface`, `text-pink-soft`…) ya no existen.
- **Merge:** este PR cambia casi todas las líneas de clases de las vistas. Conviene mergearlo después de #10 y #11 y
  antes de abrir S12 a S14, para que no haya conflictos.
- `tiburon.png` y `App.css` quedan en el repo sin importarse (como DF-013).

## Fuera de alcance
- Relayout de las vistas (grillas asimétricas): Esteban eligió solo piel y shell.
- La librería `motion`, el hero y otras piezas de StudyLicc que no aplican a un dashboard.

---

## Segunda vuelta (misma fecha): sidebar, menú de cuenta y ciclos (DF-032)

**Prompt literal:** en `prompt/tarea-fix-rediseno-studylicc/07-segunda-vuelta.md`. Esteban pidió además "un commit sin coautorizador como siempre por cada cambio que te pedi".

### Flujo de trabajo
1. **Docs antes que el código:** DF-032 y el ajuste de `docs/design/sistema-visual.md`, commit `2c6f582`.
2. **Un commit por pedido:**

| Pedido | Commit |
|---|---|
| Entrada escalonada de los ciclos (fade in hacia arriba) | `acc88e0` |
| El primer ciclo no se abre solo | `9a22d88` |
| Fondo plano, sin puntos | `850740c` |
| Foto y nombre en vez de "Sesión iniciada como" + tema y cuenta al pie de la sidebar con menú de "Cerrar sesión" | `9ea5ba1` |
| Sidebar fija, plegable con animación lateral (y cajón en el celular) | `ed79711` |
| Un solo ciclo abierto; se abre apretando la tarjeta y se cierra apretando afuera | `c41e769` |
| Botón de detalle destacado abajo a la derecha, que baja al final y cambia de color para cerrar | `aad290f` |

   El pedido 4 (foto en vez del correo) y el de la cuenta al pie de la sidebar fueron un solo commit: son el mismo componente (`UserMenu`), y hacerlos por separado obligaba a armar un header que el commit siguiente borraba.

### Qué se construyó
- `src/components/Sidebar.jsx` (nuevo):
  - logo arriba y botón para plegar;
  - secciones;
  - prueba de /health, que en el riel queda como ícono con un punto de color;
  - al pie, el tema y la cuenta;
  - desde `md` es fija y plegable con `transition-[width]` de 250 ms (excepción documentada en DF-032);
  - bajo `md` es un cajón con `translate-x`, velo, Escape e `inert` cuando está cerrado.
- `src/components/ui/UserMenu.jsx` y `ui/Avatar.jsx` (nuevos) y `src/lib/user.js` con tests:
  - foto de Auth0 o iniciales;
  - nombre sin correo (si `name` es un correo se usa `nickname`);
  - menú con "Cerrar sesión" que se cierra con Escape o apretando afuera.
- `src/hooks/useMediaQuery.js` (nuevo), con `useSyncExternalStore`.
- `src/components/ui/ThemeSwitch.jsx`: fila completa y modo `compact` para el riel.
- `src/components/CycleHistory.jsx`:
  - `openId` en el listado y `<details>` reemplazado por un botón con `aria-expanded`/`aria-controls`;
  - clic en la tarjeta cerrada y clic afuera;
  - scroll al inicio de la tarjeta si quedó fuera de la pantalla;
  - entrada `rise-in` con 70 ms entre tarjetas.
- `src/App.jsx`: sin header y con el estado de la sidebar (recordado en `localStorage`). Se borra `src/components/LogoutButton.jsx`.

### Hallazgos / Errores encontrados y corregidos
- **Texto con opacidad 0 en el riel:** seguía ocupando ancho y empujaba el switch fuera. En modo compacto los textos pasan a `sr-only`, que no ocupa espacio y conserva el nombre accesible.
- **Menú de cuenta detrás de las tarjetas:** en el riel quedaba tapado porque la sidebar no tenía `z-index` en escritorio. Se pasó a `md:z-30` (lo vio la captura `s-rail-menu`).
- **Colores de botón que compiten:** construir "Cerrar detalle" sobre `btnSecondary` dejaba dos fondos y en Tailwind no se sabe cuál gana. Se exportó `btnBase` desde `classes.js`.
- **Exports que no son componentes:** el lint (`react-refresh/only-export-components`) marcó `displayName` y `NAV_ITEMS`. Se movieron a `src/lib/user.js` o se dejaron sin exportar.

### Verificación
- `npm run lint` sin errores.
- `npx -y node@22 --test "src/lib/*.test.js"` → **21/21** (19 + 2 de `user.js`).
- `npm run build` en verde; los mocks no entran al build.
- Harness de la sesión, fuera del repo (stub de Auth0 con nombre, Chrome headless):
  - **Sidebar fija:** con scroll, su `top` sigue en 0 y su alto es el de la pantalla (900 px).
  - **Riel:** mide 72 px y se mantiene tras recargar.
  - **Menú de cuenta:** lleva el foco a "Cerrar sesión"; Escape lo cierra y devuelve el foco al botón.
  - **Celular (375 px):** el cajón está `inert` cerrado, entra con el botón de menú, sale con Escape y no hay scroll horizontal.
  - **Ciclos:** parten todos cerrados.
    - Apretar la 2.ª abre solo esa; apretar la 1.ª cierra la 2.ª y abre la 1.ª.
    - Apretar afuera cierra.
    - Con teclado, Enter abre y cierra.
    - Con la 1.ª abierta y la página al fondo, apretar la 3.ª deja la 3.ª visible (`top` 677 px de 900).
    - Cerrar desde el botón al final vuelve al inicio de la tarjeta.
  - **Regresión:** se repitieron las capturas de las 3 vistas en claro y oscuro a 1280 y 375 px y las pruebas de tema, foco y movimiento reducido. Todo igual que antes.
- **No verificado:**
  - con el login real (foto real de Google/Auth0);
  - Safari y Firefox;
  - la animación de entrada y la del riel a la vista: las capturas son estáticas.

### Pendiente
- Esteban: probar con su login. Push y PR cuando lo confirme.
- El login sigue con `grid-lines`: el pedido fue quitar los puntos del área principal. Si quieres el login liso, es un cambio de una línea.

---

## Tercera vuelta (misma fecha): intro, grilla con diálogo, navegación y detalle por pestañas (DF-033)

**Prompt literal:** en `prompt/tarea-fix-rediseno-studylicc/08-tercera-vuelta.md`. Pidió de nuevo un commit por cambio.

### Flujo de trabajo
1. **Docs antes que el código:** DF-033, commit `ba63560`.
2. **Commits:**

| Pedido | Commit |
|---|---|
| 1. Intro divertida del tiburón al iniciar sesión, en vez de "Cargando Auth0" | `db4711f` |
| 3. Grilla con el ciclo actual a la mitad del ancho, tarjetas chicas a los lados y diálogo que se abre con animación | `ba2c9f3` |
| 2. Navegación más fácil entre ciclos (y volver arriba al cambiar de página) | `b841dd2` |
| 4. Rediseño de la lectura del detalle del ciclo | `6982a26` |

   **Orden distinto al pedido:** el 3 va antes que el 2 porque la navegación (búsqueda por ID, anterior/siguiente) abre el diálogo que crea el 3.

### Qué se construyó
- **Intro:** `src/components/ui/SharkIntro.jsx` y keyframes en `src/index.css` (`swim-in`, `bob`, `wave-run`, `swim-out`, `wordmark-in`, `splash-out`).
  - Fases: la aleta entra, se mece sobre la ola mientras Auth0 carga, sale nadando y la pantalla se funde.
  - La vista se monta al empezar el fundido, para que se vea la entrada escalonada de las tarjetas.
  - Completa una vez por pestaña o al volver del login (`code` en la URL); corta en las recargas siguientes; sin nado con "Reducir movimiento".
  - Tiene un respaldo con `setTimeout` para que nunca bloquee la app.
- **Grilla:**
  - `src/components/cycles/CycleCards.jsx`:
    - `CurrentCycleCard`: 2×2 desde xl, con avance mercado/cierre con `scaleX`, cuenta regresiva (`useNow`) y contadores grandes;
    - `CycleTile`: la tarjeta entera es un botón.
  - `src/components/cycles/parts.jsx` (insignias compartidas).
  - 9 ciclos por página (la página 1 cuadra exacto).
  - `src/mocks/cycles.js` genera 40 ciclos históricos.
- **Diálogo:** `src/components/cycles/CycleDialog.jsx`, un `<dialog>` modal.
  - Crece desde la tarjeta con WAAPI (translate y scale desde su rectángulo) y vuelve a ella al cerrar.
  - Se cierra con Escape, el botón o el velo, y bloquea el scroll de la página.
  - En el celular ocupa la pantalla.
- **Navegación:**
  - `src/components/cycles/CyclePager.jsx`: números con elipsis desde `src/lib/pagination.js`, arriba y abajo. Al cambiar de página sube al inicio y enfoca la grilla.
  - `CycleSearch.jsx`: abre un ciclo por ID con `GET /api/cycles/{cycleId}`.
  - "Volver al ciclo actual".
  - En el diálogo, anterior/siguiente con botones y ← →, cruzando de página (`neighbor`).
- **Detalle:** `src/components/cycles/CycleDetail.jsx` reescrito, más `DataViews.jsx` (`DataTable`, `KeyValues`, `Section`) y `src/components/ui/Tabs.jsx`.
  - Cifras clave siempre a la vista y la última operación con "Ver".
  - Pestañas Resumen (línea de tiempo, precios, financiamiento), Mercado, Swaps (con totales), Cierre (cobertura del déficit) y Protocolo E1.
  - La pestaña se mantiene al pasar al ciclo vecino.
- **Lógica nueva con tests:** `nextMilestone` y `cycleProgress` (`src/lib/cycles.js`), `fmtClock` y `fmtDay` (`src/lib/format.js`), `pageItems` y `neighbor` (`src/lib/pagination.js`).

### Hallazgos / Errores encontrados y corregidos
- **El diálogo no crecía desde la tarjeta.** En desarrollo, StrictMode corre el efecto dos veces; la segunda medición partía del panel ya transformado y su animación (identidad) pisaba a la primera. Se cancelan las animaciones en la limpieza. Se verificó midiendo el rectángulo del panel cada 70 ms: parte junto a la tarjeta (x 929) y llega a su lugar (x 144) en unos 300 ms.
- **Las flechas dejaban de funcionar al cruzar de página.** Mientras llega la página nueva, el ciclo abierto no está en la lista: "Anterior" se deshabilita un instante y el foco cae al `body`. Ahora las flechas se escuchan en `document` y, si el foco se perdió, vuelve al botón de cerrar.
- **Panel que saltaba de alto** al cargar el detalle: ahora tiene un alto fijo desde `sm`.
- **Créditos cortados en las tarjetas chicas:** compartían fila con la última operación. Ahora van en su propia fila, y la ventana usa la hora sin segundos (`fmtClock`).
- **Prueba engañosa de la intro:** las capturas en serie en Chrome headless congelan el avance de la animación y parecía trabada. Se verificó con `document.getAnimations()` sin capturas y con una sola captura por corrida.
- **Detalles menores:** botón "Ver" de 36 px subido a 44 px; "1 swaps" pasa a "1 swap"; placeholder del buscador en Work Sans para que no se corte.

### Verificación
- `npm run lint` sin errores.
- `npx -y node@22 --test "src/lib/*.test.js"` → **26/26**.
- `npm run build` en verde; los mocks no entran al build.
- Harness fuera del repo (stub de Auth0 que simula 1,2 s de carga):
  - **Intro completa:** swim-in, después swim-out a los ~1,5 s, y la vista aparece a los ~2 s.
  - **Recarga:** versión corta. **Movimiento reducido:** solo fundido.
  - **Sin sesión:** se va al login.
- **Grilla:** ciclo actual 2×2 a 1440 px, 1 columna a 390 px; sin scroll horizontal, en claro y oscuro.
- **Diálogo:**
  - abre con foco dentro y bloquea el scroll;
  - Escape cierra y devuelve el foco a la tarjeta;
  - el velo cierra.
- **Navegación:**
  - el "Siguiente" de abajo deja `scrollY` en 0 y el foco en la grilla;
  - la página 5 funciona;
  - buscar `cycle-9999` muestra "No existe el ciclo cycle-9999." y `cycle-9400` abre su diálogo;
  - en el diálogo, → desde el último de la página 1 pasa a cycle-9423 ("10 de 43"), ← vuelve y otro ← avanza dentro de la página;
  - "Volver al ciclo actual" aparece en la página 2.
- **Detalle:**
  - la pestaña Swaps se mantiene al pasar a cycle-9431;
  - "Ver" abre Cierre con la fila marcada;
  - Home en las pestañas va a Resumen;
  - el ciclo E1 muestra Resumen, Cierre y Protocolo E1.
- **Regresión:** se repitieron las capturas de las 3 vistas, tema, foco, movimiento reducido y sidebar; todo igual que antes.
- **No verificado:**
  - con el login real de Auth0 (cuánto tarda en volver con `code` cambia cuánto se ve la aleta en reposo);
  - Safari y Firefox: animación del `<dialog>` y `::backdrop`;
  - lectores de pantalla reales: solo se revisaron roles y atributos.

### Pendiente
- Esteban: probarlo con su login. Push y PR cuando lo confirme.
- El listado de RF01 real tiene que respetar `page` y `limit` (9). El buscador usa el endpoint de detalle, que es el de E-API (pendiente en el backend).

---

## Cuarta vuelta (misma fecha): TiburonShark, aleta hacia la izquierda, paginador único y reloj (DF-034)

**Prompt literal:** en `prompt/tarea-fix-rediseno-studylicc/09-cuarta-vuelta.md`.

### Commits

| Pedido | Commit |
|---|---|
| DF-034, antes del código | `9dc6118` |
| 1. La app se llama TiburonShark (wordmark, intro, `<title>`) | `22a13ec` |
| 2. La aleta nada de derecha a izquierda, hacia donde apunta; la ola corre a la derecha | `a4141d3` |
| 3. Sin "Estado de la API" en la sidebar | `1bf189d` |
| 4. Un solo paginador fijo al pie; arriba solo "Página X de Y" | `8f08aa2` |
| 5. Reloj de actualización en vez del botón; sin "(RF01)" ni "se actualiza cada N s" | `94b4e56` |
| 6. El mismo paginador en duplicados y NACKs | `ff08dca` |

### Qué se construyó
- `src/components/ui/RefreshTimer.jsx`: círculo con reloj y un anillo que se descuenta con `stroke-dashoffset`, a saltos de 1 s.
  - "Actualizar" aparece al pasar el mouse o con foco, con los segundos que faltan.
  - Al apretarlo recarga y reinicia la cuenta.
  - Sin polling, el anillo queda lleno.
- `src/api/useApiQuery.js`: expone `updatedAt` e `interval`; una recarga manual reinicia el intervalo del poll, así el anillo y el poll no se desfasan.
- `src/components/ui/Pager.jsx`: el `CyclePager` pasó a ser genérico (`noun`) y va `sticky` al pie. Se borró `ui/Pagination.jsx`.
- `Sidebar.jsx` y `App.jsx` sin la tarjeta ni la lógica de `/health`.
- Textos fuera de la interfaz:
  - "Más reciente primero (RF01)";
  - "(RF05)";
  - "(DF-029)";
  - todos los "se actualiza/revisa cada N s".

### Hallazgo corregido
- Justo después de recargar, el reloj mostraba 31 s de 30: `useNow` todavía tenía la hora del tick anterior a `updatedAt`. Se acota al intervalo.

### Verificación
- `npm run lint` sin errores, **26/26** tests y build en verde.
- **Reloj:** a los 3 s muestra 28 s, a los 8 s muestra 23 s; al apretarlo se reinicia.
- **Paginador:**
  - el pie del paginador coincide con el borde de la ventana (900/900 px), siempre visible;
  - en NACKs, "Siguiente" deja `scrollY` en 0 y muestra "Página 2 de 4" arriba y abajo.
- **Intro:** la posición x de la aleta cada 100 ms baja de 475 a 380 al entrar y de 380 a 288 al salir, o sea, avanza hacia la izquierda.
- **Regresiones:** sidebar, navegación entre ciclos, búsqueda y ← → en el diálogo, igual que antes.
- **No verificado:** login real, Safari y Firefox.

---

## Quinta vuelta (misma fecha): login con movimiento (DF-035)

**Prompt literal:** en `prompt/tarea-fix-rediseno-studylicc/10-login-en-movimiento.md`.

**Decisión humana:** el agente ofreció cuatro fondos (mar de olas, burbujas, corrientes diagonales, cuadrícula que deriva) y Esteban eligió **mar de olas**.

### Commits

| Pedido | Commit |
|---|---|
| DF-035, antes del código | `34688a9` |
| El agua del logo corre sin parar con la aleta quieta (`WaterMark`; `SEA_WAVE` compartido con la intro) | `a431cb1` |
| Botón "Iniciar sesión" claro con un tramo verde que recorre el borde | `85f9c23` |
| Fondo de seis olas a distintas velocidades en vez de la cuadrícula (`SeaBackground`) | `253f002` |

### Hallazgos
- **El borde que giraba casi no se veía.** El primer intento era un cuadrado con `conic-gradient` girando detrás del botón; en un botón ancho, el tramo solo asomaba por momentos en una esquina (capturas pausando la animación a 0, 800, 1600 y 2400 ms).
  - Se cambió por un trazo SVG con `stroke-dashoffset`, que recorre el perímetro a velocidad constante. Se corrigió en el mismo commit del botón (`--amend`, sin push) y quedó tachado en DF-035.
- **Olas de fondo muy planas:** se subió su alto, que es la amplitud.

### Verificación
- `npm run lint` sin errores, **26/26** tests y build en verde.
- **Login en claro, oscuro y 390 px:** corren 7 `wave-run` (6 de fondo y 1 del logo) y 1 `border-run`; sin scroll horizontal ni errores.
- **Con "Reducir movimiento":** ninguna animación activa, y el borde del botón queda verde completo.
- **No verificado:** login real, Safari y Firefox (soporte de `width="calc(...)"` en el `rect` SVG).

---

## Sexta vuelta (misma fecha): olas más orgánicas y un tiburón ocasional (DF-036)

**Prompt literal:** en `prompt/tarea-fix-rediseno-studylicc/11-olas-y-tiburon.md`.

### Commits

| Pedido | Commit |
|---|---|
| DF-036, antes del código | `d6512ca` |
| Olas con crestas irregulares, vaivén vertical y línea de eco | `85efa8c` |
| Un tiburón cruza el fondo de vez en cuando | `f46ddbd` |

### Qué se construyó
- **`src/lib/waves.js` (`wavePath`), con 2 tests:** trazo de ola con crestas irregulares que se repite un número par de veces, así el bucle no salta.
- **`SeaBackground`:**
  - seis capas, cada una con su patrón, su avance horizontal y su vaivén vertical (`sea-bob`), más una línea de eco tenue;
  - el tiburón: la aleta del isotipo con opacidad 0,5 sobre la quinta ola, que cruza de derecha a izquierda (`shark-cruise`, 48 s con unos 15 s visibles; la primera pasada parte a los 3 s) y se mece.

### Hallazgos
- **Olas largas y planas** con un solo período por pantalla: se agregó `repeats` (4 a 8 según la capa) para tener más crestas.
- **Tiburón tapado por la tarjeta:** sobre la cuarta ola quedaba detrás de la tarjeta a mitad de camino; se pasó a la quinta, que va bajo la tarjeta.
- **La aleta flotaba sobre la línea:** se bajó 0,45 rem para que parezca salir del agua.

### Verificación
- `npm run lint` sin errores, **28/28** tests y build en verde.
- Posición del tiburón con la animación pausada:
  - al 1 %: x 1236, opacidad 0,16;
  - al 15 %: x 614, opacidad 0,5;
  - al 30 %: x -52, opacidad 0,16;
  - al 50 %: oculto.
  - Va de derecha a izquierda, en claro y en oscuro.
- Con "Reducir movimiento" el tiburón no se muestra y nada se anima.
- **No verificado:** cómo se siente el movimiento en vivo (las capturas son estáticas); Safari y Firefox.
