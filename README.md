# EnergyShark: frontend (E2, IIC2173)

SPA del panel de operación del nodo de energía de la ciudad (TiburonShark): login con Auth0 y siete vistas
sobre la API del backend, para el mercado entre ciudades del protocolo v3.

| | |
|---|---|
| **App** | `https://app.tiburonshark.me` (S3 + CloudFront) |
| **API** | `https://api.tiburonshark.me` · repo [`EnergyShark-IIC2173/EnergyShark`](https://github.com/EnergyShark-IIC2173/EnergyShark) |
| **Contrato de la API** | `openapi.yaml` del repo [`EnergyShark-IIC2173/contratos`](https://github.com/EnergyShark-IIC2173/contratos) |
| **Contexto para personas y agentes de IA** | `AGENTS.md` de este repo y el org-level en `contratos` |

## Qué hace

| Vista | Qué muestra | Endpoint | Requisito |
|---|---|---|---|
| Login | Inicio de sesión con Auth0. La sesión sobrevive a recargar la página (refresh tokens, DF-023) | — | G06, G07 |
| Historial de ciclos | Por ciclo: status-statement, financiamiento, oferta y sus actualizaciones, bids enviados y recibidos con resultado, swaps con estado final y transporte, `imbalance-settlement`, reporte y la **última operación aplicada** | `GET /api/cycles`, `GET /api/cycles/{cycleId}` | RF01 |
| Mercado | Libro de ofertas de `market.{CODE}`: precio, `remaining`, transporte por kWh, precio efectivo (calculado por master) y rutas deshabilitadas marcadas | `GET /api/market/book`, `GET /api/distance-table` | RF02 |
| Estrategia | Versión vigente, formulario de una versión nueva (precio y cantidad de la oferta, políticas, span), historial y swaps en curso. Aplica desde el siguiente ciclo | `GET/POST /api/strategy`, `GET /api/strategy/versions`, `GET /api/swaps?status=open` | RF04, AD6 |
| Experimento span | Por ciclo (span usado según `cycle_strategy`, déficit, cubierto, costo efectivo vs baseline, bids rechazados) y agregado por valor de span | `GET /api/metrics/cycles`, `GET /api/metrics/spans` | RF06, AD6 |
| Saldo | Ledger local frente a la wallet (CR y KWH), delta y operaciones abiertas de la última reconciliación | `GET /api/balance` | AD5 |
| Conectividad | La distance-table vigente (rige la última), con transporte por kWh y la tarifa punitiva de las rutas caídas | `GET /api/distance-table` | RF02 |
| Errores / NACKs | Duplicados, NACKs y descartes, también los de pares (`IDENTITY_MISMATCH`), con cola de origen y remitente; filtros por tipo, razón y cola | `GET /api/messages/rejected` | RF05 |

Todas las llamadas a la API llevan el JWT de Auth0. Las vistas se actualizan solas (polling) y
muestran estados de carga, vacío y error. El reloj del ciclo vive en la sidebar (DF-044).

**Stack:** React 19, Vite 8, Tailwind CSS 4, `@auth0/auth0-react`.

## Estructura

```
src/api/          cliente HTTP con el token (client.js), una función por endpoint (endpoints.js), useApiQuery
src/auth/         Auth0Provider (refresh tokens en localStorage)
src/components/   las vistas, cycles/ y strategy/ (piezas de cada vista) y ui/ (presentación, sin estado)
src/lib/          lógica pura con tests: ciclos, libro de ofertas, estrategia, experimento, saldo, formato
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

- **Contra el backend local:** `VITE_API_BASE_URL` vacío y master levantado en `:3001` según el README del
  backend. No hay mocks (se retiraron en S23, DF-045): sin backend, las vistas muestran el error.
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
