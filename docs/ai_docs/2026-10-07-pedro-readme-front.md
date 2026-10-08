# AI log — README del frontend y guía de deploy

**Fecha:** 2026-10-07
**Integrante:** Pedro
**Herramienta:** Claude Code (Opus 5.5), modo agéntico
**Unidad del roadmap:** documentación (RDOC03 y RNF03)
**Rama:** `docs/readme-front`, desde `main`, en el fork `Pedr0sit0s` (sin permiso de escritura en el repo)
**Detalle por subtarea (prompts literales y resultados):** `prompt/tarea-readme-front/`

## Prompt de la sesión
```
hace el readme del frontend tambien
```

## Qué se construyó
- `README.md` de la E1: vistas y requisitos, links, estructura, correr en local, calidad, deploy y seguridad.
- `docs/deploy.md`: build de producción, verificación del build, S3, invalidación de CloudFront,
  verificación y requisitos de Auth0.

## Verificación
lint OK, 19/19, build OK; rutas y requisitos contrastados con el repo.

## Pendiente
El UML de componentes (#17 del backend, Esteban).
