import { useAuth0 } from "@auth0/auth0-react";

// https://api.tiburonshark.me en prod; vacío = rutas relativas, que el proxy de Vite manda a master local (DF-022).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// Errores de Auth0 que solo se resuelven volviendo a iniciar sesión.
const RELOGIN_ERRORS = ["login_required", "consent_required"];

// status 0 = no hubo respuesta HTTP (red, CORS). body = cuerpo ya parseado de la respuesta.
export class ApiError extends Error {
  constructor(status, message, body = null, { authRequired = false } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.authRequired = authRequired;
  }
}

// Omite undefined, null y '' para no mandar filtros vacíos (?status=).
export function buildQuery(params = {}) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

// /health responde texto plano "ok" (DF-018): solo se parsea JSON si el content-type lo dice.
async function parseBody(res) {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  if (!isJson) return text;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// master responde {error}; el API Gateway, {message}.
function errorMessage(body, status) {
  if (body && typeof body === "object") return body.error || body.message || `Error ${status}`;
  return `Error ${status}`;
}

export function useApiClient() {
  const { getAccessTokenSilently } = useAuth0();

  async function apiFetch(path, options = {}) {
    // getAccessTokenSilently cachea el token y lo renueva solo cuando expira
    // (usa el refresh token por debajo) — no hay que manejar expiración a mano.
    let token;
    try {
      token = await getAccessTokenSilently();
    } catch (err) {
      if (RELOGIN_ERRORS.includes(err?.error)) {
        throw new ApiError(401, "La sesión expiró. Vuelve a iniciar sesión.", null, { authRequired: true });
      }
      throw err;
    }

    let res;
    try {
      res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          // Content-Type solo con body: un GET sin él no necesita preflight por ese header.
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      throw new ApiError(0, "No se pudo conectar con la API (red o CORS).");
    }

    const body = await parseBody(res);
    if (!res.ok) throw new ApiError(res.status, errorMessage(body, res.status), body);
    return body;
  }

  return { apiFetch };
}
