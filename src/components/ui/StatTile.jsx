import { Icon } from './Icon'
import { labelBase, surfaceSoft, textPrimary, textSecondary } from './classes'

const tones = {
  active: 'bg-accent/10 text-accent-ink dark:bg-accent-soft dark:text-accent',
  category: 'bg-lavender/10 text-lavender-ink dark:bg-lavender-soft dark:text-lavender',
  warning: 'bg-rose/10 text-rose-ink dark:bg-rose-soft dark:text-rose',
  neutral: 'bg-card text-sand-600 dark:bg-sand-900 dark:text-sand-300',
}

export function StatTile({ label, value, unit, tone = 'active', icon = 'bolt' }) {
  return (
    <div className={`flex items-center gap-4 rounded-xl p-4 ${surfaceSoft}`}>
      <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${tones[tone] ?? tones.active}`}>
        <Icon name={icon} />
      </span>
      <div className="min-w-0">
        <p className={labelBase}>{label}</p>
        <p className={`mt-1 font-display text-xl font-bold tabular-nums ${textPrimary}`}>
          {value} <span className={`font-sans text-sm font-normal ${textSecondary}`}>{unit}</span>
        </p>
      </div>
    </div>
  )
}
