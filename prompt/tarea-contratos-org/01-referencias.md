# RDOC04.fix — Referencias al repo de contratos org-level

## Objetivo
Que el front referencie el repo de contratos y el `AGENTS.md` a nivel de organización (RDOC04).

## Contexto
El equipo creó la organización `EnergyShark-IIC2173` y transfirió los repos. Los contratos pasaron a
`EnergyShark-IIC2173/contratos`, con un `AGENTS.md` org-level. El front apuntaba al `AGENTS.md` y a
`docs/contracts/` del backend, con las URLs viejas (`JorgeUribeGo/...`).

## Prompt utilizado
```
ahora estan ambos en la organzación. temrina con esa parte
```
Subtarea derivada: "En el front, cambia en AGENTS.md, CLAUDE.md y el comentario de endpoints.js las
referencias al AGENTS.md y a docs/contracts del backend por el repo contratos de la organización. Quita
el aviso viejo sobre el JWT, que ya está resuelto en el AGENTS.md org-level."

## Resultado esperado
Ninguna referencia a las URLs personales viejas; el `AGENTS.md` del front enlaza al org-level.

## Resultado obtenido
`AGENTS.md`, `CLAUDE.md` y `src/api/endpoints.js` actualizados. Se quitó el aviso sobre el JWT, porque
el `AGENTS.md` org-level ya lo describe bien.

## Archivos modificados
- `AGENTS.md`, `CLAUDE.md`, `src/api/endpoints.js` (solo un comentario)

## Tests ejecutados
`npm run lint`, `npm test`, `npm run build`.

## Resultado de los tests
lint OK, 19/19, build OK.

## Decisiones tomadas
Rama apilada sobre `fix/auth0-sesion` (#6): las dos agregan la sección de Pedro en `prompt/README.md`.

## Bloqueos
Ninguno.

## Observaciones
—
