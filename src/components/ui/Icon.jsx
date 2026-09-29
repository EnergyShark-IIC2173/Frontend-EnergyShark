// Íconos decorativos dibujados a mano (DF-010): sin dependencias y siempre aria-hidden
const paths = {
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 2.6-6.4" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  network: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="M8.5 6h7M7.3 8.2l3.4 7.6M16.7 8.2l-3.4 7.6" />
    </>
  ),
  handshake: (
    <>
      <path d="M4 8h14l-3-3" />
      <path d="M20 16H6l3 3" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2 20h20Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  pulse: <path d="M3 12h4l3-7 4 14 3-7h4" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />,
  wallet: (
    <>
      <path d="M4 7a2 2 0 0 1 2-2h12v4" />
      <path d="M4 7v10a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2Z" />
      <path d="M16 14h.01" />
    </>
  ),
  battery: (
    <>
      <rect x="3" y="7" width="16" height="10" rx="2" />
      <path d="M22 11v2M7 10v4M11 10v4" />
    </>
  ),
  logout: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="m10 17 5-5-5-5M15 12H3" />
    </>
  ),
  plug: (
    <>
      <path d="M9 3v5M15 3v5" />
      <path d="M6 8h12v3a6 6 0 0 1-12 0Z" />
      <path d="M12 17v4" />
    </>
  ),
}

export function Icon({ name, className = 'size-5' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name]}
    </svg>
  )
}
