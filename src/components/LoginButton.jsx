import { useAuth0 } from "@auth0/auth0-react";
import { textPrimary } from "./ui/classes";

// Botón de login (DF-035): claro, con un tramo verde que recorre su borde sin parar. Es un rect SVG con
// pathLength=1 y stroke-dasharray, animado con stroke-dashoffset (la técnica del "dock trace" de StudyLicc): va a
// velocidad constante por todo el perímetro, así siempre se ve. Con "Reducir movimiento", el borde queda verde.
export const LoginButton = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  if (isAuthenticated) return null;
  return (
    <button
      type="button"
      onClick={() => loginWithRedirect()}
      className={`relative flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-sand-200 bg-card px-4 text-sm font-semibold transition-colors duration-150 hover:bg-sand-100 focus-ring motion-reduce:border-accent dark:border-sand-800 dark:bg-sand-900 dark:hover:bg-sand-800 ${textPrimary}`}
    >
      <svg aria-hidden="true" className="pointer-events-none absolute -inset-[2px] h-[calc(100%+4px)] w-[calc(100%+4px)] overflow-visible motion-reduce:hidden">
        <rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="11"
          pathLength="1"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="0.18 0.82"
          className="stroke-accent motion-safe:animate-border-run"
        />
      </svg>
      Iniciar sesión
    </button>
  );
};
