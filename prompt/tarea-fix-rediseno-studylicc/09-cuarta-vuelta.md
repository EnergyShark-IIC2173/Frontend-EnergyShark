# Fix.9 — Cuarta vuelta: TiburonShark, aleta hacia la izquierda, sin estado de la API, paginador único y reloj (DF-034)

## Objetivo
Corregir el nombre, la dirección del tiburón y la navegación, y reemplazar los textos de intervalo por un reloj de actualización.

## Contexto
Lo que había antes de esta vuelta (DF-033):
- dos paginadores, uno arriba y otro abajo;
- un botón "Actualizar" y subtítulos con requisitos ("RF01") e intervalos;
- la tarjeta de `/health` en la sidebar;
- la aleta nadando hacia la derecha.

## Prompt utilizado
```
Cosas a corregir:

1. Nuestra App se llama TiburonShark
2. LA animacion del tiburon esta al reves, debe ir de derecha a izqueirda el tiburon, porque asi se ve como si estuviera avanzando (actualmente es como si se moviera al reves)
3. Quita el estado de la Api de la Siderbar
4. Actualmente hay 2 secciones de avanzar y retroceder, prefiero que haya solamente una abajo, y que sea visible por el usuario, actualmente esta un poco oculta porque con la barra de busqueda quedo muy abajo, para eso quizas quita la de arriba, y solo que diga en la orilla, la pagina actual
5. Quiero que quites lo de "Mas reciente primero RF01" no aporta nada, y los de se actualiza cada 30 segundos, quiero que mejor pongas un cirulito con un icono de reloj al medio, que vaya descontandose, hasta llegar a 0 y que venga la proxima actualizacion. El boton de actualizar este al hacer hover al boton del reloj, no que aparezca siempre como boton de actualizar
6. Aplica el mismo sistema de paginacion para la vista de registro de duplicados y nacks, recuerda sacar de todas partes lo que diga RNF y el tiempo en que se va a actualizar, eso va a estar en el reloj
```
Prompt de la subtarea (generado por el agente durante la sesión):
```
DF-034 primero y después un commit por pedido:
(1) TiburonShark en el wordmark, la intro y el <title>;
(2) swim-in desde la derecha y swim-out a la izquierda, con la ola al revés;
(3) quitar la tarjeta de /health de la sidebar y su lógica de App;
(4) Pager genérico sticky al pie, sin el de arriba, y "Página X de Y" en la orilla;
(5) RefreshTimer con un anillo que se descuenta según updatedAt e interval de useApiQuery (la recarga manual
    reinicia el intervalo), "Actualizar" en hover y foco, y sacar los textos de RF, DF e intervalos de la interfaz;
(6) Pager en RejectedMessages con vuelta arriba.
Verificar en el harness.
```

## Resultado esperado
Un commit por pedido, sin coautor, verificado en el harness.

## Resultado obtenido
Commits en el AI log (sección "Cuarta vuelta"). Se corrigió el desfase de 31 s del reloj.

## Archivos modificados
- `docs/decisiones-frontend.md`
- `index.html`, `src/index.css`, `src/App.jsx`
- `src/api/useApiQuery.js`
- `src/components/Sidebar.jsx`, `CycleHistory.jsx`, `DistanceTable.jsx`, `RejectedMessages.jsx`
- `src/components/ui/`: `Logo.jsx`, `SharkIntro.jsx`, `Pager.jsx` (antes `cycles/CyclePager.jsx`), `RefreshTimer.jsx` (nuevo), `ViewHeader.jsx`, `Icon.jsx`
- `src/components/ui/Pagination.jsx` (borrado)

## Tests ejecutados
- `npm run lint`
- `npx -y node@22 --test "src/lib/*.test.js"`
- `npm run build`
- Harness: `timer.mjs`, `nacks.mjs`, `frame.mjs`, medición de la aleta, `shell.mjs`, `nav.mjs`

## Resultado de los tests
- 26/26.
- Lint y build en verde.
- Comportamientos según DF-034.

## Decisiones tomadas
- El nombre cambia solo en la interfaz: no se renombran repos, claves de `localStorage` ni archivos.
- `getHealth` queda en `endpoints.js` por si se usa en otra parte.
- "Volver al ciclo actual" y el buscador se mantienen arriba: no son paginación.
- La fecha de la distance-table se mantiene en el subtítulo de Conectividad: es un dato, no un intervalo.

## Bloqueos
Ninguno.

## Observaciones
Las claves de almacenamiento siguen con el prefijo `energyshark-`, para no perder el tema ni la sidebar guardados.
