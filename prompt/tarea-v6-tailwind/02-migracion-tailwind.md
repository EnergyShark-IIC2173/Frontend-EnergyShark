# V6.2 — Migración de estilos inline a Tailwind CSS v4

## Objetivo
- Instalar la última versión de Tailwind.
- Reemplazar todos los estilos inline de los componentes por clases Tailwind, sin cambiar nada visual ni lógico.

## Contexto
- Todo el estilo estaba en objetos `style={{}}` que leían variables de `src/index.css`.
- `src/App.css` venía del template de Vite; de ahí solo se usaba `#center`.
- Última versión en npm: `tailwindcss` 4.3.3.
- Skill de diseño disponible (V6.1), pero Esteban pidió no cambiar lo visual.

## Prompt utilizado
```
Necesito ahora que instales la ultima version de tailwind al proyecto, y que modifiques el front (solamente por su version de tailwind, no modifiques nada mas que lo visual, absolutamente nada de la logica), ve reemplazando el diseño actual de la pagina, por su version de tailwind en las clases creadas en cada componente
```
Respuesta de Esteban a la pregunta del agente, literal:
```
"¿La versión Tailwind debe verse igual que hoy, o aplico también las reglas de la skill de diseño?"="Igual que hoy (Recommended)"
```
(opciones: Igual que hoy / Aplicar la skill: verde para "Habilitado", tabular-nums, focus ring cian, hover en filas)

Esteban rechazó el primer plan con este comentario, literal:
```
Perfecto el plan, con unas consideraciones a tener en cuenta:

<img>: el preflight lo pone en display: block y max-width: 100% por defecto. Si App.jsx tiene un logo o imagen que hoy depende de comportarse inline o de un ancho fijo por CSS heredado, puede desalinearse.
<table>: el preflight fuerza border-collapse: collapse; border-spacing: 0. El plan describe filas con border-b, lo cual normalmente es compatible, pero vale la pena que quede explícitamente en la lista de verificación de DistanceTable/NegotiationAdmin/RejectedMessages, no dado por sentado.
<p>: el preflight resetea sus márgenes a cero. El plan cubre h1-h4, ul y hr, pero no menciona <p> — si algún componente usa <p> para texto de estado o de ayuda (por ejemplo el mensaje OK/Error que sí menciona para App.jsx), confirma que ese caso puntual no pierda espaciado.
```
Prompt de la subtarea generado a partir de eso (plan aprobado, resumido a sus instrucciones):
```
1. npm install tailwindcss @tailwindcss/vite; agregar tailwindcss() a plugins en vite.config.js.
2. src/index.css: @import "tailwindcss"; @theme con los mismos valores (bg, surface, surface-hover,
   border, text, text-h, accent, warm = ex --success, danger = #ff6b6b, caution = #ffc107,
   shadow-card, font-sans, font-mono); @layer base para :root y #root.
3. Borrar src/App.css y su import (solo #center se usaba).
4. En cada componente, cada style={{}} pasa a className; los condicionales mantienen la misma
   condición en un template string. Compensar el preflight: h1-h4, ul, hr, th y botón base.
   img: flex item con ancho fijo -> sin cambio. table: border-collapse explícito. p: index.css ya
   tenía margin 0; los que tienen espaciado inline se traducen tal cual.
5. No tocar main.jsx, auth/, api/ ni mocks/.
Verificar: grep "style={{" = 0; diff sin líneas de lógica; lint y build; tablas, logo y
espaciado de <p> revisados; comparar con main.
```

## Resultado esperado
- 0 `style={{` en `src`.
- Lint y build OK.
- La página se ve igual que en `main`.

## Resultado obtenido
- **Instalación:** `tailwindcss` y `@tailwindcss/vite` 4.3.3. Plugin registrado. Los 7 componentes quedaron migrados.
- **Hallazgo durante la implementación:** `:root` usa 18px, así que `1rem = 18px`. Se fijó `--spacing: 4px`, los radios en px y los tamaños de texto en px arbitrarios (DF-004).
- **Comparación visual:** `main` levantado en un worktree temporal y capturas de Chrome headless de las dos versiones. Aparecieron 4 diferencias, que se corrigieron (DF-005):
  1. Botón de login 8px más alto → `leading-[normal] tracking-normal`.
  2. `hr` de 1px en vez de 2px → `border [border-style:inset]`.
  3. Inputs 1px más altos. Un primer intento con `font-[system-ui]` no bastó; midiendo estilos computados apareció que el original usa Arial 13,3333px y `content-box` → `font-[Arial] text-[13.3333px] ... box-content`.
  4. `h1` a exactamente 1024px → `max-[1025px]` en vez de `max-lg`.
- **Resultado final:**
  - login idéntico byte a byte a 900, 1024, 1025 y 1280px;
  - Historial, Conectividad y NACKs idénticos;
  - Negociaciones: layout y estilos computados idénticos, con 20 píxeles del badge "expired" distintos en 2/255 (`oklab` vs `rgba`).
- **Consideraciones de Esteban:**
  - `img`: es un flex item de 160×150 y quedó centrado igual.
  - `table`: `border-collapse` explícito; las filas se ven con un borde de 1px y sin doble línea.
  - `p`: `mt-4` en OK/Error y "Sesión iniciada como"; los `<p>` de CycleHistory siguen sin margen.

## Archivos modificados
- `package.json`, `package-lock.json`, `vite.config.js`
- `src/index.css`
- `src/App.jsx`, `src/App.css` (eliminado; restaurado en V6.3)
- `src/components/CycleHistory.jsx`, `DistanceTable.jsx`, `NegotiationAdmin.jsx`, `RejectedMessages.jsx`, `LoginButton.jsx`, `LogoutButton.jsx`

## Tests ejecutados
```
grep -rn "style={{" src ; grep -rn "var(--" src/components src/App.jsx
npm run lint
npm run build
# capturas: Chrome --headless=new --screenshot sobre localhost:5199 (rama) y :5198 (main en worktree),
# cmp byte a byte; estilos computados con getComputedStyle volcados vía --dump-dom
```

## Resultado de los tests
- `grep`: 0 y 0.
- Lint: sin errores.
- Build: OK. El aviso de chunk JS > 500 kB no depende de este cambio.
- Capturas: 4 de 5 escenarios idénticos; Negociaciones con 20 px en 2/255.

## Decisiones tomadas
- `--spacing: 4px` y radios en px, en vez de bajar `:root` a 16px, que cambiaba el tamaño del texto (DF-004).
- Tamaños de texto arbitrarios en px, porque no fijan line-height y se hereda el 26,1px original.
- En `App.jsx`, tres constantes de clases (`buttonBase`, `tabActive`, `tabInactive`) para no repetir la clase de botón 4 veces. Es la única adición en JS.
- Las tabs no llevan `hover:`, porque en el original el `style` inline anulaba el hover global.
- `bg-white/10` se mantiene, aunque difiera en 2/255, en vez de un `rgba` arbitrario.

## Bloqueos
Ninguno.

## Observaciones
- **No verificado:** la vista autenticada (tabs y barra de sesión, requieren login en Auth0), el hover y `active:scale` de los botones, y Safari/Firefox.
- La página de preview (`zz-preview.html`), el worktree temporal y los servidores de Vite se eliminaron al terminar.
