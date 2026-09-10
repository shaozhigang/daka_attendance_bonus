import { createContext, useContext, type ReactNode } from 'react'
import { useEyeCare } from '../hooks/useEyeCare'

type EyeCareContextValue = ReturnType<typeof useEyeCare>

const EyeCareContext = createContext<EyeCareContextValue | null>(null)

export function EyeCareProvider({ children }: { children: ReactNode }) {
  const value = useEyeCare()
  return <EyeCareContext.Provider value={value}>{children}</EyeCareContext.Provider>
}

export function useEyeCareContext() {
  const ctx = useContext(EyeCareContext)
  if (!ctx) throw new Error('useEyeCareContext must be used within EyeCareProvider')
  return ctx
}
