import { btnSecondary } from './classes'

// Título de vista con acciones a la derecha (filtros, "Actualizar").
export function ViewHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-2xl font-semibold tracking-tight text-text-h">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-text">{subtitle}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-end gap-3">{children}</div> : null}
    </div>
  )
}

export function RefreshButton({ onClick, loading = false }) {
  return (
    <button type="button" onClick={onClick} disabled={loading} className={`${btnSecondary} h-11 disabled:cursor-wait disabled:opacity-60`}>
      {loading ? 'Actualizando…' : 'Actualizar'}
    </button>
  )
}
