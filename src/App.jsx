import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useApiClient } from './api/client'
import { getHealth } from './api/endpoints'
import { LoginButton } from './components/LoginButton'
import { LogoutButton } from './components/LogoutButton'
import { CycleHistory } from './components/CycleHistory'
import { DistanceTable } from './components/DistanceTable'
import tiburonImg from './assets/tiburon.png'
import { NegotiationAdmin } from './components/NegotiationAdmin'
import { RejectedMessages } from './components/RejectedMessages'
import { AuthScreen, LogoMark } from './components/ui/AuthScreen'
import { Icon } from './components/ui/Icon'
import { btnSecondary, labelBase, navItemActive, navItemInactive } from './components/ui/classes'

function App() {
  const { isAuthenticated, isLoading, user } = useAuth0()
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
        <LogoMark src={tiburonImg} alt="Silueta de tiburón" size="lg" />
      </span>
      <p className="mt-6 flex items-center justify-center gap-2 text-text-h">
        <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-accent motion-reduce:animate-none" />
        Cargando Auth0...
      </p>
    </AuthScreen>
  )

  return !isAuthenticated ? (
    <AuthScreen>
      <span className="flex justify-center">
        <LogoMark src={tiburonImg} alt="Silueta de tiburón" size="lg" />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-text-h">EnergyShark</h1>
      <p className="mt-2 text-sm text-text">Panel de operación energética de la ciudad</p>
      <div className="mt-8">
        <LoginButton />
      </div>
    </AuthScreen>
  ) : (
    <div className="grid min-h-svh grid-cols-[minmax(0,1fr)] grid-rows-[auto_auto_1fr_auto] md:grid-cols-[16rem_minmax(0,1fr)] md:grid-rows-[auto_1fr_auto]">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border bg-bg px-4 py-3 md:col-span-2 md:px-6">
        <div className="flex items-center gap-3">
          <LogoMark src={tiburonImg} alt="Silueta de tiburón" size="sm" />
          <h1 className="text-lg font-semibold tracking-tight text-text-h">EnergyShark</h1>
        </div>
        <div className="flex min-w-0 items-center gap-4">
          <p className="grid text-right">
            <span className={`whitespace-nowrap ${labelBase}`}>Sesión iniciada como</span>{' '}
            <span className="truncate text-sm text-text-h">{user?.email}</span>
          </p>
          <LogoutButton />
        </div>
      </header>

      {/* Navegación por pestañas */}
      <nav aria-label="Secciones" className="flex gap-2 overflow-x-auto border-b border-border bg-panel px-4 py-3 md:row-start-2 md:flex-col md:gap-1 md:overflow-visible md:border-r md:border-b-0 md:p-4">
        <p className={`hidden px-3 pb-2 md:block ${labelBase}`}>Secciones</p>
        <button 
          onClick={() => setActiveView('history')}
          className={activeView === 'history' ? navItemActive : navItemInactive}
        >
          <Icon name="history" />
          Historial de Ciclos
        </button>
        <button 
          onClick={() => setActiveView('distance')}
          className={activeView === 'distance' ? navItemActive : navItemInactive}
        >
          <Icon name="network" />
          Conectividad
        </button>
        <button 
          onClick={() => setActiveView('negotiations')}
          className={activeView === 'negotiations' ? navItemActive : navItemInactive}
        >
          <Icon name="handshake" />
          Negociaciones
        </button>

        <button 
          onClick={() => setActiveView('rejected')}
          className={activeView === 'rejected' ? navItemActive : navItemInactive}
        >
          <Icon name="alert" />
          Errores/NACKs
        </button>
      </nav>

      <main className="min-w-0 px-4 py-6 md:col-start-2 md:row-span-2 md:row-start-2 md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-6xl">
          {/* Renderizado condicional de las vistas */}
          {activeView === 'history' && <CycleHistory />}
          {activeView === 'distance' && <DistanceTable />}
          {activeView === 'negotiations' && <NegotiationAdmin />}
          {activeView === 'rejected' && <RejectedMessages />}
        </div>
      </main>

      {/* Estado de la API: al fondo del sidebar desde md, al final del contenido en móvil (DF-011) */}
      <aside aria-label="Estado de la API" className="border-t border-border bg-panel p-4 md:col-start-1 md:row-start-3 md:border-t-0 md:border-r">
        <div className="rounded-2xl bg-surface p-4 shadow-card">
          <p className={`flex items-center gap-2 ${labelBase}`}>
            <Icon name="pulse" className="size-4 text-accent" />
            Estado de la API
          </p>
          <button onClick={checkHealth} className={`${btnSecondary} mt-3 w-full`}>
            Probar /health con token
          </button>

          {healthStatus && (
            <p className="mt-3 font-mono text-xs break-all text-success">OK: {healthStatus}</p>
          )}
          {error && (
            <p className="mt-3 font-mono text-xs break-all text-danger">Error: {error}</p>
          )}
        </div>
      </aside>
    </div>
  )
}

export default App
