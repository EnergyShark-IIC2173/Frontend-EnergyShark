# S14.2 — Reloj del ciclo en la sidebar (DF-044)

## Objetivo
Un reloj siempre visible en la sidebar que cuente hasta el próximo hito del ciclo, y sacar el anillo de refresco de
cada vista.

## Contexto
- Desde DF-034 cada vista tenía un anillo que descontaba hasta su próximo poll: siete relojes distintos y ninguno
  con el tiempo del ciclo.
- `nextMilestone` y `cycleProgress` (DF-033) ya calculaban el próximo instante y el avance desde el `status-statement`.

## Prompt utilizado
```
Dentro del commit que hagas en frontend, quiero hacer un pequeño cambio de diseño, y es que quiero que el reloj salga siempre pero en la sidebar, y que cuente hasta el siguiente ciclo, o el tiempo en general mas importante de la aplicacion

Luego de eso, reviso, y ahi haces push y abres ambas PRs
```
Respuesta literal de Esteban a "¿Qué pasa con el reloj de refresco que hoy tiene cada vista?":
```
Se va; solo el de la sidebar (Recommended)
```
Prompt de la subtarea generado a partir de eso:
```
DF-044 antes del código. cycleClock(cycle, now) y fmtMmSs puros en src/lib/cycles.js con tests (counting /
waiting / no-market / empty). useCycleClock en src/hooks (GET /api/cycles?limit=1 cada 30 s, tick de 1 s).
CycleClock presentacional con variantes full (sidebar abierta), rail (plegada) y compact (barra del celular);
tono de advertencia con ícono en el último minuto; role="timer" sin aria-live. RefreshTimer pasa a botón de ícono
"Actualizar" con la misma interfaz. Verificar con lint, tests, build y capturas de las tres variantes.
```

## Resultado esperado
El reloj se ve en todas las vistas y tamaños; pasado `validUntil` dice "Esperando el próximo ciclo" sin inventar la
apertura del siguiente; las vistas siguen actualizándose solas.

## Resultado obtenido
- `54429b9` DF-044; `74edc04` lógica, hook, componente, sidebar y botón.
- Lint marcó que `CycleClock.jsx` exportaba un hook junto al componente (fast refresh): el hook pasó a
  `src/hooks/useCycleClock.js`.
- Capturas: sidebar abierta (claro), riel (oscuro) y barra del celular (375 px en iframe).

## Archivos modificados
- `docs/decisiones-frontend.md`
- `src/lib/cycles.js`, `src/lib/cycles.test.js`, `src/hooks/useCycleClock.js`
- `src/components/CycleClock.jsx`, `src/components/Sidebar.jsx`, `src/components/ui/RefreshTimer.jsx`

## Tests ejecutados
```
npx eslint src
node --test src/lib/*.test.js
npx vite build
```

## Resultado de los tests
eslint sin errores; 55/55 (2 nuevos); build OK.

## Decisiones tomadas
- Contar hasta el próximo instante del `status-statement` — es el único reloj de verdad (DF-027).
- Sin `aria-live` — un contador por segundo inunda el lector de pantalla; el texto va en `aria-label`.
- `RefreshTimer` conserva su interfaz — ninguna vista cambia su código.

## Bloqueos
Ninguno.

## Observaciones
- Con mocks, el reloj (mock de ciclos) y la cuenta de Mercado (mock del libro) usan relojes distintos; con el
  backend real salen del mismo `status-statement`.
- El cambio va dentro de la rama de S14 por pedido de Esteban.
