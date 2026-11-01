import { useSyncExternalStore } from 'react'

// true mientras la media query se cumple. Sin estado de montaje: lee matchMedia directo (DF-032).
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
