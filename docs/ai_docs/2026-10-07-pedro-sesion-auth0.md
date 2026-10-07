# AI log — V1.fix: sesión que sobrevive a recargar y `npm test`

**Fecha:** 2026-10-07
**Integrante:** Pedro
**Herramienta:** Claude Code (Opus 5.5), modo agéntico (edita archivos y corre comandos; Claude in Chrome para el login)
**Unidad del roadmap:** V1 (login con Auth0), hallazgos del testeo de punta a punta
**Rama:** `fix/auth0-sesion`, desde `main`, en el fork `Pedr0sit0s/Frontend-EnergyShark` (sin permiso de escritura en el repo)
**Detalle por subtarea (prompts literales y resultados):** `prompt/tarea-sesion-auth0/`

## Prompt de la sesión
```
todas las cosas que podamos arreglar nosotros, arreglemolas. menos lo del UML. todo los temas de
codigo si, solo hace PRs luego. tambien si es de backend las PRs van a david (empanadaz o algo asi es
su usuario) y esteban. frontend es francisca y esteban.
```

## Qué se construyó
- DF-023 y refresh tokens en `localStorage` con fallback al iframe.
- `npm test` con los archivos de test explícitos.

## Verificación
- lint OK, `npm test` 19/19 y build OK.
- En el navegador: con `main`, F5 pierde la sesión; con el parche, se conserva.
- **No verificado:** la renovación con refresh token, porque Auth0 hoy no lo emite.

## Pendiente / para coordinar
- **Con Jorge:** en Auth0, *Allow Offline Access* (API), *Refresh Token Rotation* (SPA) y opcionalmente *Allow Skipping User Consent*.
- **Con Francisca y Esteban:** revisar el PR.

## Segunda tarea de la sesión: referencias a `contratos` (RDOC04)

Prompt: "ahora estan ambos en la organzación. temrina con esa parte". Se cambiaron `AGENTS.md`,
`CLAUDE.md` y un comentario de `src/api/endpoints.js` para que apunten al repo
`EnergyShark-IIC2173/contratos` y a su `AGENTS.md` org-level. Detalle en `prompt/tarea-contratos-org/`.
Verificación: lint OK, 19/19, build OK.
