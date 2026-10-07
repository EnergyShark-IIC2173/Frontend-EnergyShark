# API.3 — Decisiones de frontend DF-014 a DF-022 (antes del código)

## Objetivo
Registrar las decisiones de la integración en `docs/decisiones-frontend.md`, en un commit solo de documentación y anterior a cualquier código (RDOC01).

## Contexto
- Última entrada existente: DF-013, verificada con `grep -nE "^## DF-"` → línea 219.
- Decisiones humanas ya tomadas en el plan: layout de V2, capacidad del give y backend local (ver API.1).
- Rama `feat/integracion-api-real` desde `main` (`2d6bb05`), con el rename `b7754b8` encima.

## Prompt utilizado
Extracto literal del prompt maestro (completo en `01-reconocimiento-y-plan.md`):
```
══════════ FASE 1 — RAMA Y DECISIONES (antes del código) ══════════
- Verifica que el árbol esté limpio. Crea `feat/integracion-api-real` desde la rama actual
  (la que contiene el rediseño V6).
- Primer commit, SOLO documentación (RDOC01): entradas DF nuevas en
  docs/decisiones-frontend.md, cada una con contexto → decisión → alternativa descartada →
  quién decidió (humana/agente) → dónde vive. Como mínimo: hook propio `useApiQuery` sin
  react-query; polling e intervalos; 404 de distance-table mostrado como "sin datos o
  endpoint aún no desplegado"; validación de tope de precio en cliente; /health en texto
  plano; qué se muestra cuando statusStatement o negotiationReportSent son null.
  Commit: `docs: decisiones de frontend para la integracion con la API real`.
```
Y el paso 6 del prompt de API.2: "Desde ahí, sigue con el commit de decisiones y el resto del plan."

Prompt de la subtarea (extracto literal del plan aprobado, `~/.claude/plans/pasted-content-id-8434-eres-un-jolly-bunny.md`, líneas 67-87):
```
- **DF-014:** hook propio `useApiQuery` + `endpoints.js`, sin react-query/SWR, porque serían una dependencia nueva. Descarto requests sueltos en cada componente.
- **DF-015:** polling.
  - Intervalos: V5 15 s; V2 30 s, solo en la página 1; V4 3 s solo si hay filas `proposed/confirmed`, y si no, sin polling; ciclo abierto del form, 30 s; V3 60 s.
  - Los ticks se saltan si `document.hidden`; los intervalos se limpian al desmontar y las respuestas desordenadas se descartan.
  - Descarto WebSocket/SSE: el backend no los tiene.
- **DF-016:** el 404 de distance-table se muestra como estado informativo "Sin datos o endpoint aún no desplegado", no como error rojo.
- **DF-017:** validación en el cliente. Números > 0. El tope `round2(1.05×generationCost)` **bloquea**. La capacidad del give **advierte** (decisión humana).
- **DF-018:** `/health` en texto plano. El cliente lee según el content-type y la card muestra el texto. La discrepancia con el contrato queda como hallazgo y no se parcha.
- **DF-019:** valores null.
  - `statusStatement` → "Sin status-statement".
  - `negotiationReportSent` → "Pendiente" si `phase==='negotiating'` y la ventana es futura; si no, "Reporte no enviado" (rosa).
  - Cualquier otro null → "—".
- **DF-020:** layout de V2, con la primera tarjeta abierta (decisión humana).
  - `lastOperationApplied` va **siempre** visible en la cabecera de cada ciclo, abierta o plegada, con su tipo y hora. No depende de ningún emparejamiento.
  - Marcar el ítem en su sección es una **heurística de mejor esfuerzo**: igualdad exacta para transfer y demand; para give y take, la misma dirección y el `paidAt` más cercano (hallazgo 1).
- **DF-021:** próxima ventana estimada.
  - Período = mediana de las diferencias entre los `windowOpensAt` de los ciclos listados; próxima = último `windowOpensAt` + k·período, la primera mayor que ahora.
  - Sin datos suficientes → "no estimable". Nunca hardcodeada.
- **DF-022:** `.env.example` sin valores, proxy de Vite opcional y "Volver a iniciar sesión" ante `login_required/consent_required`.

Commit: `docs: decisiones de frontend para la integracion con la API real`.
```

## Resultado esperado
Un commit que solo toca `docs/decisiones-frontend.md`, con DF-014 a DF-022 en el formato pedido, antes de cualquier `feat`.

## Resultado obtenido
- Commit `bc56b59`, anterior a todos los commits de código (`git log --oneline main..HEAD`).
- 9 entradas con contexto, decisión, alternativa descartada, quién decidió y dónde vive. Las formas de las respuestas se citan desde el código de `origin/main` `c58ccbd`.

## Archivos modificados
- `docs/decisiones-frontend.md`

## Tests ejecutados
Grep de secretos de `CLAUDE.md` sobre el diff staged.

## Resultado de los tests
Una sola coincidencia, `getAccessTokenSilently` (nombre de función de Auth0). Es un falso positivo: no hay credenciales.

## Decisiones tomadas
- Valores exactos de polling dentro de los rangos del pedido: V5 15 s, para que en la demo el duplicado aparezca rápido, y V2 30 s.
- Saltar los ticks con la pestaña oculta, para no gastar requests sin que nadie mire.

## Bloqueos
Ninguno.

## Observaciones
Después del commit, durante la implementación, cambiaron dos detalles que DF no fijaba: `pollMs` también acepta una función de la data (V4, en API.8), y el tono `violet` se agregó a `Badge` (API.5). No contradicen ninguna DF.
