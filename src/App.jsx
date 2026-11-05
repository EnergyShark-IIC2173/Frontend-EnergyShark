import { useCallback, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { LoginButton } from './components/LoginButton'
import { CycleHistory } from './components/CycleHistory'
import { DistanceTable } from './components/DistanceTable'
import { MarketBook } from './components/MarketBook'
import { SpanExperiment } from './components/SpanExperiment'
import { StrategyAdmin } from './components/StrategyAdmin'
import { RejectedMessages } from './components/RejectedMessages'
import { Sidebar } from './components/Sidebar'
import { AuthScreen } from './components/ui/AuthScreen'
import { Logo } from './components/ui/Logo'
import { SharkIntro } from './components/ui/SharkIntro'
import { textPrimary, textSecondary } from './components/ui/classes'

const SIDEBAR_KEY = 'energyshark-sidebar'
const INTRO_KEY = 'energyshark-intro'

function App() {
  const { isAuthenticated, isLoading } = useAuth0()
  const [activeView, setActiveView] = useState('history')
  // Sidebar plegada desde md (se recuerda) y cajón abierto bajo md (DF-032).
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'collapsed'
    } catch {
      return false
    }
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  // Intro del tiburón (DF-033): completa una vez por pestaña o al volver del login de Auth0 (`code` en la URL).
  const [fullIntro] = useState(() => {
    if (/[?&]code=/.test(window.location.search)) return true
    try {
      return sessionStorage.getItem(INTRO_KEY) !== 'seen'
    } catch {
      return true
    }
  })
  const [revealed, setRevealed] = useState(false)
  const [introDone, setIntroDone] = useState(false)
  const reveal = useCallback(() => setRevealed(true), [])
  const finishIntro = useCallback(() => {
    setRevealed(true)
    setIntroDone(true)
    try {
      sessionStorage.setItem(INTRO_KEY, 'seen')
    } catch {
      // Sin almacenamiento: la intro completa vuelve a salir al recargar.
    }
  }, [])

  function toggleSidebar() {
    setCollapsed((value) => {
      try {
        localStorage.setItem(SIDEBAR_KEY, value ? 'expanded' : 'collapsed')
      } catch {
        // Sin almacenamiento: el estado dura hasta recargar.
      }
      return !value
    })
  }

  function selectView(view) {
    setActiveView(view)
    setMobileOpen(false)
  }


  let content = null
  if (!isLoading && !isAuthenticated) content = (
    <AuthScreen>
      <h1 className="flex justify-center">
        <Logo size="xl" water className="flex-col" />
      </h1>
      <p className={`mt-4 text-sm ${textSecondary}`}>
        Panel de operación <span className={`marker ${textPrimary}`}>energética</span> de la ciudad
      </p>
      <div className="mt-8">
        <LoginButton />
      </div>
    </AuthScreen>
  )
  else if (!isLoading) content = (
    <div className="min-h-svh bg-paper md:flex dark:bg-ink">
      <Sidebar
        activeView={activeView}
        onSelect={selectView}
        collapsed={collapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileOpen}
        onMobileOpen={() => setMobileOpen(true)}
        onMobileClose={closeMobile}
      />

      {/* Fondo plano: más serio para un dashboard (DF-032) */}
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-6xl">
          {/* Renderizado condicional de las vistas */}
          {activeView === 'history' && <CycleHistory />}
          {activeView === 'market' && <MarketBook />}
          {activeView === 'strategy' && <StrategyAdmin />}
          {activeView === 'experiment' && <SpanExperiment />}
          {activeView === 'distance' && <DistanceTable />}
          {activeView === 'rejected' && <RejectedMessages />}
        </div>
      </main>
    </div>
  )

  // La vista se monta cuando la intro empieza a fundirse, así la entrada de las tarjetas se alcanza a ver (DF-033).
  return (
    <>
      {revealed ? content : null}
      {introDone ? null : (
        <SharkIntro ready={!isLoading} full={fullIntro} skip={!isLoading && !isAuthenticated} onReveal={reveal} onDone={finishIntro} />
      )}
    </>
  )
}

export default App
