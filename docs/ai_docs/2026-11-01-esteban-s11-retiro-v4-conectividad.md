# AI log — S11: retiro de la vista de negociaciones E1 y transporte por kWh

**Fecha:** 2026-11-01
**Integrante:** Esteban
**Herramienta:** Claude Code (Opus 5.5), modo agéntico (edita archivos y corre comandos en el repo), en la extensión de VS Code. Sin subagentes.
**Unidad del roadmap:** S11 — trabajo del front que no depende de otros, mientras Francisca avanza en S3. Prompt literal: "Partamos con 1 y 2, no me interesa por ahora arreglar lo de node 20, es algo que como grupo debemos debatir antes de hacer"
**Rama:** `feat/e2-retiro-negociaciones`, apilada sobre `feat/e2-base-rf01` (PR #10), porque reutiliza los cambios de `cycles.js` y `status.js` de esa rama.
**Referencias:** DF-017, DF-021, DF-024, DF-026; enunciado E2 ("Qué cambia respecto de la E1", "Transporte"); enunciado E1 (ejemplo de la `distance-table`).
**Detalle por subtarea (prompts literales y resultados):** `prompt/tarea-s11-rf01/05-retiro-negociaciones.md` y `06-conectividad-transporte.md`

## Objetivo de la sesión
Avanzar en el front sin pisar el trabajo de Francisca en el backend: retirar la vista de la E1 que ya no sirve y
adelantar la parte de RF02 que no necesita campos nuevos.

## Flujo de trabajo
1. **Decisión humana sobre el orden.** El agente propuso empezar por el backend de S11. Esteban prefirió esperar a que
   Francisca termine S3 para no pisarla, y pidió solo tareas del front sin dependencias.
2. **Decisión humana sobre el retiro.** El agente proponía mantener la vista hasta S13. Esteban notó que S11 y S13 son
   suyas, así que se retira ahora (DF-028).
3. **Alcance:** el agente ofreció 4 tareas; Esteban eligió el retiro y la conectividad, y dejó fuera el arreglo de
   `npm test` en Node 20 para debatirlo en el grupo.
4. **Docs antes que el código** (RDOC01): DF-028 y DF-029, commit `632e5f0`.
5. **Implementación:** retiro (`5321c29`) y conectividad (`bb15339`).
6. **Verificación:** lint, tests, build y prueba en el navegador por Esteban.

## Qué se construyó
- `docs/decisiones-frontend.md` — DF-028 (retiro de V4) y DF-029 (transporte por kWh).
- Retiro: `NegotiationAdmin.jsx` borrado; pestaña, funciones del cliente y lógica sin uso eliminadas, con sus tests.
- `src/lib/transport.js` — `transportPerKwh`, `distanceKm` y `disabledRoutes`, con tests.
- `src/components/DistanceTable.jsx` — distancia en km, columna de transporte por kWh, rutas deshabilitadas destacadas.

## Verificación
- `npm run lint` → sin errores.
- `node --test src/lib/*.test.js` → **18/18** (15 tras el retiro + 3 de transporte).
- `npm run build` → en verde.
- Navegador (`npm run dev`, login de Esteban; Conectividad contra la API del `.env`, solo GET): "Se ve bien".
- Chequeo de secretos sobre lo staged antes de cada commit → sin resultados.
- **No verificado:** el aviso de rutas deshabilitadas con datos reales; no consta que hubiera alguna con `enabled: false` en la tabla vigente.

## Pendiente / para coordinar
- **Con Francisca:** puede retirar `POST /api/negotiations` en S3 sin afectar al front. En S6, si expone `disabledRouteTransportCost`, la celda "Tarifa punitiva" puede mostrar la cifra.
- **Con el grupo:** `npm test` falla con Node 20 (glob entre comillas).
- PR: base `feat/e2-base-rf01` hasta que se mergee el #10; falta push.

## Fuera de alcance
- Backend de S11 (OpenAPI y endpoint), en espera de S3.
- Libro de ofertas (S12), que depende de S6.
