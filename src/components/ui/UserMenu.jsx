import { useEffect, useRef, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { displayName } from '../../lib/user'
import { Avatar } from './Avatar'
import { Icon } from './Icon'
import { surface, textPrimary, textSecondary } from './classes'

// Cuenta al pie de la sidebar, como en los chats de LLM (DF-032): foto y nombre; al apretar, un menú con
// "Cerrar sesión". Se cierra con Escape (el foco vuelve al botón) o apretando afuera.
// `collapsed`: en el riel solo se ve la foto y el menú sale hacia la derecha.
export function UserMenu({ collapsed = false }) {
  const { user, logout } = useAuth0()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const itemRef = useRef(null)
  const name = displayName(user)

  useEffect(() => {
    if (!open) return undefined
    itemRef.current?.focus()
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      {open ? (
        <div
          role="menu"
          aria-label="Cuenta"
          className={`absolute z-30 min-w-48 rounded-xl p-1 shadow-[var(--shadow-pop)] motion-safe:animate-pop-in ${surface} ${collapsed ? 'bottom-0 left-full ml-3' : 'right-0 bottom-full left-0 mb-2'}`}
        >
          <p className={`truncate px-3 pt-2 pb-1 text-xs ${textSecondary}`}>{name}</p>
          <button
            ref={itemRef}
            type="button"
            role="menuitem"
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className={`flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-sm font-medium hover:bg-sand-100 focus-ring-inset dark:hover:bg-sand-800 ${textPrimary}`}
          >
            <Icon name="logout" className="size-4" />
            Cerrar sesión
          </button>
        </div>
      ) : null}
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        title={collapsed ? name : undefined}
        onClick={() => setOpen((v) => !v)}
        className={`flex min-h-11 w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl px-2 py-1.5 ${collapsed ? 'justify-center' : ''} text-left transition-colors duration-150 hover:bg-sand-100 focus-ring dark:hover:bg-sand-800 ${textPrimary}`}
      >
        <Avatar src={user?.picture} name={name} />
        <span className={collapsed ? 'sr-only' : 'min-w-0 flex-1 truncate text-sm font-medium whitespace-nowrap'}>{name}</span>
        {collapsed ? null : <Icon name="updown" className={`size-4 ${textSecondary}`} />}
      </button>
    </div>
  )
}
