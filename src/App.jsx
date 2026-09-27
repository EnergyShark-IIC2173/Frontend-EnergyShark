import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useApiClient } from './api/client'
import { LoginButton } from './components/LoginButton'
import { LogoutButton } from './components/LogoutButton'
import { CycleHistory } from './components/CycleHistory'
import { DistanceTable } from './components/DistanceTable'
import tiburonImg from './assets/tiburon.png'
import { NegotiationAdmin } from './components/NegotiationAdmin'
import { RejectedMessages } from './components/RejectedMessages'

const buttonBase = 'cursor-pointer rounded-lg border border-accent/50 px-5 py-2.5 font-sans text-[16px] leading-[normal] font-semibold tracking-normal [transition:background_0.2s,transform_0.1s] active:scale-[0.98]'
const tabActive = `${buttonBase} bg-accent text-bg`
const tabInactive = `${buttonBase} bg-surface text-accent`

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
      const data = await apiFetch('/health')
      setHealthStatus(JSON.stringify(data))
    } catch (err) {
      setError(err.message)
    }
  }

  if (isLoading) return <p>Cargando Auth0...</p>

  return (
    <section id="center" className="flex grow flex-col place-content-center items-center gap-6 px-5 py-10">
      <img src={tiburonImg} alt="Silueta de tiburón" className="h-[150px] w-[160px]" />
      <h1 className="m-0 font-sans text-[48px] font-semibold tracking-[-1.2px] text-text-h max-[1025px]:text-[32px]">EnergyShark</h1>

      <div className="w-full max-w-[400px]">
        {!isAuthenticated ? (
          <LoginButton />
        ) : (
          <>
            <LogoutButton />
            <p className="mt-4 text-text-h">
              Sesión iniciada como {user?.email}
            </p>
            <button onClick={checkHealth} className={`${buttonBase} mt-4 bg-accent/12 text-accent hover:bg-accent hover:text-bg`}>
              Probar /health con token
            </button>
          </>
        )}

        {healthStatus && (
          <p className="mt-4 text-warm">OK: {healthStatus}</p>
        )}
        {error && (
          <p className="mt-4 text-danger">Error: {error}</p>
        )}
      </div>

      {isAuthenticated && (
        <div className="flex w-full max-w-[800px] flex-col items-center gap-6">
          
          {/* Navegación por pestañas */}
          <div className="flex w-full justify-center gap-4 border-b border-border pb-4">
            <button 
              onClick={() => setActiveView('history')}
              className={activeView === 'history' ? tabActive : tabInactive}
            >
              Historial de Ciclos
            </button>
            <button 
              onClick={() => setActiveView('distance')}
              className={activeView === 'distance' ? tabActive : tabInactive}
            >
              Conectividad
            </button>
            <button 
              onClick={() => setActiveView('negotiations')}
              className={activeView === 'negotiations' ? tabActive : tabInactive}
            >
              Negociaciones
            </button>

            <button 
              onClick={() => setActiveView('rejected')}
              className={activeView === 'rejected' ? tabActive : tabInactive}
            >
              Errores/NACKs
            </button>
          
          </div>


          {/* Renderizado condicional de las vistas */}
          {activeView === 'history' && <CycleHistory />}
          {activeView === 'distance' && <DistanceTable />}
          {activeView === 'negotiations' && <NegotiationAdmin />}
          {activeView === 'rejected' && <RejectedMessages />}
          
        </div>
      )}
    </section>
  )
}

export default App