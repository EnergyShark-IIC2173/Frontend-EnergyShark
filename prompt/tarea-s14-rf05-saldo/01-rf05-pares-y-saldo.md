# S14.1 — RF05 con pares y vista Saldo (AD5)

## Objetivo
RF05 con el origen de cada rechazo (cola y `sender`) y filtros por tipo, razón y cola, para las anomalías 1 y 2; y
una vista "Saldo" con el ledger local frente a la wallet y la última reconciliación, como medida de AD5 (anomalía 4).

## Contexto
- `sourceQueue` y `sender` llegan con S2 (#45). El endpoint solo filtraba por `kind`: los filtros `reason` y
  `sourceQueue` se agregaron en master (PR del backend `feat/rf05-filtros`, sobre #45).
- `GET /api/balance` existe en la rama de S5 (Pedro, #43).
- Rama apilada sobre `feat/e2-s13-estrategia` (PR #14).

## Prompt utilizado
```
Podemos hacer S14 altiro? con eso ya solo nos quedaria teoricamente:
1. Mergear todo en el orden correcto
2. Hacer S23 cuando todos mis comapñeros estén listos
3. Deployar a la S3

Eso solamente sería?
```
Respuestas literales de Esteban a las dos preguntas del agente ("¿Cómo hacemos el filtro por reason?" y "¿Dónde va
el dashboard de saldo?"):
```
Param en master (Recommended)
Vista nueva "Saldo" (Recommended)
```
Prompt de la subtarea generado a partir de eso:
```
Rama feat/e2-s14-rf05-saldo sobre feat/e2-s13-estrategia. Primer commit solo docs: DF-042 (columna Origen, filtros
Tipo/Razón/Cola combinables que van a master, lista de reasons sacada de git grep del connector más "Otra…",
IDENTITY_MISMATCH destacado) y DF-043 (vista Saldo: estados Cuadra / Delta explicado / Delta sin explicar / Sin
reconciliación, tabla local-wallet-delta con signo e ícono, polling 15 s, sin leaderboard). Luego
src/lib/balance.js puro con tests, constantes en status.js, endpoints y mocks (rechazos filtrables y saldo que
alterna cada 30 s), RejectedMessages.jsx y BalanceDashboard.jsx con ítem en la sidebar. Verificar con lint,
node --test, build y capturas.
```

## Resultado esperado
Filtros combinables que se mandan a master; columna Origen; Saldo con los cuatro estados y el delta con signo.

## Resultado obtenido
- `7b82968` DF-042 y DF-043; `4b2866d` lógica, endpoints y mocks; `8d8d9bb` corrección del mock; `5fcb43e` vistas.
- El primer mock del saldo dejaba el ledger *adelantado* a la wallet. Según ADR-005 el ledger aplica los eventos
  cuando llegan, así que va atrasado: se invirtió (wallet ya liquidó swp-81, el `swap-settled` aún no se aplica).

## Archivos modificados
- `docs/decisiones-frontend.md`
- `src/lib/balance.js`, `src/lib/balance.test.js`, `src/lib/status.js`, `src/api/endpoints.js`
- `src/mocks/rejected.js`, `src/mocks/balance.js`
- `src/components/RejectedMessages.jsx`, `src/components/BalanceDashboard.jsx`, `src/components/Sidebar.jsx`, `src/App.jsx`

## Tests ejecutados
```
npx eslint src
node --test src/lib/*.test.js
npx vite build
```

## Resultado de los tests
eslint sin errores; 53/53 (2 nuevos de `balance.test.js`); build OK.

## Decisiones tomadas
- Lista de reasons desde `git grep` del connector — no de memoria; "Otra…" cubre los que falten.
- Medio centavo de delta en créditos cuenta como 0 — es redondeo.
- Un delta `null` no cuenta como 0 — no se inventa que cuadra.
- Sin tile de leaderboard — el backend no lo expone.

## Bloqueos
#45 y `feat/rf05-filtros` (backend) para los filtros; #43 (Pedro) para `/api/balance`.

## Observaciones
- Capturas headless con mocks: RF05 a 1280 px (filas `IDENTITY_MISMATCH` destacadas) y Saldo en claro (delta
  explicado) y oscuro (cuadra).
- **No verificado:** el cambio de filtros con clics en el navegador; el login real; los endpoints reales.
