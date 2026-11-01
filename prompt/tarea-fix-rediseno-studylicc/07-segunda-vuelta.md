# Fix.7 — Segunda vuelta: entrada de ciclos, sidebar fija y plegable, menú de cuenta y un solo ciclo abierto (DF-032)

## Objetivo
Aplicar los ajustes de Esteban después de revisar el primer rediseño: una página más seria y minimalista, con un shell como el de los chats de LLM.

## Contexto
El primer rediseño (Fix.1 a Fix.6, DF-030/031) estaba en la rama, sin push. Tenía:
- un header con el correo y la sesión;
- una sidebar que crecía con la página;
- fondo de puntos;
- el primer ciclo abierto;
- `<details>` con "Ver detalle del ciclo" chico a la izquierda.

## Prompt utilizado
```
Buen primer acercamiento, pero quiero seguir mejorando cosas:

1. Quiero una animacion al cargar la pagina, que los ciclos vayan apareciendo uno detras de otro como fade in barrido hacia arriba (desde el primero hasta el ultimo abajo), 
2. Quiero que el primer ciclo no se abra inmediatamente
3. Saca los puntitos del fondo, prefiero que tenga fondo plano, es mas seria esta pagina
4. No me gista que diga sesion iniciado como correo: Puedes cambiarlo al nombre del usuario o solo la foto quizas es mejor asi, la idea es que tenga un diseño minimalista la pagina
5. La sidebar de la izquierda es gigante, el token esa absolutamnete al fondo junto con el ultimo ciclo, me gustaría que fuese fijo, y que al scrolear solo se scrolee el contenido de la pagina, no que vaya hasta el fondo, además me gustaría que fuese desplegable, que haya un boton de minimizar sidebar y que tenga esa animacion hacia al lado al cerrarla, y la misma pero al reves para abrirla

El modo oscuro y claro quiero que este en la sidebar, en la parte de abajo, quiero que tambien este la foto del usuario y que al apretar aparezca el cerrar sesion (es como el estandar usado en los chats llms este diseño que tengo pensado)

El boton de ocultar detalle al desplegar esta demasiado escondido, quizas al apretar afuera del ciclo, que este se cierre, además quiero que solo uno se pueda desplegar a la vez, si no la pagina queda muy larga, si apreto encima de uno, que el que este abierto se cierre -> puede ser sin apretar encima del boton de ver detalle del ciclo

El boton de ver detalle del ciclo, quiero que destaque mas, puedes ponerlo a la derecha del ciclo abajo, y al apretarlo baje hasta el fondo tambien, y que cambie el color ahora para cerrar el ciclo

Haz un commit sin coautorizador como siempre por cada cambio que te pedi
```
Prompt de la subtarea (generado por el agente durante la sesión):
```
DF-032 primero (commit solo). Después, un commit por pedido:
(1) rise-in con 70 ms entre tarjetas, motion-safe, y fundido con reduce;
(2) todas las tarjetas parten cerradas y la primera solo conserva el borde destacado;
(3) quitar dot-grid del main;
(4+cuenta) quitar el header, logo en la cabeza de la sidebar y al pie ThemeSwitch + UserMenu (Avatar con
picture o iniciales, nombre sin correo, menú con Cerrar sesión, Escape y clic afuera);
(5) sidebar sticky h-svh desde md, plegable a riel de 4,5 rem animando el ancho (excepción en DF-032), recordada
en localStorage; bajo md, cajón con translate-x, velo, Escape e inert;
(6) openId en CycleHistory, clic en la tarjeta cerrada la abre, pointerdown afuera la cierra, el botón con
aria-expanded para teclado y scroll al inicio si la tarjeta quedó fuera de la pantalla;
(7) botón primario "Ver detalle" abajo a la derecha que, abierto, baja al final del detalle como "Cerrar
detalle" en tinta.
Verificar cada paso en el harness con capturas y pruebas de comportamiento.
```

## Resultado esperado
Un commit por pedido, sin coautor, y cada comportamiento comprobado en el harness.

## Resultado obtenido
- Commits:
  - docs: `2c6f582`
  - (1) `acc88e0`
  - (2) `9a22d88`
  - (3) `850740c`
  - (4 + cuenta) `9ea5ba1`
  - (5) `ed79711`
  - (6) `c41e769`
  - (7) `aad290f`
- El pedido 4 y la cuenta al pie de la sidebar se juntaron en un solo commit, porque son el mismo componente.
- Correcciones durante la sesión:
  - textos del riel a `sr-only`;
  - `md:z-30` para que el menú no quede detrás de las tarjetas;
  - `btnBase` exportado para el botón de cerrar.

## Archivos modificados
- `docs/decisiones-frontend.md`, `docs/design/sistema-visual.md`
- `src/App.jsx`, `src/index.css`
- `src/components/Sidebar.jsx` (nuevo) y `src/components/CycleHistory.jsx`
- `src/components/ui/`: `UserMenu.jsx` (nuevo), `Avatar.jsx` (nuevo), `ThemeSwitch.jsx`, `Icon.jsx`, `Card.jsx`, `classes.js`
- `src/hooks/useMediaQuery.js` (nuevo)
- `src/lib/user.js` (nuevo) y `src/lib/user.test.js` (nuevo)
- `src/components/LogoutButton.jsx` (borrado)

## Tests ejecutados
- `npm run lint`
- `npx -y node@22 --test "src/lib/*.test.js"`
- `npm run build`
- Harness: `shell.mjs`, `cards.mjs`, `cards2.mjs`, `shoot.mjs`, `behave.mjs`

## Resultado de los tests
- 21/21.
- Lint y build en verde.
- Todos los comportamientos según DF-032 (cifras en el AI log).

## Decisiones tomadas
- Riel de íconos en vez de ocultar la sidebar del todo: es el estándar de los chats de LLM que pidió Esteban.
- `sticky` en vez de un contenedor con scroll propio: el scroll sigue siendo el de la ventana.
- La tarjeta completa se abre con mouse o dedo; con teclado se usa el botón, para no meter botones dentro de botones.
- El clic en la barra de scroll (destino `<html>`) no cierra el ciclo.
- En el menú se muestra solo el nombre, sin el correo, siguiendo el pedido de un diseño minimalista.

## Bloqueos
Ninguno.

## Observaciones
- El login conserva el fondo cuadriculado: el pedido fue quitar los puntos del área principal.
- Falta la prueba con el login real.
