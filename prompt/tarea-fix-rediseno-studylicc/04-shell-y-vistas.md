# Fix.4 — Shell y vistas con la estética nueva

## Objetivo
Aplicar el kit al shell y a las 3 vistas cambiando solo clases y textos, sin tocar la lógica.

## Contexto
`App.jsx`, `CycleHistory.jsx`, `DistanceTable.jsx` y `RejectedMessages.jsx` usaban clases V6 sueltas (`text-text-h`, `bg-bg`, `text-pink-soft`, `${focusRing}`…).

## Prompt utilizado
```
(Plan aprobado por Esteban; mismo prompt de 01.)
```
Prompt de la subtarea (extracto literal del plan aprobado):
```
App.jsx: header con Logo, ThemeSwitch, email y logout; sidebar bg-paper dark:bg-ink; <main> con dot-grid; tarjeta
"Estado de la API" con los tokens nuevos; login con Logo y 1 .marker ("operación energética"). Vistas: reemplazo
mecánico de clases; h4 con sectionTitle; ids en font-mono; 1 .marker por título de vista; el detalle del ciclo
entra con motion-safe:animate-section-in y el chevron rota con transform.
```

## Resultado esperado
Ninguna clase V6 en `src/` y la lógica de las vistas sin cambios.

## Resultado obtenido
- El reemplazo se hizo con un script que falla si un reemplazo esperado no aparece. Quedaron 3 colores de punto
  revisados a mano:
  - negociaciones E1: `lavender`;
  - compra en un swap: `lavender` (comprar no es un error);
  - oferta: `accent` (no es una advertencia).
- Commit `2ec7097`.

## Archivos modificados
- `src/App.jsx`, `src/components/CycleHistory.jsx`, `src/components/DistanceTable.jsx`, `src/components/RejectedMessages.jsx`

## Tests ejecutados
`npm run lint`, `npm run build` y `grep` de clases V6 en `src/`.

## Resultado de los tests
Lint y build en verde, sin clases V6.

## Decisiones tomadas
- El email del header se oculta bajo `sm`: en 375 px no cabía junto al switch y al botón. En el celular no se muestra (desde `sm` sí).
- El StatTile "Costo de generación" usa el tono `neutral`: un costo no es una advertencia.
- "Última operación" usa el badge `settled` (sólido): sobre el fondo destacado tiene mejor contraste.

## Bloqueos
Ninguno.

## Observaciones
Este commit toca casi todas las líneas de clases de las vistas. Las ramas de S12 a S14 deberían partir después del merge.
