import { useState } from 'react'
import { initials } from '../../lib/user'

// Foto del usuario de Auth0 (DF-032). Si no hay foto o no carga, sus iniciales sobre el acento. Decorativa: el
// nombre siempre va como texto al lado o en el nombre accesible del botón.
export function Avatar({ src, name, className = 'size-8' }) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) {
    return <img src={src} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} className={`shrink-0 rounded-full object-cover ${className}`} />
  }
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-ink ${className}`}>
      {initials(name)}
    </span>
  )
}
