// Logo de EnergyShark (DF-030): isotipo propio (una aleta sobre una línea de agua) y wordmark tipográfico. Es la
// técnica del logo de StudyLicc, sin su marca. La aleta va en `accent` con trazo en tinta, que sobre el fondo oscuro
// se funde solo; la onda usa el color del texto. `public/favicon.svg` repite estos paths.

export const FIN_PATH = 'M4.5 20.25C7.5 12.5 12.5 6.25 21.75 3.75C19.25 9.25 19 14.75 22.75 20.25Z'
export const WAVE_PATH = 'M2 24.25C4 22.75 6 22.75 8 24.25S12 25.75 14 24.25S18 22.75 20 24.25S24 25.75 26 24.25'

const SIZES = {
  sm: { mark: 'size-8', text: 'text-lg', gap: 'gap-2' },
  xl: { mark: 'size-16', text: 'text-3xl sm:text-4xl', gap: 'gap-3' },
}

export function LogoMark({ className = 'size-8', label }) {
  return (
    <svg
      viewBox="0 0 28 28"
      className={`shrink-0 ${className}`}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <path d={FIN_PATH} className="fill-accent stroke-ink" strokeWidth={1.5} strokeLinejoin="round" />
      <path d={WAVE_PATH} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// El wordmark es texto real en mayúsculas por CSS: el lector de pantalla lee "EnergyShark", no letra por letra.
export function Logo({ size = 'sm', as: Tag = 'span', className = '' }) {
  const s = SIZES[size]
  return (
    <Tag className={`inline-flex items-center ${s.gap} text-ink dark:text-paper ${className}`}>
      <LogoMark className={s.mark} />
      <span className={`font-display leading-none font-bold tracking-[-0.02em] uppercase ${s.text}`}>EnergyShark</span>
    </Tag>
  )
}
