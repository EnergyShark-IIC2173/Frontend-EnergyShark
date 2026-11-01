import { btnSecondary, textPrimary, textSecondary } from './classes'

// Título de vista con acciones a la derecha (filtros, "Actualizar"). `title` acepta nodos para subrayar con
// `.marker` una palabra clave por vista (DF-030).
export function ViewHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className={`font-display text-2xl font-bold tracking-[-0.01em] sm:text-3xl ${textPrimary}`}>{title}</h2>
        {subtitle ? <p className={`mt-1 text-sm ${textSecondary}`}>{subtitle}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-end gap-3">{children}</div> : null}
    </div>
  )
}

export function Marker({ children }) {
  return <span className="marker">{children}</span>
}

export function RefreshButton({ onClick, loading = false }) {
  return (
    <button type="button" onClick={onClick} disabled={loading} className={`${btnSecondary} disabled:cursor-wait disabled:opacity-60`}>
      {loading ? 'Actualizando…' : 'Actualizar'}
    </button>
  )
}
