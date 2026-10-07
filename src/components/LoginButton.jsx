import { useAuth0 } from "@auth0/auth0-react";
import { btnPrimary } from "./ui/classes";

export const LoginButton = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  if (isAuthenticated) return null;
  return <button onClick={() => loginWithRedirect()} className={`${btnPrimary} w-full`}>Iniciar sesión</button>;
};