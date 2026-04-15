import { Navigate } from 'react-router-dom'
import { usePreview } from '../context/PreviewContext'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { unlocked } = usePreview()
  const { isAdmin } = useAuth()

  if (!unlocked && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
