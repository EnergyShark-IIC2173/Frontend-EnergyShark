import { pageItems } from '../../lib/pagination'
import { Icon } from './Icon'
import { textPrimary, textSecondary } from './classes'

const cell = 'grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-xl px-2 text-sm font-semibold tabular-nums transition-colors duration-150 focus-ring disabled:cursor-not-allowed disabled:opacity-40'
const idle = `${cell} ${textPrimary} hover:bg-sand-100 dark:hover:bg-sand-800 disabled:hover:bg-transparent`
const current = `${cell} bg-ink text-paper dark:bg-paper dark:text-ink`

// Paginador único de las vistas con páginas (DF-033, DF-034): primera, anterior, números con elipsis, siguiente y
// última; en el celular, sin números. Va fijo al pie de la vista (sticky), así siempre está a la vista sin bajar
// hasta el fondo. `noun` nombra lo que se cuenta ("ciclos", "mensajes").
export function Pager({ page, totalPages, total, onChange, disabled = false, noun = 'resultados', label = 'Paginación' }) {
  if (!totalPages) return null
  const go = (p) => p !== page && p >= 1 && p <= totalPages && onChange(p)
  return (
    <nav aria-label={label} className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-sand-200 bg-paper/95 px-4 py-2 backdrop-blur-sm md:-mx-8 md:px-8 dark:border-sand-800 dark:bg-ink/95">
      <p className={`text-sm tabular-nums ${textSecondary}`} aria-live="polite">
        Página <span className={`font-semibold ${textPrimary}`}>{page}</span> de {totalPages}
        {total !== undefined ? <> · {total} {noun}</> : null}
      </p>
      {totalPages > 1 ? (
        <ul className="flex items-center gap-1">
          <li className="hidden sm:block">
            <button type="button" className={idle} disabled={disabled || page <= 1} onClick={() => go(1)} aria-label="Primera página" title="Primera página">
              <Icon name="first" className="size-4" />
            </button>
          </li>
          <li>
            <button type="button" className={idle} disabled={disabled || page <= 1} onClick={() => go(page - 1)} aria-label="Página anterior" title="Página anterior">
              <Icon name="prev" className="size-4" />
            </button>
          </li>
          {pageItems(page, totalPages).map((item, i) =>
            item === 'gap' ? (
              <li key={`gap-${i}`} aria-hidden="true" className={`hidden px-1 sm:block ${textSecondary}`}>…</li>
            ) : (
              <li key={item} className="hidden sm:block">
                <button
                  type="button"
                  className={item === page ? current : idle}
                  aria-current={item === page ? 'page' : undefined}
                  aria-label={`Página ${item}`}
                  disabled={disabled && item !== page}
                  onClick={() => go(item)}
                >
                  {item}
                </button>
              </li>
            ),
          )}
          <li className={`px-2 text-sm tabular-nums sm:hidden ${textPrimary}`} aria-hidden="true">{page} / {totalPages}</li>
          <li>
            <button type="button" className={idle} disabled={disabled || page >= totalPages} onClick={() => go(page + 1)} aria-label="Página siguiente" title="Página siguiente">
              <Icon name="next" className="size-4" />
            </button>
          </li>
          <li className="hidden sm:block">
            <button type="button" className={idle} disabled={disabled || page >= totalPages} onClick={() => go(totalPages)} aria-label="Última página" title="Última página">
              <Icon name="last" className="size-4" />
            </button>
          </li>
        </ul>
      ) : null}
    </nav>
  )
}
