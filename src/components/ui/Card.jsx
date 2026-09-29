export function Card({ as: Tag = 'div', highlight = false, padded = true, className = '', children }) {
  return (
    <Tag className={`relative overflow-hidden rounded-2xl bg-surface shadow-card ${padded ? 'p-6' : ''} ${className}`}>
      {highlight && (
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-pink to-magenta" />
      )}
      {children}
    </Tag>
  )
}
