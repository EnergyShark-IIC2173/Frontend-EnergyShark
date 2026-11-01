import { useEffect } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { Icon } from './ui/Icon'
import { Logo, LogoMark } from './ui/Logo'
import { ThemeSwitch } from './ui/ThemeSwitch'
import { UserMenu } from './ui/UserMenu'
import {
  btnSecondary, divider, labelBase, navItemActive, navItemInactive, surface, textAccent, textError, textPrimary, textSecondary,
} from './ui/classes'

const NAV_ITEMS = [
  { id: 'history', icon: 'history', label: 'Historial de Ciclos' },
  { id: 'distance', icon: 'network', label: 'Conectividad' },
  { id: 'rejected', icon: 'alert', label: 'Errores/NACKs' },
]

const iconButton = `grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl transition-colors duration-150 hover:bg-sand-100 focus-ring dark:hover:bg-sand-800 ${textSecondary}`

// Sidebar al estilo de los chats de LLM (DF-032):
// - desde md es fija (sticky a la altura de la pantalla): solo hace scroll el contenido;
// - se pliega a un riel de íconos animando el ancho (excepción documentada en DF-032) y recuerda el estado;
// - bajo md es un cajón que entra con translate-x desde la barra superior.
// Al pie van el tema y la cuenta.
export function Sidebar({ activeView, onSelect, health, collapsed, onToggle, mobileOpen, onMobileOpen, onMobileClose }) {
  const desktop = useMediaQuery('(min-width: 48rem)')
  const rail = desktop && collapsed
  const hidden = !desktop && !mobileOpen

  useEffect(() => {
    if (!mobileOpen) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onMobileClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, onMobileClose])

  return (
    <>
      <div className={`sticky top-0 z-20 flex items-center gap-2 border-b bg-paper px-3 py-2 md:hidden dark:bg-ink ${divider}`}>
        <button type="button" onClick={onMobileOpen} aria-label="Abrir menú" aria-expanded={mobileOpen} aria-controls="sidebar" className={iconButton}>
          <Icon name="menu" />
        </button>
        <Logo size="sm" />
      </div>

      {mobileOpen ? (
        <div aria-hidden="true" onClick={onMobileClose} className="fixed inset-0 z-30 bg-ink/50 md:hidden motion-safe:animate-fade-in" />
      ) : null}

      <aside
        id="sidebar"
        aria-label="Barra lateral"
        inert={hidden}
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col gap-4 border-r bg-paper p-3 transition-transform duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:bg-ink ${divider}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:sticky md:top-0 md:z-30 md:h-svh md:shrink-0 md:translate-x-0 md:transition-[width] ${rail ? 'md:w-[4.5rem]' : 'md:w-64'}`}
      >
        <div className={`flex min-h-11 items-center gap-2 ${rail ? 'flex-col' : 'justify-between pl-2'}`}>
          {rail ? <LogoMark className="size-8" /> : <Logo size="sm" />}
          {desktop ? (
            <button
              type="button"
              onClick={onToggle}
              aria-label={rail ? 'Expandir barra lateral' : 'Contraer barra lateral'}
              title={rail ? 'Expandir barra lateral' : 'Contraer barra lateral'}
              aria-expanded={!rail}
              aria-controls="sidebar"
              className={iconButton}
            >
              <Icon name="sidebar" />
            </button>
          ) : (
            <button type="button" onClick={onMobileClose} aria-label="Cerrar menú" className={iconButton}>
              <Icon name="close" />
            </button>
          )}
        </div>

        <nav aria-label="Secciones" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {rail ? null : <p className={`px-3 pb-1 ${labelBase}`}>Secciones</p>}
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              aria-current={activeView === item.id ? 'page' : undefined}
              title={rail ? item.label : undefined}
              className={`${activeView === item.id ? navItemActive : navItemInactive} ${rail ? 'justify-center' : ''}`}
            >
              <Icon name={item.icon} />
              <span className={rail ? 'sr-only' : 'truncate motion-safe:animate-fade-in'}>{item.label}</span>
            </button>
          ))}
        </nav>

        <HealthCard {...health} rail={rail} />

        <div className={`flex flex-col gap-1 border-t pt-3 ${divider}`}>
          <ThemeSwitch compact={rail} />
          <UserMenu collapsed={rail} />
        </div>
      </aside>
    </>
  )
}

// Estado de la API (DF-011): el resultado de /health se muestra en la misma tarjeta. En el riel queda un ícono con
// un punto de color y el resultado como texto para lectores de pantalla y en el tooltip.
function HealthCard({ onCheck, status, error, rail }) {
  if (rail) {
    const result = status ? `OK: ${status}` : error ? `Error: ${error}` : null
    return (
      <button type="button" onClick={onCheck} title={result ?? 'Probar /health con token'} className={`relative ${iconButton} w-full`}>
        <Icon name="pulse" className={`size-5 ${textAccent}`} />
        <span className="sr-only">Probar /health con token</span>
        {result ? (
          <>
            <span aria-hidden="true" className={`absolute top-2 right-4 size-2 rounded-full ${status ? 'bg-accent' : 'bg-coral'}`} />
            <span role="status" className="sr-only">{result}</span>
          </>
        ) : null}
      </button>
    )
  }
  return (
    <section aria-label="Estado de la API" className={`rounded-2xl p-4 ${surface}`}>
      <p className={`flex items-center gap-2 ${labelBase}`}>
        <Icon name="pulse" className={`size-4 ${textAccent}`} />
        Estado de la API
      </p>
      <button type="button" onClick={onCheck} className={`${btnSecondary} mt-3 w-full ${textPrimary}`}>
        Probar /health con token
      </button>
      {status ? <p className={`mt-3 font-mono text-xs break-all ${textAccent}`}>OK: {status}</p> : null}
      {error ? <p className={`mt-3 font-mono text-xs break-all ${textError}`}>Error: {error}</p> : null}
    </section>
  )
}
