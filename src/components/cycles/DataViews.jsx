import { Badge } from '../ui/Badge'
import { labelBase, textPrimary, textSecondary } from '../ui/classes'

// Piezas de lectura del detalle (DF-033): tabla de datos y lista de clave/valor.

// columns: [{ key, label, unit?, align?: 'right', mono?, render(row) }]. La fila con `highlight(row)` true se marca
// como última operación aplicada (DF-027). Unidades en el encabezado, cifras a la derecha y con tabular-nums.
export function DataTable({ caption, columns, rows, rowKey, highlight, empty, footer }) {
  if (!rows?.length) return <p className={`text-sm ${textSecondary}`}>{empty}</p>
  return (
    <div className="overflow-x-auto rounded-xl border border-sand-200 dark:border-sand-800">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-sand-100 dark:bg-sand-800">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={`px-4 py-2.5 text-xs font-medium tracking-wider whitespace-nowrap uppercase ${textSecondary} ${c.align === 'right' ? 'text-right' : ''}`}>
                {c.label}
                {c.unit ? <span className="ml-1 normal-case">({c.unit})</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const marked = highlight?.(row)
            return (
              <tr
                key={rowKey(row)}
                data-last-op={marked ? '' : undefined}
                className={`border-t border-sand-200 dark:border-sand-800 ${marked ? 'bg-accent/10 shadow-[inset_3px_0_0_var(--color-accent)] dark:bg-accent-soft' : ''}`}
              >
                {columns.map((c, i) => (
                  <td key={c.key} className={`px-4 py-3 align-top ${c.align === 'right' ? 'text-right tabular-nums whitespace-nowrap' : ''} ${c.mono ? 'font-mono text-xs' : ''} ${i === 0 ? `font-semibold ${textPrimary}` : textPrimary}`}>
                    {c.render(row)}
                    {i === 0 && marked ? <Badge tone="settled" className="ml-2">Última operación</Badge> : null}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
        {footer ? <tfoot className="border-t-2 border-sand-200 bg-sand-100/60 dark:border-sand-800 dark:bg-sand-800/60">{footer}</tfoot> : null}
      </table>
    </div>
  )
}

// items: [[label, value, { tone?, hint? }]]. Valores grandes y legibles; la etiqueta arriba.
export function KeyValues({ items, columns = 'sm:grid-cols-2 lg:grid-cols-3', highlighted = false }) {
  return (
    <dl
      data-last-op={highlighted ? '' : undefined}
      className={`grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-sand-200 bg-sand-200 dark:border-sand-800 dark:bg-sand-800 ${columns} ${highlighted ? 'ring-2 ring-accent' : ''}`}
    >
      {items.filter(Boolean).map(([label, value, opts = {}]) => (
        <div key={label} className="bg-card px-4 py-3 dark:bg-sand-900">
          <dt className={labelBase}>{label}</dt>
          <dd className={`mt-1 text-base font-semibold tabular-nums ${opts.tone ?? textPrimary}`}>{value}</dd>
          {opts.hint ? <dd className={`mt-0.5 text-xs ${textSecondary}`}>{opts.hint}</dd> : null}
        </div>
      ))}
    </dl>
  )
}

export function Section({ title, aside, children }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={`font-display text-base font-bold ${textPrimary}`}>{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  )
}
