# Docs.1 — README del frontend y guía de deploy

## Objetivo
Cubrir en el front la parte de RDOC03 "cómo correr la aplicación en ambiente local (.env de ejemplo,
instalación, comandos)" y documentar el deploy a S3 + CloudFront (RNF03).

## Contexto
- El README era la plantilla de Vite ("# React + Vite"). Las instrucciones para correr el front
  estaban solo dentro de `AGENTS.md`.
- El deploy no estaba documentado. El 07-10 eso causó una confusión: un deploy hecho antes de mergear
  el #6 hizo parecer que la invalidación de CloudFront no funcionaba.
- El UML de componentes es de Esteban (#17 del backend) y no se toca.

## Prompt utilizado
```
hace el readme del frontend tambien
```
Subtarea derivada: "Reemplaza el README de plantilla por uno de la E1: qué hace (vistas V1–V5 con sus
RF), links a la API, al backend y a contratos, estructura, correr en local (tabla de VITE_*, backend
local o producción), lint/test/build. Agrega docs/deploy.md con build de producción, verificación del
build, subida a S3 (index.html sin caché), invalidación de CloudFront y verificación. Sin nombres de
bucket ni IDs de distribución: el repo es público."

## Resultado esperado
README útil para el ayudante y una guía de deploy que evite repetir el problema del 07-10.

## Resultado obtenido
- `README.md` y `docs/deploy.md` nuevos.
- Rutas, scripts y requisitos verificados contra el repo; el requisito de Node sale de `engines` de
  Vite 8 (`^20.19.0 || >=22.12.0`).
- lint OK, 19/19, build OK.

## Archivos modificados
- `README.md`, `docs/deploy.md`

## Tests ejecutados
`npm run lint`, `npm test`, `npm run build`; existencia de cada ruta citada.

## Resultado de los tests
OK.

## Decisiones tomadas
- Placeholders para el bucket y el ID de la distribución, con los comandos para obtenerlos: el repo es
  público.
- `index.html` subido con `Cache-Control: no-cache`: los assets llevan hash, así que la próxima
  invalidación deja de ser crítica.

## Bloqueos
Ninguno.

## Observaciones
—
