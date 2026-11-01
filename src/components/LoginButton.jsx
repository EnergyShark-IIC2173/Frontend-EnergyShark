import { useAuth0 } from "@auth0/auth0-react";
import { textPrimary } from "./ui/classes";

// Botón de login: claro con un borde verde quieto de 2 px (DF-035; sin el trazo animado desde DF-037).
export const LoginButton = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  if (isAuthenticated) return null;
  return (
    <button
      type="button"
      onClick={() => loginWithRedirect()}
      className={`flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-accent bg-card px-4 text-sm font-semibold transition-colors duration-150 hover:bg-accent/10 focus-ring dark:bg-sand-900 dark:hover:bg-accent-soft ${textPrimary}`}
    >
      Iniciar sesión
    </button>
  );
};
