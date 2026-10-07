import { Icon } from './Icon'
import { labelBase } from './classes'

const tones = {
  cyan: 'bg-accent/15 text-accent',
  pink: 'bg-pink/15 text-pink-soft',
  violet: 'bg-violet/25 text-text-h',
  orange: 'bg-orange/15 text-orange-soft',
}

export function StatTile({ label, value, unit, tone = 'cyan', icon = 'bolt' }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-bg p-4">
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
        <Icon name={icon} />
      </span>
      <div className="min-w-0">
        <p className={labelBase}>{label}</p>
        <p className="mt-1 text-xl font-semibold text-text-h tabular-nums">
          {value} <span className="text-sm font-normal text-text">{unit}</span>
        </p>
      </div>
    </div>
  )
}
