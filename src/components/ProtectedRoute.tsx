import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { isAdmin, loading } = useAuth()

  if (loading) return null

  if (adminOnly) {
    return isAdmin ? <>{children}</> : <Navigate to="/entry" replace />
  }

  return <>{children}</>
}
