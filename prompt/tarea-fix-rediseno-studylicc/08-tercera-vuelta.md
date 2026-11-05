# Fix.8 — Tercera vuelta: intro del tiburón, grilla con diálogo, navegación entre ciclos y detalle por pestañas (DF-033)

## Objetivo
Hacer la entrada más divertida y que con 72 ciclos al día sea fácil navegar entre ellos. El ciclo actual se debe distinguir del resto y el detalle se debe poder leer bien.

## Contexto
Lo que había antes de esta vuelta (DF-032):
- un listado en una sola columna;
- un detalle en línea, con un solo ciclo abierto;
- el paginador solo al fondo y sin volver arriba;
- "Cargando Auth0..." mientras cargaba la sesión.

Los mocks tenían 3 ciclos, que no alcanzaban para ver la paginación.

## Prompt utilizado
```
Quiero cambiar algunas cosas, 

1. cuando se inicie sesion, en vez de que diga cargando oauth una vez la sesion haya iniciado, que haga una animacion divertida el logo del tiburon, puede ser que nade o haga algun barrido divertido antes de entrar a la vista principal

2. Quiero que la paginacion sea mas facil de navegar, es demasiado dificil en este momento, hay que bajar hasta el fondo y apretar siguiente, y se carga la pagina siguiente, pero sigue estando abajo, en vez de ir hacia arriba, creo que sería mejor cambiar eso, para cuando se aprete siguiente, vuelva a subir hasta la primera.
Como hay tantas ciclos, debe ser mas facil navegar entre ciclos, entonces diseña un sistema de navegacion mas optimo para este sistema

3. No me gusta que se vean 1 grilla solamente hacia abajo, prefiero un sistema de visualizacion distintivo, quiero una grilla donde la primera use la mitad del ancho, y hayan otras mas pequeñas a los lados (que no sean la actual)
a lo que voy quiero diferenciar la actual, de las demas, y quiero que no sea scrolleable tan fome de ver una ancha, quiero que sean mejor como tarjetas, que se puedan abrir (usando alguna animacion), y que ahi se despliegue mejor a la vista la info completa del ciclo

4. Rediseña la vista dentro del ciclo, actualmente es muy dificil la accesiibilidad para leer toda la info, diseña un sistema para que sea mejor la lectura de datos del ciclo

Vuelve a hacer un commit por cada una nuevamente
```
Prompt de la subtarea (generado por el agente durante la sesión):
```
DF-033 primero. Después:

(1) SharkIntro en lugar de "Cargando Auth0":
- fases enter/idle/out/fade;
- la aleta del isotipo nada sobre una ola que corre y el wordmark aparece con clip-path;
- completa una vez por pestaña (sessionStorage) o al volver con `code`; corta en recargas;
- sin nado con reduce y con un respaldo con timeout;
- la vista se monta al empezar el fundido.

(3) Grilla de 9 por página:
- en la página 1, el ciclo actual en 2×2 con avance, cuenta regresiva y contadores grandes;
- tarjetas chicas como botones;
- detalle en un <dialog> que crece desde la tarjeta con WAAPI y vuelve al cerrar;
- 40 ciclos históricos en los mocks.

(2) CyclePager arriba y abajo, con números y elipsis:
- al cambiar de página, scroll al inicio y foco en la grilla;
- búsqueda por ID con GET /api/cycles/{id};
- "Volver al ciclo actual";
- anterior/siguiente en el diálogo con botones y ← →, cruzando de página.

(4) CycleDetail por pestañas:
- cifras clave fijas y la última operación con "Ver" que abre su pestaña;
- Resumen (línea de tiempo, precios, financiamiento), Mercado, Swaps, Cierre y E1;
- tablas con unidades en el encabezado y cifras a la derecha;
- la pestaña se guarda en el diálogo.

Verificar cada paso en el harness.
```

## Resultado esperado
Un commit por pedido, sin coautor, y cada comportamiento comprobado en el harness con cifras.

## Resultado obtenido
- Commits:
  - docs: `ba63560`
  - (1) `db4711f`
  - (3) `ba2c9f3`
  - (2) `b841dd2`
  - (4) `6982a26`
- El 3 va antes que el 2: la navegación abre el diálogo que crea el 3.
- Correcciones durante la sesión, detalladas en el AI log:
  - animación pisada por StrictMode;
  - foco perdido al cruzar de página;
  - alto fijo del panel;
  - créditos cortados;
  - botón "Ver" a 44 px.

## Archivos modificados
- `docs/decisiones-frontend.md`
- `src/App.jsx`, `src/index.css`
- `src/components/CycleHistory.jsx`
- `src/components/cycles/`: `CycleCards.jsx`, `CycleDialog.jsx`, `CycleDetail.jsx`, `CyclePager.jsx`, `CycleSearch.jsx`, `DataViews.jsx`, `parts.jsx`
- `src/components/ui/`: `SharkIntro.jsx`, `Tabs.jsx`, `Icon.jsx`, `Card.jsx`
- `src/hooks/useNow.js`
- `src/lib/`: `cycles.js`, `format.js`, `pagination.js` (con sus tests)
- `src/mocks/cycles.js`

## Tests ejecutados
- `npm run lint`
- `npx -y node@22 --test "src/lib/*.test.js"`
- `npm run build`
- Harness: `intro.mjs`, `dbg2.mjs`, `frame.mjs`, `grid.mjs`, `flip.mjs`, `nav.mjs`, `nav2.mjs`, `detail.mjs`, `e1.mjs`, `shoot.mjs`, `behave.mjs`, `shell.mjs`

## Resultado de los tests
- 26/26.
- Lint y build en verde.
- Comportamientos según DF-033 (cifras en el AI log).

## Decisiones tomadas
- Diálogo modal y no una página aparte: no hay que meter el router en las vistas y la grilla queda de fondo.
- 9 por página: cuadra exacto la página 1 (4 celdas + 8) y deja las demás en 3 × 3.
- La búsqueda usa el ID tal como se escribe: no se asume el formato de los IDs reales.
- ← va al ciclo más reciente y → al más antiguo, igual que el orden de la grilla.
- El detalle vuelve a pedirse al abrir (DF-024); el ciclo en curso se repite cada 30 s.

## Bloqueos
Ninguno. El buscador depende del endpoint de detalle real (E-API, pendiente en el backend).

## Observaciones
- Las capturas en serie en Chrome headless congelan las animaciones: para verificar animaciones, medir con `getAnimations()` o hacer una captura por corrida.
