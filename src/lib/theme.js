// Tema claro/oscuro (DF-030). Store externo para useSyncExternalStore: sin useEffect ni estado de montaje.
// La verdad es la clase `.dark` de <html>. La preferencia elegida (`light` o `dark`) se guarda en localStorage;
// sin ella se sigue al sistema. El script inline de index.html aplica la misma regla antes del primer paint para
// que no parpadee: si cambias STORAGE_KEY, cámbiala también allí.

export const STORAGE_KEY = 'energyshark-theme'

const listeners = new Set()
const notify = () => listeners.forEach((listener) => listener())

function storedPreference() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

function applyClass(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  notify()
}

export function getResolvedTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function setTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Sin almacenamiento (modo privado o bloqueado): el cambio dura hasta recargar.
  }
  applyClass(theme)
}

// Si nunca se eligió un tema, sigue los cambios del sistema mientras la página está abierta.
function onSystemChange(event) {
  if (!storedPreference()) applyClass(event.matches ? 'dark' : 'light')
}

export function subscribeTheme(listener) {
  listeners.add(listener)
  const media = window.matchMedia?.('(prefers-color-scheme: dark)')
  if (listeners.size === 1) media?.addEventListener('change', onSystemChange)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) media?.removeEventListener('change', onSystemChange)
  }
}
