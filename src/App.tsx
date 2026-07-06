import { Routes, Route, Navigate } from 'react-router-dom'
import OSEntry from './pages/OSEntry'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Experience from './pages/Experience'
import About from './pages/About'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import { LikeProvider } from './context/LikeContext'
import { ConsoleProvider } from './context/ConsoleContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <ToastProvider>
    <ConsoleProvider>
    <LikeProvider>
    <Routes>
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/login" element={<OSEntry />} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/projects/:slug" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
      <Route path="/experience" element={<ProtectedRoute><Experience /></ProtectedRoute>} />
      <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
      <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
      {/* Backwards-compat redirects for the old routes */}
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/entry" element={<Navigate to="/login" replace />} />
      {/* 404 fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </LikeProvider>
    </ConsoleProvider>
    </ToastProvider>
  )
}
