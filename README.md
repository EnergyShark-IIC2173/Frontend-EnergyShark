# EnergyShark: frontend (E1, IIC2173)

SPA del panel de operación del nodo de energía de la ciudad: login con Auth0 y cuatro vistas sobre
la API del backend.

| | |
|---|---|
| **App** | `https://app.tiburonshark.me` (S3 + CloudFront) |
| **API** | `https://api.tiburonshark.me` · repo [`EnergyShark-IIC2173/EnergyShark`](https://github.com/EnergyShark-IIC2173/EnergyShark) |
| **Contrato de la API** | `openapi.yaml` del repo [`EnergyShark-IIC2173/contratos`](https://github.com/EnergyShark-IIC2173/contratos) |
| **Contexto para personas y agentes de IA** | `AGENTS.md` de este repo y el org-level en `contratos` |

## Qué hace

| Vista | Qué muestra | Requisito |
|---|---|---|
| Login (V1) | Inicio de sesión con Auth0. La sesión sobrevive a recargar la página (refresh tokens, DF-023) | G06 |
| Historial de ciclos (V2) | Por ciclo: status-statement, transfers, demand-statements, negociaciones, reporte enviado, balances finales y la última operación aplicada | RF01 |
| Conectividad (V3) | La distance-table vigente: destino, distancia, `transportCost` y si está habilitado | RF02 |
| Negociaciones (V4) | Crear una propuesta en la ventana abierta y seguir su confirmación y pago; historial con estado final | RF04 |
| Errores / NACKs (V5) | Duplicados, NACKs y mensajes descartados, filtrables | RF05 |

Todas las llamadas a la API llevan el JWT de Auth0. Las vistas se actualizan solas (polling) y
muestran estados de carga, vacío y error. El diseño (V6) usa Tailwind CSS v4.

**Stack:** React 19, Vite 8, Tailwind CSS 4, `@auth0/auth0-react`.

## Estructura

```
src/api/          cliente HTTP con el token (client.js), una función por endpoint (endpoints.js), useApiQuery
src/auth/         Auth0Provider (refresh tokens en localStorage)
src/components/   las vistas V2–V5 y ui/ (componentes de presentación, sin estado)
src/lib/          lógica pura con tests: ciclos, formato, validación de propuestas
docs/             decisiones del front (decisiones-frontend.md, DF-001…), deploy, diseño, AI logs (ai_docs/)
prompt/           prompts literales de cada subtarea hecha con IA (RDOC02)
```

## Correr en local

Requisitos: Node.js 22.12 o superior (Vite 8 también acepta 20.19+).

```bash
cp .env.example .env     # completar las 4 VITE_* (ver abajo). Nunca commitear .env
npm ci
npm run dev              # http://localhost:5173
```

| Variable | Valor | Nota |
|---|---|---|
| `VITE_AUTH0_DOMAIN` | dominio del tenant de Auth0 | |
| `VITE_AUTH0_CLIENT_ID` | client id de la aplicación SPA en Auth0 | |
| `VITE_AUTH0_AUDIENCE` | `https://api.energyshark.internal` | Tiene que ser igual al audience del API Gateway y al `AUTH0_AUDIENCE` de master |
| `VITE_API_BASE_URL` | vacío, o `https://api.tiburonshark.me` | Vacío: el proxy de Vite manda `/api` y `/health` a master local en `:3001` |

- **Contra el backend local:** `VITE_API_BASE_URL` vacío y el backend levantado según su README
  (`docker compose up`).
- **Contra la API en producción:** `VITE_API_BASE_URL=https://api.tiburonshark.me`. Funciona desde
  `localhost:5173`, que está permitido en el CORS del Gateway y en Auth0. Usa ese puerto.
- Vite lee las variables **al construir**: si cambias el `.env`, reinicia `npm run dev`.

## Calidad

```bash
npm run lint     # ESLint
npm test         # tests de src/lib con node --test
npm run build    # build de producción en dist/
```

## Deploy

S3 + CloudFront (RNF03): [`docs/deploy.md`](docs/deploy.md). **No te saltes la invalidación de
CloudFront**: sin ella sigue saliendo la versión anterior.

## Seguridad

Nunca commitear `.env`. Los valores de `VITE_*` terminan dentro del bundle público (no son secretos),
pero el `.env` local puede traer otros datos. La sesión vive en `localStorage` (DF-023): no agregar
scripts de terceros.
