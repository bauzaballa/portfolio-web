import { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  token: string | null
  login: (token: string) => void
  logout: () => void
  isAdmin: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  login: () => {},
  logout: () => {},
  isAdmin: false,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('portfolio_token')
    if (stored) setToken(stored)
    setLoading(false)
  }, [])

  const login = (t: string) => {
    localStorage.setItem('portfolio_token', t)
    setToken(t)
  }

  const logout = () => {
    localStorage.removeItem('portfolio_token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, isAdmin: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
