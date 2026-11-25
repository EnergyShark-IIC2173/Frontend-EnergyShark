import { createContext, useContext } from 'react'

// Estado del feed en vivo compartido por la vista "En vivo" y la sidebar (DF-046/047).
export const FeedContext = createContext(null)

export function useFeed() {
  const value = useContext(FeedContext)
  if (!value) throw new Error('useFeed debe usarse dentro de <FeedProvider>')
  return value
}
