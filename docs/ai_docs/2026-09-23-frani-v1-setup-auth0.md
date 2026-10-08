# AI log — Sesión 1: Arquitectura, Planificación del Frontend y Setup Base

**Fecha:** 2026-10-07
**Integrante:** Frani
**Unidad del roadmap:** V1 — Setup + login

## Hito 1: Comprensión global del enunciado y arquitectura del sistema
- **Consulta técnica:** Solicitud de orientación conceptual para desglosar el flujo de trabajo del proyecto a partir de un backend funcional conectado al broker, requiriendo clarificación de conceptos normativos antes de iniciar la implementación.
- **Respuesta y acuerdos:** 
  - Clarificación conceptual de idempotencia (idpk), distinción entre ACK, NACK y ERROR a nivel de protocolo vs. negocio, y resiliencia ante caídas del broker.
  - Definición del ledger local como fuente única de verdad.
  - Roadmap en 6 fases: broker, scheduler de ciclo operativo (2 h / 20 min), negociación voluntaria, infraestructura cloud (S3/CloudFront/EC2/API Gateway) y documentación ADR.

## Hito 2: Definición técnica de la infraestructura del repositorio Frontend
- **Consulta técnica:** Consulta sobre las mejores prácticas y secuencia técnica para estructurar el repositorio desacoplado de la SPA (Gate G04).
- **Respuesta y acuerdos:**
  - Creación de repositorio aislado en GitHub para una SPA en React con build estático.
  - Identificación de vistas mínimas asociadas a requerimientos funcionales: RF01 (historial), RF02 (conectividad), RF04 (administración de ofertas) y RF05 (auditoría de duplicados/NACKs).
  - Estrategia de despliegue en AWS: build estático (`npm run build`), alojamiento en Amazon S3 y distribución vía CloudFront con terminación TLS/HTTPS mediante certificado ACM en us-east-1 (RNF03 y G05).

## Hito 3: Desglose de tareas del Frontend a partir del Roadmap
- **Consulta técnica:** Solicitud de un desglose operativo exhaustivo del alcance exclusivo del Frontend, manteniendo la nomenclatura técnica del proyecto para coordinar con el equipo de trabajo.
- **Respuesta y acuerdos:**
  - Glosario operativo de apoyo: SPA, Mocks (U0.2), JWT, S3/CloudFront, CORS y OpenAPI.
  - Cronograma atómico por fases:
    - **Días 1-2:** V1 (Setup SPA + login Auth0/Cognito, sujeto a U0.2 e I1).
    - **Días 3-5:** Desarrollo desacoplado con mocks en JSON: V2 (RF01), V3 (RF02) y V5 (RF05).
    - **Días 6-7:** V4 (RF04) e integración con endpoints reales (U9/U10) para la prueba integral INT1.
    - **Semana 2:** V6 (refinamiento UX), I6 (despliegue S3 + CloudFront) y pruebas de contingencia (INT2/INT3).

## Hito 4: Formalización de la especificación técnica para el equipo
- **Consulta técnica:** Solicitud de estructuración de la especificación del bloque inicial (Días 1-2) en formato formal de reporte técnico para validación entre pares.
- **Respuesta y acuerdos:** Documento de requerimientos en tercera persona técnica, organizando responsabilidades y dependencias sin alterar la nomenclatura operativa (V1 a V6, RF01 a RF05, U0.2, I1, I6, INT1 a INT3).

## Hito 5: Implementación técnica de la fase V1 (Setup, Auth0 y validación de sesión)
- **Consulta técnica:** Consulta sobre la integración del flujo de autenticación Auth0 en una base Vite + React, delegando credenciales hacia el API Gateway existente y comprobando el token contra el endpoint `/health`.
- **Respuesta y acuerdos:**
  - Integración de `@auth0/auth0-react` en `src/main.jsx` mediante `Auth0Provider`.
  - Implementación en `src/App.jsx` de los hooks de sesión (`loginWithRedirect`, `logout`, `getAccessTokenSilently`).
  - Validación del gate G06: obtención silenciosa del JWT y consulta autenticada a `${API_URL}/health` con header `Authorization: Bearer <token>`, verificando CORS y validez del token.

## Hito 6: Estructuración base del proyecto y resumen ejecutivo
- **Consulta técnica:** Solicitud de un resumen ejecutivo del flujo de trabajo y de un árbol de directorios estandarizado para la SPA.
- **Respuesta y acuerdos:** Síntesis ejecutiva de la arquitectura desacoplada y matriz de carpetas organizada por componentes, servicios de API/mocks y vistas por fase.