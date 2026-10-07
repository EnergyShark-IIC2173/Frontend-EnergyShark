import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  if (!(domain && clientId && audience)) {
    console.error("Faltan variables VITE_AUTH0_* en el .env del frontend");
    return null;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience,
      }}
      // Sesión que sobrevive a recargar la página. Sin refresh tokens, renovar el token depende de un
      // iframe con cookies de terceros hacia auth0.com, que Safari/Brave (y cada vez más Chrome)
      // bloquean: se recarga y aparece deslogueado. localstorage es lo que permite recuperarlo tras
      // recargar; el costo es que un XSS podría leerlo (no hay scripts de terceros y React escapa).
      // Fallback al iframe mientras Auth0 no tenga Refresh Token Rotation activado.
      useRefreshTokens
      useRefreshTokensFallback
      cacheLocation="localstorage"
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};