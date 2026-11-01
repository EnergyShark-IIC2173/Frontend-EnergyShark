import { Icon } from './Icon'

// Tonos semánticos (DF-030). En claro, tinte al 10 % del tono pleno; en oscuro, el chip `*-soft`.
// error y warning llevan ícono: un estado nunca depende solo del color.
const tones = {
  active: 'bg-accent/10 text-accent-ink dark:bg-accent-soft dark:text-accent',
  settled: 'bg-accent text-ink',
  error: 'bg-coral/10 text-coral-ink dark:bg-coral/15 dark:text-coral',
  warning: 'bg-rose/10 text-rose-ink dark:bg-rose-soft dark:text-rose',
  category: 'bg-lavender/10 text-lavender-ink dark:bg-lavender-soft dark:text-lavender',
  neutral: 'bg-sand-100 text-sand-600 dark:bg-sand-800 dark:text-sand-300',
}

const icons = { error: 'alert', warning: 'warning', settled: 'check' }

export function Badge({ tone = 'neutral', className = '', children }) {
  const icon = icons[tone]
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-sans text-xs font-semibold whitespace-nowrap tabular-nums ${tones[tone] ?? tones.neutral} ${className}`}>
      {icon ? <Icon name={icon} className="size-3.5" /> : null}
      {children}
    </span>
  )
}
