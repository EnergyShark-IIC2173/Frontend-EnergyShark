// Clases compartidas de la estética StudyLicc (DF-030, guía en docs/design/sistema-visual.md). Solo presentación.
// Cada clase trae su par `dark:` por rol de token: fondo, superficie, elevada, texto, secundario y borde.

export const textPrimary = 'text-ink dark:text-paper'
export const textSecondary = 'text-sand-600 dark:text-sand-400'
export const textAccent = 'text-accent-ink dark:text-accent'
export const textError = 'text-coral-ink dark:text-coral'

export const surface = 'border border-sand-200 bg-card edge-light dark:border-sand-800 dark:bg-sand-900'
export const surfaceSoft = 'bg-sand-100 dark:bg-sand-800'
export const divider = 'border-sand-200 dark:border-sand-800'

export const btnBase = 'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus-ring motion-safe:active:scale-[0.98] motion-reduce:transition-none'

export const btnPrimary = `${btnBase} bg-accent text-ink hover:bg-accent-hover`
export const btnSecondary = `${btnBase} border border-sand-200 bg-card ${textPrimary} hover:bg-sand-100 dark:border-sand-800 dark:bg-sand-900 dark:hover:bg-sand-800`

const navItem = 'flex min-h-11 shrink-0 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-ring motion-reduce:transition-none md:w-full'

export const navItemActive = `${navItem} bg-sand-100 ${textPrimary} dark:bg-sand-800 [&>svg]:text-accent-ink dark:[&>svg]:text-accent`
export const navItemInactive = `${navItem} ${textSecondary} hover:bg-sand-100 hover:text-ink dark:hover:bg-sand-800 dark:hover:text-paper`

// Rótulos chicos de campos y columnas. Los títulos de sección usan `sectionTitle`.
export const labelBase = `text-xs font-medium uppercase tracking-wider ${textSecondary}`
export const sectionTitle = `font-display text-base font-bold ${textPrimary}`

export const inputBase = `min-h-11 w-full rounded-xl border border-sand-200 bg-card px-3 py-2 text-sm ${textPrimary} transition-colors focus-ring motion-reduce:transition-none dark:border-sand-800 dark:bg-sand-900`

export const th = `px-5 py-3 text-left text-xs font-medium whitespace-nowrap uppercase tracking-wider ${textSecondary}`
export const td = 'px-5 py-4 text-sm'
export const tr = `border-t ${divider} transition-colors hover:bg-sand-100 motion-reduce:transition-none dark:hover:bg-sand-800`
