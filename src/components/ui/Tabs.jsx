import { useRef } from 'react'
import { textPrimary, textSecondary } from './classes'

// Pestañas accesibles (DF-033): role tablist/tab, activación con las flechas, Home y End; solo la pestaña activa
// entra al orden del Tab. Cada panel va en un `TabPanel`.
export function Tabs({ tabs, value, onChange, idPrefix, label }) {
  const listRef = useRef(null)

  function onKeyDown(e) {
    const index = tabs.findIndex((t) => t.id === value)
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    const target = tabs[(next + tabs.length) % tabs.length]
    onChange(target.id)
    listRef.current?.querySelector(`#${idPrefix}-tab-${target.id}`)?.focus()
  }

  return (
    <div ref={listRef} role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex gap-1 overflow-x-auto border-b border-sand-200 dark:border-sand-800">
      {tabs.map((tab) => {
        const active = tab.id === value
        return (
          <button
            key={tab.id}
            id={`${idPrefix}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`relative -mb-px flex min-h-11 shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3 text-sm font-semibold whitespace-nowrap transition-colors duration-150 focus-ring-inset ${
              active ? `border-accent ${textPrimary}` : `border-transparent ${textSecondary} hover:text-ink dark:hover:text-paper`
            }`}
          >
            {tab.label}
            {tab.count != null ? (
              <span className="rounded-md bg-sand-100 px-1.5 text-xs tabular-nums dark:bg-sand-800">{tab.count}</span>
            ) : null}
            {tab.marked ? <span aria-label="tiene la última operación" className="size-2 rounded-full bg-accent" /> : null}
          </button>
        )
      })}
    </div>
  )
}

// Panel de la pestaña activa, enlazado con su pestaña.
export function TabPanel({ idPrefix, id, className = '', children }) {
  return (
    <div id={`${idPrefix}-panel-${id}`} role="tabpanel" aria-labelledby={`${idPrefix}-tab-${id}`} tabIndex={0} className={className}>
      {children}
    </div>
  )
}
