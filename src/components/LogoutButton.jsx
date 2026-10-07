import { useAuth0 } from "@auth0/auth0-react";
import { btnSecondary } from "./ui/classes";
import { Icon } from "./ui/Icon";

export const LogoutButton = () => {
  const { logout, isAuthenticated } = useAuth0();
  if (!isAuthenticated) return null;
  return (
    <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} className={`${btnSecondary} whitespace-nowrap`}>
      <Icon name="logout" className="size-4" />
      Cerrar sesión
    </button>
  );
};
