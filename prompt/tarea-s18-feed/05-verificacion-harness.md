# S18.5 — Verificación en navegador con el servidor de prueba

## Objetivo
Comprobar con evidencia que el feed reconecta sin perder eventos, detecta conexiones colgadas y que la vista se ve
bien.

## Contexto
Sin S17/S19 ni Auth0 real en local. Mismo patrón de harness que S23: stub de `@auth0/auth0-react`, Vite en otro
puerto, Chromium headless con `playwright-core` (de la caché de npx). Nada del harness se commitea.

## Prompt utilizado
```
Podemos hacer DF-046? y el mock de feed? dependo de las tareas de fran?
```
Prompt de la subtarea generado a partir de eso:
```
Harness en el scratchpad: auth0-stub.jsx (sesión iniciada, token falso), vite.harness.config.mjs (alias, proxy
/api/feed → :3002, puerto 5199). Servidor de prueba con cortes cada 8 s. Medir: ids de la lista contiguos y sin
duplicados tras 2 cortes; enlace de la ejecución; filtro Sagas; pausa; alerta abierta y runbook; contador en la
sidebar desde otra vista; servidor caído (¿cuánto tarda en salir de "En vivo"?) y reiniciado con otra numeración
(reset). Capturas claro/oscuro 1280 y 375, overflow horizontal.
```

## Resultado esperado
0 huecos y 0 duplicados tras reconectar; reset limpio; caída detectada; 0 px de overflow a 375.

## Resultado obtenido
- Reconexión: `Last-Event-ID` 111 y 132; 142 eventos, ids 1..142, 0 huecos, 0 duplicados.
- Reinicio del servidor con otra numeración: `reset` recibido, lista vaciada, "1 reinicio del servidor".
- **Hallazgo:** con el servidor caído el panel siguió en "En vivo" ≥ 15 s. Causa: el proxy de Vite no cierra la
  conexión del navegador (directo: `curl` sale en 2 s con código 18; por el proxy: timeout a los 15 s, código 28).
  El latido de 45 s la detectó (medido: 45 s).
- **Bug encontrado y corregido:** el primer texto decía "Reconectando en 47 s" para una espera de ~2 s (reloj
  `useNow` detenido desde el montaje). `connectionText` usa `max(now, at)`; test de regresión (con la fórmula
  anterior da 47). Después: "Reconectando en 2 s (intento 1)".
- Servidor de prueba: casi sin alertas en 90 s → peso y cierre diferido (ver S18.3).
- Enlace a la consola correcto, filtro Sagas, pausa ("Reanudar (7 nuevos)"), alerta con runbook
  `#wallet-lenta`, contador "1" en la sidebar que vuelve a 0 al entrar a la vista; 0 px de overflow a 375.

## Archivos modificados
- `src/lib/feed.js`, `src/lib/feed.test.js` (cuenta regresiva), `scripts/mock-feed-server.mjs` (alertas),
  `src/components/LiveFeed.jsx` (rótulo), `src/components/feed/ActiveAlerts.jsx` (borde).

## Tests ejecutados
Scripts `shot.mjs`, `shot2.mjs`, `shot3.mjs`, `shot4.mjs` del harness; `curl` directo y por el proxy; `npm test`.

## Resultado de los tests
Todo lo anterior; `npm test` 85/85, lint limpio.

## Decisiones tomadas
- Mantener el latido en 45 s (3 latidos de 15 s) — más corto daría falsos cortes si el servidor se atrasa un latido.

## Bloqueos
No se puede probar contra producción hasta S17 y S19.

## Observaciones
Aviso para S19: Nginx debe cerrar al caerse master (lo hace por defecto) y `proxy_read_timeout` debe ser mayor
que el latido.
