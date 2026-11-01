# Fix.2 — Tokens, fuentes y tema claro/oscuro

## Objetivo
Reemplazar los tokens V6 por los de StudyLicc (con el claro más blanco) y agregar el modo oscuro por clase sin parpadeo.

## Contexto
DF-030 aprobado. El `@theme` V6 de `src/index.css` definía `panel`, `bg`, `surface`, `text-h`, `pink`, etc., solo para oscuro.

## Prompt utilizado
```
(Plan aprobado por Esteban; mismo prompt de 01.)
```
Prompt de la subtarea (extracto literal del plan aprobado):
```
Tokens y base: src/index.css
- Ajuste pedido por Esteban: el claro no es crema. paper #FAFAF8, card #FFFFFF, sand-100 #F4F3EF y sand-200
  #E7E5DF, --rule #EDECE8. El resto de la paleta queda como en StudyLicc. El oscuro no cambia.
- Reemplazar el @theme V6 por los tokens de StudyLicc, los --oscuro-* en :root y el bloque .dark que los reasigna
  por rol.
- @custom-variant dark (&:where(.dark, .dark *));
- Utilidades: focus-ring, focus-ring-inset, edge-light, marker, dot-grid, ruled-lines, grid-lines y --shadow-pop.
- Keyframes con easing cubic-bezier(0.22,1,0.36,1).
- Imports de @fontsource/* en src/main.jsx.
next-themes → store propio en src/lib/theme.js + script inline en index.html que pone .dark antes del primer paint.
```

## Resultado esperado
Build en verde y `.dark` en `<html>` según la preferencia guardada o la del sistema.

## Resultado obtenido
- Commit `27b4270`.
- Primera versión de `theme.js`: leía la preferencia de `localStorage` como snapshot. Se reescribió para que la verdad
  sea la clase de `<html>`, porque con el almacenamiento bloqueado el snapshot y la clase quedaban desalineados.

## Archivos modificados
- `src/index.css`, `src/main.jsx`, `src/lib/theme.js` (nuevo), `index.html`, `package.json`, `package-lock.json`

## Tests ejecutados
`npm run build`

## Resultado de los tests
En verde.

## Decisiones tomadas
- La clave `energyshark-theme` está repetida en `theme.js` y en el script inline, con un comentario cruzado.
- Sin preferencia guardada, sigue los cambios del sistema en vivo.
- Se quitaron del `@theme` los tokens que no aplican: áreas, pomodoro, escritorio del visor.

## Bloqueos
Ninguno.

## Observaciones
Hasta el commit de las vistas, las clases viejas (`text-text-h`…) quedan sin estilo: el commit compila pero se ve mal.
