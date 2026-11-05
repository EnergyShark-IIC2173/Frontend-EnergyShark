# Fix.1 — Decisiones y plan del rediseño StudyLicc (DF-030, DF-031)

## Objetivo
Fijar antes del código cómo se adapta la estética de StudyLicc a EnergyShark y resolver los choques entre esa guía y
lo que ya existe en el front (RDOC01).

## Contexto
- Fix propio de Esteban, fuera de las tareas S de la E2.
- Rama apilada sobre la PR #11 (`feat/e2-retiro-negociaciones`, `20ee738`).
- La guía de StudyLicc (`E1/docs/studylicc-design/`, fuera del repo) está pensada para Next.js y una plataforma de
  estudio. Choca con EnergyShark en cinco puntos:
  - el logo (es marca de StudyLicc);
  - la falta de un color de advertencia (el naranja de DF-008);
  - el "—" de nulos de DF-019 frente a la regla "sin em-dash";
  - el layout asimétrico frente a las grillas de RF01 en revisión;
  - el papel crema.

## Prompt utilizado
```
Abriendo una nueva rama desde la actual (ultimos cambios), en la PR 11 de retiro negociaciones, quiero hacer un fix visual de la pagina, eso no va dentro de ninguna Tarea "S", es algo propio mio como tal, que quiero hacer un rediseño de la pagina, que tenga visor modo oscuro y claro, y cambie el estilo cyberpunk que actualmente tiene nuestro diseño por uno mas en el estilo usado en mi plataforma web studylicc, te deje la documentacion en dosc/studylicc-design

A continuacion el prompt para hacer el rediseño:

"""

Este proyecto debe tener la estética de StudyLicc. Lee primero docs/studylicc-design/DESIGN.md
y globals.css (la fuente de verdad de los tokens). Antes de escribir UI:
- Usa SOLO los tokens de color definidos (paper, ink, card, sand-*, accent, accent-ink,
  marker, coral). Nada de zinc/slate/gray/neutral de Tailwind.
- Fuentes: Space Grotesk 700 para títulos y logo, Work Sans para UI y cuerpo,
  Space Mono para siglas o código. Cifras con tabular-nums.
- Soporta modo claro y oscuro con variantes dark:. Elevación por luminosidad,
  sin sombras pesadas ni degradados.
- Formas: botones e inputs rounded-xl, tarjetas rounded-2xl, chips rounded-lg,
  bordes de 1px cálidos.
- Fondos de cuaderno (ruled-lines, dot-grid, grid-lines), subrayador .marker en
  1 o 2 palabras clave por página, layouts asimétricos.
- Focus siempre con la utilidad focus-ring. Tap targets de 44px.
- Movimiento: solo transform/opacity/clip-path, 150-300 ms, easing [0.22,1,0.36,1],
  y respeta prefers-reduced-motion.
- Textos en español de Chile con "tú", sin em-dash, sin emojis ni frases de marketing.
- Íconos: Phosphor bold.
Reutiliza estas técnicas antes de inventar estilos nuevos. Si algo no está cubierto,
pregúntame.

"""

Si consideras que hay cosas del prompt que chocan, preguntamelas, porque lo pedi dentro del contexto de studylicc, y no sabe de que va nuestra entrega de energyshark
```
Respuestas literales de Esteban a las 4 preguntas del agente (logo, color de advertencia, guiones y alcance):
```
Isotipo SVG nuevo, pero no tiene que ser amarillo, que sea del color que mejor estimes conveniente para no salirse de la estetica
Rose (Recomendado)
'Sin dato' + 'a' (Recomendado)
Solo piel + shell (Recomendado)
```
Rechazo literal del primer plan:
```
Solo un pequeño cambio, el color del modo claro actualmente en studylicc es crema porque emula un poco el papel, en este caso estamos viendo dashboards y no se ve muy profesional el usar crema, puedes usar un tono un poco mas blanco
```
Prompt de la subtarea (extracto literal del plan aprobado):
```
Docs primero (commit solo, antes del código, regla de RDOC01)
- docs/decisiones-frontend.md: DF-030 Rediseño StudyLicc. Reemplaza la paleta y el login con degradado de DF-008
  y los íconos a mano de DF-010, y actualiza DF-012 con los contrastes nuevos. DF-031 Nulos "Sin dato" y rangos
  con "a". Reemplaza la fila "—" de DF-019.
- docs/design/sistema-visual.md: guía corta de la estética adaptada a EnergyShark. No se commitean los archivos
  de StudyLicc: son de otra marca y viven fuera del repo.
```

## Resultado esperado
DF-030, DF-031 y la guía en un commit anterior a cualquier código, con las cifras de contraste reales de la paleta ajustada.

## Resultado obtenido
- Antes de escribir los DF se corrió un script de contraste WCAG. Detectó `rose-ink` sobre `rose-soft` a 4,47:1, así
  que en claro los chips pasan a un tinte al 10 % del tono pleno, y el punto del `dot-grid` baja a `#e2e0d9`.
- Commit `fd16998` `docs: DF-030/DF-031 y guía del sistema visual StudyLicc`, primero de la rama.

## Archivos modificados
- `docs/decisiones-frontend.md`
- `docs/design/sistema-visual.md`

## Tests ejecutados
`node contrast.mjs` y `node c2.mjs` (scripts en el scratchpad de la sesión, fuera del repo).

## Resultado de los tests
Todo el texto da al menos 4,5:1 y el foco al menos 3:1 con la paleta final. Cifras en DF-030.

## Decisiones tomadas
- `@fontsource` en vez de Google Fonts: queda dentro del bundle que sirve CloudFront, sin pedir nada a terceros.
- Store propio de tema en vez de `next-themes` (el proyecto es Vite, no Next).
- Solo CSS para el movimiento: un dashboard no necesita la librería `motion`.
- Logo en `accent` con trazo en tinta: el amarillo queda reservado para el subrayador, como en StudyLicc.

## Bloqueos
Ninguno.

## Observaciones
La guía de StudyLicc no se copia al repo; si alguien la necesita, está en `E1/docs/studylicc-design/`, fuera de los repos.
