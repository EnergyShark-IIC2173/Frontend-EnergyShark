# AI log — S14: RF05 con pares y vista Saldo (AD5)

**Fecha:** 2026-11-01
**Integrante:** Esteban
**Herramienta:** Claude Code (Opus 5.5), modo agéntico (edita archivos y corre comandos en el repo), en la extensión de VS Code. Sin subagentes.
**Unidad del roadmap:** S14 — "RF05 con pares + dashboard de saldo". Prompt literal: "Podemos hacer S14 altiro? [...]"
**Rama:** `feat/e2-s14-rf05-saldo`, apilada sobre `feat/e2-s13-estrategia` (PR #14). La parte de backend está en `feat/rf05-filtros` (repo EnergyShark).
**Referencias:** enunciado E2 (RF05, AD5, anomalías 1, 2 y 4), ADR-005, ADR-001 addendum E2, `walletController` de S5 (#43).
**Detalle (prompts literales y resultados):** `prompt/tarea-s14-rf05-saldo/` (01 RF05 y saldo, 02 reloj del ciclo)

## Decisiones humanas
- "Param en master (Recommended)": los filtros `reason` y `sourceQueue` van al backend; en el front la paginación
  escondería registros.
- "Vista nueva Saldo (Recommended)": ítem propio para la medida de AD5.

## Qué se construyó
- **RF05:** columna "Origen" (cola y `sender`), filtros Tipo, Razón (lista real del connector y "Otra…") y Cola,
  "Limpiar filtros", filas `IDENTITY_MISMATCH` destacadas.
- **Saldo:** saldo local, estado de la última reconciliación, tabla local / wallet / delta con signo e ícono,
  operaciones abiertas y nota. Polling 15 s.
- **Mocks** de rechazos (filtrables) y del saldo.

## Cambio de diseño en la misma rama: reloj del ciclo (DF-044)
- Pedido de Esteban: *"quiero que el reloj salga siempre pero en la sidebar, y que cuente hasta el siguiente ciclo, o el tiempo en general mas importante de la aplicacion"*. Decisión humana: "Se va; solo el de la sidebar (Recommended)".
- `CycleClock` en la sidebar (abierta, riel y barra del celular) cuenta hasta el próximo instante del
  `status-statement` del ciclo más reciente; pasado `validUntil`, "Esperando el próximo ciclo". Las vistas quedan
  con un botón "Actualizar" y siguen con su polling.

## Hallazgos / Errores encontrados y corregidos
- **Hook exportado junto al componente** → lint de fast refresh → el hook pasó a `src/hooks/useCycleClock.js`.
- **Mock del saldo con el ledger adelantado** → contradecía ADR-005 (el ledger aplica eventos al llegar) → se
  invirtió (`8d8d9bb`).

## Verificación
- `npx eslint src` sin errores; `vite build` OK; `node --test src/lib/*.test.js` → **55/55**.
- Capturas del reloj: sidebar abierta, riel y barra del celular.
- Capturas headless con mocks de las dos vistas.
- **No verificado:** filtros con clics en el navegador, login real, endpoints reales (#45, `feat/rf05-filtros`, #43).

## Pendiente / para coordinar
- **Con David:** revisar `feat/rf05-filtros` (toca su controller de S2).
- **Con Pedro:** la vista lee `ledger` y `lastReconciliation` de `/api/balance`.
