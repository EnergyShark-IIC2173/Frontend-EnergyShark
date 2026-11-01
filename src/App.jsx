import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useApiClient } from './api/client'
import { getHealth } from './api/endpoints'
import { LoginButton } from './components/LoginButton'
import { LogoutButton } from './components/LogoutButton'
import { CycleHistory } from './components/CycleHistory'
import { DistanceTable } from './components/DistanceTable'
import { RejectedMessages } from './components/RejectedMessages'
import { AuthScreen } from './components/ui/AuthScreen'
import { Icon } from './components/ui/Icon'
import { Logo, LogoMark } from './components/ui/Logo'
import { LoadingDot } from './components/ui/States'
import { ThemeSwitch } from './components/ui/ThemeSwitch'
import {
  btnSecondary, divider, labelBase, navItemActive, navItemInactive, surface, textAccent, textError, textPrimary, textSecondary,
} from './components/ui/classes'

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
    <div className="grid min-h-svh grid-cols-[minmax(0,1fr)] grid-rows-[auto_auto_1fr_auto] bg-paper md:grid-cols-[16rem_minmax(0,1fr)] md:grid-rows-[auto_1fr_auto] dark:bg-ink">
      <header className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b bg-paper px-4 py-3 md:col-span-2 md:px-6 dark:bg-ink ${divider}`}>
        <h1>
          <Logo size="sm" />
        </h1>
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <ThemeSwitch />
          <p className="hidden min-w-0 text-right sm:grid">
            <span className={`whitespace-nowrap ${labelBase}`}>Sesión iniciada como</span>{' '}
            <span className={`truncate text-sm ${textPrimary}`}>{user?.email}</span>
          </p>
          <LogoutButton />
        </div>
      </header>

      {/* Navegación por pestañas */}
      <nav aria-label="Secciones" className={`flex gap-2 overflow-x-auto border-b bg-paper px-4 py-3 md:row-start-2 md:flex-col md:gap-1 md:overflow-visible md:border-r md:border-b-0 md:p-4 dark:bg-ink ${divider}`}>
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
          onClick={() => setActiveView('rejected')}
          className={activeView === 'rejected' ? navItemActive : navItemInactive}
        >
          <Icon name="alert" />
          Errores/NACKs
        </button>
      </nav>

      {/* Fondo de cuaderno detrás de las tarjetas, que son opacas (DF-030) */}
      <main className="min-w-0 bg-paper px-4 py-6 dot-grid md:col-start-2 md:row-span-2 md:row-start-2 md:px-8 md:py-8 dark:bg-ink">
        <div className="mx-auto w-full max-w-6xl">
          {/* Renderizado condicional de las vistas */}
          {activeView === 'history' && <CycleHistory />}
          {activeView === 'distance' && <DistanceTable />}
          {activeView === 'rejected' && <RejectedMessages />}
        </div>
      </main>

      {/* Estado de la API: al fondo del sidebar desde md, al final del contenido en móvil (DF-011) */}
      <aside aria-label="Estado de la API" className={`border-t bg-paper p-4 md:col-start-1 md:row-start-3 md:border-t-0 md:border-r dark:bg-ink ${divider}`}>
        <div className={`rounded-2xl p-4 ${surface}`}>
          <p className={`flex items-center gap-2 ${labelBase}`}>
            <Icon name="pulse" className={`size-4 ${textAccent}`} />
            Estado de la API
          </p>
          <button onClick={checkHealth} className={`${btnSecondary} mt-3 w-full`}>
            Probar /health con token
          </button>

          {healthStatus && (
            <p className={`mt-3 font-mono text-xs break-all ${textAccent}`}>OK: {healthStatus}</p>
          )}
          {error && (
            <p className={`mt-3 font-mono text-xs break-all ${textError}`}>Error: {error}</p>
          )}
        </div>
      </aside>
    </div>
  )
}

export default App
