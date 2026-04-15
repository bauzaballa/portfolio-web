import { createContext, useContext, useState } from 'react'

interface PreviewContextType {
  unlocked: boolean
  unlock: () => void
  lock: () => void
}

const PreviewContext = createContext<PreviewContextType>({
  unlocked: false,
  unlock: () => {},
  lock: () => {},
})

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => {
    return localStorage.getItem('portfolio_preview') === 'true'
  })

  const unlock = () => {
    localStorage.setItem('portfolio_preview', 'true')
    setUnlocked(true)
  }

  const lock = () => {
    localStorage.removeItem('portfolio_preview')
    setUnlocked(false)
  }

  return (
    <PreviewContext.Provider value={{ unlocked, unlock, lock }}>
      {children}
    </PreviewContext.Provider>
  )
}

export const usePreview = () => useContext(PreviewContext)
