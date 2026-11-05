# Fix.10 — Login con movimiento: agua del logo, borde animado del botón y mar de olas (DF-035)

## Objetivo
Que el login deje de ser "fome": agua en movimiento, un botón con un borde animado y un fondo que se mueva.

## Contexto
El login tenía un fondo `grid-lines` quieto, el logo estático y un botón verde lleno (DF-030).

## Prompt utilizado
```
Pequeño cambio en el login, esta demasiado fome actualmente, puedes hacer la animacion continua del agua como si se estuviera moviendo, sin mover al tiburon, y que el boton de iniciar sesion no sea verde totalmente, si no que tenga una animación por el borde, de color verde que gire en ciclos continuamente
Si no es muy complicado de implementar, puedes dar la impresion de que el fondo tambien se esta moviendo? quizas no con los cuadrados actualmente, ahi puedes pensar algo y me preguntas por opciones
```
Respuesta literal de Esteban a la pregunta del agente (opciones: mar de olas, burbujas, corrientes diagonales, cuadrícula que deriva):
```
Mar de olas (Recomendado)
```
Prompt de la subtarea (generado por el agente durante la sesión):
```
DF-035 primero y después un commit por pedido:
(1) WaterMark: la aleta quieta y la ola SEA_WAVE corriendo con wave-run; la intro reutiliza SEA_WAVE;
(2) LoginButton claro con un tramo accent que gira por el borde;
(3) SeaBackground con seis olas a distintas alturas, opacidades y velocidades, en vez de grid-lines.
Todo con motion-safe; con reduce, quieto y el borde verde completo.
Verificar en el harness con capturas en claro, oscuro, 390 px y reduce.
```

## Resultado esperado
Tres commits, sin coautor, y el login animado sin scroll horizontal y quieto con movimiento reducido.

## Resultado obtenido
- Commits:
  - docs: `34688a9`
  - (1) `a431cb1`
  - (2) `85f9c23`
  - (3) `253f002`
- El borde con `conic-gradient` girando no se veía en un botón ancho: se reemplazó por un trazo SVG con `stroke-dashoffset` (corrección tachada en DF-035).

## Archivos modificados
- `docs/decisiones-frontend.md`
- `src/index.css`, `src/App.jsx`
- `src/components/LoginButton.jsx`
- `src/components/ui/`: `Logo.jsx`, `SharkIntro.jsx`, `AuthScreen.jsx`, `SeaBackground.jsx` (nuevo)

## Tests ejecutados
- `npm run lint`
- `npx -y node@22 --test "src/lib/*.test.js"`
- `npm run build`
- Harness: `login.mjs` y `beam.mjs`

## Resultado de los tests
- 26/26.
- Lint y build en verde.
- 7 olas y el borde animados; ninguno con "Reducir movimiento".

## Decisiones tomadas
- Las olas corren hacia la derecha, igual que el agua de la intro (DF-034).
- Desfases negativos en las olas, para que no partan alineadas.
- El texto del botón queda en tinta sobre `card` (17,37:1).

## Bloqueos
Ninguno.

## Observaciones
Revisar en Safari y Firefox el `rect` con `width="calc(...)"`. Si falla, la alternativa es `width="100%"` dentro de un `svg` con `inset` de 1 px.
