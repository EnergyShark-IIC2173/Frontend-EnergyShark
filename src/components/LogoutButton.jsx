import { useAuth0 } from "@auth0/auth0-react";

export const LogoutButton = () => {
  const { logout, isAuthenticated } = useAuth0();
  if (!isAuthenticated) return null;
  return (
    <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} className="cursor-pointer rounded-lg border border-accent/50 bg-accent/12 px-5 py-2.5 font-sans text-[16px] leading-[normal] font-semibold tracking-normal text-accent [transition:background_0.2s,transform_0.1s] hover:bg-accent hover:text-bg active:scale-[0.98]">
      Cerrar sesión
    </button>
  );
};
