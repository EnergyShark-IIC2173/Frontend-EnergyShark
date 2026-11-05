# Fix.12 — El tiburón como easter egg de la aleta del logo y el botón de login sin borde animado (DF-037)

## Objetivo
Que el tiburón aparezca solo al apretar la aleta del logo, sin destacar, y sacar la animación del borde del botón.

## Contexto
DF-036: el tiburón cruzaba solo cada 48 s, en verde. DF-035: el botón tenía un trazo verde recorriendo su borde.

## Prompt utilizado
```
Las olas perfectas, el tiburon prefiero que sea un easter egg solo al apretar encima de la aleta del logo, que desaparezca de ahí y aparezca nadando en la pagina (prefiero que sea de un color mas parecido al del fondo, para que no destaque tanto)

Quita la animacion por el borde del boton de iniciar sesion
```
Prompt de la subtarea (generado por el agente durante la sesión):
```
DF-037 primero.
(1) Contexto sharkSwim entre WaterMark y SeaBackground:
    - la aleta es un botón; al apretarla se sumerge;
    - el tiburón cruza una vez en sand-300/sand-700 sobre la quinta ola;
    - al terminar, la aleta vuelve a asomar;
    - con reduce, solo un fundido;
    - se quita el cruce automático.
(2) LoginButton claro con borde accent quieto; se quitan border-run y sus keyframes.
Verificar el clic, el cruce, la vuelta de la aleta y el login en sus modos.
```

## Resultado esperado
Dos commits, sin coautor, y el easter egg completo verificado.

## Resultado obtenido
- Commits: docs `2041771` y easter egg `f245262`, más el commit del botón (ver el AI log).
- Se corrigió el doble conteo de nados en StrictMode.

## Archivos modificados
- `docs/decisiones-frontend.md`
- `src/index.css`
- `src/hooks/sharkSwim.js` (nuevo)
- `src/components/ui/`: `Logo.jsx`, `SeaBackground.jsx`, `AuthScreen.jsx`
- `src/components/LoginButton.jsx`

## Tests ejecutados
- `npm run lint`
- `npx -y node@22 --test "src/lib/*.test.js"`
- `npm run build`
- Harness: `egg.mjs` y `login.mjs`

## Resultado de los tests
- 28/28.
- Lint y build en verde.
- El easter egg funciona en claro y en oscuro.

## Decisiones tomadas
- El botón queda claro con borde verde quieto, en vez de volver a verde lleno (Esteban no quería verde lleno, DF-035).
- La aleta queda deshabilitada mientras el tiburón nada, para que no se encimen dos nados.

## Bloqueos
Ninguno.

## Observaciones
El nombre accesible de la aleta revela el easter egg a quien usa lector de pantalla; es a propósito, para que no sea un botón mudo.
