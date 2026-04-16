import { createContext, useContext, useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface AuthContextType {
  login: () => void
  logout: () => Promise<void>
  isAdmin: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  login: () => {},
  logout: async () => {},
  isAdmin: false,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/v1/auth/me`, { credentials: 'include' })
      .then(res => setIsAdmin(res.ok))
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false))
  }, [])

  const login = () => setIsAdmin(true)

  const logout = async () => {
    await fetch(`${API}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' })
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ login, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
