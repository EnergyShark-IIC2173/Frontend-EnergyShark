import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useApiClient } from './api/client'
import { getHealth } from './api/endpoints'
import { LoginButton } from './components/LoginButton'
import { CycleHistory } from './components/CycleHistory'
import { DistanceTable } from './components/DistanceTable'
import { RejectedMessages } from './components/RejectedMessages'
import { Sidebar } from './components/Sidebar'
import { AuthScreen } from './components/ui/AuthScreen'
import { Logo, LogoMark } from './components/ui/Logo'
import { LoadingDot } from './components/ui/States'
import { textPrimary, textSecondary } from './components/ui/classes'

function App() {
  const { isAuthenticated, isLoading } = useAuth0()
  const { apiFetch } = useApiClient()
  const [healthStatus, setHealthStatus] = useState(null)
  const [error, setError] = useState(null)
  const [activeView, setActiveView] = useState('history')

  async function checkHealth() {
    setError(null)
    setHealthStatus(null)
    try {
      const data = await getHealth(apiFetch)
      // master responde texto plano "ok"; el contrato promete JSON (DF-018): se muestran ambos.
      setHealthStatus(typeof data === 'string' ? data : JSON.stringify(data))
    } catch (err) {
      setError(err.message)
    }
  }

  if (isLoading) return (
    <AuthScreen>
      <span className="flex justify-center">
        <LogoMark className="size-16" />
      </span>
      <p className={`mt-6 flex items-center justify-center gap-2 ${textPrimary}`}>
        <LoadingDot />
        Cargando Auth0...
      </p>
    </AuthScreen>
  )

  return !isAuthenticated ? (
    <AuthScreen>
      <h1 className="flex justify-center">
        <Logo size="xl" className="flex-col" />
      </h1>
      <p className={`mt-4 text-sm ${textSecondary}`}>
        Panel de operación <span className={`marker ${textPrimary}`}>energética</span> de la ciudad
      </p>
      <div className="mt-8">
        <LoginButton />
      </div>
    </AuthScreen>
  ) : (
    <div className="min-h-svh bg-paper md:flex dark:bg-ink">
      <Sidebar
        activeView={activeView}
        onSelect={setActiveView}
        health={{ onCheck: checkHealth, status: healthStatus, error }}
      />

      {/* Fondo plano: más serio para un dashboard (DF-032) */}
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-6xl">
          {/* Renderizado condicional de las vistas */}
          {activeView === 'history' && <CycleHistory />}
          {activeView === 'distance' && <DistanceTable />}
          {activeView === 'rejected' && <RejectedMessages />}
        </div>
      </main>
    </div>
  )
}

export default App
