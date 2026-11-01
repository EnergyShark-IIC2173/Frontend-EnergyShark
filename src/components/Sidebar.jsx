import { Icon } from './ui/Icon'
import { Logo } from './ui/Logo'
import { ThemeSwitch } from './ui/ThemeSwitch'
import { UserMenu } from './ui/UserMenu'
import { btnSecondary, divider, labelBase, navItemActive, navItemInactive, surface, textAccent, textError } from './ui/classes'

const NAV_ITEMS = [
  { id: 'history', icon: 'history', label: 'Historial de Ciclos' },
  { id: 'distance', icon: 'network', label: 'Conectividad' },
  { id: 'rejected', icon: 'alert', label: 'Errores/NACKs' },
]

// Sidebar al estilo de los chats de LLM (DF-032): logo arriba, secciones, prueba de /health y, al pie, el tema y la
// cuenta. Sin header superior.
export function Sidebar({ activeView, onSelect, health }) {
  return (
    <aside className={`flex flex-col gap-4 border-b bg-paper p-3 md:w-64 md:shrink-0 md:border-r md:border-b-0 dark:bg-ink ${divider}`}>
      <div className="flex min-h-11 items-center px-2">
        <Logo size="sm" />
      </div>

      <nav aria-label="Secciones" className="flex flex-col gap-1">
        <p className={`px-3 pb-1 ${labelBase}`}>Secciones</p>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={activeView === item.id ? 'page' : undefined}
            className={activeView === item.id ? navItemActive : navItemInactive}
          >
            <Icon name={item.icon} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      <HealthCard {...health} />

      <div className={`flex flex-col gap-1 border-t pt-3 ${divider}`}>
        <ThemeSwitch />
        <UserMenu />
      </div>
    </aside>
  )
}

// Estado de la API (DF-011): el resultado de /health se muestra en la misma tarjeta.
function HealthCard({ onCheck, status, error }) {
  return (
    <section aria-label="Estado de la API" className={`rounded-2xl p-4 ${surface}`}>
      <p className={`flex items-center gap-2 ${labelBase}`}>
        <Icon name="pulse" className={`size-4 ${textAccent}`} />
        Estado de la API
      </p>
      <button type="button" onClick={onCheck} className={`${btnSecondary} mt-3 w-full`}>
        Probar /health con token
      </button>
      {status ? <p className={`mt-3 font-mono text-xs break-all ${textAccent}`}>OK: {status}</p> : null}
      {error ? <p className={`mt-3 font-mono text-xs break-all ${textError}`}>Error: {error}</p> : null}
    </section>
  )
}
