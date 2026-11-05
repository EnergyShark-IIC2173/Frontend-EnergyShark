import { useSyncExternalStore } from 'react'
import { getResolvedTheme, setTheme, subscribeTheme } from '../../lib/theme'
import { Icon } from './Icon'
import { textSecondary } from './classes'

// Switch "Modo oscuro" (DF-030). aria-checked sale del store del tema; la posición del thumb y los colores salen
// solo de `dark:`, así coinciden con la clase de <html> desde el primer paint. En el riel de la sidebar (`compact`)
// el texto queda solo para lectores de pantalla y sigue siendo el nombre accesible (DF-032).
export function ThemeSwitch({ compact = false }) {
  const theme = useSyncExternalStore(subscribeTheme, getResolvedTheme, () => 'light')
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      title="Modo oscuro"
      className={`flex min-h-11 w-full cursor-pointer items-center gap-3 overflow-hidden ${compact ? 'justify-center' : 'justify-between'} rounded-xl px-2 text-sm font-medium transition-colors duration-150 hover:bg-sand-100 focus-ring dark:hover:bg-sand-800 ${textSecondary}`}
    >
      <span className={compact ? 'sr-only' : 'whitespace-nowrap'}>Modo oscuro</span>
      <span aria-hidden="true" className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-sand-200 bg-sand-100 transition-colors duration-200 dark:border-sand-700 dark:bg-accent-soft">
        <span className="absolute left-0.5 grid size-6 place-items-center rounded-full bg-card text-sand-600 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:translate-x-5 dark:bg-accent dark:text-ink">
          <Icon name="sun" className="size-3.5 dark:hidden" />
          <Icon name="moon" className="hidden size-3.5 dark:block" />
        </span>
      </span>
    </button>
  )
}
