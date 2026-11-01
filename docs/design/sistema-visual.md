# Sistema visual de EnergyShark

Guía corta para escribir UI en este repo. Es la estética de StudyLicc adaptada a un dashboard (DF-030): tinta, un acento verde, un subrayador amarillo, fondos de cuaderno y bordes cálidos de 1 px, con modo claro y oscuro. La fuente de verdad de los tokens es `src/index.css`. Las clases compartidas están en `src/components/ui/classes.js`.

## Reglas

- Usa solo tokens: `paper`, `ink`, `card`, `sand-100…900`, `accent`, `accent-hover`, `accent-ink`, `marker`, `coral`, `coral-ink`, `rose`, `rose-ink`, `lavender`, `lavender-ink` y `*-soft`. No uses `zinc`, `slate`, `gray`, `neutral`, `stone`, `white/` ni `black/`.
- Sin degradados ni sombras. Las tarjetas se separan con un borde de 1 px y, en oscuro, por luminosidad (`edge-light`).
- Todo componente funciona en claro y en oscuro con `dark:` por rol de token:
  - fondo: `bg-paper dark:bg-ink`
  - superficie: `bg-card dark:bg-sand-900`
  - elevada o hover: `bg-sand-100 dark:bg-sand-800`
  - texto: `text-ink dark:text-paper`
  - secundario: `text-sand-600 dark:text-sand-400`
  - borde: `border-sand-200 dark:border-sand-800`
- `accent` nunca va como texto en claro (2,4:1): usa `text-accent-ink dark:text-accent`.
- Tipografía:
  - Space Grotesk 700 (`font-display font-bold`) para títulos y el logo.
  - Work Sans (`font-sans`) para la interfaz.
  - Space Mono (`font-mono`) solo para identificadores: `cycleId`, `swapId`, `idpk`, `msgId`, `offerId` y códigos de ciudad.
  - Cifras siempre con `tabular-nums`.
- Formas: botones e inputs `rounded-xl`, tarjetas `rounded-2xl`, chips `rounded-lg`.
- Foco: siempre `focus-ring` (o `focus-ring-inset` dentro de contenedores con overflow). Tap targets de 44 px (`min-h-11`).
- Fondo de cuaderno: `dot-grid` en el área principal y `grid-lines` en el login. Las tarjetas son opacas encima.
- Subrayador: `.marker` en 1 palabra clave por vista (el título).
- Movimiento: solo `transform`, `opacity` y `clip-path`, de 150 a 300 ms con `cubic-bezier(0.22,1,0.36,1)`, siempre con `motion-safe:` o con respaldo `motion-reduce:`.
- Textos en español de Chile, tratando de "tú", sin em-dash ni en-dash, sin emojis. Los nulos se muestran como "Sin dato" (DF-031).
- Íconos: Phosphor, peso bold, a través de `<Icon name="..." />` (`src/components/ui/Icon.jsx`). Si falta uno, agrégalo al mapa.

## Estados (`Badge` tone)

| Tono | Uso |
|---|---|
| `active` | vigente, propuesto, aceptado, habilitado, mercado abierto |
| `settled` | liquidado, reporte enviado |
| `error` | NACK, rechazado, ruta deshabilitada, reporte no enviado (`coral`, solo errores) |
| `warning` | duplicado, periodo de cierre (`rose`) |
| `category` | consumo (`lavender`) |
| `neutral` | enviado, expirado, cerrado, pendiente |

`error` y `warning` llevan ícono además de texto: un estado nunca depende solo del color.

## Checklist antes de subir una vista

1. ¿Solo tokens de la paleta?
2. ¿Se ve bien en claro y en oscuro?
3. ¿Space Grotesk en títulos, Work Sans en el cuerpo y Space Mono en los ids?
4. ¿Radios xl/2xl/lg, bordes de 1 px, sin sombras ni degradados?
5. ¿`focus-ring` en todo lo interactivo y 44 px de alto en botones?
6. ¿Animaciones solo con transform u opacity y con respaldo de movimiento reducido?
7. ¿Textos con tuteo, sin em-dash ni emojis?
