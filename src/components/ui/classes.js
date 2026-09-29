// Clases compartidas del rediseño V6 (DF-010). Solo presentación: sin lógica.

export const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

const btnBase = `inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-[background-color,filter,transform] duration-150 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 ${focusRing}`

export const btnPrimary = `${btnBase} bg-linear-to-r from-accent-from to-accent-to text-panel shadow-card hover:brightness-110`
export const btnSecondary = `${btnBase} border border-border text-text-h hover:bg-surface-hover`

const navItem = `flex shrink-0 cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium whitespace-nowrap transition-[background-color,color] motion-reduce:transition-none md:w-full ${focusRing}`

export const navItemActive = `${navItem} bg-surface-hover text-text-h shadow-[inset_0_-2px_0_var(--color-accent)] md:shadow-[inset_3px_0_0_var(--color-accent)]`
export const navItemInactive = `${navItem} text-text hover:bg-surface-hover hover:text-text-h`

export const labelBase = 'text-xs font-semibold uppercase tracking-widest text-muted'

export const inputBase = 'h-11 w-full rounded-xl border border-border bg-panel px-3 py-2.5 text-sm text-text-h transition-colors focus:border-accent focus:ring-2 focus:ring-accent/40 focus:outline-none motion-reduce:transition-none'

export const th = 'px-5 py-3 text-left text-xs font-semibold whitespace-nowrap uppercase tracking-widest text-muted'
export const td = 'px-5 py-4 text-sm'
export const tr = 'border-t border-border transition-colors hover:bg-surface-hover motion-reduce:transition-none'
