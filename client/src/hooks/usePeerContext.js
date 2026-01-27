import { createContext, useContext } from "react"

export const PeerContext = createContext(null)

export const usePeerContext = () => {
  const context = useContext(PeerContext)
  if (context) {
    return context
  }
}
