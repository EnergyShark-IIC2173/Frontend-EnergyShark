# AI log — S11: base del front de la E2 y RF01

**Fecha:** 2026-11-01
**Integrante:** Esteban
**Herramienta:** Claude Code (Opus 5.5), modo agéntico (edita archivos y corre comandos en el repo), en la extensión de VS Code. Sin subagentes.
**Unidad del roadmap:** S11 — "Base del front, OpenAPI y RF01" (`docs/E2 Road Map.md` del backend). En esta sesión, solo la parte del front. Prompt literal: "Hagamos 1, recuerda dejar todo documentado, preguntame lo que sea necesario y cuando comitees no dejes coautor en los commits durante esta entrega, eso puedes dejarlo en el Claude.md que dejaste fuera de los repos"
**Rama:** `feat/e2-base-rf01`, desde `main` (`ce569a2`). No depende de código sin mergear: el backend de la E2 se reemplaza con mocks.
**Referencias:** enunciado E2 (secciones "El ciclo", "Liquidación al cierre", "Requisitos y Evaluacion" RF01 y "Referencia API v3"), `docs/E2 Road Map.md` y ADR-004/005/006 del backend, DF-019 a DF-021.
**Detalle por subtarea (prompts literales y resultados):** `prompt/tarea-s11-rf01/` (01 a 04)

## Objetivo de la sesión
Rehacer la vista de historial de ciclos (RF01) para el protocolo v3 sin esperar al backend: decisiones primero,
mocks con la forma de datos propuesta, lógica probada y la vista.

## Flujo de trabajo
1. **Lectura:** vista y lógica de la E1 (`CycleHistory.jsx`, `src/lib/cycles.js`, `status.js`), `openapi.yaml` de la
   E1, DF-020 y la guía `CLAUDE.md`.
2. **Decisiones humanas** (tres preguntas del agente). Esteban eligió las tres recomendadas:
   - "Resumen + detalle al expandir": con 72 ciclos al día y bids en ráfaga, el listado completo pesaría mucho.
   - "Flag VITE_USE_MOCKS": ver la vista mientras el backend no existe.
   - "Mostrar solo si traen datos": los ciclos de la E1 siguen viéndose.
3. **Docs antes que el código** (RDOC01): DF-024 a DF-027, commit `71867c0`.
4. **Implementación** en tres commits: mocks (`dcbf671`), lógica (`e2c9a39`) y vista (`30d95e3`).
5. **Verificación:** lint, tests y build; prueba en el navegador por Esteban.

## Qué se construyó
- `docs/decisiones-frontend.md` — DF-024 a DF-027.
- `src/mocks/cycles.js` — forma propuesta del listado y del detalle de ciclo v3, con tres ciclos (vendedor en
  curso, comprador cerrado y uno de la E1).
- `src/api/endpoints.js` — `listCycles` y `getCycle` responden desde los mocks solo en dev con `VITE_USE_MOCKS=true`.
- `src/lib/cycles.js` — `marketPhase`, `reportPending` v3, `matchLastOperation` por referencia exacta,
  `hasLegacyData` y `buyerTotals`.
- `src/lib/status.js` — etiquetas de fases v3, estados de swap y bid, roles y tipos de operación v3.
- `src/components/CycleHistory.jsx` — cabecera desde el listado y detalle al expandir, con las secciones de RF01.
- `.env.example` — `VITE_USE_MOCKS=false`.

## Hallazgos / Errores encontrados y corregidos
- **Saldo del mock imposible.** Con 1 782 073,36 CR la wallet habría rechazado la aceptación de `swp-64`
  (supera disponible + `creditLine`) → se subió el saldo previo a 4 782 073,36 CR. Saldo final verificado a mano:
  −1 004 038,64 CR.
- **`npm test` falla en Node 20, también en `main`.** El glob entre comillas solo lo expande Node 21+. No se
  cambió `package.json`; se usó `node --test src/lib/*.test.js`.

## Verificación
- `npm run lint` → sin errores.
- `node --test src/lib/*.test.js` → **24/24** (5 tests nuevos).
- `npm run build` → en verde; `grep -rl "cycle-9432\|mockListCycles" dist/` → sin resultados (los mocks no entran
  al bundle de producción).
- Navegador (`VITE_USE_MOCKS=true npm run dev`, login de Esteban): "Se ve bien".
- `git diff --cached | grep -inE 'amqps?://[^ ]*@|password|secret|token|BEGIN .*PRIVATE KEY'` → nada, en los 4 commits.
- **No verificado:** la vista contra el backend real (local o producción). Hoy ese backend responde con la forma
  de la E1 y la vista debería mostrar sus ciclos como E1; no se probó.

## Pendiente / para coordinar
- **Esteban (siguiente tarea):** escribir la forma de DF-024 en el `openapi.yaml` del repo `contratos` y su copia en
  el backend (rama apilada sobre `feat/s0-contratos-v3`), y después el endpoint en master por partes.
- **Con Francisca (S3), Pedro (S5) y David (S7):** los campos que espera RF01 están en `src/mocks/cycles.js`.
- **Con el equipo:** `npm test` con Node 20.
- PR a `main` con revisión de 2 compañeros: falta hacer push y abrirlo.

## Fuera de alcance
- El endpoint de master y el OpenAPI (siguientes tareas de S11).
- Retirar la vista de negociaciones de la E1 (S13).
