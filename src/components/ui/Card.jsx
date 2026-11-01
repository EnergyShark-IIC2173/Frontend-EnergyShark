// Sin `surface` de classes.js: el color del borde depende de `highlight` y dos clases de borde no se pueden pisar.

// Tarjeta opaca, borde de 1 px y sin sombra (DF-030). `highlight` marca el ciclo más reciente con el borde en acento.
export function Card({ as: Tag = 'div', highlight = false, padded = true, className = '', style, children }) {
  return (
    <Tag className={`relative overflow-hidden rounded-2xl border bg-card edge-light dark:bg-sand-900 ${highlight ? 'border-accent' : 'border-sand-200 dark:border-sand-800'} ${padded ? 'p-6' : ''} ${className}`} style={style}>
      {children}
    </Tag>
  )
}
