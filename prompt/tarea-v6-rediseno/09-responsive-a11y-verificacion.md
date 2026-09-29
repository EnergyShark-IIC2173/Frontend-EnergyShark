# V6R.9 — Pasada de responsive, accesibilidad y verificación final

## Objetivo
Cerrar el rediseño:
- revisar las 4 vistas a 360, 768, 1024 y 1440px;
- confirmar el foco visible y el contraste AA;
- eliminar los tokens legado sin uso;
- aplicar el cambio aprobado de `index.html`;
- verificar que no cambió la lógica y borrar el preview temporal.

## Contexto
- V2 a V5 están rediseñadas (V6R.5 a V6R.8).
- **Ajuste 6 del plan:** `lang="es"` y `<title>EnergyShark</title>` en `index.html`, documentado en DF-012.
- **Ajuste 11:** el preview no se commitea y se borra al terminar.

## Prompt utilizado
```
Sin prompt nuevo de Esteban: esta subtarea ejecuta el paso 10 del plan aprobado y la sección
"Verificación" del plan. Prompt maestro y aprobación literales en 01-decisiones-y-tokens.md.
```
Prompt de la subtarea generado a partir de eso:
```
grep de tokens legado (warm, caution) y de hex sueltos en components y App.jsx; eliminar los legado
si tienen 0 usos. index.html: lang="es" y <title>EnergyShark</title>. Ampliar el script de contraste
con los pares sobre surface-hover (hover de filas) y corregir lo que no pase. Sonda en iframe: body
sin desborde horizontal en las 4 vistas a 360/768/1024/1440; foco: :focus-visible y outline o ring en
todos los botones, inputs y select. Conteos globales de patrones de lógica HEAD vs ahora en App.jsx
y los 6 componentes, explicando cada diferencia. Borrar zz-*, quitar sus líneas de
.git/info/exclude, detener Vite y hacer el build final.
```

## Resultado esperado
- 0 usos de tokens legado y 0 hex sueltos.
- Todos los pares de texto ≥ 4,5:1.
- Body sin desborde horizontal en 16 combinaciones (4 vistas × 4 anchos).
- Foco visible en todo lo interactivo.
- Diferencias de lógica solo en lo aprobado.
- Preview eliminado.

## Resultado obtenido
- **Tokens legado:** `warm` y `caution` tenían 0 usos y se eliminaron de `@theme`. Hex sueltos en componentes y `App.jsx`: 0.
- **`index.html`:** `lang="es"` y `<title>EnergyShark</title>`.
- **Contraste:** se agregaron 10 pares. Uno falló:
  - la pill rosa sobre una fila en hover daba 4,28:1;
  - `pink-soft` y `danger` pasaron de `#ff6b98` a **`#ff80a8`**, con 4,88 sobre la pill en hover, 5,45 sobre la pill normal y 7,41 sobre `panel`;
  - se corrigió DF-008 (valor anterior tachado) y DF-012 (corrección con cifras).
  - `text-muted` sobre `surface-hover` (4,14) queda como excluido en el script, porque esa combinación no se usa: `tr` con hover solo va en el `tbody`, y el `thead` va sobre `surface`.
  - **Resultado final: todos los pares pasan.**
- **Desborde:** en las 16 combinaciones, `doc` es igual al viewport (`overflowBody=false`). Las tablas hacen scroll dentro de su card.
- **Foco:**
  - Los 7 botones del shell y de V4 tienen `:focus-visible` con `outline: solid 2px rgb(0, 194, 236)`.
  - Los 3 inputs y el select tienen `:focus-visible` con borde cian y anillo (`box-shadow`).
  - **Hallazgo:** en la nav, `transition-colors` también anima `outline-color` (Tailwind v4 la incluye). El contorno partía en blanco o gris y tardaba 150ms en llegar a cian. Con `--force-prefers-reduced-motion` ya era cian desde el inicio. La nav pasó a `transition-[background-color,color]`, y ahora es cian también sin movimiento reducido.
- **Limpieza:**
  - se borraron `zz-preview.html`, `zz-preview.jsx`, `zz-frame.html` y `zz-probe.html`;
  - se quitaron sus líneas de `.git/info/exclude` (quedan 0 líneas con `zz`);
  - se detuvo Vite: el puerto 5199 quedó libre.
- **Captura extra:** `v2-1024.png`, y `login-1440.png` rehecha con el rosa final.

## Archivos modificados
- `src/index.css` (sin `warm` ni `caution`; `pink-soft` y `danger` en `#ff80a8`)
- `src/components/ui/classes.js` (transición de la nav)
- `index.html`
- `docs/decisiones-frontend.md` (correcciones visibles en DF-008 y DF-012)

## Tests ejecutados
```
grep -rnE "(text|bg|border|from|to|ring|outline)-(warm|caution)\b" src
grep -rnE "#[0-9a-fA-F]{3,8}\b" src/components src/App.jsx
node <scratchpad>/contrast.mjs                      # 36 pares
Chrome --headless=new --dump-dom zz-probe.html?w={360,768,1024,1440}&view={Historial,Conectividad,Negociaciones,Errores}
Chrome --headless=new [--force-prefers-reduced-motion] --dump-dom zz-probe.html?w=1440&view=Negociaciones&focus=1
bash: conteos de 27 patrones en App.jsx + 6 componentes, HEAD vs ahora
git diff --stat HEAD -- src/api src/auth src/mocks src/main.jsx src/App.css vite.config.js package.json package-lock.json
grep -rnE "useState|useEffect|useAuth0|onClick|onChange|fetch" src/components/ui ; grep -rn "style={{" src
npm run lint ; npm run build
```

## Resultado de los tests
- Legado: 0 usos. Hex: 0. `style={{`: 0. Hooks o handlers en `ui/`: 0.
- Contraste: todos pasan, 36 pares (uno excluido y documentado).
- Desborde: 16/16 sin desborde.
- Foco: 11/11 elementos con `:focus-visible` y outline o anillo cian.
- Archivos de lógica (`api`, `auth`, `mocks`, `main.jsx`, `App.css`, `vite.config.js`, `package*`): sin cambios.
- Conteos globales `HEAD → ahora`: 23 de 27 iguales, entre ellos:
  - `onClick=` 7, `onChange=` 4, `onSubmit=` 1, `key=` 7;
  - `useState` 7, `useAuth0` 6, `setActiveView(` 4, `activeView === '` 8;
  - `required` 3, `min="` 2, `step="` 1, `type="` 4;
  - ternarios (` ? `) 9.

  Las 4 diferencias están explicadas:
  - `value=` 6 → 11: los 4 `value={formData…}` y 2 `<option value>` siguen iguales, y se suman 5 props `value` de `StatTile`, que no son atributos de formulario;
  - `id="` 1 → 4: sale `id="center"`, que solo usaba `App.css` (no importado), y entran los 4 `id` de V4 aprobados;
  - `htmlFor="` 0 → 4: aprobado;
  - `isAuthenticated` 7 → 6: la fusión aprobada del bloque autenticado.
- Lint: sin errores. Build final: OK (CSS 28,58 kB). El aviso de chunk JS > 500 kB ya estaba antes.

## Decisiones tomadas
- **`#ff80a8` y no un valor más claro:** es el primer tono que pasa AA en todos los fondos donde se usa, y sigue viéndose rosa.
- **Transición de la nav limitada a `background-color` y `color`:** el foco no debe animarse.

## Bloqueos
Ninguno.

## Observaciones
- **No verificado:**
  - el login real con Auth0 y la llamada real a `/health`, que requieren el tenant y el backend: el preview los simulaba;
  - Safari y Firefox;
  - lectores de pantalla reales: solo se revisaron `aria-hidden`, `aria-label`, `lang` y los pares label/control.
- **Limitación en móvil:** la nav no hace scroll hasta el ítem activo (requiere JS; ver V6R.7).
