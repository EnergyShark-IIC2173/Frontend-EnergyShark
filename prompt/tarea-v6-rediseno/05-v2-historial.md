# V6R.5 — V2 Historial de Ciclos (`CycleHistory.jsx`)

## Objetivo
Rediseñar la vista V2 (RF01) con los componentes UI:
- una card por ciclo;
- Status Statement y Balances Finales como stat tiles;
- Operaciones como lista con un punto de color por tipo.

Todos los datos siguen visibles.

## Contexto
- Shell validado por Esteban después del ALTO (V6R.4).
- **Ajuste 8 del plan:** Presupuesto en tono cian; el naranja queda reservado para "duplicate".
- **Ajuste 7:** `toLocaleString` sigue descartado, así que las cifras se muestran tal como vienen del mock.

## Prompt utilizado
```
Validado, con un ajuste en la topbar:

El bloque de sesión va en dos líneas a propósito, en todos los tamaños: arriba
"Sesión iniciada como" en text-xs uppercase tracking-widest text-muted, y abajo el
email en text-sm text-h con truncate. El texto no cambia, solo su disposición.
Rehace m360-shell.png y shell-1440-ok.png para confirmarlo.

Después sigue con V2 (CycleHistory).
```
(El ajuste de la topbar está registrado en `04-login-y-shell.md`.)

Prompt de la subtarea generado a partir de eso:
```
CycleHistory.jsx: Card highlight por ciclo con key={cycle.cycleId}; encabezado con label "Ciclo" y
h3 con cycleId. Secciones con h4 en labelBase: Status Statement (StatTile Generación/Consumo/Costo
base) y Balances Finales (StatTile Presupuesto en cyan, Energía), grid 1 / sm:2 / lg:3.
Operaciones: ul con divisores; cada li conserva su key y su texto literal, con un punto decorativo
(cian transferencia, violeta demand statement, rosa negociación); <strong>{n.status}</strong> pasa a
<Badge tone="neutral"> (tono fijo: sin condición nueva). Verificar: expresiones de datos iguales a
HEAD, textos con grep, lint, build, capturas a 1440/768/360.
```

## Resultado esperado
- Expresiones de datos y keys idénticas a `HEAD`.
- Todos los textos presentes.
- Lint y build OK.
- A 360px, nada se sale de la card.

## Resultado obtenido
- **Card con `highlight`:** barra superior rosa→magenta, con label "Ciclo" y `cycleId` en cian.
- **Stat tiles:**
  - 5 tiles con ícono, label en mayúsculas y cifra `text-xl` con su unidad.
  - Tonos:
    - Generación: cian;
    - Consumo: violeta;
    - Costo base: rosa;
    - Presupuesto: cian;
    - Energía: violeta.
  - La cifra de Presupuesto ya no va en naranja (`text-warm`): el tile cian la distingue.
- **Operaciones:**
  - lista con divisores sobre `bg`;
  - el estado de la negociación ("pagada") va en una pill neutra;
  - se conserva el " - " del texto original.
- **Ajuste durante la subtarea:** en las filas que ocupan dos líneas a 360px, el punto quedaba centrado verticalmente. Pasó a `items-start` con `mt-1.5`.
  - El primer intento con `sed` usó `\|`, que el `sed` de macOS no acepta en expresiones básicas, y no aplicó nada. Se repitió con `sed -E`.
- **Capturas:** `v2-1440.png`, `v2-768.png`, `v2-360.png` y `v2-360-ops.png`.

## Archivos modificados
- `src/components/CycleHistory.jsx`

## Tests ejecutados
```
npm run lint
npm run build
diff <(git show HEAD:src/components/CycleHistory.jsx | <extraer {expresiones} y key=>) <(<ídem> src/components/CycleHistory.jsx)
for p in 'Historial de Ciclos' 'Status Statement' ... '{n.status}' 'cyclesData.map((cycle)'; do grep -cF (HEAD vs ahora); done
Chrome --headless=new --force-prefers-reduced-motion --screenshot (1440, 768; 360 vía iframe)
```

## Resultado de los tests
- Lint: sin errores. Build: OK.
- Expresiones de datos: **sin diferencias** con `HEAD`:
  - keys: `cycle.cycleId`, `` `t-${i}` ``, `` `d-${i}` ``, `` `n-${i}` ``;
  - los 5 valores de `statusStatement` y `report`;
  - los campos de `t`, `d` y `n`.
- Textos, `HEAD → ahora`: 14 de 14 iguales (1 → 1). Incluye el texto literal de cada `<li>`.

## Decisiones tomadas
- **Encabezado:** se usa el label "Ciclo" con el `cycleId` en `h3`, en vez de "`cycleId` + badge" del plan. Un badge que dijera "Ciclo" junto al id repetía información.
- **Badge del estado de la negociación:** tono fijo `neutral`. Colorearlo según el valor (`pagada`, etc.) sería una condición nueva, o sea, lógica.
- **Unidades en los tiles:** "kWh" y "cr" pasan a la prop `unit`, así que el valor y la unidad siguen visibles juntos. Se pierden los ":" de "Generación:" y los demás, porque ahora el label y la cifra van en líneas separadas.
- **`<hr>`:** se eliminó. La separación entre secciones la da `gap-6` y los labels en mayúsculas.

## Bloqueos
Ninguno.

## Observaciones
- Los números sin separador de miles (`1234512`) siguen igual, porque `toLocaleString` está descartado. Si se aprueba después, se cambiaría en el componente o en el mapeo de la API.
