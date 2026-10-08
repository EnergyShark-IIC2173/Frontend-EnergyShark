# AI log — Sesión 3: V2 a V5 (Mocks), Errores de Red y Navegación SPA

**Fecha:** 2026-10-07
**Integrante:** Frani
**Unidades del roadmap:** V2 (RF01), V3 (RF02), V4 (RF04), V5 (RF05)

## Hito 1: Resolución de error de red y creación de la primera vista (V2)
- **Consulta técnica:** Reporte de error `Load failed` en la aplicación y solicitud de asistencia para implementar la funcionalidad V2 (Historial de ciclos) basándose en el enunciado E1.
- **Respuesta y acuerdos:**
  - Diagnóstico del error como un bloqueo CORS del API Gateway, especificando que es una tarea de infraestructura (backend) y no un fallo en React.
  - Estrategia de desacoplamiento: creación de un mock (`cycles.json`) y del componente `<CycleHistory/>` para avanzar con el requerimiento del historial de ciclos (RF01) de manera autónoma.

## Hito 2: Depuración de renderizado de componentes en App.jsx
- **Consulta técnica:** Revisión de código porque los mocks generados no se visualizaban en la interfaz, sumado a la persistencia del error CORS.
- **Respuesta y acuerdos:**
  - Identificación de la omisión del componente: `<CycleHistory/>` no estaba siendo importado ni insertado en el `return` de la aplicación.
  - Corrección del código en `App.jsx` agregando renderizado condicional (`{isAuthenticated && <CycleHistory/>}`) para proteger la vista.

## Hito 3: Análisis de contratos (OpenAPI vs AMQP) y generación masiva de Mocks
- **Consulta técnica:** Revisión de múltiples esquemas (request, demand-statement, error) para determinar cuáles son necesarios para el frontend según el funcionamiento esperado.
- **Respuesta y acuerdos:**
  - Aclaración de arquitectura: los esquemas enviados pertenecían a los contratos del broker AMQP de RabbitMQ, los cuales no son consumidos directamente por el frontend.
  - Generación de los 3 archivos estáticos restantes (`distance.json`, `negotiations.json`, `rejected.json`) basándose estrictamente en las rutas del OpenAPI definido para la API REST interna.

## Hito 4: Estructuración de SPA y navegación de vistas
- **Consulta técnica:** Consulta sobre la necesidad de mostrar todos los mocks simultáneamente en la pantalla principal.
- **Respuesta y acuerdos:** Explicación del modelo SPA (Single Page Application): recomendación arquitectónica de separar los requerimientos visuales (RF01, RF02, RF04, RF05) en vistas y pestañas independientes para evitar sobrecargar la interfaz.

## Hito 5: Implementación V3 (Tabla de Conectividad) y sistema de pestañas
- **Consulta técnica:** Solicitud de implementación para la vista V3 (Conectividad - RF02) y la agregación de pestañas de navegación en `App.jsx`.
- **Respuesta y acuerdos:**
  - Construcción del componente `<DistanceTable/>` (RF02) transformando el diccionario del mock JSON en un arreglo iterativo para la tabla HTML.
  - Modificación de `App.jsx` introduciendo un estado local (`activeView`) y botones de navegación para alternar dinámicamente entre el historial y la conectividad.

## Hito 6: Implementación V4 (Administración de Negociaciones)
- **Consulta técnica:** Transición a V4 para implementar el panel de administración (RF04) basándose en los lineamientos del roadmap.
- **Respuesta y acuerdos:**
  - Creación de `<NegotiationAdmin/>` (RF04) integrando un formulario controlado en React.
  - Implementación de lógica temporal (mock) que inserta la nueva propuesta en el estado local de la tabla, permitiendo testear la UX sin requerir que el endpoint U10 del backend esté desplegado.

## Hito 7: Implementación V5 (Registro de Duplicados y NACKs para Evaluación)
- **Consulta técnica:** Solicitud de implementación final para la vista V5 (Duplicados/NACKs - RF05) para asegurar la evidencia de la demo.
- **Respuesta y acuerdos:** Entrega del componente `<RejectedMessages/>` (RF05) con validadores visuales rápidos (códigos de colores ámbar para duplicados y rojo para NACKs) con el fin de facilitar la lectura de evidencia durante la revisión con el evaluador.