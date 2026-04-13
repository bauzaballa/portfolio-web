import { createContext, useContext, useState } from 'react'

interface AuthContextType {
  token: string | null
  login: (token: string) => void
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  login: () => {},
  logout: () => {},
  isAdmin: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('portfolio_token')
  )

  const login = (t: string) => {
    localStorage.setItem('portfolio_token', t)
    setToken(t)
  }

  const logout = () => {
    localStorage.removeItem('portfolio_token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, isAdmin: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
