import { useEffect, useLayoutEffect, useRef } from 'react'
import { Icon } from '../ui/Icon'
import { textPrimary, textSecondary } from '../ui/classes'
import { CycleDetail } from './CycleDetail'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Transform que lleva el panel (en su lugar final) al rectángulo de la tarjeta de origen.
function fromOrigin(origin, panel) {
  const from = origin?.isConnected ? origin.getBoundingClientRect() : null
  if (!from?.width) return null
  const to = panel.getBoundingClientRect()
  return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`
}

// Detalle del ciclo en un <dialog> modal (DF-033). Al abrir crece desde la tarjeta que se apretó (transform y
// opacidad con WAAPI) y al cerrar vuelve a ella. Escape, el botón o apretar el velo lo cierran. Mientras está
// abierto la página no hace scroll. Con "Reducir movimiento", solo un fundido.
export function CycleDialog({ cycleId, origin, live, onClose }) {
  const dialogRef = useRef(null)
  const panelRef = useRef(null)
  const closing = useRef(false)
  const originRef = useRef(origin)

  useLayoutEffect(() => {
    originRef.current = origin
  }, [origin])

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    const panel = panelRef.current
    dialog.showModal()
    document.documentElement.style.overflow = 'hidden'
    const start = reduceMotion() ? null : fromOrigin(originRef.current, panel)
    if (start) {
      panel.animate([{ transform: start, opacity: 0.35 }, { transform: 'none', opacity: 1 }], { duration: 340, easing: EASE })
      panel.firstElementChild?.animate([{ opacity: 0 }, { opacity: 0 }, { opacity: 1 }], { duration: 340, easing: 'ease-out' })
    } else {
      panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' })
    }
    return () => {
      // En desarrollo (StrictMode) el efecto corre dos veces: sin cancelar, la segunda medición parte del panel ya
      // transformado y la animación nueva pisa a la primera.
      panel.getAnimations({ subtree: true }).forEach((a) => a.cancel())
      document.documentElement.style.overflow = ''
      if (dialog.open) dialog.close()
    }
  }, [])

  function requestClose() {
    if (closing.current) return
    closing.current = true
    const panel = panelRef.current
    const target = originRef.current
    dialogRef.current?.setAttribute('data-closing', '')
    const end = reduceMotion() ? null : fromOrigin(target, panel)
    const anim = end
      ? panel.animate([{ transform: 'none', opacity: 1 }, { transform: end, opacity: 0 }], { duration: 260, easing: EASE, fill: 'forwards' })
      : panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease-in', fill: 'forwards' })
    anim.onfinish = () => {
      onClose()
      if (target?.isConnected) target.focus({ preventScroll: true })
    }
  }

  // Escape: el navegador cerraría el modal de golpe; se cierra con la animación.
  useEffect(() => {
    const dialog = dialogRef.current
    const onCancel = (e) => {
      e.preventDefault()
      requestClose()
    }
    dialog.addEventListener('cancel', onCancel)
    return () => dialog.removeEventListener('cancel', onCancel)
  })

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="cycle-dialog-title"
      onClick={(e) => e.target === e.currentTarget && requestClose()}
      className="fixed inset-0 m-0 flex h-full max-h-none w-full max-w-none items-stretch justify-center bg-transparent p-0 backdrop:bg-ink/55 backdrop:transition-opacity backdrop:duration-200 data-[closing]:backdrop:opacity-0 motion-safe:backdrop:animate-fade-in sm:items-center sm:p-6"
    >
      <div
        ref={panelRef}
        style={{ transformOrigin: '0 0' }}
        className="flex h-full w-full max-w-6xl flex-col overflow-hidden border-sand-200 bg-paper sm:h-[min(60rem,calc(100svh-3rem))] sm:rounded-2xl sm:border dark:border-sand-800 dark:bg-ink"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-sand-200 px-5 py-3 dark:border-sand-800">
            <p className={textSecondary}>
              <span className="text-xs font-medium tracking-wider uppercase">Ciclo</span>{' '}
              <span id="cycle-dialog-title" className={`font-mono text-lg font-bold ${textPrimary}`}>{cycleId}</span>
            </p>
            <button
              type="button"
              onClick={requestClose}
              aria-label="Cerrar detalle"
              className={`grid size-11 cursor-pointer place-items-center rounded-xl hover:bg-sand-100 focus-ring dark:hover:bg-sand-800 ${textSecondary}`}
            >
              <Icon name="close" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
            <CycleDetail key={cycleId} cycleId={cycleId} live={live} />
          </div>
        </div>
      </div>
    </dialog>
  )
}
