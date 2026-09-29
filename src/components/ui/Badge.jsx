const tones = {
  cyan: 'bg-accent/15 text-accent',
  pink: 'bg-pink/15 text-pink-soft',
  orange: 'bg-orange/15 text-orange-soft',
  success: 'bg-success/15 text-success',
  neutral: 'bg-white/10 text-text-h',
}

export function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap tabular-nums ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}
