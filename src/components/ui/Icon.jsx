import {
  ArrowClockwise, ArrowsOut, Clock, BatteryHigh, CaretDown, CaretLeft, CaretRight, CaretUpDown, CheckCircle, MagnifyingGlass, CaretDoubleLeft, CaretDoubleRight, ClockCounterClockwise, Copy, Lightning, Moon, Plug, Pulse, ShareNetwork, SignOut,
  SidebarSimple, List, X, Sun, Wallet, Warning, WarningCircle,
} from '@phosphor-icons/react'

// Íconos de Phosphor, peso bold (DF-030; reemplaza los SVG a mano de DF-010). Siempre decorativos: aria-hidden.
const icons = {
  history: ClockCounterClockwise,
  network: ShareNetwork,
  alert: WarningCircle,
  warning: Warning,
  duplicate: Copy,
  check: CheckCircle,
  pulse: Pulse,
  chevron: CaretDown,
  expand: ArrowsOut,
  clock: Clock,
  refresh: ArrowClockwise,
  prev: CaretLeft,
  next: CaretRight,
  first: CaretDoubleLeft,
  last: CaretDoubleRight,
  search: MagnifyingGlass,
  updown: CaretUpDown,
  sidebar: SidebarSimple,
  menu: List,
  close: X,
  bolt: Lightning,
  wallet: Wallet,
  battery: BatteryHigh,
  logout: SignOut,
  plug: Plug,
  sun: Sun,
  moon: Moon,
}

export function Icon({ name, className = 'size-5' }) {
  const Component = icons[name]
  if (!Component) return null
  return <Component weight="bold" aria-hidden="true" className={`shrink-0 ${className}`} />
}
