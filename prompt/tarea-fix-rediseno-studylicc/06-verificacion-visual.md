# Fix.6 — Verificación visual y de comportamiento

## Objetivo
Ver las vistas en ambos temas y anchos sin el login real, y corregir lo que aparezca.

## Contexto
En la sesión no había herramienta de navegador y el agente no usa credenciales de Auth0. En sesiones anteriores, la
prueba en el navegador la hizo Esteban.

## Prompt utilizado
```
(Plan aprobado por Esteban; mismo prompt de 01.)
```
Prompt de la subtarea (generado por el agente durante la sesión):
```
Harness fuera del repo (scratchpad): vite con root en el front, alias de @auth0/auth0-react a un stub autenticado
(?login muestra el login), VITE_USE_MOCKS=true para los ciclos y puppeteer-core con el Chrome instalado,
interceptando /api/distance-table y /api/messages/rejected con datos falsos (una ruta deshabilitada; un
duplicado, un NACK IDENTITY_MISMATCH y un descartado). Capturas del login y de las 3 vistas en claro y oscuro a
1280 y 375 px; medir scroll horizontal; probar el switch, la persistencia, aria-checked, reduce motion, el foco
con Tab y los botones de menos de 44 px.
```

## Resultado esperado
Sin errores de página, sin scroll horizontal y todos los comportamientos según DF-030.

## Resultado obtenido
- 16 capturas: sin `pageerror` y sin scroll horizontal.
- Se encontraron y corrigieron 3 problemas en `89b0bbc`:
  - el badge de fase heredaba Space Mono del `h3`;
  - el borde `accent` de la tarjeta destacada no se aplicaba;
  - "Sin dato" se partía en dos líneas en la columna Código.
- Comportamiento:
  - con el sistema en oscuro y sin preferencia, carga oscuro;
  - el click cambia a claro, guarda `light` y persiste al recargar;
  - `aria-checked` coincide con el tema;
  - con `reduce`, la animación del detalle es `none`;
  - el foco con Tab es un outline sólido de 2 px `rgb(22,113,93)`;
  - ningún `button` mide menos de 44 px.
- El `summary` "Ver detalle" medía menos de 44 px y ahora lleva `min-h-11`.

## Archivos modificados
- `src/components/ui/Badge.jsx`, `src/components/ui/Card.jsx`, `src/components/RejectedMessages.jsx`, `src/components/CycleHistory.jsx`

## Tests ejecutados
`node shoot.mjs`, `node behave.mjs` (harness), `npm run lint`, `npx -y node@22 --test "src/lib/*.test.js"`, `npm run build`

## Resultado de los tests
Todo en verde; 19/19.

## Decisiones tomadas
- El harness queda fuera del repo: es una herramienta de la sesión, y el stub de Auth0 no debe poder entrar al build.

## Bloqueos
Ninguno.

## Observaciones
Falta la prueba de Esteban con su login y contra la API real, además de Safari y Firefox.
