import { createContext, useContext, useState } from 'react'

const ConsoleContext = createContext<{
  consoleOpen: boolean
  setConsoleOpen: (v: boolean) => void
}>({ consoleOpen: false, setConsoleOpen: () => {} })

export function ConsoleProvider({ children }: { children: React.ReactNode }) {
  const [consoleOpen, setConsoleOpen] = useState(false)
  return (
    <ConsoleContext.Provider value={{ consoleOpen, setConsoleOpen }}>
      {children}
    </ConsoleContext.Provider>
  )
}

export function useConsole() {
  return useContext(ConsoleContext)
}
