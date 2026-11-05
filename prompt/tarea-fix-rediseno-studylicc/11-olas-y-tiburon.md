# Fix.11 — Olas del login más orgánicas y un tiburón ocasional (DF-036)

## Objetivo
Que el fondo del login se sienta más como mar en movimiento y que, muy sutilmente, a veces cruce un tiburón.

## Contexto
Las olas de DF-035 eran la misma senoide repetida, sin vaivén vertical.

## Prompt utilizado
```
Puedes dibujar mejor las olas del fondo? que se sienta mas el movimiento, y que a veces muy sutilmente aparezca un tiburon de inicio hasta el fin de la pantalla, probemos como sale esta idea
```
Prompt de la subtarea (generado por el agente durante la sesión):
```
DF-036 primero.
(1) wavePath en src/lib/waves.js, con tests: crestas irregulares por capa, período repetido un número par de veces;
    SeaBackground con vaivén vertical por capa (sea-bob) y una línea de eco tenue.
(2) Tiburón: FIN_PATH translúcido que cruza de derecha a izquierda sobre una ola, con el mismo vaivén;
    shark-cruise de 48 s con ~15 s visibles; oculto con reduce.
Verificar con capturas y muestreando la posición con la animación pausada.
```

## Resultado esperado
Dos commits, sin coautor, olas con más movimiento y un tiburón que cruza de derecha a izquierda.

## Resultado obtenido
- Commits:
  - docs: `d6512ca`
  - olas: `85efa8c`
  - tiburón: `f46ddbd`
- Se ajustó la cantidad de crestas (`repeats`).
- El tiburón se movió a la quinta ola para que la tarjeta no lo tape.

## Archivos modificados
- `docs/decisiones-frontend.md`
- `src/index.css`
- `src/lib/waves.js` y `src/lib/waves.test.js` (nuevos)
- `src/components/ui/SeaBackground.jsx`

## Tests ejecutados
- `npm run lint`
- `npx -y node@22 --test "src/lib/*.test.js"`
- `npm run build`
- Harness: `login.mjs` y `shark.mjs`

## Resultado de los tests
- 28/28.
- Lint y build en verde.
- El tiburón va de x 1236 a x -52 con fundido; oculto con reduce.

## Decisiones tomadas
- La primera pasada parte a los 3 s: en el login se está poco tiempo y, si no, el tiburón no se alcanza a ver.
- Opacidad máxima de 0,5: sutil, pero se distingue.

## Bloqueos
Ninguno.

## Observaciones
Si el tiburón molesta, basta con quitar `<Shark />` de `SeaBackground.jsx`.
