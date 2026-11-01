import { createContext, useContext } from 'react'

// Easter egg del login (DF-037): la aleta del logo y el fondo comparten si el tiburón está nadando.
// swims cuenta los nados terminados, para que la aleta vuelva a asomar con su animación.
export const SharkSwimContext = createContext({ swimming: false, swims: 0, start: () => {}, finish: () => {} })

export const useSharkSwim = () => useContext(SharkSwimContext)
