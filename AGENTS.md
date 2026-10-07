# AGENTS.md — frontend de EnergyShark (RDOC04)

Contexto para agentes de IA y personas nuevas en **este** repo. El contexto compartido del proyecto
(arquitectura del backend, reglas del protocolo, contratos y cómo trabajamos) vive en un solo lugar:
**[`JorgeUribeGo/EnergyShark/AGENTS.md`](https://github.com/JorgeUribeGo/EnergyShark/blob/main/AGENTS.md)**.
Léelo primero. Aquí solo va lo propio del frontend.

> Aviso (2026-10-07): ese archivo todavía dice "Las rutas de la API no validan JWT por sí mismas".
> Desde el PR #24 del backend, master también valida el JWT. Hay que considerar vigente lo segundo.

## Qué es este repo

SPA en React 19 + Vite 8 + Tailwind 4, con login de Auth0 (`@auth0/auth0-react`). Se despliega en S3 + CloudFront.
Consume la API de master a través del API Gateway (`https://api.tiburonshark.me`, JWT de Auth0).

| Ruta | Qué hay |
|---|---|
| `src/api/client.js` | `useApiClient().apiFetch`: token de Auth0, `ApiError(status, message, body)` y lectura según content-type |
| `src/api/endpoints.js` | una función por endpoint de master |
| `src/api/useApiQuery.js` | hook de datos `{ data, loading, error, reload }` con polling opcional |
| `src/lib/` | lógica pura (formatos, tope de precio, ventanas), con tests `node --test` |
| `src/components/` | vistas V2–V5 |
| `src/components/ui/` | componentes presentacionales del diseño V6, sin hooks |

**Contrato de la API:** `docs/contracts/openapi.yaml` del backend. Si la realidad difiere del
contrato, se avisa al backend; no se parcha en el front.

## Correr y probar

```bash
cp .env.example .env   # completar las 4 VITE_*; nunca commitear .env
npm ci
npm run dev            # http://localhost:5173. Usar ese puerto: es el origen que permite el CORS del Gateway
npm run lint && npm test && npm run build
```

- **Backend local:** `VITE_API_BASE_URL=` vacío, y el proxy de Vite manda `/api` y `/health` a master en `:3001`.
- **Dato de Vite:** una variable de shell gana sobre `.env`, así que `VITE_API_BASE_URL= npm run dev` sirve sin editar archivos.

## Cómo trabajamos en este repo

Se siguen las reglas del `AGENTS.md` del backend. El detalle de la documentación del front está en
**`CLAUDE.md`** de este repo. En resumen:

1. **Decisiones antes que el código (RDOC01).** Las decisiones de frontend van en
   `docs/decisiones-frontend.md` (DF-xxx), en un commit **anterior** a la implementación. Las de
   arquitectura van en los ADRs del backend.
2. **Trazabilidad de IA (RDOC02).**
   - Un AI log por sesión: `docs/ai_docs/AAAA-MM-DD-<integrante>-<unidad>-<slug>.md`.
   - Un archivo por subtarea en `prompt/tarea-<unidad>/NN-<slug>.md`, con los prompts **literales**.
   - Una fila en `prompt/README.md`.
3. **Ramas y commits.** `feat/<unidad>-<tema>`, con commits convencionales en español y sin tildes en el
   asunto. PR a `main` con revisión de 2 compañeros. El agente no hace push ni mergea.
4. **Honestidad.** Cada log separa Verificado (con comando y cifras), No verificado y Pendiente.
5. **Sin secretos.** Nunca `.env`, tokens ni valores de Auth0 en commits ni en logs. Antes de cada commit:
   `git diff --cached | grep -inE 'amqps?://[^ ]*@|password|secret|token|BEGIN .*PRIVATE KEY'`.
