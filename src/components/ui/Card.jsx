import { surface } from './classes'

// Tarjeta opaca, borde de 1 px y sin sombra (DF-030). `highlight` marca el ciclo más reciente con el borde en acento.
export function Card({ as: Tag = 'div', highlight = false, padded = true, className = '', children }) {
  return (
    <Tag className={`relative overflow-hidden rounded-2xl ${surface} ${highlight ? 'border-accent dark:border-accent' : ''} ${padded ? 'p-6' : ''} ${className}`}>
      {children}
    </Tag>
  )
}
