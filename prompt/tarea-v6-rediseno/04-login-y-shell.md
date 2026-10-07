# V6R.4 — Login, pantalla de carga y app shell (`LoginButton`, `LogoutButton`, `App.jsx`)

## Objetivo
Llevar el login y el dashboard autenticado al diseño de la imagen de referencia (DF-011):
- login a pantalla completa con card central;
- topbar, sidebar con la card "Estado de la API" y área principal;
- responsive sin estado nuevo.

## Contexto
- Componentes UI disponibles desde V6R.3.
- **Decisión humana (ajuste 3 del plan):** mover `healthStatus` y `error` a la card "Estado de la API", dentro de la rama autenticada, copiando las condiciones literales.
- **Ajustes 10 y 11 del plan:**
  - en móvil, la card de API va al final del contenido;
  - el preview usa un `getAccessTokenSilently` simulado y no se commitea.
- **Tras el paso 0:**
  - sidebar en `panel` con `border-r`;
  - topbar en `bg`;
  - ningún texto sobre el degradado.

## Prompt utilizado
```
Sin prompt nuevo de Esteban: esta subtarea ejecuta los pasos 4 y 5 del plan aprobado. El prompt
maestro, la aprobación del plan con sus ajustes y la respuesta al paso 0 están literales en
01-decisiones-y-tokens.md.
```
Prompt de la subtarea generado a partir de eso:
```
LoginButton/LogoutButton: solo className (btnPrimary w-full / btnSecondary + ícono logout).
App.jsx: dejar idéntico el bloque de lógica (desde function App() hasta antes de if (isLoading)).
isLoading -> AuthScreen con logo y "Cargando Auth0..." (misma condición y texto).
return !isAuthenticated ? login : shell, fusionando el bloque isAuthenticated && (...) en la rama
autenticada. Shell en grid: header (col-span-2), nav (fila 2, col 1), main (col 2, row-span-2),
aside API (fila 3, col 1); en móvil el orden del DOM es nav -> main -> aside. Los 4 <button> quedan
en App.jsx con el mismo onClick y la misma comparación; solo cambian navItemActive/navItemInactive y
se agrega un <Icon>. {healthStatus && ...} y {error && ...} copiados literales en la card de API.
Verificar: lógica idéntica con diff, conteos de patrones HEAD vs ahora, lint, build, capturas con
un preview temporal (Auth0Context simulado, fetch de /health simulado sin red) a 1440, 768 y 360.
ALTO: mostrar capturas a Esteban.
```

## Resultado esperado
- Bloque de lógica de `App.jsx` idéntico a `HEAD`.
- Todos los textos visibles se mantienen.
- Lint y build OK.
- Capturas del login, la carga y el shell (con OK y con Error) a 1440, 768 y 360px.

## Resultado obtenido
- **`LoginButton.jsx` / `LogoutButton.jsx`:** cambia solo `className`, más un `<Icon name="logout">` decorativo en el botón de salir. `onClick`, `logoutParams` y los `return null` quedan iguales.
- **`AuthScreen.jsx` (nuevo, presentacional):** tiene el fondo con el degradado del marco, la card `panel`, y `LogoMark`, el tiburón en blanco (`brightness-0 invert`) dentro del círculo rosa→magenta.
- **`App.jsx`:**
  - Carga y login usan `AuthScreen`. El subtítulo nuevo es "Panel de operación energética de la ciudad".
  - Shell:
    - topbar con logo, `h1` "EnergyShark", "Sesión iniciada como" en label y el email con `truncate`, más `LogoutButton`;
    - nav con el label "Secciones" y 4 ítems con ícono;
    - `main` con `max-w-6xl`;
    - card "Estado de la API" con el botón y el OK/Error en `font-mono text-xs break-all`.
- **Intentos corregidos durante la subtarea:**
  1. **Móvil:** el grid sin filas definidas estiraba la topbar y la nav. Se corrigió con `grid-rows-[auto_auto_1fr_auto]` y `grid-cols-[minmax(0,1fr)]`.
  2. **Captura de 1440px:** marcaba 2 ítems activos. Era la transición a mitad de camino en la captura headless: con `--force-prefers-reduced-motion` (que además prueba `motion-reduce:`) aparece un solo ítem activo.
  3. **Chrome headless no baja de 500px de ancho.** La primera "captura de 360px" era un layout de 500px recortado, y la sonda lo confirmó (`viewport=500`). Se rehízo con el preview dentro de un iframe de 360px.
  4. **Logo:** el tiburón se veía chico. Pasó de `w-16`/`w-6` a `w-20`/`w-8`.
  5. **OK/Error de /health:** pasan a `font-mono text-xs` para leer mejor el JSON.
- **Capturas finales** (en el scratchpad de la sesión, no versionadas):
  - `login-1440`, `m360-login`, `m360-loading`;
  - `shell-1440-ok`, `shell-1440-err-rm`, `shell-768`, `m360-shell`.
- **Visto en las capturas:**
  - a 360px nada se sale del viewport; la nav hace scroll horizontal dentro de su fila;
  - la card de API queda al final del contenido;
  - el email se trunca, pero sigue visible.

## Archivos modificados
- `src/App.jsx`
- `src/components/LoginButton.jsx`, `src/components/LogoutButton.jsx`
- `src/components/ui/AuthScreen.jsx` (nuevo)
- `src/components/ui/Icon.jsx` (ícono `logout`)
- `src/components/ui/classes.js` (`whitespace-nowrap` en los ítems de nav)
- Temporales, no versionados: `zz-preview.html`, `zz-preview.jsx` y `zz-frame.html`, en la raíz. Se borran al terminar V6R.9.

## Tests ejecutados
```
npm run lint
npm run build
diff <(git show HEAD:src/App.jsx | sed -n '/^function App()/,/if (isLoading)/p' | sed '$d') \
     <(sed -n '/^function App()/,/if (isLoading)/p' src/App.jsx | sed '$d')
for p in 'onClick=' 'setActiveView(' "activeView === '" 'checkHealth' 'useState' 'useAuth0' ...; do
  git show HEAD:src/App.jsx | grep -cF -- "$p"; grep -cF -- "$p" src/App.jsx; done
git diff --stat HEAD -- src/api src/auth src/mocks src/main.jsx .env*
Chrome --headless=new --force-prefers-reduced-motion --window-size=... --screenshot=... zz-preview.html?auth=in|out|loading&view=...&health=ok|error
Chrome --headless=new --dump-dom zz-preview.html?auth=in&probe=1   # elementos que se salen del viewport
```

## Resultado de los tests
- Lint: sin errores. Build: OK.
- Bloque de lógica: **IDÉNTICO**.
- Conteos `HEAD → ahora`: iguales en `onClick=` 5, `setActiveView(` 4, `activeView === '` 8, `checkHealth` 2, `useState` 4, `useAuth0` 2, `healthStatus &&` 1, `error &&` 1, y en los 8 textos visibles. Dos diferencias esperadas:
  - `isAuthenticated`: 3 → 2. Es el `{isAuthenticated && (...)}` fusionado con la rama autenticada, aprobado.
  - `alt="Silueta de tiburón"`: 1 → 3. El `<img>` aparece en carga, login y topbar, pantallas que nunca se muestran juntas.
- `src/api`, `src/auth`, `src/mocks`, `main.jsx` y `.env`: sin cambios.
- Sonda a 500px: solo los botones de la nav quedan fuera del viewport, porque scrollean dentro de su fila.

## Decisiones tomadas
- **Una sola `h1`** en cada pantalla: "EnergyShark" en el login y en la topbar. Las vistas usan `h2`.
- **`{' '}` entre "Sesión iniciada como" y el email:** están en dos `span` block, pero el texto se sigue leyendo como una frase para lectores de pantalla y al copiar.
- **Punto pulsante decorativo en "Cargando Auth0..."** (`animate-pulse`, `aria-hidden`, `motion-reduce:animate-none`): es solo CSS, sin estado.
- **Sin divisores entre los ítems de la nav:** se usa separación (`gap-1`), porque un divisor corta el hover redondeado de cada ítem.

## Bloqueos
Ninguno.

## Observaciones
- **ALTO del plan:** se muestran las capturas a Esteban antes de seguir con V2–V5.
- ~~A 360px, "Cerrar sesión" se parte en dos líneas por falta de espacio en la topbar. No se forzó `whitespace-nowrap` en `btnSecondary`, porque desbordaría el botón de /health en el sidebar de 16rem.~~

  **Corrección (misma fecha), pedida por Esteban después del ALTO:**
  ```
  1. "Cerrar sesión": agrega whitespace-nowrap solo en el className de LogoutButton, no en
     btnSecondary, para que no afecte al botón de /health. El email de la topbar es el que
     cede espacio con truncate (sin ocultarlo). Rehace m360-shell.png para confirmarlo.
  2. zz-preview: confirma que zz-preview.html y su entrada no aparecen en git status como
     archivos a commitear, y que npm run build no los incluye en dist/. Se borran al final,
     como está en el plan.
  ```
  - **`LogoutButton`:** pasó a `className={`${btnSecondary} whitespace-nowrap`}`, sin tocar `btnSecondary`.
  - **Medición con una sonda dentro de un iframe de 360px:**
    - `doc=360`, sin desborde;
    - botón de 42px de alto (una línea), terminando en x=344;
    - email con 163px visibles de 196, truncado con elipsis y con el texto completo en el DOM.
  - **Captura `m360-shell.png` rehecha.** El label "Sesión iniciada como" ahora se parte en dos líneas, porque es el texto que cede espacio junto al email. No se truncó, para no ocultar texto.
  - **Archivos del preview:**
    - aparecían como `??` en `git status`;
    - se agregaron a `.git/info/exclude` (local de este clon, no versionado, sin tocar `.gitignore`);
    - `git status` ya no los lista y `git add --dry-run .` no los incluye.
  - **`npm run build`:** `dist/` solo contiene `index.html`, `favicon.svg`, `icons.svg`, `tiburon-*.png`, `index-*.js` e `index-*.css`. El `grep` de `zz-preview`, `preview-token` y `operador.demo` en `dist/` no encuentra nada.
- Las vistas V2–V5 todavía tienen sus clases del 1:1 sobre los tokens nuevos. Por ejemplo, "Habilitado" y "confirmed" se ven naranjas porque `warm` ahora es naranja. Se rediseñan en los pasos 6 a 9.

**Validación de Esteban tras el ALTO (literal):**
```
Validado, con un ajuste en la topbar:

El bloque de sesión va en dos líneas a propósito, en todos los tamaños: arriba
"Sesión iniciada como" en text-xs uppercase tracking-widest text-muted, y abajo el
email en text-sm text-h con truncate. El texto no cambia, solo su disposición.
Rehace m360-shell.png y shell-1440-ok.png para confirmarlo.

Después sigue con V2 (CycleHistory).
```
- **Cambio:** el `<p>` de sesión pasó de `min-w-0` con dos `span` block a `grid`.
  - El label (`labelBase` + `whitespace-nowrap`) fija el ancho mínimo del bloque.
  - El email (`truncate`, con `overflow: hidden`) tiene un mínimo automático de 0 en el grid, así que es el único que cede espacio.
  - El texto no cambió.
- **Medición** (sonda en un iframe, a 360 y 1440px, con el email de ejemplo y con uno de 401px):
  - el label siempre queda en 1 línea (16px);
  - `doc` igual al viewport y sin superposición con el botón;
  - email: 168px visibles a 360px (truncado), completo a 1440px.
- Capturas `m360-shell.png` y `shell-1440-ok.png` rehechas.
