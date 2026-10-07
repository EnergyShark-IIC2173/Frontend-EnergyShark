import { btnSecondary } from './classes'

const btn = `${btnSecondary} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent`

// Paginador de las respuestas {page, totalPages, total} de master. Sin estado propio (DF-010).
export function Pagination({ page, totalPages, total, onChange, disabled = false }) {
  if (!totalPages || totalPages <= 1) return null
  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-text tabular-nums" aria-live="polite">
        Página {page} de {totalPages}
        {total !== undefined ? <span className="text-muted"> · {total} en total</span> : null}
      </p>
      <div className="flex gap-2">
        <button type="button" className={btn} disabled={disabled || page <= 1} onClick={() => onChange(page - 1)}>
          Anterior
        </button>
        <button type="button" className={btn} disabled={disabled || page >= totalPages} onClick={() => onChange(page + 1)}>
          Siguiente
        </button>
      </div>
    </nav>
  )
}
